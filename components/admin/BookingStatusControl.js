'use client';

import { useState } from 'react';
import { updateBookingStatus } from '@/lib/actions/booking-actions';
import { CheckCircle, ChevronDown } from 'lucide-react';

const STATUS_PHASES = {
    'Phase 1: Lead & Booking': [
        { value: 'enquiry_received', label: 'Enquiry Received' },
        { value: 'quote_sent', label: 'Quote Sent' },
        { value: 'booking_confirmed', label: 'Booking Confirmed' },
        { value: 'deposit_paid', label: 'Deposit Paid' },
        { value: 'awaiting_payment', label: 'Awaiting Payment' },
    ],
    'Phase 2: Documentation & Compliance': [
        { value: 'vet_coordination', label: 'Vet Coordination' },
        { value: 'permit_pending', label: 'Permit Pending' },
        { value: 'permit_approved', label: 'Permit Approved' },
        { value: 'crate_sizing', label: 'Crate Sizing' },
        { value: 'docs_verified', label: 'Docs Verified' },
    ],
    'Phase 3: Logistics & Flight': [
        { value: 'flight_booked', label: 'Flight Booked' },
        { value: 'flight_confirmed', label: 'Flight Confirmed' },
        { value: 'manifest_cargo', label: 'Manifest Cargo' },
        { value: 'baggage_avih', label: 'Baggage AVIH' },
        { value: 'petc_cabin', label: 'PETC Cabin' },
    ],
    'Phase 4: In-Transit': [
        { value: 'pet_collected', label: 'Pet Collected' },
        { value: 'airport_checkin', label: 'Airport Check-in' },
        { value: 'departed', label: 'Departed' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'arrived_clearing', label: 'Arrived/Clearing' },
    ],
    'Phase 5: Completion & Closed': [
        { value: 'delivered', label: 'Delivered' },
        { value: 'move_completed', label: 'Move Completed' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'cancelled', label: 'Canceled' },
        { value: 'refunded', label: 'Refunded' },
    ]
};

export default function BookingStatusControl({ bookingId, currentStatus }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        await updateBookingStatus(bookingId, newStatus);
        setIsUpdating(false);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-brand-color-01 text-white rounded-lg hover:bg-brand-color-01/90 transition-colors text-sm font-medium"
            >
                {isUpdating ? 'Updating...' : 'Action'}
                <ChevronDown size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-brand-text-02/20 z-50 max-h-[500px] overflow-y-auto">
                    {Object.entries(STATUS_PHASES).map(([phase, statuses]) => (
                        <div key={phase} className="p-2 border-b border-gray-50 last:border-0">
                            <div className="text-[10px] font-bold text-brand-text-02/60 uppercase tracking-wider mb-1 px-2">{phase}</div>
                            {statuses.map((status) => (
                                <button
                                    key={status.value}
                                    onClick={() => handleStatusChange(status.value)}
                                    className={`flex items-center gap-2 w-full px-2 py-2 text-sm text-brand-text-02 hover:bg-brand-text-02/5 rounded-md ${currentStatus === status.value ? 'bg-brand-color-02/20 text-brand-color-01 font-medium' : ''}`}
                                >
                                    {currentStatus === status.value && <CheckCircle size={14} className="text-brand-color-01" />}
                                    <span className={currentStatus === status.value ? 'ml-0' : 'ml-6'}>{status.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            )}
        </div>
    );
}
