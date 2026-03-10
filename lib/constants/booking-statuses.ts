/**
 * Canonical booking status groupings.
 * Use these constants everywhere instead of hardcoding status arrays.
 */

export const STATUS_GROUPS = {
    /** Enquiry & pre-booking statuses */
    PENDING: [
        'enquiry',
        'enquiry_received',
        'quote_sent',
        'booking_confirmed',
        'deposit_paid',
        'awaiting_payment',
    ],

    /** Active in-progress relocations */
    ACTIVE: [
        'vet_coordination',
        'permit_pending',
        'permit_approved',
        'crate_sizing',
        'docs_verified',
        'flight_booked',
        'flight_confirmed',
        'manifest_cargo',
        'baggage_avih',
        'petc_cabin',
        'pet_collected',
        'airport_checkin',
    ],

    /** Currently in transit */
    IN_TRANSIT: [
        'departed',
        'in_transit',
        'arrived_clearing',
    ],

    /** Successfully completed */
    COMPLETED: [
        'delivered',
        'move_completed',
    ],

    /** Requires attention / action needed */
    ACTION_REQUIRED: [
        'payment_pending',
        'docs_pending',
        'customs_clearance',
        'on_hold',
    ],

    /** Terminated */
    CLOSED: [
        'cancelled',
        'refunded',
    ],
} as const;

/** All active statuses (ACTIVE + IN_TRANSIT) */
export const ALL_ACTIVE_STATUSES = [
    ...STATUS_GROUPS.ACTIVE,
    ...STATUS_GROUPS.IN_TRANSIT,
];
