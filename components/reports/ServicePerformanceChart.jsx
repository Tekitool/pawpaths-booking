// components/reports/ServicePerformanceChart.jsx
'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ServicePerformanceChart({ revenueData = [], bookingData = [], marginData = [] }) {
    const [view, setView] = useState('revenue');

    const views = [
        { key: 'revenue', label: 'Revenue' },
        { key: 'bookings', label: 'Bookings' },
        { key: 'margin', label: 'Margin %' },
    ];

    const chartData = {
        revenue: revenueData.slice(0, 10).map(s => ({
            name: s.name?.length > 20 ? s.name.slice(0, 20) + '…' : s.name,
            total: Math.round(s.total_revenue),
        })),
        bookings: bookingData.slice(0, 10).map(s => ({
            name: s.name?.length > 20 ? s.name.slice(0, 20) + '…' : s.name,
            total: s.booking_count,
        })),
        margin: marginData.slice(0, 10).map(s => ({
            name: s.name?.length > 20 ? s.name.slice(0, 20) + '…' : s.name,
            total: s.margin_pct,
        })),
    };

    const tooltipFormatters = {
        revenue: (v) => [`AED ${Number(v).toLocaleString()}`, 'Revenue'],
        bookings: (v) => [v, 'Bookings'],
        margin: (v) => [`${v}%`, 'Gross Margin'],
    };

    const current = chartData[view];

    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-text-01">Service Performance</h2>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {views.map(v => (
                        <button
                            key={v.key}
                            onClick={() => setView(v.key)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                view === v.key
                                    ? 'bg-white text-brand-text-01 shadow-sm'
                                    : 'text-brand-text-02 hover:text-brand-text-01'
                            }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {current.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-brand-text-02 text-sm">
                    No service data for this period
                </div>
            ) : (
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={current}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(var(--brand-color-02))" />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'oklch(var(--brand-text-02))', fontSize: 11 }}
                                tickFormatter={(v) => view === 'margin' ? `${v}%` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'oklch(var(--brand-text-02))', fontSize: 11 }}
                                width={130}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={tooltipFormatters[view]}
                            />
                            <Bar
                                dataKey="total"
                                fill="oklch(var(--brand-color-01))"
                                radius={[0, 4, 4, 0]}
                                barSize={16}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
