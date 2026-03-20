'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const OverrideSchema = z.object({
    service_id: z.string().uuid(),
    country_code: z.string().length(2),
    price_override: z.coerce.number().min(0).nullable().optional(),
    cost_override: z.coerce.number().min(0).nullable().optional(),
    is_active: z.boolean().default(true),
});

export async function getOverridesForService(serviceId) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('service_price_overrides')
        .select('*')
        .eq('service_id', serviceId)
        .order('country_code');

    if (error) {
        console.error('Error fetching price overrides:', error);
        return [];
    }
    return data;
}

export async function upsertPriceOverride(data) {
    const result = OverrideSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.flatten().fieldErrors };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('service_price_overrides')
        .upsert(result.data, { onConflict: 'service_id,country_code' });

    if (error) {
        console.error('Error upserting price override:', error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/services');
    return { success: true };
}

export async function deletePriceOverride(id) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('service_price_overrides')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting price override:', error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/services');
    return { success: true };
}
