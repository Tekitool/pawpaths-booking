const POPULAR_COUNTRIES = [
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'IN', label: 'India' },
    { value: 'PH', label: 'Philippines' },
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'QA', label: 'Qatar' },
    { value: 'DE', label: 'Germany' },
];

const OTHER_COUNTRIES = [
    { value: 'PK', label: 'Pakistan' },
    { value: 'BH', label: 'Bahrain' },
    { value: 'KW', label: 'Kuwait' },
    { value: 'OM', label: 'Oman' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'SE', label: 'Sweden' },
    { value: 'NO', label: 'Norway' },
    { value: 'DK', label: 'Denmark' },
    { value: 'IE', label: 'Ireland' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'SG', label: 'Singapore' },
    { value: 'MY', label: 'Malaysia' },
    { value: 'TH', label: 'Thailand' },
    { value: 'ID', label: 'Indonesia' },
    { value: 'VN', label: 'Vietnam' },
    { value: 'JP', label: 'Japan' },
    { value: 'KR', label: 'South Korea' },
    { value: 'CN', label: 'China' },
    { value: 'HK', label: 'Hong Kong' },
    { value: 'NZ', label: 'New Zealand' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' },
    { value: 'AR', label: 'Argentina' },
    { value: 'RU', label: 'Russia' },
    { value: 'TR', label: 'Turkey' },
    { value: 'EG', label: 'Egypt' },
    // Add more as needed
].sort((a, b) => a.label.localeCompare(b.label));

export const COUNTRIES = [...POPULAR_COUNTRIES, ...OTHER_COUNTRIES];

export const countries = COUNTRIES;
