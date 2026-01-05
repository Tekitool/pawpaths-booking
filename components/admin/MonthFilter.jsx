'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { CalendarDays } from 'lucide-react';

export default function MonthFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentMonth = searchParams.get('month') || '';

    const handleMonthChange = (term) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (term) {
            params.set('month', term);
        } else {
            params.delete('month');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    return (
        <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-brand-text-02/80 pointer-events-none" />
            <select
                className="appearance-none block w-full rounded-lg border border-brand-text-02/20 py-[9px] pl-10 pr-8 text-sm outline-2 focus:ring-2 focus:ring-brand-color-01 focus:outline-none bg-white text-brand-text-02 cursor-pointer hover:border-brand-text-02/20 transition-colors"
                onChange={(e) => handleMonthChange(e.target.value)}
                value={currentMonth}
            >
                <option value="">All Months</option>
                {months.map((m) => (
                    <option key={m.value} value={m.value}>
                        {m.label}
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
