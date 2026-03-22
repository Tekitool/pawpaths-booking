'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit-logger';

/**
 * Add or update a pet on an admin booking.
 *
 * @param {string} bookingUUID  - booking.id (UUID, not booking_number)
 * @param {Object} petData      - Form fields from PetDetailsForm
 * @param {string|null} petId   - Existing pet UUID for edit, null for add
 */
export async function upsertAdminPet(bookingUUID, petData, petId = null) {
    if (!bookingUUID) return { success: false, message: 'Invalid booking ID' };

    const supabase = await createClient();

    // Normalise age → age_years (decimal)
    let ageYears = null;
    const rawAge = parseFloat(petData.age);
    if (!isNaN(rawAge) && rawAge >= 0) {
        ageYears = petData.ageUnit === 'months' ? rawAge / 12 : rawAge;
    }

    // Normalise medical_alerts: form stores a plain string; DB expects JSONB array
    let medicalAlerts = [];
    const alertStr = (petData.medical_alerts || '').trim();
    if (alertStr) medicalAlerts = [alertStr];

    const petRecord = {
        name: (petData.name || '').trim(),
        species_id: petData.species_id ? parseInt(petData.species_id) : null,
        breed_id: petData.breed_id ? parseInt(petData.breed_id) : null,
        gender: petData.gender || null,
        age_years: ageYears,
        weight_kg: petData.weight !== '' && petData.weight !== null && petData.weight !== undefined
            ? parseFloat(petData.weight)
            : null,
        date_of_birth: petData.date_of_birth || null,
        microchip_id: (petData.microchip_id || '').trim() || null,
        passport_number: (petData.passport_number || '').trim() || null,
        medical_alerts: medicalAlerts,
    };

    const specialRequirements = (petData.specialRequirements || '').trim();

    try {
        let newPetId = petId;

        if (petId) {
            // ── EDIT: update pets row + booking_pets notes ─────────────────
            const { error: petError } = await supabase
                .from('pets')
                .update(petRecord)
                .eq('id', petId);
            if (petError) throw petError;

            const { error: bpError } = await supabase
                .from('booking_pets')
                .update({ notes: specialRequirements || null })
                .eq('booking_id', bookingUUID)
                .eq('pet_id', petId);
            if (bpError) throw bpError;

            await logAuditAction(supabase, 'pets', petId, 'UPDATE', 'Admin updated pet profile', petRecord);
        } else {
            // ── ADD: insert new pet + link to booking ──────────────────────
            const { data: newPet, error: insertError } = await supabase
                .from('pets')
                .insert(petRecord)
                .select('id')
                .single();
            if (insertError) throw insertError;

            newPetId = newPet.id;

            const { error: linkError } = await supabase
                .from('booking_pets')
                .insert({
                    booking_id: bookingUUID,
                    pet_id: newPetId,
                    notes: specialRequirements || null,
                });
            if (linkError) throw linkError;

            await logAuditAction(
                supabase, 'pets', newPetId, 'INSERT',
                'Admin added pet to booking',
                { bookingId: bookingUUID, ...petRecord }
            );
        }

        revalidatePath('/admin/relocations/[id]', 'page');
        return { success: true, petId: newPetId };
    } catch (error) {
        console.error('upsertAdminPet error:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Update one or more pet fields inline (microchip, passport, medical alerts,
 * special requirements). Used by the auto-save textareas in DocumentStatusSection.
 *
 * @param {string}  petId     - pets.id (UUID)
 * @param {Object}  fields    - Partial: { microchip_id, passport_number, medical_alerts, specialRequirements }
 * @param {string}  [bookingId] - Required when fields includes specialRequirements (stored in booking_pets.notes)
 */
export async function updatePetFields(petId, fields, bookingId = null) {
    if (!petId || petId === 'default') return { success: false, message: 'Invalid pet ID' };

    const supabase = await createClient();

    const petUpdate = {};
    const bpUpdate = {};

    if ('microchip_id' in fields) petUpdate.microchip_id = (fields.microchip_id || '').trim() || null;
    if ('passport_number' in fields) petUpdate.passport_number = (fields.passport_number || '').trim() || null;
    if ('medical_alerts' in fields) {
        const str = (fields.medical_alerts || '').trim();
        petUpdate.medical_alerts = str ? [str] : [];
    }
    if ('specialRequirements' in fields && bookingId) {
        bpUpdate.notes = (fields.specialRequirements || '').trim() || null;
    }

    try {
        if (Object.keys(petUpdate).length > 0) {
            const { error } = await supabase.from('pets').update(petUpdate).eq('id', petId);
            if (error) throw error;
        }
        if (Object.keys(bpUpdate).length > 0 && bookingId) {
            const { error } = await supabase
                .from('booking_pets')
                .update(bpUpdate)
                .eq('pet_id', petId)
                .eq('booking_id', bookingId);
            if (error) throw error;
        }

        await logAuditAction(
            supabase, 'pets', petId, 'UPDATE',
            `Updated fields: ${Object.keys(fields).join(', ')}`,
            { fields }
        );

        revalidatePath('/admin/relocations/[id]', 'page');
        return { success: true };
    } catch (error) {
        console.error('updatePetFields error:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Soft-delete a pet from an admin booking.
 * Sets is_active=false, deleted_at=NOW(), deletion_reason on the pets row.
 * Records the action in system_audit_logs.
 *
 * @param {string} bookingUUID - booking.id (UUID)
 * @param {string} petId       - pets.id (UUID) to deactivate
 * @param {string} reason      - Mandatory audit reason captured from modal
 */
export async function deleteAdminPet(bookingUUID, petId, reason) {
    if (!bookingUUID || !petId) return { success: false, message: 'Invalid parameters' };
    if (!reason?.trim()) return { success: false, message: 'A reason is required to remove a pet' };

    const supabase = await createClient();

    try {
        // Server-side guard: ensure at least one OTHER active pet remains on this booking
        const { data: linkedPets } = await supabase
            .from('booking_pets')
            .select('pet_id')
            .eq('booking_id', bookingUUID);

        const otherPetIds = (linkedPets || []).map(lp => lp.pet_id).filter(id => id !== petId);

        if (otherPetIds.length > 0) {
            const { count: activePeerCount } = await supabase
                .from('pets')
                .select('id', { count: 'exact', head: true })
                .in('id', otherPetIds)
                .is('deleted_at', null);

            if (activePeerCount === 0) {
                return { success: false, message: 'Cannot remove the last active pet from a relocation' };
            }
        } else {
            // No other pets linked at all
            return { success: false, message: 'Cannot remove the last active pet from a relocation' };
        }

        const { error } = await supabase
            .from('pets')
            .update({
                is_active: false,
                deleted_at: new Date().toISOString(),
            })
            .eq('id', petId);
        if (error) throw error;

        await logAuditAction(
            supabase, 'pets', petId, 'DELETE',
            reason.trim(),
            { bookingId: bookingUUID }
        );

        revalidatePath('/admin/relocations/[id]', 'page');
        revalidatePath('/admin/relocations');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('deleteAdminPet error:', error);
        return { success: false, message: error.message };
    }
}
