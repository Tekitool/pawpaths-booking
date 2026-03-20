import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Paths that never require authentication — served instantly with no DB call
const PUBLIC_PREFIXES = [
    '/enquiry',
    '/tools',
    '/services',
    '/products',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/api/booking',
    '/api/services',
    '/api/health',
    '/api/tools',
    '/api/upload',
    '/api/ai-crate-audit',
    '/auth/callback',
    '/auth/set-password',
    '/auth/auth-code-error',
]

function isPublicPath(pathname: string): boolean {
    if (pathname === '/') return true
    return PUBLIC_PREFIXES.some(
        prefix => pathname === prefix || pathname.startsWith(prefix + '/')
    )
}

// Security headers applied to every response
const SECURITY_HEADERS: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
}

function applySecurityHeaders(response: NextResponse): NextResponse {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(key, value)
    }
    return response
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const host = request.headers.get('host') ?? ''

    // ── 0. Defensive: catch Supabase auth responses landing on root ───────────
    // When redirectTo isn't in Supabase's allowlist it falls back to the Site URL,
    // appending ?code= or ?error= to the root. Forward both to the right handlers.
    const strayCode  = request.nextUrl.searchParams.get('code')
    const strayError = request.nextUrl.searchParams.get('error')
    if (pathname === '/') {
        if (strayCode) {
            const callbackUrl = new URL('/auth/callback', request.url)
            callbackUrl.searchParams.set('code', strayCode)
            callbackUrl.searchParams.set('next', '/auth/set-password')
            return NextResponse.redirect(callbackUrl)
        }
        if (strayError) {
            const errorUrl = new URL('/auth/auth-code-error', request.url)
            const errorCode = request.nextUrl.searchParams.get('error_code')
            if (errorCode) errorUrl.searchParams.set('error_code', errorCode)
            return NextResponse.redirect(errorUrl)
        }
    }

    // ── 1. Cross-domain 301: booking.pawpathsae.com → pawpathsae.com ─────────
    // Requires booking.pawpathsae.com added as a domain alias in Vercel Dashboard.
    // Once Vercel routes that domain to this Next.js app, this intercepts it.
    if (host === 'booking.pawpathsae.com') {
        const url = request.nextUrl.clone()
        url.host = 'pawpathsae.com'
        url.port = ''
        return NextResponse.redirect(url, { status: 301 })
    }

    // ── 2. Security obscurity: /login/* → /admin/login/* ─────────────────────
    if (pathname === '/login' || pathname.startsWith('/login/')) {
        const adminPath = pathname.replace('/login', '/admin/login')
        return NextResponse.redirect(new URL(adminPath, request.url), { status: 301 })
    }

    // ── 3. /admin/login and all sub-paths: pass through ───────────────────────
    // Without this, unauthenticated user → /admin/login/* → matches /admin/* →
    // redirect to / → user can never reach the login or forgot-password form.
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
        return applySecurityHeaders(NextResponse.next())
    }

    // ── 4. Public paths: no auth check, return immediately ───────────────────
    if (isPublicPath(pathname)) {
        return applySecurityHeaders(NextResponse.next())
    }

    // ── 5. Protected routes: create Supabase client with cookie domain ────────
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                // Scope cookies to parent domain so session is shared across
                // pawpathsae.com AND admin.pawpathsae.com subdomains
                domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.pawpathsae.com' : undefined),
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            },
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // ── 6. Session check ──────────────────────────────────────────────────────
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        // No session → redirect to homepage (not /login, which would loop)
        return NextResponse.redirect(new URL('/', request.url))
    }

    // ── 7. RBAC: admin role check for /admin/* ───────────────
    if (pathname.startsWith('/admin')) {
        // Use service role to bypass RLS for the RBAC check
        const adminSupabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll() { return [] },
                    setAll() { },
                },
            }
        )

        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const staffRoles = ['super_admin', 'admin', 'ops_manager', 'relocation_coordinator', 'finance', 'driver', 'staff']
        if (!profile || !staffRoles.includes(profile.role)) {
            // Authenticated but not a staff member → back to homepage
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Fine-grained route protection
        const role = profile.role
        const financeRoutes = ['/admin/invoices', '/admin/expenses', '/admin/summary', '/admin/reports', '/admin/quotes']
        const financeRoles = ['super_admin', 'admin', 'finance', 'ops_manager']
        if (financeRoutes.some(r => pathname.startsWith(r)) && !financeRoles.includes(role)) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }

        const systemRoutes = ['/admin/users', '/admin/settings', '/admin/themes']
        const systemRoles = ['super_admin', 'admin']
        if (systemRoutes.some(r => pathname.startsWith(r)) && !systemRoles.includes(role)) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
    }

    return applySecurityHeaders(response)
}

export const config = {
    matcher: [
        // Match all paths except Next.js internals and static file extensions
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)$).*)',
    ],
}
