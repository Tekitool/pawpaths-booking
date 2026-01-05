'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createUserAction(formData: any) {
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
        // Note: Triggers might handle this, but explicit insert ensures data sync if triggers fail or don't exist for all fields
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authData.user.id,
                full_name: fullName,
                email,
                role,
                // status is usually managed via auth.users (banned/confirmed), but if we have a status column in profiles:
                // Assuming 'status' in profiles is text 'Active'/'Suspended' or boolean
                // User request says "Status: A sleek toggle switch for 'Active/Suspended'".
                // Let's assume we store it in profiles for display, but also manage auth ban state.
                avatar_url: avatar,
                updated_at: new Date().toISOString(),
            });

        if (profileError) {
            // If profile creation fails, we might want to cleanup auth user, but for now just throw
            console.error('Profile creation failed:', profileError);
            throw profileError;
        }

        // 3. Handle Status (Ban/Unban)
        if (status === false) {
            await supabaseAdmin.auth.admin.updateUserById(authData.user.id, { ban_duration: '876000h' }); // Ban for 100 years
        }

        revalidatePath('/admin/users');
        return { success: true, userId: authData.user.id };
    } catch (error: any) {
        console.error('Create User Error:', error);
        return { success: false, message: error.message };
    }
}

export async function updateUserAction(userId: string, formData: any) {
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
                // We update email in profile only if auth update succeeds, or we let auth update trigger it?
                // Let's update it here for consistency if auth update is separate.
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
        // Check current ban status? Or just force update.
        if (status === false) {
            await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
        } else {
            await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
        }

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Update User Error:', error);
        return { success: false, message: error.message };
    }
}

export async function deleteUserAction(userId: string) {
    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Delete User Error:', error);
        return { success: false, message: error.message };
    }
}

export async function sendPasswordResetAction(email: string) {
    try {
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings/security`,
        });
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Password Reset Error:', error);
        return { success: false, message: error.message };
    }
}
