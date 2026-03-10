import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = [
        '/enquiry',
        '/services',
        '/tools',
        '/api/booking',
        '/api/tools',
        '/api/health',
        '/api/upload',
        '/auth/callback',
    ]

    const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

    // Protected admin/dashboard routes
    const isProtectedRoute = path.startsWith('/admin') || path.startsWith('/dashboard')

    // Redirect unauthenticated users from protected routes to login
    if (!user && isProtectedRoute) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        loginUrl.searchParams.set('redirectTo', path)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users from login page to admin dashboard
    if (user && path.startsWith('/login')) {
        const dashUrl = request.nextUrl.clone()
        dashUrl.pathname = '/admin/dashboard'
        return NextResponse.redirect(dashUrl)
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
