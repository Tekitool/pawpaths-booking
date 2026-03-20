'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const RuleSchema = z.object({
    service_id: z.string().uuid(),
    rule_type: z.enum(['requires', 'conflicts', 'suggests']),
    target_service_id: z.string().uuid(),
    notes: z.string().optional(),
});

export async function getRulesForService(serviceId) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('service_rules')
        .select(`
            *,
            target:service_catalog!service_rules_target_service_id_fkey(id, name, code)
        `)
        .eq('service_id', serviceId)
        .order('rule_type');

    if (error) {
        console.error('Error fetching service rules:', error);
        return [];
    }
    return data;
}

export async function addServiceRule(data) {
    const result = RuleSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.flatten().fieldErrors };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('service_rules')
        .insert(result.data);

    if (error) {
        if (error.code === '23505') {
            return { success: false, message: 'This rule already exists.' };
        }
        console.error('Error adding service rule:', error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/services');
    return { success: true };
}

export async function removeServiceRule(id) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('service_rules')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error removing service rule:', error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/services');
    return { success: true };
}
