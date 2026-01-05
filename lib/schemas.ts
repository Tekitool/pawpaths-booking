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
        city: z.string().optional(), // Added city as it's used in the form
        is_client: z.boolean().default(true)
    }),

    // B. Pet Details (Pets)
    pets: z.array(z.object({
        name: z.string().min(1, "Pet name is required"),
        species_id: z.coerce.number().int().positive("Species is required"),
        breed_id: z.coerce.number().int().positive("Breed is required"),
        gender: z.enum(['Male', 'Female', 'Male_Neutered', 'Female_Spayed', 'Unknown', 'Desexed']).transform(val => val === 'Desexed' ? 'Unknown' : val), // Handle 'Desexed' legacy
        weight: z.coerce.number().min(0.1, "Weight must be greater than 0.1 kg"),
        age: z.coerce.number().nonnegative("Age must be non-negative").optional(),
        ageUnit: z.string().optional(),
        specialRequirements: z.string().optional()
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
    }),

    // Services (Optional array of strings/IDs)
    services: z.array(z.string()).optional(),

    // File Upload Paths (Optional)
    pet_photo_path: z.string().optional(),
    documents_path: z.string().optional(), // Keeping for backward compatibility or folder ref
    passport_path: z.string().optional(),
    vaccination_path: z.string().optional(),
    rabies_path: z.string().optional(),
    enquiry_session_id: z.string().optional()
});
