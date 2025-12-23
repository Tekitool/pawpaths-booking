function validateRoute(origin, destination) {
    // Helper to check for UAE
    const isUAE = (country) => {
        const c = (country || '').toLowerCase();
        return c === 'ae' || c === 'uae' || c.includes('united arab emirates');
    };

    const isOriginUAE = isUAE(origin);
    const isDestUAE = isUAE(destination);

    // Valid if either origin OR destination is UAE
    return isOriginUAE || isDestUAE;
}

console.log('Testing Limitation Logic:');
console.log('AE -> UK:', validateRoute('AE', 'UK')); // Expected: true
console.log('UK -> AE:', validateRoute('UK', 'AE')); // Expected: true
console.log('US -> UK:', validateRoute('US', 'UK')); // Expected: false
console.log('United Arab Emirates -> UK:', validateRoute('United Arab Emirates', 'UK')); // Expected: true
console.log('uae -> uk:', validateRoute('uae', 'uk')); // Expected: true
console.log('Empty -> UK:', validateRoute('', 'UK')); // Expected: false
