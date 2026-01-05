'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { getPublicUrl, STORAGE_BUCKETS } from '@/lib/services/storage';
import { logAuditAction } from '@/lib/audit-logger';

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
                pet:pets(
                    *,
                    breed:breeds(name)
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
                    pet:pets(
                        *,
                        breed:breeds(name)
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

    // Create Admin Client for signing URLs (Bypass RLS)
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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

    // Pre-sign private documents
    const passportUrl = await getSignedUrl(booking.passport_path);
    const vaccinationUrl = await getSignedUrl(booking.vaccination_path);
    const rabiesUrl = await getSignedUrl(booking.rabies_path);

    // Map Pets
    const pets = booking.booking_pets?.map(bp => {
        const photoPath = bp.pet.photo_path; // Assuming this field exists in DB
        // Use individual photo if available, otherwise use booking fallback
        const photoUrl = photoPath ? getPublicUrl(STORAGE_BUCKETS.PHOTOS, photoPath) : bookingPhotoUrl;

        return {
            ...bp.pet,
            specialRequirements: bp.pet.medical_alerts?.[0] || '', // Assuming array
            age: bp.pet.age_years,
            ageUnit: 'years',
            weight: bp.pet.weight_kg,
            type: bp.pet.species_id === 1 ? 'Dog' : bp.pet.species_id === 2 ? 'Cat' : 'Pet', // Simplified mapping
            breed: bp.pet.breed?.name || 'Unknown Breed', // Map breed name
            photoUrl: photoUrl
        };
    }) || [];

    // Map Travel Details (Extract from internal_notes or fields)
    const notes = booking.internal_notes || '';
    const originMatch = notes.match(/Origin: (.*?) \((.*?)\)/);
    const destMatch = notes.match(/Destination: (.*?) \((.*?)\)/);

    // Helper to normalize country codes
    const normalizeCountry = (code) => {
        if (!code) return 'Unknown';
        if (code === 'US') return 'USA';
        if (code === 'AE') return 'UAE';
        return code;
    };

    return {
        id: booking.id,
        bookingId: booking.booking_number,
        status: { current: booking.status },
        createdAt: booking.created_at,
        customerInfo: {
            fullName: booking.customer?.display_name,
            email: booking.customer?.contact_info?.email,
            phone: booking.customer?.contact_info?.phone,
            city: booking.customer?.contact_info?.city,
        },
        travelDetails: {
            originCountry: normalizeCountry(originMatch ? originMatch[1] : 'Unknown'),
            originAirport: originMatch ? originMatch[2] : '',
            destinationCountry: normalizeCountry(destMatch ? destMatch[1] : 'Unknown'),
            destinationAirport: destMatch ? destMatch[2] : '',
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
        // Pass file paths for DocumentStatusSection
        pet_photo_path: booking.pet_photo_path,
        documents_path: booking.documents_path,
        passport_path: booking.passport_path,
        vaccination_path: booking.vaccination_path,
        rabies_path: booking.rabies_path,
        // Pass Signed URLs
        passportUrl,
        vaccinationUrl,
        rabiesUrl
    };
}

export async function updateLineItem(itemId, updates) {
    const supabase = await createClient();

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
            return { success: false, error: error.message };
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
        return { success: false, error: error.message };
    }
}

export async function removeLineItem(itemId) {
    const supabase = await createClient();

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
            return { success: false, error: error.message };
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
        return { success: false, error: error.message };
    }
}

export async function uploadBookingDocument(bookingId, documentType, formData) {
    const supabase = await createClient();
    const file = formData.get('file');

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    // Determine bucket and path based on document type
    let bucket = STORAGE_BUCKETS.DOCUMENTS;
    let column = '';

    switch (documentType) {
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
            return { success: false, error: 'Invalid document type' };
    }

    try {
        // 1. Upload file
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `admin-uploads/${bookingId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Update booking record
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ [column]: uploadData.path })
            .eq('id', bookingId);

        if (updateError) throw updateError;

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
        console.error('Error uploading document:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteBookingDocument(bookingId, documentType, reason) {
    const supabase = await createClient();

    let column = '';
    switch (documentType) {
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
            return { success: false, error: 'Invalid document type' };
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

        // We only clear the reference in the DB for safety, we don't delete the file from storage immediately
        // to prevent accidental data loss.
        const { error } = await supabase
            .from('bookings')
            .update({ [column]: null })
            .eq('id', bookingId);

        if (error) throw error;

        revalidatePath('/admin/relocations/[id]', 'page');
        return { success: true };

    } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message };
    }
}
