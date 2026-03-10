/**
 * Canonical booking view model and mapping functions.
 * All booking data consumers should use these types and mappers
 * instead of inline transformations.
 */

// ── Types ──

export interface BookingCustomerInfo {
    fullName: string;
    email: string;
    phone: string;
    city?: string;
    customerType?: string;
}

export interface BookingTravelDetails {
    originCountry: string;
    originAirport: string;
    destinationCountry: string;
    destinationAirport: string;
    travelDate: string;
    travelingWithPet?: boolean;
    transportMode?: string;
}

export interface BookingPet {
    id?: string;
    name: string;
    species: string;
    breed: string;
    weight: number;
    gender?: string;
    age?: number;
    ageUnit?: string;
    specialRequirements?: string;
    photoUrl?: string | null;
}

export interface BookingServiceItem {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface BookingViewModel {
    id: string;
    bookingId: string;
    status: string;
    serviceType: string;
    createdAt: string;
    updatedAt?: string;
    customerInfo: BookingCustomerInfo;
    travelDetails: BookingTravelDetails;
    pets: BookingPet[];
    services: BookingServiceItem[];
    transportMode?: string;
}

// ── Helpers ──

function parseJsonField(value: unknown): Record<string, unknown> {
    if (!value) return {};
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return {}; }
    }
    return value as Record<string, unknown>;
}

// ── Mappers ──

/**
 * Maps a raw Supabase booking row (with origin_raw/destination_raw JSON columns)
 * to the canonical BookingViewModel. Used by booking-actions.js list/detail views.
 */
export function mapRawBookingToViewModel(b: Record<string, unknown>): BookingViewModel {
    if (!b) return null as unknown as BookingViewModel;

    const origin = parseJsonField(b.origin_raw);
    const destination = parseJsonField(b.destination_raw);
    const contact = parseJsonField(b.customer_contact_snapshot);

    const customer = (b.customer || {}) as Record<string, unknown>;
    const contactInfo = (customer.contact_info || contact || {}) as Record<string, unknown>;

    // Flatten pets from junction table
    const rawPets = Array.isArray(b.pets) ? b.pets : [];
    const pets: BookingPet[] = rawPets.map((p: Record<string, unknown>) => {
        const pet = (p.pet || p) as Record<string, unknown>;
        return {
            id: pet.id as string,
            name: (pet.name as string) || 'Unknown',
            species: String(pet.species_id || ''),
            breed: String(pet.breed_id || ''),
            weight: Number(pet.weight_kg) || 0,
            gender: pet.gender as string,
        };
    }).filter(Boolean);

    // Flatten services from junction table
    const rawServices = Array.isArray(b.services) ? b.services : [];
    const services: BookingServiceItem[] = rawServices.map((s: Record<string, unknown>) => {
        const svc = (s.service || s) as Record<string, unknown>;
        return {
            id: (svc.id as string) || '',
            name: (svc.name as string) || 'Unknown Service',
            quantity: Number(s.quantity) || 1,
            unitPrice: Number(s.unit_price) || 0,
            total: Number(s.line_total) || (Number(s.quantity) * Number(s.unit_price)) || 0,
        };
    });

    return {
        id: b.id as string,
        bookingId: b.booking_number as string,
        status: (b.status as string) || 'enquiry',
        serviceType: (b.service_type as string) || '',
        createdAt: b.created_at as string,
        updatedAt: b.updated_at as string,
        customerInfo: {
            fullName: (customer.display_name as string) || (contactInfo.fullName as string) || 'Unknown',
            email: (contactInfo.email as string) || '',
            phone: (contactInfo.phone as string) || '',
            customerType: b.service_type as string,
        },
        travelDetails: {
            originCountry: (origin.country as string) || '',
            originAirport: (origin.airport as string) || '',
            destinationCountry: (destination.country as string) || '',
            destinationAirport: (destination.airport as string) || '',
            travelDate: b.scheduled_departure_date as string,
            travelingWithPet: b.traveling_with_pet as boolean,
            transportMode: b.transport_mode as string,
        },
        pets,
        services,
        transportMode: b.transport_mode as string,
    };
}

/**
 * Maps a booking row with node-based origin/destination joins (from relocations page query)
 * to the canonical BookingViewModel. Used by relocations/page.js table view.
 */
export function mapNodeBookingToViewModel(b: Record<string, unknown>): BookingViewModel {
    if (!b) return null as unknown as BookingViewModel;

    const origin = (b.origin || {}) as Record<string, unknown>;
    const destination = (b.destination || {}) as Record<string, unknown>;
    const customer = (b.customer || {}) as Record<string, unknown>;
    const contactInfo = (customer.contact_info || {}) as Record<string, unknown>;
    const originCountry = (origin.country || {}) as Record<string, unknown>;
    const destCountry = (destination.country || {}) as Record<string, unknown>;

    const rawPets = Array.isArray(b.pets) ? b.pets : [];
    const pets: BookingPet[] = rawPets.map((p: Record<string, unknown>) => {
        const pet = (p.pet || p) as Record<string, unknown>;
        const species = (pet.species || {}) as Record<string, unknown>;
        const breed = (pet.breed || {}) as Record<string, unknown>;
        return {
            id: pet.id as string,
            name: (pet.name as string) || 'Unknown',
            species: (species.name as string) || 'Pet',
            breed: (breed.name as string) || '',
            weight: Number(pet.weight_kg) || 0,
        };
    });

    return {
        id: b.id as string,
        bookingId: b.booking_number as string,
        status: (b.status as string) || 'enquiry',
        serviceType: (b.service_type as string) || '',
        createdAt: b.created_at as string,
        customerInfo: {
            fullName: (customer.display_name as string) || 'Unknown',
            email: (contactInfo.email as string) || '',
            phone: (contactInfo.whatsapp as string) || (contactInfo.phone as string) || '',
        },
        travelDetails: {
            originCountry: (originCountry.iso_code as string) || '',
            originAirport: (origin.iata_code as string) || (origin.city as string) || 'TBD',
            destinationCountry: (destCountry.iso_code as string) || '',
            destinationAirport: (destination.iata_code as string) || (destination.city as string) || 'TBD',
            travelDate: b.scheduled_departure_date as string,
            travelingWithPet: b.transport_mode === 'in_cabin',
            transportMode: b.transport_mode as string,
        },
        pets,
        services: [],
        transportMode: b.transport_mode as string,
    };
}
