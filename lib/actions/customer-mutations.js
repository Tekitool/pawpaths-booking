'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit-logger';

export async function deleteCustomer(customerId, reason) {
    const supabase = await createClient();

    // 0. Verify Admin Status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        return { success: false, message: 'Permission Denied: Admins only.' };
    }

    if (!reason) {
        return { success: false, message: 'Audit reason is required.' };
    }

    // 1. Check for active bookings
    const { count, error: checkError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .in('status', ['enquiry', 'quote_sent', 'confirmed', 'in_progress']);

    if (checkError) {
        console.error('Error checking bookings:', checkError);
        return { success: false, message: 'Failed to verify customer status.' };
    }

    if (count > 0) {
        return { success: false, message: 'Cannot delete customer with active bookings.' };
    }

    // 2. Perform Soft Delete (set deleted_at)
    const { error: deleteError } = await supabase
        .from('entities')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', customerId);

    if (deleteError) {
        console.error('Error deleting customer:', deleteError);
        return { success: false, message: 'Failed to delete customer.' };
    }

    // 3. Log Audit
    await logAuditAction(supabase, 'entities', customerId, 'DELETE', reason);

    revalidatePath('/admin/customers');
    return { success: true, message: 'Customer deleted successfully.' };
}

export async function updateCustomer(customerId, formData) {
    const supabase = await createClient();

    // 0. Verify Admin Status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        return { success: false, message: 'Permission Denied: Admins only.' };
    }

    const reason = formData.get('audit_reason');
    if (!reason) {
        return { success: false, message: 'Audit reason is required.' };
    }

    const updates = {
        display_name: formData.get('display_name'),
        contact_info: {
            email: formData.get('email'),
            phone: formData.get('phone'),
            whatsapp: formData.get('whatsapp')
        },
        type: formData.get('type'),
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('entities')
        .update(updates)
        .eq('id', customerId);

    if (error) {
        console.error('Error updating customer:', error);
        return { success: false, message: 'Failed to update customer.' };
    }

    // Log Audit
    await logAuditAction(supabase, 'entities', customerId, 'UPDATE', reason, { updates });

    revalidatePath('/admin/customers');
    return { success: true, message: 'Customer updated successfully.' };
}
