'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit-logger';

// Get users with pagination
export async function getUsers({ page = 1, pageSize = 15, query = '' } = {}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let q = supabase
            .from('profiles')
            .select('*', { count: 'exact' });

        if (query) {
            q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
        }

        const { data: profiles, count, error } = await q
            .order('created_at', { ascending: true })
            .range(from, to);

        if (error) throw error;

        const data = (profiles || []).map(profile => ({
            _id: profile.id,
            name: profile.full_name || 'Unknown',
            email: profile.email || '',
            role: profile.role || 'customer',
            status: 'Active',
            joined: profile.created_at,
            avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&background=random`
        }));

        return {
            data,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize),
        };
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw new Error('Failed to fetch users');
    }
}

// Create a new user (Supabase Admin)
export async function createUser(userData) {
    try {
        const supabase = await createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
            return { success: false, message: 'Unauthorized' };
        }

        const { email, password, name, role } = userData;

        // 1. Create user in Supabase Auth using Admin Client
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name }
        });

        if (authError) throw authError;

        // 2. Update profile with role
        if (authData.user) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({ role: role.toLowerCase() })
                .eq('id', authData.user.id);

            if (profileError) {
                console.error('Error updating profile role:', profileError);
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
        // Check auth...

        const { name, role } = userData;

        const { error } = await supabaseAdmin
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
export async function deleteUser(userId, reason = '') {
    try {
        const supabase = await createClient();

        // Log Audit BEFORE delete
        const { data: userProfile } = await supabaseAdmin.from('profiles').select('email').eq('id', userId).single();
        const userEmail = userProfile?.email || userId;

        await logAuditAction(
            supabase,
            'profiles',
            userId,
            'DELETE',
            `Deleted user: ${userEmail}`,
            { userId, reason }
        );

        // Delete from Auth using Admin Client
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, message: error.message };
    }
}

