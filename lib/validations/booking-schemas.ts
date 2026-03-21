// lib/validations/booking-schemas.ts
// Zod schemas for each booking wizard step.

import { z } from 'zod';

export const step1Schema = z.object({
    originCountry: z.string().min(1, 'Origin country is required'),
    originAirport: z.string().min(1, 'Origin city/airport is required'),
    destinationCountry: z.string().min(1, 'Destination country is required'),
    destinationAirport: z.string().min(1, 'Destination city/airport is required'),
    transportMode: z.string().min(1, 'Transport mode is required'),
    travelDate: z.string().nullable().optional(),
    travelingWithPet: z.boolean().optional(),
});

export const petSchema = z.object({
    name: z.string().min(1, 'Pet name is required'),
    species_id: z.coerce.number().int().positive('Species is required'),
    breed_id: z.coerce.number().int().positive('Breed is required').optional(),
    gender: z.string().optional(),
    weight: z.coerce.number().min(0).optional(),
    age: z.coerce.number().min(0).optional(),
    ageUnit: z.string().optional(),
    microchip_id: z.string().optional(),
    passport_number: z.string().optional(),
    date_of_birth: z.string().optional(),
    medical_alerts: z.string().optional(),
    specialRequirements: z.string().optional(),
});

export const step2Schema = z.object({
    pets: z.array(petSchema).min(1, 'At least one pet is required'),
});

export const step3Schema = z.object({
    services: z.array(z.string()).min(1, 'Select at least one service'),
});

export const contactInfoSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    whatsapp: z.string().optional(),
});

/**
 * Validate a specific wizard step's data.
 * Returns { valid, errors[] } — errors are user-friendly strings.
 */
export function validateStep(
    step: number,
    formData: Record<string, unknown>
): { valid: boolean; errors: Record<string, string> } {
    let result;
    switch (step) {
        case 1:
            result = step1Schema.safeParse(formData.travelDetails);
            break;
        case 2:
            result = step2Schema.safeParse({ pets: formData.pets });
            break;
        case 3:
            result = step3Schema.safeParse({ services: formData.services });
            break;
        case 4:
            // Documents are optional
            return { valid: true, errors: {} };
        case 5:
            result = contactInfoSchema.safeParse(formData.contactInfo);
            break;
        default:
            return { valid: true, errors: {} };
    }

    if (!result || result.success) return { valid: true, errors: {} };

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
        const key = issue.path.join('.');
        errors[key] = issue.message;
    });
    return { valid: false, errors };
}
