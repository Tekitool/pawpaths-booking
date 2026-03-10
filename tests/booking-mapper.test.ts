import { describe, it, expect } from 'vitest';
import { mapRawBookingToViewModel, mapNodeBookingToViewModel } from '@/lib/mappers/booking-mapper';

describe('mapRawBookingToViewModel', () => {
    it('maps a raw booking with JSON origin/destination', () => {
        const raw = {
            id: 'uuid-1',
            booking_number: 'PP-001',
            status: 'enquiry',
            service_type: 'export',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            origin_raw: { country: 'UAE', airport: 'DXB' },
            destination_raw: { country: 'UK', airport: 'LHR' },
            customer_contact_snapshot: { fullName: 'John', email: 'john@test.com', phone: '+971500000000' },
            customer: { display_name: 'John Doe', contact_info: { email: 'john@test.com', phone: '+971500000000' } },
            scheduled_departure_date: '2026-03-15',
            traveling_with_pet: true,
            transport_mode: 'manifest_cargo',
            number_of_pets: 1,
            pets: [{ pet: { id: 'p1', name: 'Buddy', species_id: 1, breed_id: 10, weight_kg: 15, gender: 'male' } }],
            services: [{ service: { id: 's1', name: 'Crate Sizing' }, quantity: 1, unit_price: 100, line_total: 100 }],
        };

        const result = mapRawBookingToViewModel(raw);

        expect(result.id).toBe('uuid-1');
        expect(result.bookingId).toBe('PP-001');
        expect(result.status).toBe('enquiry');
        expect(result.customerInfo.fullName).toBe('John Doe');
        expect(result.travelDetails.originCountry).toBe('UAE');
        expect(result.travelDetails.destinationAirport).toBe('LHR');
        expect(result.pets).toHaveLength(1);
        expect(result.pets[0].name).toBe('Buddy');
        expect(result.services).toHaveLength(1);
        expect(result.services[0].name).toBe('Crate Sizing');
    });

    it('handles string JSON fields', () => {
        const raw = {
            id: 'uuid-2',
            booking_number: 'PP-002',
            status: 'confirmed',
            origin_raw: JSON.stringify({ country: 'India', airport: 'DEL' }),
            destination_raw: JSON.stringify({ country: 'UAE', airport: 'DXB' }),
            customer_contact_snapshot: JSON.stringify({ fullName: 'Jane', email: 'jane@test.com' }),
            customer: null,
            pets: [],
            services: [],
        };

        const result = mapRawBookingToViewModel(raw);
        expect(result.travelDetails.originCountry).toBe('India');
        expect(result.travelDetails.destinationAirport).toBe('DXB');
    });

    it('returns null-like for null input', () => {
        const result = mapRawBookingToViewModel(null as unknown as Record<string, unknown>);
        expect(result).toBeNull();
    });
});

describe('mapNodeBookingToViewModel', () => {
    it('maps a booking with node-based joins', () => {
        const raw = {
            id: 'uuid-3',
            booking_number: 'PP-003',
            status: 'in_transit',
            service_type: 'import',
            created_at: '2026-02-01T00:00:00Z',
            scheduled_departure_date: '2026-04-01',
            transport_mode: 'excess_baggage',
            customer: { display_name: 'Alice', contact_info: { email: 'alice@test.com', phone: '+44123456789' } },
            origin: { name: 'Heathrow', iata_code: 'LHR', city: 'London', country: { iso_code: 'GB' } },
            destination: { name: 'Dubai Intl', iata_code: 'DXB', city: 'Dubai', country: { iso_code: 'AE' } },
            pets: [{ pet: { id: 'p2', name: 'Rex', weight_kg: 25, species: { name: 'Dog' }, breed: { name: 'Labrador' } } }],
        };

        const result = mapNodeBookingToViewModel(raw);

        expect(result.bookingId).toBe('PP-003');
        expect(result.customerInfo.fullName).toBe('Alice');
        expect(result.travelDetails.originAirport).toBe('LHR');
        expect(result.travelDetails.destinationCountry).toBe('AE');
        expect(result.pets[0].species).toBe('Dog');
        expect(result.pets[0].breed).toBe('Labrador');
    });
});
