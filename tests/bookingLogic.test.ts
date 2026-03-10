import { describe, it, expect } from 'vitest';
import { detectBookingContext } from '@/utils/bookingLogic';

describe('detectBookingContext', () => {
    it('returns "local" when both origin and destination are UAE', () => {
        expect(detectBookingContext('AE', 'AE')).toBe('local');
        expect(detectBookingContext('UAE', 'uae')).toBe('local');
        expect(detectBookingContext('United Arab Emirates', 'AE')).toBe('local');
    });

    it('returns "export" when origin is UAE and destination is not', () => {
        expect(detectBookingContext('AE', 'US')).toBe('export');
        expect(detectBookingContext('UAE', 'United Kingdom')).toBe('export');
        expect(detectBookingContext('United Arab Emirates', 'India')).toBe('export');
    });

    it('returns "import" when origin is not UAE and destination is UAE', () => {
        expect(detectBookingContext('US', 'AE')).toBe('import');
        expect(detectBookingContext('India', 'UAE')).toBe('import');
        expect(detectBookingContext('Germany', 'United Arab Emirates')).toBe('import');
    });

    it('returns "transit" when neither origin nor destination is UAE', () => {
        expect(detectBookingContext('US', 'UK')).toBe('transit');
        expect(detectBookingContext('India', 'Germany')).toBe('transit');
    });

    it('handles empty strings gracefully', () => {
        expect(detectBookingContext('', '')).toBe('transit');
        expect(detectBookingContext('AE', '')).toBe('export');
        expect(detectBookingContext('', 'AE')).toBe('import');
    });

    it('is case-insensitive', () => {
        expect(detectBookingContext('ae', 'ae')).toBe('local');
        expect(detectBookingContext('Ae', 'uAe')).toBe('local');
    });
});
