import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export default async function proxy(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Note: We do not call request.cookies.set here as it causes issues in this environment.
                    // The updated cookies are set on the response object below.

                    // Create a new response with the latest headers
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

    // 2. DEFINE PROTECTED ROUTES
    // The Dashboard is at the root "/"
    const isDashboardRoute = path === '/' || path.startsWith('/dashboard')

    // 3. SECURITY LOGIC

    // CASE A: User is NOT logged in and tries to access Dashboard
    if (!user && isDashboardRoute) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        const redirectResponse = NextResponse.redirect(loginUrl)

        // Copy cookies from the temporary response (which might have session updates)
        const newCookies = response.cookies.getAll()
        newCookies.forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
    }

    // CASE B: User IS logged in and tries to access Login page (Redirect to Dash)
    if (user && path.startsWith('/login')) {
        const dashUrl = request.nextUrl.clone()
        dashUrl.pathname = '/'
        const redirectResponse = NextResponse.redirect(dashUrl)

        // Copy cookies here too, just in case
        const newCookies = response.cookies.getAll()
        newCookies.forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
