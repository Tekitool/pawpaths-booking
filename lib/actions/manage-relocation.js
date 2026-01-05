'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Updates customer details in the entities table
 */
export async function updateCustomerDetails(entityId, data) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('entities')
        .update(data)
        .eq('id', entityId);

    if (error) {
        console.error('Error updating customer:', error);
        throw new Error('Failed to update customer details');
    }

    revalidatePath('/admin/relocations');
    return { success: true };
}

/**
 * Adds a new pet to the system and links it to the booking
 */
export async function addPetToBooking(bookingId, petData) {
    const supabase = await createClient();

    // 1. Create the pet in 'pets' table
    const { data: newPet, error: petError } = await supabase
        .from('pets')
        .insert({
            name: petData.name,
            species_id: petData.species_id,
            breed_id: petData.breed_id,
            weight_kg: petData.weight_kg,
            age_years: petData.age_years,
            // Add other pet fields as needed
        })
        .select()
        .single();

    if (petError) {
        console.error('Error creating pet:', petError);
        throw new Error('Failed to create pet');
    }

    // 2. Link pet to booking in 'booking_pets'
    const { error: linkError } = await supabase
        .from('booking_pets')
        .insert({
            booking_id: bookingId,
            pet_id: newPet.id
        });

    if (linkError) {
        console.error('Error linking pet:', linkError);
        throw new Error('Failed to link pet to booking');
    }

    revalidatePath(`/admin/relocations`);
    return { success: true, pet: newPet };
}

/**
 * Updates logistics information (nodes, dates) for a booking
 */
export async function updateLogistics(bookingId, routeData) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('bookings')
        .update({
            scheduled_departure_date: routeData.scheduled_departure_date,
            origin_node_id: routeData.origin_node_id,
            destination_node_id: routeData.destination_node_id,
            // Add other logistics fields if needed
        })
        .eq('id', bookingId);

    if (error) {
        console.error('Error updating logistics:', error);
        throw new Error('Failed to update logistics');
    }

    revalidatePath(`/admin/relocations`);
    return { success: true };
}

/**
 * Adds a service line item to the booking
 */
export async function addServiceLineItem(bookingId, serviceData) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('booking_services')
        .insert({
            booking_id: bookingId,
            description: serviceData.description,
            amount: serviceData.amount,
            currency: serviceData.currency || 'AED',
            // Add other fields like tax_rate if needed
        });

    if (error) {
        console.error('Error adding service line item:', error);
        throw new Error('Failed to add service line item');
    }

    revalidatePath(`/admin/relocations`);
    return { success: true };
}
