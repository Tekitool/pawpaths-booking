// components/reports/DateRangeFilter.jsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

const PRESETS = [
    { label: 'This Month', key: 'this_month' },
    { label: 'Last Month', key: 'last_month' },
    { label: 'This Quarter', key: 'this_quarter' },
    { label: 'Last Quarter', key: 'last_quarter' },
    { label: 'This Year', key: 'this_year' },
    { label: 'Last Year', key: 'last_year' },
    { label: 'Custom', key: 'custom' },
];

function getPresetRange(key) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    switch (key) {
        case 'this_month':
            return {
                from: new Date(y, m, 1).toISOString().split('T')[0],
                to: new Date(y, m + 1, 0).toISOString().split('T')[0],
            };
        case 'last_month':
            return {
                from: new Date(y, m - 1, 1).toISOString().split('T')[0],
                to: new Date(y, m, 0).toISOString().split('T')[0],
            };
        case 'this_quarter': {
            const qStart = Math.floor(m / 3) * 3;
            return {
                from: new Date(y, qStart, 1).toISOString().split('T')[0],
                to: new Date(y, qStart + 3, 0).toISOString().split('T')[0],
            };
        }
        case 'last_quarter': {
            const qStart = Math.floor(m / 3) * 3 - 3;
            const qYear = qStart < 0 ? y - 1 : y;
            const qMonth = ((qStart % 12) + 12) % 12;
            return {
                from: new Date(qYear, qMonth, 1).toISOString().split('T')[0],
                to: new Date(qYear, qMonth + 3, 0).toISOString().split('T')[0],
            };
        }
        case 'this_year':
            return { from: `${y}-01-01`, to: `${y}-12-31` };
        case 'last_year':
            return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` };
        default:
            return null;
    }
}

export default function DateRangeFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const activePreset = searchParams.get('preset') || 'this_year';
    const [customFrom, setCustomFrom] = useState(searchParams.get('from') || '');
    const [customTo, setCustomTo] = useState(searchParams.get('to') || '');

    const applyFilter = useCallback((preset, from, to) => {
        const params = new URLSearchParams();
        params.set('preset', preset);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        router.push(`/admin/reports?${params.toString()}`);
    }, [router]);

    const handlePresetClick = (key) => {
        if (key === 'custom') {
            applyFilter('custom', customFrom, customTo);
            return;
        }
        const range = getPresetRange(key);
        if (range) {
            applyFilter(key, range.from, range.to);
        }
    };

    const handleCustomApply = () => {
        if (customFrom && customTo) {
            applyFilter('custom', customFrom, customTo);
        }
    };

    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
                <Calendar size={16} className="text-brand-text-02" />
                {PRESETS.map((p) => (
                    <button
                        key={p.key}
                        onClick={() => handlePresetClick(p.key)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activePreset === p.key
                                ? 'bg-accent text-white'
                                : 'bg-brand-color-01 text-brand-text-02 hover:bg-brand-color-02'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}

                {activePreset === 'custom' && (
                    <div className="flex items-center gap-2 ml-2">
                        <input
                            type="date"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            className="px-2 py-1.5 rounded-lg border border-brand-color-02 text-sm bg-white text-brand-text-01"
                        />
                        <span className="text-brand-text-02 text-sm">to</span>
                        <input
                            type="date"
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            className="px-2 py-1.5 rounded-lg border border-brand-color-02 text-sm bg-white text-brand-text-01"
                        />
                        <button
                            onClick={handleCustomApply}
                            className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
