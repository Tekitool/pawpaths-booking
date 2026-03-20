// lib/utils/pricing-calculator.ts
// Dynamic pricing calculator for Pawpath service catalog.
// Supports all pricing models: fixed, per_kg, per_km, per_day, per_item, percentage.

export type PricingModel = 'fixed' | 'per_kg' | 'per_km' | 'per_day' | 'per_item' | 'percentage';

export interface PricingInput {
    basePrice: number;
    pricingModel: PricingModel;
    taxRate?: number;     // percentage (e.g. 5 for 5%). Defaults to 5.
    quantity?: number;    // multiplier for per_kg / per_km / per_day / per_item
    petWeight?: number;   // kg — used as quantity fallback for per_kg
    tripDistance?: number; // km — used as quantity fallback for per_km
    baseCost?: number;    // only needed for 'percentage' model (price = baseCost * basePrice%)
}

export interface PricingResult {
    subtotal: number;
    taxAmount: number;
    total: number;
}

export function calculatePrice(input: PricingInput): PricingResult {
    const { basePrice, pricingModel, taxRate = 5, quantity = 1, petWeight, tripDistance, baseCost = 0 } = input;

    let subtotal = 0;

    switch (pricingModel) {
        case 'fixed':
            subtotal = basePrice;
            break;

        case 'per_kg': {
            const kg = quantity > 1 ? quantity : (petWeight ?? 1);
            subtotal = basePrice * kg;
            break;
        }

        case 'per_km': {
            const km = quantity > 1 ? quantity : (tripDistance ?? 1);
            subtotal = basePrice * km;
            break;
        }

        case 'per_day':
        case 'per_item':
            subtotal = basePrice * Math.max(1, quantity);
            break;

        case 'percentage':
            // basePrice is treated as a percentage of baseCost
            subtotal = (baseCost * basePrice) / 100;
            break;

        default:
            subtotal = basePrice;
    }

    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
    };
}

export function formatPrice(aed: number): string {
    return `AED ${aed.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
