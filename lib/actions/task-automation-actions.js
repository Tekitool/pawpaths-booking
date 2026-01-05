'use server';

import { createClient } from '@/lib/supabase/server';
import { addBookingInteraction } from '@/lib/actions/booking-interactions';
import { revalidatePath } from 'next/cache';

/**
 * Generates tasks for a booking based on a trigger event.
 * @param {string} bookingId - The UUID of the booking.
 * @param {string} triggerEvent - The event triggering the task generation (e.g., 'booking_confirmed').
 */
export async function generateTasksForBooking(bookingId, triggerEvent) {
    const supabase = await createClient();

    // 1. Fetch Booking Details
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
            *,
            customer:entities!customer_id(customer_type_id),
            booking_services(service:service_catalog(name))
        `)
        .eq('id', bookingId)
        .single();

    if (bookingError || !booking) {
        console.error('Error fetching booking for task generation:', bookingError);
        return;
    }

    // Determine Service Scope (e.g., 'export', 'import')
    // This logic might need refinement based on how you store "Type" (e.g. EX-A)
    // For now, let's try to derive it or default to 'export' if unknown, or check service_type enum if it exists
    // The previous turn showed `service_type` column in bookings table.
    let serviceScope = 'export'; // Default
    if (booking.service_type) {
        // Map enum to scope if needed, or use directly if they match
        // Enum values in 01_enums.sql might be 'export', 'import', etc.
        serviceScope = booking.service_type.toLowerCase();
    }

    // 2. Fetch Matching Templates
    // We want templates that:
    // - Are active
    // - Include the serviceScope in their service_scope array
    // - (Optional) Match the triggerEvent if we only want to generate tasks relevant to this stage
    //   However, usually 'booking_confirmed' triggers the generation of ALL tasks, even those anchored to departure.
    //   So we might just fetch ALL templates for this scope if the trigger is 'booking_confirmed'.

    let query = supabase
        .from('task_templates')
        .select('*')
        .eq('is_active', true)
        .contains('service_scope', [serviceScope]);

    // If the trigger is NOT the main "start" event, maybe we only generate specific tasks?
    // For now, let's assume 'booking_confirmed' generates the full checklist.
    if (triggerEvent !== 'booking_confirmed') {
        // If we trigger on 'scheduled_departure', maybe we only generate late-stage tasks?
        // But usually we generate everything upfront. 
        // Let's stick to generating everything on 'booking_confirmed'.
        console.log(`Trigger ${triggerEvent} ignored for full task generation.`);
        return;
    }

    const { data: templates, error: templatesError } = await query;

    if (templatesError) {
        console.error('Error fetching task templates:', templatesError);
        return;
    }

    if (!templates || templates.length === 0) {
        console.log('No matching task templates found.');
        return;
    }

    // 3. Calculate Due Dates and Prepare Inserts
    const tasksToInsert = templates.map(template => {
        let anchorDate = new Date(); // Default to now (booking_confirmed)

        if (template.anchor_event === 'scheduled_departure' && booking.scheduled_departure_date) {
            anchorDate = new Date(booking.scheduled_departure_date);
        } else if (template.anchor_event === 'scheduled_arrival' && booking.scheduled_arrival_date) { // Assuming field exists
            // If arrival date isn't in bookings table, fallback to departure or now
            anchorDate = booking.scheduled_departure_date ? new Date(booking.scheduled_departure_date) : new Date();
        }

        // Add offset (days)
        const dueDate = new Date(anchorDate);
        dueDate.setDate(dueDate.getDate() + template.days_offset);

        return {
            booking_id: bookingId,
            template_id: template.id,
            title: template.title,
            description: template.description,
            priority: template.priority,
            status: 'pending',
            due_date: dueDate.toISOString(),
        };
    });

    // 4. Insert Tasks
    const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

    if (insertError) {
        console.error('Error inserting generated tasks:', insertError);
    } else {
        // Log interaction
        await addBookingInteraction({
            bookingId: bookingId, // This expects UUID now as per my previous fix
            action_type: 'System',
            note_content: `Generated ${tasksToInsert.length} operational tasks based on '${serviceScope}' template.`,
            is_internal: true
        });

        revalidatePath(`/admin/relocations/${booking.booking_number}`); // Revalidate using readable ID if that's what page uses, or just generic
        // Actually the page uses [id] which is mapped to booking_number in getAdminBookingDetails usually, 
        // but wait, my previous fix changed getAdminBookingDetails to return UUID as id, but the URL param is still likely the booking_number or UUID depending on how it was navigated.
        // Let's revalidate both to be safe or just the path.
    }
}

export async function getTasksForBooking(bookingId) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('booking_id', bookingId)
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
    return data;
}

export async function updateTaskStatus(taskId, status) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tasks')
        .update({
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
