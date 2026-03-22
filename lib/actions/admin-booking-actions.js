'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { getPublicUrl, STORAGE_BUCKETS } from '@/lib/services/storage';
import { logAuditAction } from '@/lib/audit-logger';

// Roles permitted to mutate booking data
const ADMIN_ROLES = ['super_admin', 'admin', 'ops_manager', 'ops_staff', 'finance_manager', 'finance_staff'];

async function _requireAdminRole(supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
        return { error: 'Insufficient permissions' };
    }
    return { user, profile };
}

export async function getAdminBookingDetails(bookingId) {
    const supabase = await createClient();

    // Fetch booking with nested services, customer, and pets
    const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
            *,
            items:booking_services(
                id, 
                quantity, 
                unit_price, 
                line_total, 
                service:service_catalog(name)
            ),
            customer:entities!customer_id(*),
            booking_pets(
                notes,
                pet:pets(
                    *,
                    breed:breeds(name, default_image_path)
                )
            )
        `)
        .eq('booking_number', bookingId) // Try booking_number first
        .single();

    if (error) {
        // Fallback: Try querying by UUID
        const { data: bookingByUuid, error: uuidError } = await supabase
            .from('bookings')
            .select(`
                *,
                items:booking_services(
                    id, 
                    quantity, 
                    unit_price, 
                    line_total, 
                    service:service_catalog(name)
                ),
                customer:entities!customer_id(*),
                booking_pets(
                    notes,
                    pet:pets(
                        *,
                        breed:breeds(name, default_image_path)
                    )
                )
            `)
            .eq('id', bookingId)
            .single();

        if (uuidError) {
            console.error('Error fetching booking:', error, uuidError);
            return null;
        }
        return await mapSupabaseToPage(bookingByUuid);
    }

    return await mapSupabaseToPage(booking);
}

async function mapSupabaseToPage(booking) {
    if (!booking) return null;

    const getSignedUrl = async (path) => {
        if (!path) return null;
        const { data, error } = await supabaseAdmin.storage
            .from(STORAGE_BUCKETS.DOCUMENTS)
            .createSignedUrl(path, 3600); // 1 hour validity
        if (error) console.error(`Error signing ${path}:`, error.message);
        return data?.signedUrl || null;
    };

    // Get Booking Level Photo (Fallback)
    const bookingPhotoPath = booking.pet_photo_path;
    const bookingPhotoUrl = bookingPhotoPath ? getPublicUrl(STORAGE_BUCKETS.PHOTOS, bookingPhotoPath) : null;

    // Pre-sign private documents (parallel)
    const [passportUrl, vaccinationUrl, rabiesUrl] = await Promise.all([
        getSignedUrl(booking.passport_path),
        getSignedUrl(booking.vaccination_path),
        getSignedUrl(booking.rabies_path),
    ]);

    // Parse Per-Pet documents map
    let extraDocuments = {};
    if (booking.documents_path) {
        try { extraDocuments = JSON.parse(booking.documents_path); } catch (e) { }
    }

    // Sign URLs for extra pets (parallel across pets and doc types)
    await Promise.all(
        Object.keys(extraDocuments).map(async (pId) => {
            const [pUrl, vUrl, rUrl] = await Promise.all([
                extraDocuments[pId].passport    ? getSignedUrl(extraDocuments[pId].passport)    : Promise.resolve(null),
                extraDocuments[pId].vaccination ? getSignedUrl(extraDocuments[pId].vaccination) : Promise.resolve(null),
                extraDocuments[pId].rabies      ? getSignedUrl(extraDocuments[pId].rabies)      : Promise.resolve(null),
            ]);
            if (extraDocuments[pId].passport)    extraDocuments[pId].passportUrl    = pUrl;
            if (extraDocuments[pId].vaccination) extraDocuments[pId].vaccinationUrl = vUrl;
            if (extraDocuments[pId].rabies)      extraDocuments[pId].rabiesUrl      = rUrl;
        })
    );

    // Map Pets safely — exclude soft-deleted pets (deleted_at is set by deleteAdminPet)
    const rawBookingPets = Array.isArray(booking.booking_pets)
        ? booking.booking_pets.filter(bp => !bp?.pet?.deleted_at)
        : [];
    const pets = rawBookingPets.map(bp => {
        // Protect against null pet
        const petObj = bp?.pet || {};

        // Resolve photo: photos JSONB array (primary) → photo_path string (legacy) → booking fallback
        const photosArr = petObj.photos;
        let photoUrl = null;
        if (Array.isArray(photosArr) && photosArr.length > 0) {
            // photos column stores objects with { url, storage_path, bucket, source }
            photoUrl = photosArr[0].url || null;
        }
        if (!photoUrl && petObj.photo_path) {
            photoUrl = getPublicUrl(STORAGE_BUCKETS.PHOTOS, petObj.photo_path);
        }
        if (!photoUrl) {
            photoUrl = bookingPhotoUrl;
        }

        // Enforce medicalAlerts as Array
        const rawAlerts = petObj.medical_alerts;
        const alertsArr = Array.isArray(rawAlerts) ? rawAlerts : (rawAlerts ? [rawAlerts] : []);

        // Breed default image for avatar in Documents frame
        const breedDefaultPath = petObj.breed?.default_image_path;
        const breedPhotoUrl = breedDefaultPath ? getPublicUrl(STORAGE_BUCKETS.AVATARS, breedDefaultPath) : null;

        return {
            ...petObj,
            specialRequirements: bp.notes || '',              // from booking_pets.notes
            medicalAlerts: alertsArr,                           // strictly an array
            age: petObj.age_years,
            ageUnit: 'years',
            weight: petObj.weight_kg,
            type: petObj.species_id === 1 ? 'Dog' : petObj.species_id === 2 ? 'Cat' : 'Pet', // Simplified mapping
            breed: petObj.breed?.name || 'Unknown Breed', // Map breed name
            breedPhotoUrl,
            photoUrl: photoUrl
        };
    }) || [];

    const parseJsonFallback = (val) => {
        if (!val) return {};
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return {}; }
        }
        return val || {};
    };

    try {
        // Map Travel Details from origin_raw/destination_raw JSON columns
        const origin = parseJsonFallback(booking.origin_raw);
        const destination = parseJsonFallback(booking.destination_raw);

        const customerObj = Array.isArray(booking.customer) ? (booking.customer[0] || {}) : (booking.customer || {});

        return {
            id: booking.id,
            bookingId: booking.booking_number,
            status: { current: booking.status },
            createdAt: booking.created_at,
            internal_notes: booking.internal_notes || '',
            customerInfo: {
                id: customerObj.id,
                fullName: customerObj.display_name || 'Unknown',
                email: customerObj.contact_info?.email || '',
                phone: customerObj.contact_info?.phone || '',
                city: customerObj.contact_info?.city || '',
            },
            travelDetails: {
                originCountry: origin.country || '',
                originAirport: origin.airport || '',
                destinationCountry: destination.country || '',
                destinationAirport: destination.airport || '',
                travelDate: booking.scheduled_departure_date,
                transportMode: booking.transport_mode
            },
            pets: pets,
            items: booking.items?.map(item => ({
                id: item.id,
                name: item.service?.name || 'Unknown Service',
                quantity: item.quantity,
                unitPrice: item.unit_price,
                total: item.line_total || (item.quantity * item.unit_price)
            })) || [],
            pet_photo_path: booking.pet_photo_path,
            documents_path: booking.documents_path,
            passport_path: booking.passport_path,
            vaccination_path: booking.vaccination_path,
            rabies_path: booking.rabies_path,
            passportUrl,
            vaccinationUrl,
            rabiesUrl,
            extraDocuments
        };
    } catch (e) {
        console.error("MAPPING ERROR IN getAdminBookingDetails:", e);
        throw e;
    }
}

export async function updateBookingInternalNotes(bookingId, notes) {
    const supabase = await createClient();
    const auth = await _requireAdminRole(supabase);
    if (auth.error) return { success: false, message: auth.error };
    const { error } = await supabase
        .from('bookings')
        .update({ internal_notes: notes })
        .eq('id', bookingId);
    if (error) return { success: false, message: error.message };
    revalidatePath('/admin/relocations/[id]', 'page');
    return { success: true };
}

export async function updateLineItem(itemId, updates) {
    const supabase = await createClient();
    const auth = await _requireAdminRole(supabase);
    if (auth.error) return { success: false, message: auth.error };

    try {
        // Fetch item details for logging before update
        const { data: item } = await supabase
            .from('booking_services')
            .select('booking_id, service:service_catalog(name)')
            .eq('id', itemId)
            .single();

        const { error } = await supabase
            .from('booking_services')
            .update(updates)
            .eq('id', itemId);

        if (error) {
            console.error('Error updating line item:', error);
            return { success: false, message: error.message };
        }

        if (item) {
            await logAuditAction(
                supabase,
                'booking_services',
                itemId,
                'UPDATE',
                `Updated service: ${item.service?.name || 'Unknown'}`,
                { booking_id: item.booking_id, updates }
            );
        }

        revalidatePath('/admin/relocations/[id]', 'page');
        return { success: true };
    } catch (error) {
        console.error('Error in updateLineItem:', error);
        return { success: false, message: error.message };
    }
}

export async function removeLineItem(itemId) {
    const supabase = await createClient();
    const auth = await _requireAdminRole(supabase);
    if (auth.error) return { success: false, message: auth.error };

    try {
        // Fetch item details for logging before delete
        const { data: item } = await supabase
            .from('booking_services')
            .select('booking_id, service:service_catalog(name)')
            .eq('id', itemId)
            .single();

        const { error } = await supabase
            .from('booking_services')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Error removing line item:', error);
            return { success: false, message: error.message };
        }

        if (item) {
            await logAuditAction(
                supabase,
                'booking_services',
                itemId,
                'DELETE',
                `Removed service: ${item.service?.name || 'Unknown'}`,
                { booking_id: item.booking_id }
            );
        }

        revalidatePath('/admin/relocations/[id]', 'page');
        return { success: true };
    } catch (error) {
        console.error('Error in removeLineItem:', error);
        return { success: false, message: error.message };
    }
}

export async function uploadBookingDocument(bookingId, documentType, formData) {
    const supabase = await createClient();
    const auth = await _requireAdminRole(supabase);
    if (auth.error) return { success: false, message: auth.error };

    const file = formData.get('file');

    if (!file) {
        return { success: false, message: 'No file provided' };
    }

    let baseType = documentType;
    let petId = null;

    if (documentType.includes('_') && documentType !== 'pet_photo_path') {
        const parts = documentType.split('_');
        baseType = parts[0];
        petId = parts.slice(1).join('_');
    }

    // Determine bucket and path based on document type
    let bucket = STORAGE_BUCKETS.DOCUMENTS;
    let column = '';

    switch (baseType) {
        case 'photo':
            bucket = STORAGE_BUCKETS.PHOTOS;
            column = 'pet_photo_path';
            break;
        case 'passport':
            column = 'passport_path';
            break;
        case 'vaccination':
            column = 'vaccination_path';
            break;
        case 'rabies':
            column = 'rabies_path';
            break;
        default:
            return { success: false, message: 'Invalid document type' };
    }

    try {
        // Validate petId belongs to this booking to prevent path traversal
        if (petId) {
            const { data: bookingCheck } = await supabase
                .from('bookings')
                .select('booking_pets(pet_id)')
                .eq('id', bookingId)
                .single();
            const validPetIds = (bookingCheck?.booking_pets || []).map(bp => bp.pet_id);
            if (!validPetIds.includes(petId)) {
                return { success: false, message: 'Invalid pet ID for this booking' };
            }
        }

        // 1. Upload file
        const fileExt = (file.name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const folder = petId ? `admin-uploads/${bookingId}/pets/${petId}` : `admin-uploads/${bookingId}`;
        const filePath = `${folder}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Update booking record
        if (petId) {
            const { data: booking } = await supabase.from('bookings').select('documents_path').eq('id', bookingId).single();
            let docsMap = {};
            if (booking && booking.documents_path) {
                try { docsMap = JSON.parse(booking.documents_path); } catch (e) { }
            }
            if (!docsMap[petId]) docsMap[petId] = {};
            docsMap[petId][baseType] = uploadData.path;

            const { error: updateError } = await supabase.from('bookings').update({ documents_path: JSON.stringify(docsMap) }).eq('id', bookingId);
            if (updateError) throw updateError;
        } else {
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ [column]: uploadData.path })
                .eq('id', bookingId);

            if (updateError) throw updateError;
        }

        // 3. Log Audit
        await logAuditAction(
            supabase,
            'bookings',
            bookingId,
            'CREATE',
            `Uploaded document: ${documentType}`,
            { documentType, fileName: file.name, path: uploadData.path }
        );

        revalidatePath('/admin/relocations/[id]', 'page');
        return { success: true };

    } catch (error) {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureException(error, { extra: { bookingId, documentType } });
        return { success: false, message: 'Failed to upload document. Please try again.' };
    }
}

