'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- SPECIES ---
export async function getSpecies() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('species')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching species:', error);
        return [];
    }

    // Custom Sort: Dog, Cat, Bird, then alphabetical
    const priority = ['Dog', 'Cat', 'Bird'];

    return data.sort((a, b) => {
        const indexA = priority.indexOf(a.name);
        const indexB = priority.indexOf(b.name);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return a.name.localeCompare(b.name);
    });
}

import { logAuditAction } from '@/lib/audit-logger';

// ... (existing imports)

export async function upsertSpecies(data) {
    const supabase = await createClient();
    const payload = {
        name: data.name,
        iata_code: data.iata_code,
        is_restricted_global: data.is_restricted_global || false,
        is_verified: true
    };

    let error;
    let action = 'CREATE';
    let entityId = data.id;

    if (data.id) {
        action = 'UPDATE';
        const { error: updateError } = await supabase
            .from('species')
            .update(payload)
            .eq('id', data.id);
        error = updateError;
    } else {
        const { data: inserted, error: insertError } = await supabase
            .from('species')
            .insert(payload)
            .select()
            .single();
        error = insertError;
        if (inserted) entityId = inserted.id;
    }

    if (error) return { success: false, message: error.message };

    // Log Audit
    await logAuditAction(
        supabase,
        'species',
        entityId || 'unknown',
        action,
        `${action === 'CREATE' ? 'Created' : 'Updated'} species: ${data.name}`,
        payload
    );

    revalidatePath('/admin/dashboard');
    return { success: true };
}

// ... (Breeds)

// --- BREEDS ---
export async function getBreeds(speciesId) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('breeds')
        .select('*')
        .eq('species_id', speciesId)
        .order('name');

    if (error) {
        console.error('Error fetching breeds:', error);
        return [];
    }
    return data;
}

export async function upsertBreed(data) {
    const supabase = await createClient();
    const payload = {
        species_id: data.species_id,
        name: data.name,
        is_brachycephalic: data.is_brachycephalic || false,
        is_restricted: data.is_restricted || false,
        iata_crate_rule: data.iata_crate_rule,
        avg_weight_kg: data.avg_weight_kg ? parseFloat(data.avg_weight_kg) : null,
        is_verified: true
    };

    let error;
    let action = 'CREATE';
    let entityId = data.id;

    if (data.id) {
        action = 'UPDATE';
        const { error: updateError } = await supabase
            .from('breeds')
            .update(payload)
            .eq('id', data.id);
        error = updateError;
    } else {
        const { data: inserted, error: insertError } = await supabase
            .from('breeds')
            .insert(payload)
            .select()
            .single();
        error = insertError;
        if (inserted) entityId = inserted.id;
    }

    if (error) return { success: false, message: error.message };

    // Log Audit
    await logAuditAction(
        supabase,
        'breeds',
        entityId || 'unknown',
        action,
        `${action === 'CREATE' ? 'Created' : 'Updated'} breed: ${data.name}`,
        payload
    );

    revalidatePath('/admin/dashboard');
    return { success: true };
}

// ... (Countries)

// --- COUNTRIES ---
export async function getCountries() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
    return data;
}

export async function upsertCountry(data) {
    const supabase = await createClient();
    const payload = {
        iso_code: data.iso_code?.toUpperCase(),
        iso_code_3: data.iso_code_3?.toUpperCase(),
        name: data.name,
        currency_code: data.currency_code?.toUpperCase(),
        phone_code: data.phone_code,
        timezone: data.timezone,
        requires_import_permit: data.requires_import_permit || false
    };

    let action = 'CREATE';
    let entityId = data.id;

    // Handle ID (Numeric Code)
    if (data.id) {
        // Check if exists
        const { data: existing } = await supabase.from('countries').select('id').eq('id', data.id).single();

        if (existing && !data.is_new) {
            action = 'UPDATE';
            const { error: updateError } = await supabase
                .from('countries')
                .update(payload)
                .eq('id', data.id);
            if (updateError) return { success: false, message: updateError.message };
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('countries')
                .insert({ ...payload, id: data.id });
            if (insertError) return { success: false, message: insertError.message };
        }
    } else {
        return { success: false, message: "Country ID (Numeric Code) is required." };
    }

    // Log Audit
    await logAuditAction(
        supabase,
        'countries',
        entityId,
        action,
        `${action === 'CREATE' ? 'Created' : 'Updated'} country: ${data.name}`,
        payload
    );

    revalidatePath('/admin/dashboard');
    return { success: true };
}

// --- DELETE ---
export async function deleteRecord(table, id) {
    const supabase = await createClient();

    // Constraint Check for Species
    if (table === 'species') {
        const { count, error } = await supabase
            .from('breeds')
            .select('*', { count: 'exact', head: true })
            .eq('species_id', id);

        if (error) return { success: false, message: error.message };
        if (count > 0) return { success: false, message: "Cannot delete Species with associated Breeds." };
    }

    // Fetch before delete for logging (generic)
    const { data: item } = await supabase.from(table).select('*').eq('id', id).single();
    const itemName = item?.name || item?.title || id;

    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

    if (error) return { success: false, message: error.message };

    // Log Audit
    await logAuditAction(
        supabase,
        table,
        id,
        'DELETE',
        `Deleted record from ${table}: ${itemName}`,
        { id }
    );

    revalidatePath('/admin/dashboard');
    return { success: true };
}
