'use client';

import { useState, useTransition } from 'react';
import { updateBookingInternalNotes } from '@/lib/actions/admin-booking-actions';

export default function InternalNotesEditor({ bookingId, initialNotes }) {
    const [notes, setNotes] = useState(initialNotes || '');
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateBookingInternalNotes(bookingId, notes);
            if (result.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        });
    };

    return (
        <div className="mt-4 pt-4 border-t border-brand-color-02/20 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-brand-text-02/80 uppercase">
                    Internal Notes
                </label>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-4 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-60 transition-all shadow-[0_2px_8px_rgba(249,115,22,0.25)] hover:shadow-glow-accent"
                >
                    {isPending ? 'Saving...' : saved ? '✓ Saved' : 'Add Note'}
                </button>
            </div>
            <textarea
                className="w-full text-sm p-3 bg-white/50 border border-brand-color-02/20 rounded-xl focus:ring-2 focus:ring-brand-color-02/20 outline-none resize-none h-24"
                placeholder="Add internal notes about this customer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>
    );
}
