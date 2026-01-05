import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAuditAction } from '@/lib/audit-logger';

async function checkAdmin(supabase) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile && ['admin', 'super_admin'].includes(profile.role);
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const supabase = await createClient();

        if (!await checkAdmin(supabase)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        // Extract audit reason
        const { audit_reason, ...updateFields } = body;

        // Map frontend camelCase to DB snake_case if needed
        const updateData = {};
        if (updateFields.name !== undefined) updateData.name = updateFields.name;
        if (updateFields.shortDescription !== undefined) updateData.short_description = updateFields.shortDescription;
        if (updateFields.longDescription !== undefined) updateData.long_description = updateFields.longDescription;
        if (updateFields.requirements !== undefined) updateData.requirements = updateFields.requirements;
        if (updateFields.baseCost !== undefined) updateData.base_cost = updateFields.baseCost;
        if (updateFields.basePrice !== undefined) updateData.base_price = updateFields.basePrice;
        if (updateFields.isMandatory !== undefined) updateData.is_mandatory = updateFields.isMandatory;
        if (updateFields.isActive !== undefined) updateData.is_active = updateFields.isActive;

        const { data, error } = await supabase
            .from('service_catalog')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Log Audit if reason provided or if it's a significant change
        if (audit_reason) {
            await logAuditAction(supabase, 'service_catalog', id, 'UPDATE', audit_reason, updateData);
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        if (!await checkAdmin(supabase)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        let audit_reason = 'No reason provided';
        try {
            const body = await req.json();
            if (body && body.audit_reason) {
                audit_reason = body.audit_reason;
            }
        } catch (e) {
            // Body might be empty
        }

        const { error } = await supabase
            .from('service_catalog')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await logAuditAction(supabase, 'service_catalog', id, 'DELETE', audit_reason);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
