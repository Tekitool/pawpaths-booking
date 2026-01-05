'use client';

import React, { useEffect, useState } from 'react';
import PageShell from '@/components/ui/PageShell';
import TimelineWidget from '@/components/relocation/TimelineWidget';
import { Plus } from 'lucide-react';
import { getAdminBookingDetails } from '@/lib/actions/admin-booking-actions';

export default function RelocationCockpit({ params }: { params: { id: string } }) {
    const bookingId = params.id;
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getAdminBookingDetails(bookingId);
                setBooking(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [bookingId]);

    if (loading) {
        return <PageShell title="Loading…" subtitle="Fetching relocation data…" actions={null}><div /></PageShell>;
    }

    if (!booking) {
        return (
            <PageShell title="Not found" subtitle="Booking does not exist" actions={null}>
                <p className="text-center text-brand-text-02/80">Unable to locate this relocation.</p>
            </PageShell>
        );
    }

    return (
        <PageShell
            title="Relocation Cockpit"
            subtitle={`Booking #${booking.reference || booking.id}`}
            actions={
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent transition-colors shadow-sm font-medium text-sm">
                    <Plus size={16} /> Add Note
                </button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side – existing profile/info (placeholder) */}
                <div className="lg:col-span-2">
                    <section className="p-4 bg-white/40 rounded-xl shadow-sm mb-6">
                        <h2 className="mb-2">Customer Profile</h2>
                        <p><strong>Name:</strong> {booking.customer?.display_name}</p>
                        <p><strong>Email:</strong> {booking.customer?.email}</p>
                        <p><strong>Phone:</strong> {booking.customer?.phone}</p>
                    </section>
                    {/* You can insert other existing components here (pet list, flight info, etc.) */}
                </div>
                {/* Right side – Timeline widget */}
                <div className="lg:col-span-1">
                    <TimelineWidget bookingId={bookingId} />
                </div>
            </div>
        </PageShell>
    );
}
