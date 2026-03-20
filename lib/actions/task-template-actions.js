'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAuditAction } from '@/lib/audit-logger';

// ── Schema ──────────────────────────────────────────────────────────────────

const templateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    service_scope: z.array(z.string()).default([]),
    anchor_event: z.string().optional(),
    days_offset: z.coerce.number().default(0),
});

// ── Read ────────────────────────────────────────────────────────────────────

export async function getTaskTemplates() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching task templates:', error);
        return [];
    }
    return data;
}

// ── Mutations ───────────────────────────────────────────────────────────────

export async function createTaskTemplate(template) {
    const parsed = templateSchema.safeParse(template);
    if (!parsed.success) {
        return { success: false, message: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('task_templates')
            .insert(parsed.data)
            .select()
            .single();

        if (error) {
            console.error('Error creating task template:', error);
            return { success: false, message: error.message };
        }

        await logAuditAction(
            supabase,
            'task_templates',
            data.id,
            'CREATE',
            `Created task template: ${parsed.data.title}`,
            parsed.data
        );

        revalidatePath('/admin/settings');
        return { success: true, data };
    } catch (err) {
        console.error('[createTaskTemplate]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}

export async function updateTaskTemplate(id, updates) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('task_templates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating task template:', error);
            return { success: false, message: error.message };
        }

        await logAuditAction(
            supabase,
            'task_templates',
            id,
            'UPDATE',
            `Updated task template: ${data.title}`,
            updates
        );

        revalidatePath('/admin/settings');
        return { success: true, data };
    } catch (err) {
        console.error('[updateTaskTemplate]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}

export async function deleteTaskTemplate(id) {
    try {
        const supabase = await createClient();

        const { data: template } = await supabase.from('task_templates').select('title').eq('id', id).single();

        const { error } = await supabase
            .from('task_templates')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting task template:', error);
            return { success: false, message: error.message };
        }

        await logAuditAction(
            supabase,
            'task_templates',
            id,
            'DELETE',
            `Deleted task template: ${template?.title || id}`,
            { id }
        );

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (err) {
        console.error('[deleteTaskTemplate]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}

export async function seedDefaultTemplates() {
    try {
        const supabase = await createClient();

        const defaults = [
            { title: 'Initial Vet Consult & Vaccinations', description: 'Check microchip, rabies validity, and schedule boosters if needed.', priority: 'high', service_scope: ['export', 'import'], anchor_event: 'scheduled_departure', days_offset: -30 },
            { title: 'Check Import Requirements', description: 'Verify destination country entry requirements and breed restrictions.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -28 },
            { title: 'Order Travel Crate', description: 'Measure pet and order IATA compliant travel crate.', priority: 'medium', service_scope: ['export', 'domestic'], anchor_event: 'scheduled_departure', days_offset: -21 },
            { title: 'Crate Training Advice', description: 'Send crate training guide to customer.', priority: 'low', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -20 },
            { title: 'Book Flight Cargo', description: 'Request space confirmation with airline.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -14 },
            { title: 'Apply for Import Permit', description: 'Submit application to destination country ministry/authority.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -10 },
            { title: 'Draft Health Certificate', description: 'Prepare draft government health certificate for review.', priority: 'medium', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -7 },
            { title: 'Request Flight Confirmation', description: 'Ensure airway bill (AWB) is issued.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -7 },
            { title: 'Collect Original Docs', description: 'Collect vaccination book and passport from owner.', priority: 'medium', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -5 },
            { title: 'Final Vet Check', description: 'Clinical exam for health certificate endorsement.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -2 },
            { title: 'Ministry Endorsement', description: 'Get official stamp on health certificate from government vet.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -1 },
            { title: 'Prepare Travel Pouch', description: 'Assemble original docs, AWB, and copies attached to crate.', priority: 'medium', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -1 },
            { title: 'Airport Check-In', description: 'Lodge pet at cargo terminal.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: 0 },
            { title: 'Send Pre-Alert', description: 'Email flight details and copies of docs to destination agent/owner.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: 0 },
            { title: 'Arrival Clearance', description: 'Clear customs and vet inspection at destination.', priority: 'high', service_scope: ['import'], anchor_event: 'scheduled_arrival', days_offset: 0 },
        ];

        const { error } = await supabase
            .from('task_templates')
            .insert(defaults);

        if (error) {
            console.error('Error seeding templates:', error);
            return { success: false, message: error.message };
        }

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (err) {
        console.error('[seedDefaultTemplates]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}
