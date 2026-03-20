'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addBookingInteraction } from '@/lib/actions/booking-interactions';
import { generateTasksForBooking } from '@/lib/actions/task-automation-actions';
import { mapRawBookingToViewModel } from '@/lib/mappers/booking-mapper';

const VALID_STATUSES = [
    'enquiry_received', 'quote_sent', 'booking_confirmed', 'deposit_paid', 'awaiting_payment',
    'vet_coordination', 'permit_pending', 'permit_approved', 'crate_sizing', 'docs_verified',
    'flight_booked', 'flight_confirmed', 'manifest_cargo', 'baggage_avih', 'petc_cabin',
    'pet_collected', 'airport_checkin', 'departed', 'in_transit', 'arrived_clearing',
    'delivered', 'move_completed', 'on_hold', 'cancelled', 'refunded',
];

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

        const mappedBookings = data.map(mapRawBookingToViewModel);

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
        if (!user) return { success: false, message: 'Unauthorized' };

        // Validate status value
        const statusVal = newStatus.current || newStatus;
        if (!VALID_STATUSES.includes(statusVal)) {
            return { success: false, message: `Invalid status: ${statusVal}` };
        }

        // We need the UUID. bookingId passed here is likely the booking_number string (PP-...)
        // First find the ID
        const { data: booking, error: findError } = await supabase
            .from('bookings')
            .select('id')
            .eq('booking_number', bookingId)
            .single();

        if (findError || !booking) return { success: false, message: 'Booking not found' };

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
        return { success: false, message: error.message };
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

        return mapRawBookingToViewModel(data);
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

        const recentBookings = recentData ? recentData.map(mapRawBookingToViewModel) : [];

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
