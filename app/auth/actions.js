'use server'

import { createClient } from '@/lib/supabase/server'
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

    redirect('/')
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
