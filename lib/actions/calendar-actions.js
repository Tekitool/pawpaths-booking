'use server';
import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function getCalendarEvents() {
    noStore();
    const supabase = await createClient();

    // Fetch bookings with related data
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            id, 
            booking_number, 
            status, 
            scheduled_departure_date,
            transport_mode,
            customer:customer_id(display_name), 
            origin:origin_node_id(iata_code, city),
            destination:destination_node_id(iata_code, city),
            booking_pets(pet:pet_id(name, species:species_id(name)))
        `)
        .is('deleted_at', null)
        .not('scheduled_departure_date', 'is', null)
        .neq('status', 'cancelled');

    if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }

    // Map to BigCalendar format with full resource data
    const events = data
        .map(b => ({
            id: b.booking_number,
            title: `${b.customer?.display_name || 'Unknown'} → ${b.destination?.iata_code || '?'}`,
            start: b.scheduled_departure_date, // Pass as STRING (ISO format) for serialization
            end: b.scheduled_departure_date,   // Pass as STRING (ISO format) for serialization
            allDay: true,
            status: b.status,
            resource: {
                booking_number: b.booking_number,
                customer_name: b.customer?.display_name || 'Unknown Customer',
                origin: b.origin ? `${b.origin.iata_code} (${b.origin.city || ''})` : 'N/A',
                destination: b.destination ? `${b.destination.iata_code} (${b.destination.city || ''})` : 'N/A',
                status: b.status,
                mode: b.transport_mode,
                pets: b.booking_pets?.map(bp => ({
                    name: bp.pet?.name || 'Unknown',
                    species: bp.pet?.species?.name || 'Pet'
                })) || []
            }
        }));

    return events;
}
