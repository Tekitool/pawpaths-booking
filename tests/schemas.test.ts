import { describe, it, expect } from 'vitest';
import { EnquirySchema } from '@/lib/schemas';

describe('EnquirySchema', () => {
    const validData = {
        contactInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+971501234567',
        },
        pets: [{
            name: 'Buddy',
            species_id: 1,
            breed_id: 10,
            gender: 'Male',
            weight: 15,
        }],
        travelDetails: {
            originCountry: 'United Arab Emirates',
            destinationCountry: 'United Kingdom',
            travelDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        },
    };

    it('validates correct enquiry data', () => {
        const result = EnquirySchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('rejects missing contact name', () => {
        const data = {
            ...validData,
            contactInfo: { ...validData.contactInfo, fullName: '' },
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
        const data = {
            ...validData,
            contactInfo: { ...validData.contactInfo, email: 'not-an-email' },
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('rejects invalid phone format', () => {
        const data = {
            ...validData,
            contactInfo: { ...validData.contactInfo, phone: '12' },
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('rejects empty pets array', () => {
        const data = { ...validData, pets: [] };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('rejects pet with zero weight', () => {
        const data = {
            ...validData,
            pets: [{ ...validData.pets[0], weight: 0 }],
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('rejects past travel dates', () => {
        const data = {
            ...validData,
            travelDetails: { ...validData.travelDetails, travelDate: '2020-01-01' },
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it('accepts valid transport modes', () => {
        const data = {
            ...validData,
            travelDetails: { ...validData.travelDetails, transportMode: 'in_cabin' },
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it('handles gender transformation for Desexed', () => {
        const data = {
            ...validData,
            pets: [{ ...validData.pets[0], gender: 'Desexed' }],
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.pets[0].gender).toBe('Unknown');
        }
    });

    it('accepts pet with optional compliance fields', () => {
        const data = {
            ...validData,
            pets: [{
                ...validData.pets[0],
                microchip_id: '900123456789012',
                passport_number: 'GB123456',
                date_of_birth: '2022-06-15',
                medical_alerts: 'Allergic to sedatives',
            }],
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.pets[0].microchip_id).toBe('900123456789012');
            expect(result.data.pets[0].passport_number).toBe('GB123456');
            expect(result.data.pets[0].date_of_birth).toBe('2022-06-15');
            expect(result.data.pets[0].medical_alerts).toBe('Allergic to sedatives');
        }
    });

    it('accepts travelingWithPet in travel details', () => {
        const data = {
            ...validData,
            travelDetails: { ...validData.travelDetails, travelingWithPet: true },
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.travelDetails.travelingWithPet).toBe(true);
        }
    });

    it('accepts WhatsApp and address in contact info', () => {
        const data = {
            ...validData,
            contactInfo: {
                ...validData.contactInfo,
                whatsapp: '+971509876543',
                whatsappSameAsPhone: false,
                address: {
                    street: '123 Sheikh Zayed Road',
                    city: 'Dubai',
                    state: 'Dubai',
                    country: 'UAE',
                    postalCode: '00000',
                },
            },
        };
        const result = EnquirySchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.contactInfo.whatsapp).toBe('+971509876543');
            expect(result.data.contactInfo.address?.city).toBe('Dubai');
        }
    });

    it('defaults travelingWithPet to false when not provided', () => {
        const result = EnquirySchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.travelDetails.travelingWithPet).toBe(false);
        }
    });
});
