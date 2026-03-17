'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function login(prevState, formData) {
    const email = formData.get('email')
    const password = formData.get('password')

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return error.message
    }

    redirect('/admin/dashboard')
}

export async function signup(prevState, formData) {
    const email = formData.get('email')
    const password = formData.get('password')
    const fullName = formData.get('fullName')

    const supabase = await createClient()
    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            }
        }
    })

    if (error) {
        return error.message
    }

    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function updatePassword(prevState, formData) {
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
        return 'Passwords do not match'
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return error.message
    }

    redirect('/admin/dashboard')
}

export async function requestPasswordReset(prevState, formData) {
    const email = formData.get('email')?.trim().toLowerCase()

    // Check if a user with this email exists before attempting a reset
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

    if (!profile) {
        return 'No account found with that email address.'
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/set-password`
    })

    if (error) {
        return error.message
    }

    return { success: true, email }
}
