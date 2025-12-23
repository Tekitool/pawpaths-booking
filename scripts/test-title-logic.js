function getCustomerTypeCode(origin, destination, isTravelingWithPet) {
    const originCountry = origin?.toLowerCase() || '';
    const destinationCountry = destination?.toLowerCase() || '';

    const isOriginUAE = originCountry.includes('united arab emirates') || originCountry === 'uae';
    const isDestUAE = destinationCountry.includes('united arab emirates') || destinationCountry === 'uae';

    if (isOriginUAE && isDestUAE) return 'LOCL';
    if (isOriginUAE && !isDestUAE) return isTravelingWithPet ? 'EX-A' : 'EX-U';
    if (!isOriginUAE && isDestUAE) return isTravelingWithPet ? 'IM-A' : 'IM-U';
    return 'LOCL'; // Default fallback
}

console.log('Testing with Codes (Current Behavior):');
console.log('Origin: AE, Dest: UK ->', getCustomerTypeCode('AE', 'UK', false)); // Expected: EX-U, Actual: LOCL?
console.log('Origin: UK, Dest: AE ->', getCustomerTypeCode('UK', 'AE', false)); // Expected: IM-U, Actual: LOCL?

console.log('\nTesting with Names (Old Behavior):');
console.log('Origin: United Arab Emirates, Dest: United Kingdom ->', getCustomerTypeCode('United Arab Emirates', 'United Kingdom', false));
