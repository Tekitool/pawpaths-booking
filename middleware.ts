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
]

function isPublicPath(pathname: string): boolean {
    if (pathname === '/') return true
    return PUBLIC_PREFIXES.some(
        prefix => pathname === prefix || pathname.startsWith(prefix + '/')
    )
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const host = request.headers.get('host') ?? ''

    // ── 1. Cross-domain 301: booking.pawpathsae.com → pawpathsae.com ─────────
    // Requires booking.pawpathsae.com added as a domain alias in Vercel Dashboard.
    // Once Vercel routes that domain to this Next.js app, this intercepts it.
    if (host === 'booking.pawpathsae.com') {
        const url = request.nextUrl.clone()
        url.host = 'pawpathsae.com'
        url.port = ''
        return NextResponse.redirect(url, { status: 301 })
    }

    // ── 2. Security obscurity: /login → /admin/login ──────────────────────────
    if (pathname === '/login') {
        return NextResponse.redirect(
            new URL('/admin/login', request.url),
            { status: 301 }
        )
    }

    // ── 3. /admin/login: pass through — MUST come before protected route check ─
    // Without this, unauthenticated user → /admin/login → matches /admin/* →
    // redirect to / → user can never reach the login form. Infinite loop fixed.
    if (pathname === '/admin/login') {
        return NextResponse.next()
    }

    // ── 4. Public paths: no auth check, return immediately ───────────────────
    if (isPublicPath(pathname)) {
        return NextResponse.next()
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

        const allowedRoles = ['admin', 'super_admin', 'super-admin'] // Allowing variations just in case
        if (!profile || !allowedRoles.includes(profile.role)) {
            // Authenticated but not an admin → back to homepage
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        // Match all paths except Next.js internals and static file extensions
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}
