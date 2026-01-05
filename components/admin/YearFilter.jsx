'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { CalendarRange } from 'lucide-react';

export default function YearFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentYear = searchParams.get('year') || '';

    const handleYearChange = (term) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (term) {
            params.set('year', term);
        } else {
            params.delete('year');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const getYearOptions = () => {
        const today = new Date();
        const current = today.getFullYear();
        const years = [];

        // 2 upcoming years, current, 2 previous years (Descending)
        for (let i = 2; i >= -2; i--) {
            years.push(current + i);
        }
        return years;
    };

    const years = getYearOptions();

    return (
        <div className="relative">
            <CalendarRange className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-brand-text-02/80 pointer-events-none" />
            <select
                className="appearance-none block w-full rounded-lg border border-brand-text-02/20 py-[9px] pl-10 pr-8 text-sm outline-2 focus:ring-2 focus:ring-brand-color-01 focus:outline-none bg-white text-brand-text-02 cursor-pointer hover:border-brand-text-02/20 transition-colors"
                onChange={(e) => handleYearChange(e.target.value)}
                value={currentYear}
            >
                <option value="">All Years</option>
                {years.map((year) => (
                    <option key={year} value={year}>
                        {year}
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
