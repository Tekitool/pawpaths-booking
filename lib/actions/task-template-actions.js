'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

import { logAuditAction } from '@/lib/audit-logger';

// ... (existing imports)

export async function createTaskTemplate(template) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('task_templates')
        .insert(template)
        .select()
        .single();

    if (error) throw error;

    // Log Audit
    await logAuditAction(
        supabase,
        'task_templates',
        data.id,
        'CREATE',
        `Created task template: ${template.title}`,
        template
    );

    revalidatePath('/admin/settings');
    return data;
}

export async function updateTaskTemplate(id, updates) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('task_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    // Log Audit
    await logAuditAction(
        supabase,
        'task_templates',
        id,
        'UPDATE',
        `Updated task template: ${data.title}`,
        updates
    );

    revalidatePath('/admin/settings');
    return data;
}

export async function deleteTaskTemplate(id) {
    const supabase = await createClient();

    // Fetch before delete for logging
    const { data: template } = await supabase.from('task_templates').select('title').eq('id', id).single();

    const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', id);

    if (error) throw error;

    // Log Audit
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
}

export async function seedDefaultTemplates() {
    const supabase = await createClient();

    const defaults = [
        // Phase 1: Preparation
        { title: 'Initial Vet Consult & Vaccinations', description: 'Check microchip, rabies validity, and schedule boosters if needed.', priority: 'high', service_scope: ['export', 'import'], anchor_event: 'scheduled_departure', days_offset: -30 },
        { title: 'Check Import Requirements', description: 'Verify destination country entry requirements and breed restrictions.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -28 },
        { title: 'Order Travel Crate', description: 'Measure pet and order IATA compliant travel crate.', priority: 'medium', service_scope: ['export', 'domestic'], anchor_event: 'scheduled_departure', days_offset: -21 },
        { title: 'Crate Training Advice', description: 'Send crate training guide to customer.', priority: 'low', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -20 },
        { title: 'Book Flight Cargo', description: 'Request space confirmation with airline.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -14 },

        // Phase 2: Documentation
        { title: 'Apply for Import Permit', description: 'Submit application to destination country ministry/authority.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -10 },
        { title: 'Draft Health Certificate', description: 'Prepare draft government health certificate for review.', priority: 'medium', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -7 },
        { title: 'Request Flight Confirmation', description: 'Ensure airway bill (AWB) is issued.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -7 },
        { title: 'Collect Original Docs', description: 'Collect vaccination book and passport from owner.', priority: 'medium', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -5 },

        // Phase 3: Pre-Flight
        { title: 'Final Vet Check', description: 'Clinical exam for health certificate endorsement.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -2 },
        { title: 'Ministry Endorsement', description: 'Get official stamp on health certificate from government vet.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -1 },
        { title: 'Prepare Travel Pouch', description: 'Assemble original docs, AWB, and copies attached to crate.', priority: 'medium', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: -1 },

        // Phase 4: Departure & Arrival
        { title: 'Airport Check-In', description: 'Lodge pet at cargo terminal.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: 0 },
        { title: 'Send Pre-Alert', description: 'Email flight details and copies of docs to destination agent/owner.', priority: 'high', service_scope: ['export'], anchor_event: 'scheduled_departure', days_offset: 0 },
        { title: 'Arrival Clearance', description: 'Clear customs and vet inspection at destination.', priority: 'high', service_scope: ['import'], anchor_event: 'scheduled_arrival', days_offset: 0 }
    ];

    const { error } = await supabase
        .from('task_templates')
        .insert(defaults);

    if (error) throw error;
    revalidatePath('/admin/settings');
    return { success: true };
}
