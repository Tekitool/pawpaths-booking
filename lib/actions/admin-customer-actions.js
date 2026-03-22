'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAuditAction } from '@/lib/audit-logger';

const ADMIN_ROLES = ['super_admin', 'admin', 'ops_manager', 'ops_staff', 'finance_manager', 'finance_staff'];

const customerProfileSchema = z.object({
    fullName: z.string().min(1, 'Full name is required').max(200),
    email:    z.string().email('Invalid email address'),
    phone:    z.string().min(1, 'Phone number is required').max(50),
    city:     z.string().max(100).optional().default(''),
});

/**
 * Updates display_name and contact_info fields on the entities row.
 * Merges into existing contact_info JSONB to preserve any non-UI fields.
 */
export async function updateCustomerProfile(customerId, data) {
    try {
        const parsed = customerProfileSchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, message: parsed.error.errors[0]?.message || 'Invalid data' };
        }

        const { fullName, email, phone, city } = parsed.data;

        const supabase = await createClient();

        // ── Auth guard ────────────────────────────────────────────────
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !ADMIN_ROLES.includes(profile.role)) {
            return { success: false, message: 'Insufficient permissions' };
        }
        // ─────────────────────────────────────────────────────────────

        // Fetch existing entity to safely merge contact_info
        const { data: entity, error: fetchError } = await supabase
            .from('entities')
            .select('contact_info')
            .eq('id', customerId)
            .single();

        if (fetchError || !entity) {
            return { success: false, message: 'Customer not found' };
        }

        const { error } = await supabase
            .from('entities')
            .update({
                display_name: fullName,
                contact_info: {
                    ...(entity.contact_info || {}),
                    email,
                    phone,
                    city,
                },
            })
            .eq('id', customerId);

        if (error) {
            console.error('[updateCustomerProfile] Supabase error:', error);
            return { success: false, message: 'Failed to update customer profile' };
        }

        await logAuditAction(
            supabase,
            'entities',
            customerId,
            'UPDATE',
            'Customer profile updated via admin panel',
            { fullName, email, phone, city },
        );

        revalidatePath('/admin/relocations/[id]', 'page');
        revalidatePath('/admin/relocations');

        return { success: true };
    } catch (err) {
        console.error('[updateCustomerProfile]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}
