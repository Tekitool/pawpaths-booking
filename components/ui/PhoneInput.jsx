'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

// ─── Country dial-code registry ───────────────────────────────────────────────
// UAE, UK, USA pinned first; rest alphabetical by name.
const DIAL_CODES = [
    // ── Pinned ────────────────────────────────────────────────────────────────
    { code: 'AE', dialCode: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: 'GB', dialCode: '+44',  flag: '🇬🇧', name: 'UK' },
    { code: 'US', dialCode: '+1',   flag: '🇺🇸', name: 'USA' },
    // ── A ─────────────────────────────────────────────────────────────────────
    { code: 'AF', dialCode: '+93',  flag: '🇦🇫', name: 'Afghanistan' },
    { code: 'AL', dialCode: '+355', flag: '🇦🇱', name: 'Albania' },
    { code: 'DZ', dialCode: '+213', flag: '🇩🇿', name: 'Algeria' },
    { code: 'AD', dialCode: '+376', flag: '🇦🇩', name: 'Andorra' },
    { code: 'AO', dialCode: '+244', flag: '🇦🇴', name: 'Angola' },
    { code: 'AG', dialCode: '+1',   flag: '🇦🇬', name: 'Antigua and Barbuda' },
    { code: 'AR', dialCode: '+54',  flag: '🇦🇷', name: 'Argentina' },
    { code: 'AM', dialCode: '+374', flag: '🇦🇲', name: 'Armenia' },
    { code: 'AU', dialCode: '+61',  flag: '🇦🇺', name: 'Australia' },
    { code: 'AT', dialCode: '+43',  flag: '🇦🇹', name: 'Austria' },
    { code: 'AZ', dialCode: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
    // ── B ─────────────────────────────────────────────────────────────────────
    { code: 'BS', dialCode: '+1',   flag: '🇧🇸', name: 'Bahamas' },
    { code: 'BH', dialCode: '+973', flag: '🇧🇭', name: 'Bahrain' },
    { code: 'BD', dialCode: '+880', flag: '🇧🇩', name: 'Bangladesh' },
    { code: 'BB', dialCode: '+1',   flag: '🇧🇧', name: 'Barbados' },
    { code: 'BY', dialCode: '+375', flag: '🇧🇾', name: 'Belarus' },
    { code: 'BE', dialCode: '+32',  flag: '🇧🇪', name: 'Belgium' },
    { code: 'BZ', dialCode: '+501', flag: '🇧🇿', name: 'Belize' },
    { code: 'BJ', dialCode: '+229', flag: '🇧🇯', name: 'Benin' },
    { code: 'BT', dialCode: '+975', flag: '🇧🇹', name: 'Bhutan' },
    { code: 'BO', dialCode: '+591', flag: '🇧🇴', name: 'Bolivia' },
    { code: 'BA', dialCode: '+387', flag: '🇧🇦', name: 'Bosnia and Herzegovina' },
    { code: 'BW', dialCode: '+267', flag: '🇧🇼', name: 'Botswana' },
    { code: 'BR', dialCode: '+55',  flag: '🇧🇷', name: 'Brazil' },
    { code: 'BN', dialCode: '+673', flag: '🇧🇳', name: 'Brunei' },
    { code: 'BG', dialCode: '+359', flag: '🇧🇬', name: 'Bulgaria' },
    { code: 'BF', dialCode: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
    { code: 'BI', dialCode: '+257', flag: '🇧🇮', name: 'Burundi' },
    // ── C ─────────────────────────────────────────────────────────────────────
    { code: 'KH', dialCode: '+855', flag: '🇰🇭', name: 'Cambodia' },
    { code: 'CM', dialCode: '+237', flag: '🇨🇲', name: 'Cameroon' },
    { code: 'CA', dialCode: '+1',   flag: '🇨🇦', name: 'Canada' },
    { code: 'CV', dialCode: '+238', flag: '🇨🇻', name: 'Cape Verde' },
    { code: 'CF', dialCode: '+236', flag: '🇨🇫', name: 'Central African Republic' },
    { code: 'TD', dialCode: '+235', flag: '🇹🇩', name: 'Chad' },
    { code: 'CL', dialCode: '+56',  flag: '🇨🇱', name: 'Chile' },
    { code: 'CN', dialCode: '+86',  flag: '🇨🇳', name: 'China' },
    { code: 'CO', dialCode: '+57',  flag: '🇨🇴', name: 'Colombia' },
    { code: 'KM', dialCode: '+269', flag: '🇰🇲', name: 'Comoros' },
    { code: 'CG', dialCode: '+242', flag: '🇨🇬', name: 'Congo' },
    { code: 'CR', dialCode: '+506', flag: '🇨🇷', name: 'Costa Rica' },
    { code: 'HR', dialCode: '+385', flag: '🇭🇷', name: 'Croatia' },
    { code: 'CU', dialCode: '+53',  flag: '🇨🇺', name: 'Cuba' },
    { code: 'CY', dialCode: '+357', flag: '🇨🇾', name: 'Cyprus' },
    { code: 'CZ', dialCode: '+420', flag: '🇨🇿', name: 'Czech Republic' },
    // ── D ─────────────────────────────────────────────────────────────────────
    { code: 'DK', dialCode: '+45',  flag: '🇩🇰', name: 'Denmark' },
    { code: 'DJ', dialCode: '+253', flag: '🇩🇯', name: 'Djibouti' },
    { code: 'DM', dialCode: '+1',   flag: '🇩🇲', name: 'Dominica' },
    { code: 'DO', dialCode: '+1',   flag: '🇩🇴', name: 'Dominican Republic' },
    { code: 'CD', dialCode: '+243', flag: '🇨🇩', name: 'DR Congo' },
    // ── E ─────────────────────────────────────────────────────────────────────
    { code: 'EC', dialCode: '+593', flag: '🇪🇨', name: 'Ecuador' },
    { code: 'EG', dialCode: '+20',  flag: '🇪🇬', name: 'Egypt' },
    { code: 'SV', dialCode: '+503', flag: '🇸🇻', name: 'El Salvador' },
    { code: 'GQ', dialCode: '+240', flag: '🇬🇶', name: 'Equatorial Guinea' },
    { code: 'ER', dialCode: '+291', flag: '🇪🇷', name: 'Eritrea' },
    { code: 'EE', dialCode: '+372', flag: '🇪🇪', name: 'Estonia' },
    { code: 'ET', dialCode: '+251', flag: '🇪🇹', name: 'Ethiopia' },
    // ── F ─────────────────────────────────────────────────────────────────────
    { code: 'FJ', dialCode: '+679', flag: '🇫🇯', name: 'Fiji' },
    { code: 'FI', dialCode: '+358', flag: '🇫🇮', name: 'Finland' },
    { code: 'FR', dialCode: '+33',  flag: '🇫🇷', name: 'France' },
    // ── G ─────────────────────────────────────────────────────────────────────
    { code: 'GA', dialCode: '+241', flag: '🇬🇦', name: 'Gabon' },
    { code: 'GM', dialCode: '+220', flag: '🇬🇲', name: 'Gambia' },
    { code: 'GE', dialCode: '+995', flag: '🇬🇪', name: 'Georgia' },
    { code: 'DE', dialCode: '+49',  flag: '🇩🇪', name: 'Germany' },
    { code: 'GH', dialCode: '+233', flag: '🇬🇭', name: 'Ghana' },
    { code: 'GR', dialCode: '+30',  flag: '🇬🇷', name: 'Greece' },
    { code: 'GD', dialCode: '+1',   flag: '🇬🇩', name: 'Grenada' },
    { code: 'GT', dialCode: '+502', flag: '🇬🇹', name: 'Guatemala' },
    { code: 'GN', dialCode: '+224', flag: '🇬🇳', name: 'Guinea' },
    { code: 'GW', dialCode: '+245', flag: '🇬🇼', name: 'Guinea-Bissau' },
    { code: 'GY', dialCode: '+592', flag: '🇬🇾', name: 'Guyana' },
    // ── H ─────────────────────────────────────────────────────────────────────
    { code: 'HT', dialCode: '+509', flag: '🇭🇹', name: 'Haiti' },
    { code: 'HN', dialCode: '+504', flag: '🇭🇳', name: 'Honduras' },
    { code: 'HK', dialCode: '+852', flag: '🇭🇰', name: 'Hong Kong' },
    { code: 'HU', dialCode: '+36',  flag: '🇭🇺', name: 'Hungary' },
    // ── I ─────────────────────────────────────────────────────────────────────
    { code: 'IS', dialCode: '+354', flag: '🇮🇸', name: 'Iceland' },
    { code: 'IN', dialCode: '+91',  flag: '🇮🇳', name: 'India' },
    { code: 'ID', dialCode: '+62',  flag: '🇮🇩', name: 'Indonesia' },
    { code: 'IR', dialCode: '+98',  flag: '🇮🇷', name: 'Iran' },
    { code: 'IQ', dialCode: '+964', flag: '🇮🇶', name: 'Iraq' },
    { code: 'IE', dialCode: '+353', flag: '🇮🇪', name: 'Ireland' },
    { code: 'IL', dialCode: '+972', flag: '🇮🇱', name: 'Israel' },
    { code: 'IT', dialCode: '+39',  flag: '🇮🇹', name: 'Italy' },
    { code: 'CI', dialCode: '+225', flag: '🇨🇮', name: 'Ivory Coast' },
    // ── J ─────────────────────────────────────────────────────────────────────
    { code: 'JM', dialCode: '+1',   flag: '🇯🇲', name: 'Jamaica' },
    { code: 'JP', dialCode: '+81',  flag: '🇯🇵', name: 'Japan' },
    { code: 'JO', dialCode: '+962', flag: '🇯🇴', name: 'Jordan' },
    // ── K ─────────────────────────────────────────────────────────────────────
    { code: 'KZ', dialCode: '+7',   flag: '🇰🇿', name: 'Kazakhstan' },
    { code: 'KE', dialCode: '+254', flag: '🇰🇪', name: 'Kenya' },
    { code: 'KI', dialCode: '+686', flag: '🇰🇮', name: 'Kiribati' },
    { code: 'KW', dialCode: '+965', flag: '🇰🇼', name: 'Kuwait' },
    { code: 'KG', dialCode: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
    // ── L ─────────────────────────────────────────────────────────────────────
    { code: 'LA', dialCode: '+856', flag: '🇱🇦', name: 'Laos' },
    { code: 'LV', dialCode: '+371', flag: '🇱🇻', name: 'Latvia' },
    { code: 'LB', dialCode: '+961', flag: '🇱🇧', name: 'Lebanon' },
    { code: 'LS', dialCode: '+266', flag: '🇱🇸', name: 'Lesotho' },
    { code: 'LR', dialCode: '+231', flag: '🇱🇷', name: 'Liberia' },
    { code: 'LY', dialCode: '+218', flag: '🇱🇾', name: 'Libya' },
    { code: 'LI', dialCode: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
    { code: 'LT', dialCode: '+370', flag: '🇱🇹', name: 'Lithuania' },
    { code: 'LU', dialCode: '+352', flag: '🇱🇺', name: 'Luxembourg' },
    // ── M ─────────────────────────────────────────────────────────────────────
    { code: 'MO', dialCode: '+853', flag: '🇲🇴', name: 'Macau' },
    { code: 'MG', dialCode: '+261', flag: '🇲🇬', name: 'Madagascar' },
    { code: 'MW', dialCode: '+265', flag: '🇲🇼', name: 'Malawi' },
    { code: 'MY', dialCode: '+60',  flag: '🇲🇾', name: 'Malaysia' },
    { code: 'MV', dialCode: '+960', flag: '🇲🇻', name: 'Maldives' },
    { code: 'ML', dialCode: '+223', flag: '🇲🇱', name: 'Mali' },
    { code: 'MT', dialCode: '+356', flag: '🇲🇹', name: 'Malta' },
    { code: 'MH', dialCode: '+692', flag: '🇲🇭', name: 'Marshall Islands' },
    { code: 'MR', dialCode: '+222', flag: '🇲🇷', name: 'Mauritania' },
    { code: 'MU', dialCode: '+230', flag: '🇲🇺', name: 'Mauritius' },
    { code: 'MX', dialCode: '+52',  flag: '🇲🇽', name: 'Mexico' },
    { code: 'FM', dialCode: '+691', flag: '🇫🇲', name: 'Micronesia' },
    { code: 'MD', dialCode: '+373', flag: '🇲🇩', name: 'Moldova' },
    { code: 'MC', dialCode: '+377', flag: '🇲🇨', name: 'Monaco' },
    { code: 'MN', dialCode: '+976', flag: '🇲🇳', name: 'Mongolia' },
    { code: 'ME', dialCode: '+382', flag: '🇲🇪', name: 'Montenegro' },
    { code: 'MA', dialCode: '+212', flag: '🇲🇦', name: 'Morocco' },
    { code: 'MZ', dialCode: '+258', flag: '🇲🇿', name: 'Mozambique' },
    { code: 'MM', dialCode: '+95',  flag: '🇲🇲', name: 'Myanmar' },
    // ── N ─────────────────────────────────────────────────────────────────────
    { code: 'NA', dialCode: '+264', flag: '🇳🇦', name: 'Namibia' },
    { code: 'NR', dialCode: '+674', flag: '🇳🇷', name: 'Nauru' },
    { code: 'NP', dialCode: '+977', flag: '🇳🇵', name: 'Nepal' },
    { code: 'NL', dialCode: '+31',  flag: '🇳🇱', name: 'Netherlands' },
    { code: 'NZ', dialCode: '+64',  flag: '🇳🇿', name: 'New Zealand' },
    { code: 'NI', dialCode: '+505', flag: '🇳🇮', name: 'Nicaragua' },
    { code: 'NE', dialCode: '+227', flag: '🇳🇪', name: 'Niger' },
    { code: 'NG', dialCode: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: 'KP', dialCode: '+850', flag: '🇰🇵', name: 'North Korea' },
    { code: 'MK', dialCode: '+389', flag: '🇲🇰', name: 'North Macedonia' },
    { code: 'NO', dialCode: '+47',  flag: '🇳🇴', name: 'Norway' },
    // ── O ─────────────────────────────────────────────────────────────────────
    { code: 'OM', dialCode: '+968', flag: '🇴🇲', name: 'Oman' },
    // ── P ─────────────────────────────────────────────────────────────────────
    { code: 'PK', dialCode: '+92',  flag: '🇵🇰', name: 'Pakistan' },
    { code: 'PW', dialCode: '+680', flag: '🇵🇼', name: 'Palau' },
    { code: 'PA', dialCode: '+507', flag: '🇵🇦', name: 'Panama' },
    { code: 'PG', dialCode: '+675', flag: '🇵🇬', name: 'Papua New Guinea' },
    { code: 'PY', dialCode: '+595', flag: '🇵🇾', name: 'Paraguay' },
    { code: 'PE', dialCode: '+51',  flag: '🇵🇪', name: 'Peru' },
    { code: 'PH', dialCode: '+63',  flag: '🇵🇭', name: 'Philippines' },
    { code: 'PL', dialCode: '+48',  flag: '🇵🇱', name: 'Poland' },
    { code: 'PT', dialCode: '+351', flag: '🇵🇹', name: 'Portugal' },
    // ── Q ─────────────────────────────────────────────────────────────────────
    { code: 'QA', dialCode: '+974', flag: '🇶🇦', name: 'Qatar' },
    // ── R ─────────────────────────────────────────────────────────────────────
    { code: 'RO', dialCode: '+40',  flag: '🇷🇴', name: 'Romania' },
    { code: 'RU', dialCode: '+7',   flag: '🇷🇺', name: 'Russia' },
    { code: 'RW', dialCode: '+250', flag: '🇷🇼', name: 'Rwanda' },
    // ── S ─────────────────────────────────────────────────────────────────────
    { code: 'KN', dialCode: '+1',   flag: '🇰🇳', name: 'Saint Kitts and Nevis' },
    { code: 'LC', dialCode: '+1',   flag: '🇱🇨', name: 'Saint Lucia' },
    { code: 'VC', dialCode: '+1',   flag: '🇻🇨', name: 'Saint Vincent' },
    { code: 'WS', dialCode: '+685', flag: '🇼🇸', name: 'Samoa' },
    { code: 'SM', dialCode: '+378', flag: '🇸🇲', name: 'San Marino' },
    { code: 'ST', dialCode: '+239', flag: '🇸🇹', name: 'Sao Tome' },
    { code: 'SA', dialCode: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: 'SN', dialCode: '+221', flag: '🇸🇳', name: 'Senegal' },
    { code: 'RS', dialCode: '+381', flag: '🇷🇸', name: 'Serbia' },
    { code: 'SC', dialCode: '+248', flag: '🇸🇨', name: 'Seychelles' },
    { code: 'SL', dialCode: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
    { code: 'SG', dialCode: '+65',  flag: '🇸🇬', name: 'Singapore' },
    { code: 'SK', dialCode: '+421', flag: '🇸🇰', name: 'Slovakia' },
    { code: 'SI', dialCode: '+386', flag: '🇸🇮', name: 'Slovenia' },
    { code: 'SB', dialCode: '+677', flag: '🇸🇧', name: 'Solomon Islands' },
    { code: 'SO', dialCode: '+252', flag: '🇸🇴', name: 'Somalia' },
    { code: 'ZA', dialCode: '+27',  flag: '🇿🇦', name: 'South Africa' },
    { code: 'KR', dialCode: '+82',  flag: '🇰🇷', name: 'South Korea' },
    { code: 'ES', dialCode: '+34',  flag: '🇪🇸', name: 'Spain' },
    { code: 'LK', dialCode: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
    { code: 'SD', dialCode: '+249', flag: '🇸🇩', name: 'Sudan' },
    { code: 'SR', dialCode: '+597', flag: '🇸🇷', name: 'Suriname' },
    { code: 'SE', dialCode: '+46',  flag: '🇸🇪', name: 'Sweden' },
    { code: 'CH', dialCode: '+41',  flag: '🇨🇭', name: 'Switzerland' },
    { code: 'SY', dialCode: '+963', flag: '🇸🇾', name: 'Syria' },
    // ── T ─────────────────────────────────────────────────────────────────────
    { code: 'TW', dialCode: '+886', flag: '🇹🇼', name: 'Taiwan' },
    { code: 'TJ', dialCode: '+992', flag: '🇹🇯', name: 'Tajikistan' },
    { code: 'TZ', dialCode: '+255', flag: '🇹🇿', name: 'Tanzania' },
    { code: 'TH', dialCode: '+66',  flag: '🇹🇭', name: 'Thailand' },
    { code: 'TL', dialCode: '+670', flag: '🇹🇱', name: 'Timor-Leste' },
    { code: 'TG', dialCode: '+228', flag: '🇹🇬', name: 'Togo' },
    { code: 'TO', dialCode: '+676', flag: '🇹🇴', name: 'Tonga' },
    { code: 'TT', dialCode: '+1',   flag: '🇹🇹', name: 'Trinidad and Tobago' },
    { code: 'TN', dialCode: '+216', flag: '🇹🇳', name: 'Tunisia' },
    { code: 'TR', dialCode: '+90',  flag: '🇹🇷', name: 'Turkey' },
    { code: 'TM', dialCode: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
    { code: 'TV', dialCode: '+688', flag: '🇹🇻', name: 'Tuvalu' },
    // ── U ─────────────────────────────────────────────────────────────────────
    { code: 'UG', dialCode: '+256', flag: '🇺🇬', name: 'Uganda' },
    { code: 'UA', dialCode: '+380', flag: '🇺🇦', name: 'Ukraine' },
    { code: 'UY', dialCode: '+598', flag: '🇺🇾', name: 'Uruguay' },
    { code: 'UZ', dialCode: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
    // ── V ─────────────────────────────────────────────────────────────────────
    { code: 'VU', dialCode: '+678', flag: '🇻🇺', name: 'Vanuatu' },
    { code: 'VA', dialCode: '+379', flag: '🇻🇦', name: 'Vatican' },
    { code: 'VE', dialCode: '+58',  flag: '🇻🇪', name: 'Venezuela' },
    { code: 'VN', dialCode: '+84',  flag: '🇻🇳', name: 'Vietnam' },
    // ── Y ─────────────────────────────────────────────────────────────────────
    { code: 'YE', dialCode: '+967', flag: '🇾🇪', name: 'Yemen' },
    // ── Z ─────────────────────────────────────────────────────────────────────
    { code: 'ZM', dialCode: '+260', flag: '🇿🇲', name: 'Zambia' },
    { code: 'ZW', dialCode: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
];

// Sort by dialCode length descending so longer codes win prefix matching
const SORTED_BY_LENGTH = [...DIAL_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);

/**
 * Parse a full international phone string (e.g. "+971552184027") into
 * { dialCode: "+971", localNumber: "552184027" }.
 * Falls back to UAE (+971) if no known prefix is matched.
 */
function parsePhoneValue(val) {
    if (!val) return { dialCode: '+971', localNumber: '' };
    const str = String(val).trim();
    for (const entry of SORTED_BY_LENGTH) {
        if (str.startsWith(entry.dialCode)) {
            return { dialCode: entry.dialCode, localNumber: str.slice(entry.dialCode.length) };
        }
    }
    return { dialCode: '+971', localNumber: str.replace(/^\+/, '') };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Composite international phone input with searchable country dropdown.
 *
 * Props:
 *   value      — full combined phone string ("+971552184027")
 *   onChange   — (e: { target: { name, value } }) => void
 *   name       — form field name (default "phone")
 *   label      — floating label text (default "Phone Number")
 *   id         — input id for label association
 *   className  — applied to the outer wrapper div
 *   error      — error string shown below the field
 */
export default function PhoneInput({
    value = '',
    onChange,
    name = 'phone',
    label = 'Phone Number',
    id,
    className = '',
    error,
}) {
    const [isFocused, setIsFocused]     = useState(false);
    const [isOpen, setIsOpen]           = useState(false);
    const [search, setSearch]           = useState('');
    // Track selected country by its unique code (not dialCode) so CA vs US stay distinct
    const [selectedCode, setSelectedCode] = useState(
        () => DIAL_CODES.find(c => c.dialCode === parsePhoneValue(value).dialCode)?.code || 'AE'
    );
    const wrapperRef = useRef(null);
    const searchRef  = useRef(null);

    const { dialCode, localNumber } = useMemo(() => parsePhoneValue(value), [value]);

    const selectedEntry = useMemo(
        () => DIAL_CODES.find(c => c.code === selectedCode) || DIAL_CODES[0],
        [selectedCode]
    );

    // ── Sync selectedCode when value changes from an external source ──────────
    // (e.g. Zustand rehydration, "same as phone" copy, or form reset)
    // Skipped if the current country already covers the same dial code prefix
    // so CA vs US disambiguation is never clobbered by the user's own typing.
    useEffect(() => {
        const currentEntry = DIAL_CODES.find(c => c.code === selectedCode) || DIAL_CODES[0];
        if (currentEntry.dialCode !== dialCode) {
            const match = DIAL_CODES.find(c => c.dialCode === dialCode);
            if (match) setSelectedCode(match.code);
        }
    }, [dialCode]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Filter: starts-with wins, then contains ───────────────────────────────
    const filteredCountries = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return DIAL_CODES;

        const startsWith = DIAL_CODES.filter(c =>
            c.name.toLowerCase().startsWith(q) ||
            c.code.toLowerCase().startsWith(q) ||
            c.dialCode.startsWith(q) ||
            c.dialCode.startsWith('+' + q)
        );
        const contains = DIAL_CODES.filter(c =>
            !startsWith.includes(c) &&
            (c.name.toLowerCase().includes(q) || c.dialCode.includes(q))
        );
        return [...startsWith, ...contains];
    }, [search]);

    // ── Close on outside click ────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    // ── Auto-focus search when dropdown opens ─────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => searchRef.current?.focus());
        }
    }, [isOpen]);

    const emit = (newDial, newLocal) => {
        const digits = newLocal.replace(/[^\d]/g, '');
        onChange?.({ target: { name, value: newDial + digits } });
    };

    const handleSelect = (country) => {
        setSelectedCode(country.code);
        emit(country.dialCode, localNumber);
        setIsOpen(false);
        setSearch('');
    };

    const handleLocalChange = (e) => {
        const raw = e.target.value.replace(/[^\d\s\-]/g, '');
        emit(dialCode, raw);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearch('');
        } else if (e.key === 'Enter' && filteredCountries.length > 0) {
            handleSelect(filteredCountries[0]);
        }
    };

    const handleToggle = () => {
        if (isOpen) { setIsOpen(false); setSearch(''); }
        else { setIsOpen(true); }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>

            {/* ── Composite field container ─────────────────────────── */}
            <div
                className={`flex items-center rounded-t-md3-xs border-b bg-surface transition-all duration-200 ${
                    isFocused || isOpen
                        ? 'border-b-2 border-brand-color-01'
                        : error
                            ? 'border-b-2 border-error'
                            : 'border-outline'
                }`}
            >
                {/* LEFT: Country selector trigger */}
                <button
                    type="button"
                    onClick={handleToggle}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-label="Select country dial code"
                    className="relative flex items-center gap-1.5 flex-shrink-0 pl-3 pr-7 pt-6 pb-2.5 focus:outline-none cursor-pointer"
                >
                    <span className="text-base leading-none">{selectedEntry.flag}</span>
                    <span className="text-body-large text-on-surface tabular-nums">{selectedEntry.dialCode}</span>
                    <ChevronDown
                        size={13}
                        className={`absolute right-1.5 top-1/2 -translate-y-[30%] text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* DIVIDER */}
                <div className="w-px h-5 bg-outline flex-shrink-0 mx-0.5" />

                {/* RIGHT: Local number input */}
                <input
                    type="tel"
                    id={id}
                    value={localNumber}
                    onChange={handleLocalChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={isFocused ? '552184027' : ' '}
                    autoComplete="tel-local"
                    className="flex-1 min-w-0 bg-transparent px-3 pb-2.5 pt-6 text-body-large text-on-surface focus:outline-none placeholder:text-brand-text-02/50"
                />
            </div>

            {/* ── Floating label ────────────────────────────────────── */}
            <label
                htmlFor={id}
                className={`
                    absolute left-4 top-4 z-10 origin-[0] pointer-events-none
                    -translate-y-3 scale-75
                    text-body-medium duration-200 transition-colors
                    ${(isFocused || isOpen) && !error ? 'text-brand-color-01' : error ? 'text-error' : 'text-on-surface-variant'}
                `}
            >
                {label}
            </label>

            {/* ── Searchable country dropdown ────────────────────────── */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 w-72 rounded-xl border border-outline bg-white shadow-xl overflow-hidden" style={{ opacity: 1 }}>

                    {/* Search bar */}
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-200 bg-white">
                        <Search size={14} className="text-on-surface-variant flex-shrink-0" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search country or code…"
                            className="flex-1 bg-transparent text-body-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                                aria-label="Clear search"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Country list */}
                    <ul role="listbox" aria-label="Countries" className="max-h-52 overflow-y-auto py-1 bg-white">
                        {filteredCountries.length === 0 ? (
                            <li className="px-4 py-3 text-body-small text-on-surface-variant text-center">
                                No countries found
                            </li>
                        ) : (
                            filteredCountries.map((c) => {
                                const isSelected = c.code === selectedEntry.code;
                                return (
                                    <li
                                        key={c.code}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(c)}
                                        className={`flex items-center gap-3 px-4 py-2 cursor-pointer text-body-medium transition-colors ${
                                            isSelected
                                                ? 'bg-brand-color-01/10 text-brand-color-01'
                                                : 'text-gray-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-base leading-none w-5 text-center">{c.flag}</span>
                                        <span className="flex-1 truncate">{c.name}</span>
                                        <span className={`text-body-small tabular-nums ${isSelected ? 'text-brand-color-01' : 'text-on-surface-variant'}`}>
                                            {c.dialCode}
                                        </span>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}

            {error && (
                <p className="mt-1 text-body-small text-error px-4">{error}</p>
            )}
        </div>
    );
}
