// lib/constants/service-constants.ts
// Shared constants for the service catalog management UI.

import { Plane, Stethoscope, Home, Truck, FileText, Box } from 'lucide-react';

export const PRICING_MODELS = [
    { value: 'fixed', label: 'Fixed Price (One-time)' },
    { value: 'per_day', label: 'Time-Based (Per Day)' },
    { value: 'per_item', label: 'Quantity-Based (Per Item)' },
    { value: 'per_kg', label: 'Weight-Based (Per Kg)' },
    { value: 'per_km', label: 'Distance-Based (Per Km)' },
];

export const ICONS = [
    { value: 'Plane', icon: Plane },
    { value: 'Stethoscope', icon: Stethoscope },
    { value: 'Home', icon: Home },
    { value: 'Truck', icon: Truck },
    { value: 'FileText', icon: FileText },
    { value: 'Box', icon: Box },
];

export const SERVICE_TYPES = [
    { value: 'export', label: 'Export' },
    { value: 'import', label: 'Import' },
    { value: 'local', label: 'Local' },
    { value: 'transit', label: 'Transit' },
];

export const TRANSPORT_MODES = [
    { value: 'manifest_cargo', label: 'Manifest Cargo' },
    { value: 'in_cabin', label: 'In Cabin' },
    { value: 'excess_baggage', label: 'Excess Baggage' },
    { value: 'ground_transport', label: 'Road' },
];

export const SPECIES_OPTIONS = [
    { value: 'Dog', label: 'Dog' },
    { value: 'Cat', label: 'Cat' },
    { value: 'Bird', label: 'Bird' },
    { value: 'Other', label: 'Other' },
];

export const PROMO_BADGES = [
    { value: 'none', label: 'None' },
    { value: 'complimentary', label: 'Complimentary (Free)' },
    { value: 'bestseller', label: 'Bestseller' },
    { value: 'limited_offer', label: 'Limited Offer' },
    { value: 'essential', label: 'Essential' },
];
