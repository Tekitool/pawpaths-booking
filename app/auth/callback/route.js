import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        // Start with the success redirect; setAll will re-assign this with cookies attached
        let response = NextResponse.redirect(`${origin}${next}`)

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    // Mirror the middleware pattern: write to both request AND response
                    // so the Set-Cookie headers are included on the redirect response.
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value, options)
                        )
                        response = NextResponse.redirect(`${origin}${next}`)
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return response
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
