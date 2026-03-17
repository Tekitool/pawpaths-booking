'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    status: boolean;
    avatar?: string;
    // NOTE: 'password' is intentionally omitted.
    // New users receive a secure invite email via generateLink({ type: 'invite' }).
    // Passwords never pass through this server action layer.
}

interface ActionResult {
    success: boolean;
    message?: string;
    userId?: string;
}

export async function createUserAction(formData: UserFormData): Promise<ActionResult> {
    try {
        const { firstName, lastName, email, role, status, avatar } = formData;
        const fullName = `${firstName} ${lastName}`.trim();

        // 1. Generate a secure invite link — no password touches this layer.
        //    The user receives an email with a magic link to set their own password.
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email,
            options: {
                data: { full_name: fullName },
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/set-password`,
            },
        });

        if (linkError) {
            console.error('[createUser] Step 1 — generateLink failed:', linkError.message);
            return { success: false, message: `[Auth] ${linkError.message}` };
        }
        if (!linkData.user) throw new Error('Failed to generate invite link');

        // 2. Upsert public.profiles with the admin-specified role and avatar.
        //    The DB trigger already inserted a default-role row; this updates it.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: linkData.user.id,
                full_name: fullName,
                email,
                role,
                avatar_url: avatar ?? null,
                updated_at: new Date().toISOString(),
            });

        if (profileError) {
            console.error('[createUser] Step 2 — profile upsert failed:', profileError.message);
            return { success: false, message: `[Profile] ${profileError.message}` };
        }

        // 3. Handle initial Status (ban if Suspended)
        if (status === false) {
            await supabaseAdmin.auth.admin.updateUserById(linkData.user.id, { ban_duration: '876000h' });
        }

        revalidatePath('/admin/users');
        return { success: true, userId: linkData.user.id };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, message };
    }
}

// Resend invite to an existing unconfirmed user
export async function resendInviteAction(email: string): Promise<ActionResult> {
    try {
        const { error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email,
            options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin` },
        });
        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, message };
    }
}

export async function updateUserAction(userId: string, formData: UserFormData): Promise<ActionResult> {
    try {
        const { firstName, lastName, email, phone, role, status, avatar } = formData;
        const fullName = `${firstName} ${lastName}`.trim();

        // ── SECURITY GUARD: Role Escalation Protection ────────────────────────
        // We NEVER trust role assertions from the client.
        // The caller's identity and role are resolved exclusively from the
        // server-side session cookie → profiles table (bypasses RLS via service key).
        //
        // Privilege matrix (enforced here AND at the page/middleware level):
        //
        //   super_admin → may assign any role in the system
        //   admin       → may assign: ops_manager, relocation_coordinator,
        //                             finance, driver, customer
        //                 BLOCKED from assigning: admin, super_admin
        //                 (prevents privilege escalation to peer/superior roles)
        //   All others  → blocked entirely (ops_manager, finance, driver, customer,
        //                 relocation_coordinator have no user-management rights)
        //
        // This guard runs on every update — even if the client-side UI already
        // hides restricted role options, the server re-validates unconditionally.
        // ─────────────────────────────────────────────────────────────────────
        const { createClient } = await import('@/lib/supabase/server');
        const serverClient = await createClient();
        const { data: { user: callerAuth }, error: sessionError } = await serverClient.auth.getUser();

        if (sessionError || !callerAuth) {
            return { success: false, message: 'Unauthorized: no active session' };
        }

        // Fetch caller role and current profile email in parallel (independent queries)
        const [
            { data: callerProfile, error: callerProfileError },
            { data: currentProfile },
        ] = await Promise.all([
            supabaseAdmin.from('profiles').select('role').eq('id', callerAuth.id).single(),
            supabaseAdmin.from('profiles').select('email').eq('id', userId).single(),
        ]);

        if (callerProfileError || !callerProfile) {
            return { success: false, message: 'Unauthorized: caller profile not found' };
        }

        const callerRole = callerProfile.role as string;

        // Only super_admin and admin may perform user updates
        if (!['admin', 'super_admin'].includes(callerRole)) {
            return { success: false, message: 'Forbidden: insufficient privileges' };
        }

        // Admin cannot elevate to admin or super_admin — only super_admin can
        if (callerRole === 'admin' && ['admin', 'super_admin'].includes(role)) {
            return {
                success: false,
                message: 'Forbidden: only a Super Admin can assign the Admin or Super Admin role',
            };
        }

        // 2. Update public.profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: fullName,
                role,
                phone: phone ?? null,
                avatar_url: avatar ?? null,
                updated_at: new Date().toISOString(),
                email,
            })
            .eq('id', userId);

        if (profileError) throw profileError;

        // 3. Update Auth: ban status + email change in a single call
        const authUpdate: { email?: string; ban_duration: string } = {
            ban_duration: status === false ? '876000h' : 'none',
        };
        if (currentProfile?.email !== email) authUpdate.email = email;
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdate);
        if (authError) throw authError;

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';

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
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/set-password`,
        });
        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Password Reset Error:', message);
        return { success: false, message };
    }
}
