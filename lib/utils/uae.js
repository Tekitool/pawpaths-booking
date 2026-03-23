/**
 * UAE detection — single source of truth.
 *
 * Accepts ISO codes ('AE', 'ae'), abbreviations ('UAE', 'uae'),
 * or full names ('United Arab Emirates').
 */
export function isUAE(country) {
    if (!country) return false;
    const c = String(country).trim().toLowerCase();
    return c === 'ae' || c === 'uae' || c === 'united arab emirates';
}
