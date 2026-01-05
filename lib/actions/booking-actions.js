'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { addBookingInteraction } from '@/lib/actions/booking-interactions';
import { generateTasksForBooking } from '@/lib/actions/task-automation-actions';

// Helper to map Supabase Booking to Frontend Model
const mapBooking = (b) => {
    if (!b) return null;

    const origin = typeof b.origin_raw === 'string' ? JSON.parse(b.origin_raw) : b.origin_raw || {};
    const destination = typeof b.destination_raw === 'string' ? JSON.parse(b.destination_raw) : b.destination_raw || {};
    const contact = typeof b.customer_contact_snapshot === 'string' ? JSON.parse(b.customer_contact_snapshot) : b.customer_contact_snapshot || {};

    const customer = b.customer || {};
    const contactInfo = b.customer?.contact_info || contact || {};

    // Flatten pets if they come from junction
    const pets = Array.isArray(b.pets) ? b.pets.map(p => p.pet || p).filter(Boolean) : [];
    // Flatten services
    const services = Array.isArray(b.services) ? b.services.map(s => s.service || s).filter(Boolean) : [];

    return {
        _id: b.id,
        bookingId: b.booking_number,
        createdAt: b.created_at,
        updatedAt: b.updated_at,

        status: {
            current: b.status || 'enquiry',
            history: []
        },

        customer: {
            fullName: customer.display_name || contactInfo.fullName || 'Unknown',
            email: contactInfo.email,
            phone: contactInfo.phone,
            customerType: b.service_type
        },
        customerInfo: {
            fullName: customer.display_name || contactInfo.fullName || 'Unknown',
            email: contactInfo.email,
            phone: contactInfo.phone,
        },

        travel: {
            origin: {
                country: origin.country,
                airport: origin.airport
            },
            destination: {
                country: destination.country,
                airport: destination.airport
            },
            departureDate: b.scheduled_departure_date,
            travelingWithPet: b.traveling_with_pet,
            numberOfPets: b.number_of_pets,
            transportMode: b.transport_mode
        },
        travelDetails: {
            originCountry: origin.country,
            originAirport: origin.airport,
            destinationCountry: destination.country,
            destinationAirport: destination.airport,
            travelDate: b.scheduled_departure_date,
            travelingWithPet: b.traveling_with_pet,
            transportMode: b.transport_mode
        },

        pets: pets.map(p => ({
            _id: p.id,
            name: p.name,
            breed: p.breed_id,
            species: p.species_id,
            weight: p.weight_kg,
            gender: p.gender
        })),

        services: {
            selected: services.map(s => ({
                _id: s.id,
                name: s.name,
                description: s.description
            }))
        }
    };
};

export async function getBookings(query = '', page = 1, year = '', month = '', type = '') {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const limit = 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let queryBuilder = supabase
            .from('bookings')
            .select(`
                *,
                customer:entities!customer_id (id, display_name, contact_info),
                pets:booking_pets(pet:pets(*)),
                services:booking_services(service:service_catalog(*))
            `, { count: 'exact' });

        if (query) {
            queryBuilder = queryBuilder.ilike('booking_number', `%${query}%`);
        }

        if (year) {
            const yearNum = parseInt(year);
            let startDate, endDate;
            if (month) {
                const monthNum = parseInt(month);
                startDate = new Date(yearNum, monthNum - 1, 1).toISOString();
                endDate = new Date(yearNum, monthNum, 0).toISOString();
            } else {
                startDate = new Date(yearNum, 0, 1).toISOString();
                endDate = new Date(yearNum, 11, 31).toISOString();
            }
            queryBuilder = queryBuilder.gte('scheduled_departure_date', startDate).lte('scheduled_departure_date', endDate);
        }

        if (type && type !== 'All') {
            // Assuming type maps to service_type enum or similar
            // For now, ignore strict type filtering if mapping is unclear, or try exact match
            // queryBuilder = queryBuilder.eq('service_type', type.toLowerCase());
        }

        queryBuilder = queryBuilder.order('created_at', { ascending: false }).range(from, to);

        const { data, count, error } = await queryBuilder;
        if (error) throw error;

        const mappedBookings = data.map(mapBooking);

        return { bookings: mappedBookings, total: count, totalPages: Math.ceil(count / limit) };
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        throw new Error('Failed to fetch bookings');
    }
}

export async function updateBookingStatus(bookingId, newStatus) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        // Update Status
        const statusVal = newStatus.current || newStatus;

        // We need the UUID. bookingId passed here is likely the booking_number string (PP-...)
        // First find the ID
        const { data: booking, error: findError } = await supabase
            .from('bookings')
            .select('id')
            .eq('booking_number', bookingId)
            .single();

        if (findError || !booking) throw new Error('Booking not found');

        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: statusVal })
            .eq('id', booking.id);

        if (updateError) throw updateError;

        // Log Interaction
        await addBookingInteraction({
            bookingId: booking.id,
            action_type: `Status Change: ${statusVal}`,
            note_content: `System auto-update. New status: ${statusVal}`,
            is_internal: true
        });

        // Trigger Tasks
        if (statusVal === 'booking_confirmed') {
            await generateTasksForBooking(booking.id, 'booking_confirmed');
        }

        revalidatePath('/admin/relocations');
        revalidatePath(`/admin/relocations/${bookingId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to update status:', error);
        return { success: false, error: error.message };
    }
}

export async function getBookingById(bookingId) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:entities!customer_id (id, display_name, contact_info),
                pets:booking_pets(pet:pets(*)),
                services:booking_services(service:service_catalog(*))
            `)
            .eq('booking_number', bookingId)
            .single();

        if (error) return null;

        return mapBooking(data);
    } catch (error) {
        console.error('Failed to fetch booking:', error);
        return null;
    }
}

export async function getDashboardStats() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        // Total
        const { count: totalBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });

        // Active
        const activeStatuses = ['pet_collected', 'airport_checkin', 'departed', 'in_transit', 'arrived_clearing'];
        const { count: activeRelocations } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', activeStatuses);

        // Pending
        const pendingStatuses = ['enquiry', 'quote_sent', 'booking_confirmed', 'deposit_paid', 'awaiting_payment'];
        const { count: pendingActions } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', pendingStatuses);

        // Completed
        const completedStatuses = ['delivered', 'move_completed'];
        const { count: completedRelocations } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', completedStatuses);

        // Recent
        const { data: recentData } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:entities!customer_id (id, display_name, contact_info),
                pets:booking_pets(pet:pets(*)),
                services:booking_services(service:service_catalog(*))
            `)
            .eq('status', 'enquiry')
            .order('created_at', { ascending: false })
            .limit(5);

        const recentBookings = recentData ? recentData.map(mapBooking) : [];

        return {
            totalBookings: totalBookings || 0,
            activeRelocations: activeRelocations || 0,
            pendingActions: pendingActions || 0,
            completedRelocations: completedRelocations || 0,
            recentBookings
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Failed to fetch dashboard stats');
    }
}