export async function deleteBookingDocument(bookingId, documentType, reason) {
    const supabase = await createClient();
    const auth = await _requireAdminRole(supabase);
    if (auth.error) return { success: false, message: auth.error };

    let baseType = documentType;
    let petId = null;

    if (documentType.includes('_') && documentType !== 'pet_photo_path') {
        const parts = documentType.split('_');
        baseType = parts[0];
        petId = parts.slice(1).join('_');
    }

    let column = '';
    switch (baseType) {
        case 'photo':
            column = 'pet_photo_path';
            break;
        case 'passport':
            column = 'passport_path';
            break;
        case 'vaccination':
            column = 'vaccination_path';
            break;
        case 'rabies':
            column = 'rabies_path';
            break;
        default:
            return { success: false, message: 'Invalid document type' };
    }

    try {
        // Log the action first
        await logAuditAction(
            supabase,
            'bookings',
            bookingId,
            'DELETE',
            reason || 'No reason provided',
            { documentType, column }
        );

        if (petId) {
            const { data: booking } = await supabase.from('bookings').select('documents_path').eq('id', bookingId).single();
            if (booking && booking.documents_path) {
                let docsMap = {};
                try { docsMap = JSON.parse(booking.documents_path); } catch (e) { }
                if (docsMap[petId]) {
                    delete docsMap[petId][baseType];
                    const { error } = await supabase.from('bookings').update({ documents_path: JSON.stringify(docsMap) }).eq('id', bookingId);
                    if (error) throw error;
                }
            }
        } else {
            const { error } = await supabase
                .from('bookings')
                .update({ [column]: null })
                .eq('id', bookingId);

            if (error) throw error;
        }

        revalidatePath('/admin/relocations/[id]', 'page');
        return { success: true };

    } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Update a single identifier field (microchip_id or passport_number) on a pet.
 * Allowlist prevents arbitrary column updates.
 */
export async function updatePetIdentifier(petId, field, value) {
    const ALLOWED_FIELDS = ['microchip_id', 'passport_number'];
    if (!ALLOWED_FIELDS.includes(field)) {
        return { success: false, message: 'Invalid field' };
    }
    if (!petId || petId === 'default') {
        return { success: false, message: 'Invalid pet ID' };
    }

    const supabase = await createClient();
    const auth = await _requireAdminRole(supabase);
    if (auth.error) return { success: false, message: auth.error };

    try {
        const { error } = await supabase
            .from('pets')
            .update({ [field]: value.trim() || null })
            .eq('id', petId);

        if (error) throw error;

        await logAuditAction(
            supabase,
            'pets',
            petId,
            'UPDATE',
            `Updated ${field === 'microchip_id' ? 'microchip number' : 'passport number'}`,
            { field, value: value.trim() || null }
        );

        revalidatePath('/admin/relocations/[id]', 'page');
        return { success: true };
    } catch (error) {
        console.error(`Error updating pet ${field}:`, error);
        return { success: false, message: error.message };
    }
}
