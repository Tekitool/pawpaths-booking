// lib/utils/booking-table-helpers.ts
// Shared helper functions for booking tables and status displays.

export const STATUS_PHASES: Record<string, { value: string; label: string }[]> = {
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
    ],
};

export function getStatusLabel(statusValue: string): string {
    for (const phase in STATUS_PHASES) {
        const status = STATUS_PHASES[phase].find(s => s.value === statusValue);
        if (status) return status.label;
    }
    return statusValue;
}

export function getStatusColor(status: string): string {
    if (['delivered', 'move_completed'].includes(status)) return 'bg-success/15 text-system-color-02';
    if (['cancelled', 'refunded'].includes(status)) return 'bg-error/10 text-system-color-01';
    if (['in_transit', 'departed'].includes(status)) return 'bg-info/10 text-system-color-03';
    return 'bg-warning/10 text-yellow-800';
}

export function getDatePillStyle(dateString: string | null): string {
    if (!dateString) return 'bg-brand-text-02/5 text-brand-text-02/60 border-brand-text-02/20';

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 15 && diffDays >= 0) {
        return 'bg-error/10 text-error border-system-color-01';
    }
    return 'bg-success/15 text-success border-system-color-02';
}

export function formatTransportMode(mode: string): string {
    if (!mode) return '';
    return mode.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function formatDate(dateString: string | null): string {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function buildWhatsAppMessage(booking: {
    bookingId: string;
    customerName: string;
    petNames: string;
}): string {
    return (
        `*PawPaths Pets Relocation Services* - Your Trusted Travel Partner!\n` +
        `(Relocation Ref: ${booking.bookingId})\n` +
        `Dear ${booking.customerName},\n` +
        `Hope you are having a great day! This is from the PawPaths team.\n` +
        `Thank you for choosing PawPaths for the relocation of ${booking.petNames}. We are delighted to have you with us!\n` +
        `To finalize the IATA-compliant travel itinerary and documentation, we require a few specific details to ensure a seamless experience:\n` +
        `*Final Logistics Details:*\n` +
        `* Pickup Address: (Building/Villa & Area in UAE)\n` +
        `* Delivery Address: (Full destination address)\n` +
        `* Owner's Passport Copy: (Needed for permit filing)\n` +
        `* Current Vaccination Record: (Please send a clear photo)\n` +
        `* Specific Pet Measurements (for Crate Customization):\n` +
        `........\n` +
        `........\n` +
        `Once these are received, your dedicated coordinator will finalize all the requirements for ${booking.petNames}'s relocation, including the full travel itinerary, documentation schedule, and compliance checks.\n\n` +
        `We are committed to making this a stress-free move for you and a first-class journey for ${booking.petNames}.\n\n` +
        `Best regards,\n` +
        `The PawPaths Team \n` +
        `*+971 58 694 7755* \n` +
        `www.pawpathsae.com`
    );
}

export function buildEmailBody(booking: {
    bookingId: string;
    customerName: string;
    petNames: string;
}): string {
    return (
        `PawPaths Pets Relocation Services - Your Trusted Travel Partner!\n` +
        `(Relocation Ref: ${booking.bookingId})\n` +
        `Dear ${booking.customerName},\n` +
        `Hope you are having a great day! This is from the PawPaths team.\n` +
        `Thank you for choosing PawPaths for the relocation of ${booking.petNames}. We are delighted to have you with us!\n` +
        `To finalize the IATA-compliant travel itinerary and documentation, we require a few specific details to ensure a seamless experience:\n` +
        `Final Logistics Details:\n` +
        `* Pickup Address: (Building/Villa & Area in UAE)\n` +
        `* Delivery Address: (Full destination address)\n` +
        `* Owner's Passport Copy: (Needed for permit filing)\n` +
        `* Current Vaccination Record: (Please send a clear photo)\n` +
        `* Specific Pet Measurements (for Crate Customization):\n` +
        `........\n` +
        `........\n` +
        `Once these are received, your dedicated coordinator will finalize all the requirements for ${booking.petNames}'s relocation, including the full travel itinerary, documentation schedule, and compliance checks.\n\n` +
        `We are committed to making this a stress-free move for you and a first-class journey for ${booking.petNames}.\n\n` +
        `Best regards,\n` +
        `The PawPaths Team \n` +
        `*+971 58 694 7755* \n` +
        `www.pawpathsae.com`
    );
}
