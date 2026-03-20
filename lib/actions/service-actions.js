'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ServiceSchema = z.object({
    id: z.string().optional(),
    code: z.string().optional(),
    name: z.string().min(1, "Service name is required"),
    category_id: z.coerce.number().min(1, "Category is required"),
    icon: z.string().optional(),
    short_description: z.string().optional(),
    long_description: z.string().optional(),
    requirements: z.string().optional(),
    promo_badge: z.string().optional().default('none'),
    valid_species: z.array(z.string()).default([]),
    valid_service_types: z.array(z.string()).default([]),
    valid_transport_modes: z.array(z.string()).default([]),
    base_price: z.coerce.number().min(0, "Price must be positive"),
    base_cost: z.coerce.number().min(0, "Cost must be positive"),
    tax_rate: z.coerce.number().default(5.0),
    pricing_model: z.enum(['fixed', 'per_kg', 'per_km', 'percentage', 'per_day', 'per_item']),
    uom: z.string().optional().default('service'),
    is_mandatory: z.boolean().default(false),
    is_active: z.boolean().default(true),
});

import { logAuditAction } from '@/lib/audit-logger';

export async function upsertService(data) {
    const { audit_reason, ...serviceData } = data; // Extract audit_reason
    const result = ServiceSchema.safeParse(serviceData);

    if (!result.success) {
        return { success: false, error: result.error.flatten().fieldErrors };
    }

    const supabase = await createClient();
    const service = result.data;

    try {
        // Prepare data for DB (snake_case)
        const payload = {
            name: service.name,
            category_id: service.category_id,
            ...(service.code ? { code: service.code } : {}),
            icon: service.icon,
            short_description: service.short_description,
            long_description: service.long_description,
            requirements: service.requirements,
            promo_badge: service.promo_badge,
            valid_species: service.valid_species,
            valid_service_types: service.valid_service_types,
            valid_transport_modes: service.valid_transport_modes,
            base_price: service.base_price,
            base_cost: service.base_cost,
            tax_rate: service.tax_rate,
            pricing_model: service.pricing_model,
            uom: service.uom,
            is_mandatory: service.is_mandatory,
            is_active: service.is_active,
            updated_at: new Date().toISOString(),
        };

        let error;
        let entityId = service.id;
        let action = service.id ? 'UPDATE' : 'CREATE';

        if (service.id) {
            // Update
            if (!audit_reason) {
                return { success: false, message: 'Audit reason is required for updates.' };
            }

            // Capture price history before updating if price fields changed
            const { data: current } = await supabase
                .from('service_catalog')
                .select('base_price, base_cost, tax_rate')
                .eq('id', service.id)
                .single();

            if (current) {
                const priceChanged =
                    Number(current.base_price) !== service.base_price ||
                    Number(current.base_cost) !== service.base_cost ||
                    Number(current.tax_rate) !== service.tax_rate;

                if (priceChanged) {
                    await supabase.from('service_price_history').insert({
                        service_id: service.id,
                        base_price: current.base_price ?? 0,
                        base_cost: current.base_cost ?? 0,
                        tax_rate: current.tax_rate ?? 5.0,
                        change_note: audit_reason,
                    });
                }
            }

            const { error: updateError } = await supabase
                .from('service_catalog')
                .update(payload)
                .eq('id', service.id);
            error = updateError;
        } else {
            // Insert
            if (!payload.code) {
                const prefix = 'SVC';
                const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                payload.code = `${prefix}-${random}`;
            }

            const { data: insertedData, error: insertError } = await supabase
                .from('service_catalog')
                .insert(payload)
                .select()
                .single();

            if (insertedData) {
                entityId = insertedData.id;
            }
            error = insertError;
        }

        if (error) throw error;

        // Log Audit
        if (audit_reason || action === 'UPDATE') {
            await logAuditAction(supabase, 'service_catalog', entityId, action, audit_reason || 'Service Created', payload);
        }

        revalidatePath('/admin/services');
        return { success: true };

    } catch (error) {
        console.error('Error upserting service:', error);
        return { success: false, message: error.message };
    }
}

export async function getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data;
}

export async function getServiceCatalog() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('service_catalog')
        .select(`
            *,
            category:service_categories(*)
        `)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name');

    if (error) {
        console.error('Error fetching service catalog:', error);
        return [];
    }
    return data;
}

export async function deleteService(id, audit_reason) {
    if (!audit_reason) {
        return { success: false, message: 'Audit reason is required.' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('service_catalog')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', id);

    if (error) {
        console.error('Error soft-deleting service:', error);
        return { success: false, message: error.message };
    }

    await logAuditAction(supabase, 'service_catalog', id, 'DELETE', audit_reason, { deleted_at: new Date().toISOString() });

    revalidatePath('/admin/services');
    return { success: true };
}
