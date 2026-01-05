export type ServiceType = 'export' | 'import' | 'local' | 'transit';

/**
 * Detects the service type based on origin and destination countries.
 * 
 * Rules:
 * - Local: Origin is UAE AND Destination is UAE
 * - Export: Origin is UAE AND Destination is NOT UAE
 * - Import: Origin is NOT UAE AND Destination is UAE
 * - Transit: Origin is NOT UAE AND Destination is NOT UAE
 */
export function detectBookingContext(originCountry: string, destinationCountry: string): ServiceType {
    const origin = (originCountry || '').toLowerCase();
    const dest = (destinationCountry || '').toLowerCase();

    const isOriginUAE = origin === 'ae' || origin === 'uae' || origin.includes('united arab emirates');
    const isDestUAE = dest === 'ae' || dest === 'uae' || dest.includes('united arab emirates');

    if (isOriginUAE && isDestUAE) return 'local';
    if (isOriginUAE && !isDestUAE) return 'export';
    if (!isOriginUAE && isDestUAE) return 'import';
    return 'transit';
}
