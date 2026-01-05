'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Get all users (Supabase)
export async function getUsers() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        // Fetch profiles from Supabase
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Map profiles to the expected UI format
        return profiles.map(profile => ({
            _id: profile.id,
            name: profile.full_name || 'Unknown',
            email: profile.email || '',
            role: profile.role || 'customer',
            status: 'Active', // Default to Active as Supabase handles auth status
            joined: profile.created_at,
            avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&background=random`
        }));
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw new Error('Failed to fetch users');
    }
}

import { logAuditAction } from '@/lib/audit-logger';

// ... (existing imports)

// Create a new user (Supabase Admin)
export async function createUser(userData) {
    try {
        const supabase = await createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // Check if current user is admin (you might need a more robust check here based on your RLS/Claims)
        // For now, assuming if they can access this, they are authorized, or let Supabase RLS handle it.
        if (!currentUser) {
            return { success: false, message: 'Unauthorized' };
        }

        const { email, password, name, role } = userData;

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name }
        });

        if (authError) throw authError;

        // 2. Update profile with role (if your trigger doesn't handle it or if you need to set it explicitly)
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: role.toLowerCase() })
                .eq('id', authData.user.id);

            if (profileError) {
                console.error('Error updating profile role:', profileError);
                // Continue but warn?
            }

            // Log Audit
            await logAuditAction(
                supabase,
                'profiles',
                authData.user.id,
                'CREATE',
                `Created user: ${email}`,
                { role, name }
            );
        }

        revalidatePath('/admin/users');
        return { success: true, message: 'User created successfully' };
    } catch (error) {
        console.error('Failed to create user:', error);
        return { success: false, message: error.message };
    }
}

// Update a user
export async function updateUser(userId, userData) {
    try {
        const supabase = await createClient();

        const { name, role } = userData;

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: name,
                role: role.toLowerCase()
            })
            .eq('id', userId);

        if (error) throw error;

        // Log Audit
        await logAuditAction(
            supabase,
            'profiles',
            userId,
            'UPDATE',
            `Updated user profile: ${name}`,
            { role, name }
        );

        revalidatePath('/admin/users');
        return { success: true, message: 'User updated successfully' };
    } catch (error) {
        console.error('Failed to update user:', error);
        return { success: false, message: error.message };
    }
}

// Delete a user
export async function deleteUser(userId) {
    try {
        const supabase = await createClient();

        // Log Audit BEFORE delete (so we know who it was)
        // We might want to fetch the user email first for the log
        const { data: userProfile } = await supabase.from('profiles').select('email').eq('id', userId).single();
        const userEmail = userProfile?.email || userId;

        await logAuditAction(
            supabase,
            'profiles',
            userId,
            'DELETE',
            `Deleted user: ${userEmail}`,
            { userId }
        );

        // Delete from Auth (which should cascade to profiles if set up, or delete profile manually)
        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, message: error.message };
    }
}

