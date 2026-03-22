'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAuditAction } from '@/lib/audit-logger';

// Roles permitted to update journey / logistics data
const JOURNEY_EDIT_ROLES = ['super_admin', 'admin', 'ops_manager', 'ops_staff'];

const journeySchema = z.object({
    originCountry: z.string().min(1, 'Origin country is required'),
    originAirport: z.string().optional().default(''),
    destinationCountry: z.string().min(1, 'Destination country is required'),
    destinationAirport: z.string().optional().default(''),
    transportMode: z.string().min(1, 'Transport mode is required'),
    travelDate: z.string().optional().nullable(),
});

/**
 * Updates journey / travel details for a booking.
 * @param {string} bookingUUID  — booking primary key (UUID)
 * @param {object} data         — validated journey fields
 */
export async function updateJourneyDetails(bookingUUID, data) {
    try {
        const parsed = journeySchema.safeParse(data);
        if (!parsed.success) {
            return { success: false, message: parsed.error.errors[0]?.message || 'Invalid data' };
        }

        const { originCountry, originAirport, destinationCountry, destinationAirport, transportMode, travelDate } = parsed.data;

        const supabase = await createClient();

        // ── Auth guard ─────────────────────────────────────────────────────
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !JOURNEY_EDIT_ROLES.includes(profile.role)) {
            return { success: false, message: 'Insufficient permissions' };
        }
        // ──────────────────────────────────────────────────────────────────

        const { error } = await supabase
            .from('bookings')
            .update({
                origin_raw: { country: originCountry, airport: originAirport },
                destination_raw: { country: destinationCountry, airport: destinationAirport },
                transport_mode: transportMode,
                scheduled_departure_date: travelDate || null,
            })
            .eq('id', bookingUUID);

        if (error) {
            console.error('[updateJourneyDetails] Supabase error:', error);
            return { success: false, message: 'Failed to update journey details' };
        }

        await logAuditAction(supabase, 'bookings', bookingUUID, 'UPDATE', 'Journey details updated via admin panel', {
            transportMode,
            travelDate,
        });

        revalidatePath('/admin/relocations/[id]', 'page');
        revalidatePath('/admin/relocations');
        revalidatePath('/admin/dashboard');

        return { success: true };
    } catch (err) {
        console.error('[updateJourneyDetails]', err);
        return { success: false, message: err.message || 'An unexpected error occurred' };
    }
}
