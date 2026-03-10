'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: boolean;
    password?: string;
    avatar?: string;
}

interface ActionResult {
    success: boolean;
    message?: string;
    userId?: string;
}

export async function createUserAction(formData: UserFormData): Promise<ActionResult> {
    try {
        const { firstName, lastName, email, role, status, password, avatar } = formData;
        const fullName = `${firstName} ${lastName}`.trim();

        // 1. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create auth user');

        // 2. Insert into public.profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authData.user.id,
                full_name: fullName,
                email,
                role,
                avatar_url: avatar,
                updated_at: new Date().toISOString(),
            });

        if (profileError) {
            console.error('Profile creation failed:', profileError);
            throw profileError;
        }

        // 3. Handle Status (Ban/Unban)
        if (status === false) {
            await supabaseAdmin.auth.admin.updateUserById(authData.user.id, { ban_duration: '876000h' });
        }

        revalidatePath('/admin/users');
        return { success: true, userId: authData.user.id };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Create User Error:', message);
        return { success: false, message };
    }
}

export async function updateUserAction(userId: string, formData: UserFormData): Promise<ActionResult> {
    try {
        const { firstName, lastName, email, role, status, avatar } = formData;
        const fullName = `${firstName} ${lastName}`.trim();

        // 1. Get current profile to check email change
        const { data: currentProfile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();

        // 2. Update public.profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: fullName,
                role,
                avatar_url: avatar,
                updated_at: new Date().toISOString(),
                email: email
            })
            .eq('id', userId);

        if (profileError) throw profileError;

        // 3. Update Auth if Email Changed
        if (currentProfile && currentProfile.email !== email) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, { email });
            if (authError) throw authError;
        }

        // 4. Update Status (Ban/Unban)
        if (status === false) {
            await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
        } else {
            await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
        }

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Update User Error:', message);
        return { success: false, message };
    }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Delete User Error:', message);
        return { success: false, message };
    }
}

export async function sendPasswordResetAction(email: string): Promise<ActionResult> {
    try {
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings/security`,
        });
        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Password Reset Error:', message);
        return { success: false, message };
    }
}
