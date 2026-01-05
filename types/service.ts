export interface Service {
    id: string;
    name: string;
    short_description: string;
    long_description: string;
    base_price: number;
    currency: string;
    is_active: boolean;
    is_mandatory: boolean;

    // New Fields
    scope: 'per_booking' | 'per_pet';
    is_recommended: boolean;

    // Filtering Arrays
    valid_service_types: string[] | null;
    valid_transport_modes: string[] | null;
    valid_species: string[] | null;

    // UI fields (mapped)
    icon?: string;
    promo_badge?: string; // e.g., 'complimentary', 'popular'
}

export interface ServiceSelection {
    serviceId: string;
    quantity: number;
    petId?: string; // If scope is 'per_pet'
}
