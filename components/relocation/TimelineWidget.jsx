'use client';

import React, { useEffect, useState } from 'react';
import { Send, Search } from 'lucide-react';
import { addBookingInteraction, getBookingInteractions } from '@/lib/actions/booking-interactions';
import { formatDistanceToNow } from 'date-fns';
import GroupedSelect from '@/components/ui/GroupedSelect';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from 'sonner';

// Action groups for the dropdown (colors are Tailwind classes)
const ACTION_GROUPS = [
    {
        label: 'Communication',
        options: [
            { value: 'Call Attempted', color: 'gray' },
            { value: 'Contacted / Spoke', color: 'blue' },
            { value: 'Email Sent', color: 'indigo' },
            { value: 'WhatsApp Msg Sent', color: 'green' },
        ],
    },
    {
        label: 'Finance & Admin',
        options: [
            { value: 'Quote Sent', color: 'purple' },
            { value: 'Payment Requested', color: 'orange' },
            { value: 'Payment Received', color: 'green' },
            { value: 'Docs Received', color: 'teal' },
        ],
    },
    {
        label: 'Operations (Pre‑Flight)',
        options: [
            { value: 'Vet Appointment Scheduled', color: 'yellow' },
            { value: 'Crate Measured', color: 'amber' },
            { value: 'Flight Booked', color: 'green' },
            { value: 'Import Permit Applied', color: 'indigo' },
        ],
    },
    {
        label: 'Logistics (Active)',
        options: [
            { value: 'Pet Picked Up', color: 'blue' },
            { value: 'Check‑In Complete', color: 'cyan' },
            { value: 'In Transit / Airborne', color: 'purple' },
            { value: 'Landed / Arrival', color: 'green' },
            { value: 'Customs Clearance', color: 'teal' },
        ],
    },
    {
        label: 'Issues',
        options: [
            { value: 'Issue / Delay', color: 'red' },
            { value: 'On Hold', color: 'orange' },
        ],
    },
];

// Helper to map action type to a Tailwind bg color class
const colorMap = {
    gray: 'bg-gray-400',
    blue: 'bg-info/100',
    indigo: 'bg-indigo-500',
    green: 'bg-success/150',
    teal: 'bg-teal-500',
    purple: 'bg-brand-text-03/100',
    orange: 'bg-accent',
    red: 'bg-error/100',
    yellow: 'bg-warning/100',
    amber: 'bg-warning/100',
};

function dotForAction(type) {
    const opt = ACTION_GROUPS.flatMap((g) => g.options).find((o) => o.value === type);
    const bg = opt ? colorMap[opt.color] : 'bg-gray-400';
    return <span className={`inline-block w-3 h-3 rounded-full ${bg}`} />;
}

export default function TimelineWidget({ bookingId }) {
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Load interactions on mount / booking change
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getBookingInteractions(bookingId);
                setInteractions(data);
            } catch (e) {
                console.error('Failed to load interactions', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [bookingId]);

    const handleAdd = async () => {
        if (!selectedAction) return;

        // 1. Create optimistic item
        const tempId = 'temp-' + Date.now();
        const optimisticItem = {
            id: tempId,
            action_type: selectedAction,
            note_content: note,
            author_name: 'You', // Temporary placeholder until server confirms
            created_at: new Date().toISOString(),
            is_optimistic: true
        };

        // 2. Update UI immediately (Optimistic Prepend)
        setInteractions((prev) => [optimisticItem, ...prev]);

        // Clear input immediately for better UX
        const actionToSubmit = selectedAction;
        const noteToSubmit = note;
        setSelectedAction('');
        setNote('');
        setSubmitting(true);

        try {
            // 3. Call Server Action
            const newItem = await addBookingInteraction({
                bookingId,
                action_type: actionToSubmit,
                note_content: noteToSubmit,
                is_internal: true,
            });

            // 4. Replace optimistic item with real item
            setInteractions((prev) => prev.map(item =>
                item.id === tempId ? newItem : item
            ));
        } catch (e) {
            console.error('Add interaction error', e);
            // 5. Rollback on error
            setInteractions((prev) => prev.filter(item => item.id !== tempId));
            // Restore inputs
            setSelectedAction(actionToSubmit);
            setNote(noteToSubmit);
            toast.error('Failed to add note. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="bg-accent/5 rounded-2xl shadow-sm border-[0.5px] border-accent/20 p-6 flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/15 text-accent rounded-xl border border-accent/20">
                        <Search size={24} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-accent">Actions Timeline</h2>
                        <p className="text-xs text-brand-text-02/80 uppercase font-bold tracking-wider">Activity Log</p>
                    </div>
                </div>
            </div>

            {/* Input area */}
            <div className="space-y-3 mb-6 bg-white/60 p-4 rounded-xl border border-accent/20 flex-shrink-0">
                <GroupedSelect
                    placeholder="Select Action Type..."
                    value={selectedAction}
                    onChange={setSelectedAction}
                    groups={ACTION_GROUPS}
                    searchable
                    className="w-full"
                />
                <div className="relative">
                    <textarea
                        rows={1}
                        maxLength={50}
                        placeholder="Add details (max 50 chars)..."
                        className="w-full p-3 text-xs border border-brand-text-02/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none bg-white pr-16"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-brand-text-02/40 font-medium pointer-events-none">
                        {note.length}/50
                    </span>
                </div>
                <div className="flex justify-end mt-2">
                    <button
                        disabled={submitting || !selectedAction}
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={14} /> Add Note
                    </button>
                </div>
            </div>


            {/* Feed */}
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-brand-text-02/60">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-2"></div>
                        <p className="text-sm">Loading timeline...</p>
                    </div>
                ) : (
                    <ul className="space-y-4 border-l-2 border-accent/20 pl-6 ml-3 relative pb-2">
                        {interactions.map((it) => (
                            <li key={it.id} className="relative group">
                                {/* Dot on the line */}
                                <div className="absolute left-[-31px] top-1.5 ring-4 ring-white bg-white rounded-full">
                                    {dotForAction(it.action_type)}
                                </div>

                                <div className="flex items-start gap-0">
                                    <div className="flex-1 bg-white/60 p-3 rounded-lg border border-accent/20 shadow-sm hover:shadow-md transition-shadow group-hover:border-accent/40">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 text-xs">{it.action_type}</span>
                                                <span className="text-[10px] text-brand-text-02/60 font-medium bg-brand-text-02/5 px-1.5 py-0.5 rounded truncate max-w-[100px]" title={it.author_name}>
                                                    {it.author_name?.split(' ')[0]}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-brand-text-02/50 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(it.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-brand-text-02 truncate" title={it.note_content}>
                                            {it.note_content}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {interactions.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 text-accent">
                                    <Search size={20} />
                                </div>
                                <p className="text-brand-text-02/80 text-sm">No timeline activity yet.</p>
                                <p className="text-brand-text-02/60 text-xs mt-1">Add a note to start tracking.</p>
                            </div>
                        )}
                    </ul>
                )}
            </div>
        </section>
    );
}
