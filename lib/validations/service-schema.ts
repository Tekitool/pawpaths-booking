// lib/validations/service-schema.ts
// Zod schema and types for the service catalog form.

import * as z from 'zod';

export const serviceSchema = z.object({
    id: z.string().optional(),
    code: z.string().optional(),
    name: z.string().min(2, "Service Name is required"),
    categoryId: z.union([z.string(), z.number()]).refine(val => val !== '', "Category is required"),
    icon: z.string().optional(),
    shortDescription: z.string().max(140, "Short description must be under 140 characters").optional(),
    longDescription: z.string().optional(),

    // Logic Matrix
    validSpecies: z.array(z.string()),
    validServiceTypes: z.array(z.string()),
    validTransportModes: z.array(z.string()),

    requirements: z.array(z.object({ value: z.string() })),

    // Financials & Marketing
    pricingModel: z.string().min(1, "Pricing Model is required"),
    uom: z.enum(['service', 'kg', 'km', 'day', 'item', 'percentage']),
    basePrice: z.number().min(0, "Price must be positive"),
    baseCost: z.number().min(0, "Cost must be positive"),
    taxRate: z.number().min(0),
    promoBadge: z.enum(['none', 'complimentary', 'bestseller', 'limited_offer', 'essential']),

    isActive: z.boolean(),
    isMandatory: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
