import { z } from 'zod';

// Helper Regex for International Phone Numbers
// Helper Regex for International Phone Numbers (Allows +, spaces, dashes, parentheses)
const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/;

export const EnquirySchema = z.object({
    // A. Contact Details (Entities)
    contactInfo: z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().regex(phoneRegex, "Invalid phone number format (e.g., +971501234567)"),
        city: z.string().optional(),
        whatsapp: z.string().optional(),
        whatsappSameAsPhone: z.boolean().optional().default(true),
        address: z.object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            country: z.string().optional(),
            postalCode: z.string().optional(),
        }).optional(),
        is_client: z.boolean().default(true),
    }),

    // B. Pet Details (Pets)
    pets: z.array(z.object({
        name: z.string().min(1, "Pet name is required"),
        species_id: z.coerce.number().int().positive("Species is required"),
        breed_id: z.coerce.number().int().positive("Breed is required"),
        gender: z.enum(['Male', 'Female', 'Male_Neutered', 'Female_Spayed', 'Unknown', 'Desexed']).transform(val => val === 'Desexed' ? 'Unknown' : val),
        weight: z.coerce.number().min(0.1, "Weight must be greater than 0.1 kg"),
        age: z.coerce.number().nonnegative("Age must be non-negative").optional(),
        ageUnit: z.string().optional(),
        specialRequirements: z.string().optional(),
        microchip_id: z.string().optional(),
        passport_number: z.string().optional(),
        date_of_birth: z.string().optional(),
        medical_alerts: z.string().optional(),
    })).min(1, "At least one pet is required"),

    // C. Logistics (Bookings)
    travelDetails: z.object({
        originCountry: z.string().min(1, "Origin country is required"),
        destinationCountry: z.string().min(1, "Destination country is required"),
        originAirport: z.string().optional(),
        destinationAirport: z.string().optional(),
        travelDate: z.string().refine((date) => {
            const d = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return d >= today;
        }, {
            message: "Travel date cannot be in the past"
        }),
        transportMode: z.enum(['manifest_cargo', 'excess_baggage', 'in_cabin', 'ground_transport', 'private_charter']).optional().default('manifest_cargo'),
        travelingWithPet: z.boolean().optional().default(false),
    }),

    // Services (Optional array — may contain strings or full service objects)
    services: z.array(z.any()).optional(),

    // File Upload Paths (Optional & Nullable — uploads are fully optional)
    pet_photo_path: z.string().nullable().optional(),
    documents_path: z.string().nullable().optional(),
    passport_path: z.string().nullable().optional(),
    vaccination_path: z.string().nullable().optional(),
    rabies_path: z.string().nullable().optional(),
    enquiry_session_id: z.string().nullable().optional(),
}).passthrough(); // Allow extra per-pet path fields (pet_0_photo_path, etc.)
