'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';

const TYPES = [
    { label: 'All Types', value: 'All' },
    { label: 'Export', value: 'export' },
    { label: 'Import', value: 'import' },
    { label: 'Local', value: 'local' },
];

export default function TypeFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentType = searchParams.get('type') || 'All';

    const handleTypeChange = (type) => {
        const params = new URLSearchParams(searchParams);
        if (type === 'All') {
            params.delete('type');
        } else {
            params.set('type', type);
        }
        params.set('page', '1'); // Reset to first page
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-brand-text-02/80 pointer-events-none" />
            <select
                className="appearance-none block w-full rounded-lg border border-brand-text-02/20 py-[9px] pl-10 pr-8 text-sm outline-2 focus:ring-2 focus:ring-brand-color-01 focus:outline-none bg-white text-brand-text-02 cursor-pointer hover:border-brand-text-02/20 transition-colors"
                onChange={(e) => handleTypeChange(e.target.value)}
                value={currentType}
            >
                {TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                        {type.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="h-4 w-4 text-brand-text-02/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}
