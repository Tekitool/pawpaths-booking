'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ── Schemas ─────────────────────────────────────────────────────────────────

const petSchema = z.object({
    name: z.string().min(1, 'Pet name is required'),
    species_id: z.coerce.number().positive('Species is required'),
    breed_id: z.coerce.number().positive('Breed is required'),
    weight_kg: z.coerce.number().min(0).optional(),
    age_years: z.coerce.number().min(0).optional(),
});

const logisticsSchema = z.object({
    scheduled_departure_date: z.string().optional(),
    origin_node_id: z.coerce.number().optional(),
    destination_node_id: z.coerce.number().optional(),
});

const lineItemSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    amount: z.coerce.number().min(0, 'Amount must be positive'),
    currency: z.string().default('AED'),
});

// ── Actions ─────────────────────────────────────────────────────────────────

/**
 * Updates customer details in the entities table
 */
export async function updateCustomerDetails(entityId, data) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('entities')
            .update(data)
            .eq('id', entityId);

        if (error) {
            console.error('Error updating customer:', error);
            return { success: false, message: 'Failed to update customer details' };
        }

        revalidatePath('/admin/relocations');
        return { success: true };
    } catch (err) {
        console.error('[updateCustomerDetails]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}

/**
 * Adds a new pet to the system and links it to the booking
 */
export async function addPetToBooking(bookingId, petData) {
    const parsed = petSchema.safeParse(petData);
    if (!parsed.success) {
        return { success: false, message: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        const supabase = await createClient();

        // 1. Create the pet in 'pets' table
        const { data: newPet, error: petError } = await supabase
            .from('pets')
            .insert(parsed.data)
            .select()
            .single();

        if (petError) {
            console.error('Error creating pet:', petError);
            return { success: false, message: 'Failed to create pet' };
        }

        // 2. Link pet to booking in 'booking_pets'
        const { error: linkError } = await supabase
            .from('booking_pets')
            .insert({ booking_id: bookingId, pet_id: newPet.id });

        if (linkError) {
            console.error('Error linking pet:', linkError);
            return { success: false, message: 'Failed to link pet to booking' };
        }

        revalidatePath('/admin/relocations');
        return { success: true, data: newPet };
    } catch (err) {
        console.error('[addPetToBooking]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}

/**
 * Updates logistics information (nodes, dates) for a booking
 */
export async function updateLogistics(bookingId, routeData) {
    const parsed = logisticsSchema.safeParse(routeData);
    if (!parsed.success) {
        return { success: false, message: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('bookings')
            .update(parsed.data)
            .eq('id', bookingId);

        if (error) {
            console.error('Error updating logistics:', error);
            return { success: false, message: 'Failed to update logistics' };
        }

        revalidatePath('/admin/relocations');
        return { success: true };
    } catch (err) {
        console.error('[updateLogistics]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}

/**
 * Adds a service line item to the booking
 */
export async function addServiceLineItem(bookingId, serviceData) {
    const parsed = lineItemSchema.safeParse(serviceData);
    if (!parsed.success) {
        return { success: false, message: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('booking_services')
            .insert({
                booking_id: bookingId,
                ...parsed.data,
            });

        if (error) {
            console.error('Error adding service line item:', error);
            return { success: false, message: 'Failed to add service line item' };
        }

        revalidatePath('/admin/relocations');
        return { success: true };
    } catch (err) {
        console.error('[addServiceLineItem]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}
