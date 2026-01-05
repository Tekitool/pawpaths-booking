'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardMetrics() {
    const supabase = await createClient();

    let metrics = {
        total: 0,
        inTransit: 0,
        completed: 0,
        actionRequired: 0
    };

    let recentEnquiries = [];

    try {
        // 1. Metrics
        const [totalRes, inTransitRes, completedRes, actionRes] = await Promise.all([
            supabase.from('bookings').select('*', { count: 'exact', head: true }),
            supabase.from('bookings').select('*', { count: 'exact', head: true })
                .in('status', ['in_transit', 'picked_up', 'out_for_delivery']),
            supabase.from('bookings').select('*', { count: 'exact', head: true })
                .in('status', ['completed', 'delivered']),
            supabase.from('bookings').select('*', { count: 'exact', head: true })
                .in('status', ['payment_pending', 'docs_pending', 'enquiry', 'customs_clearance'])
        ]);

        metrics = {
            total: totalRes.count || 0,
            inTransit: inTransitRes.count || 0,
            completed: completedRes.count || 0,
            actionRequired: actionRes.count || 0
        };
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
    }

    try {
        // 2. Recent Enquiries
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                booking_number,
                created_at,
                customer:customer_id(display_name),
                origin:origin_node_id(iata_code, city),
                destination:destination_node_id(iata_code, city),
                booking_pets(
                    pet:pet_id(
                        name,
                        species:species_id(name),
                        breed:breed_id(name)
                    )
                )
            `)
            .eq('status', 'enquiry')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        recentEnquiries = (data || []).map(booking => {
            // Format Route
            const origin = booking.origin?.iata_code || booking.origin?.city || 'Unknown';
            const dest = booking.destination?.iata_code || booking.destination?.city || 'Unknown';
            const route = `${origin} ➝ ${dest}`;

            // Format Pets
            const pets = booking.booking_pets
                ?.map(bp => {
                    const name = bp.pet?.name || 'Unknown';
                    const type = bp.pet?.species?.name || 'Unknown';
                    const breed = bp.pet?.breed?.name || 'Unknown';
                    return `${name} (${type} | ${breed})`;
                })
                .filter(Boolean)
                .join(', ') || 'Unknown';

            return {
                ref: booking.booking_number || 'N/A',
                customer: booking.customer?.display_name || 'Unknown',
                date: new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                route: route,
                petDetails: pets
            };
        });
    } catch (error) {
        console.error('Error fetching recent enquiries:', error);
    }

    return {
        metrics,
        recentEnquiries
    };
}
