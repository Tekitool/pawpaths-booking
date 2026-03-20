// components/reports/TopCustomersChart.jsx
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TopCustomersChart({ data = [], title = 'Top Customers by Revenue' }) {
    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm h-full">
            <h2 className="text-lg font-semibold text-brand-text-01 mb-4">{title}</h2>

            {data.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-brand-text-02 text-sm">
                    No customer data for this period
                </div>
            ) : (
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(var(--brand-color-02))" />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'oklch(var(--brand-text-02))', fontSize: 11 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'oklch(var(--brand-text-02))', fontSize: 11 }}
                                width={120}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [`AED ${Number(value).toLocaleString()}`, 'Revenue']}
                            />
                            <Bar
                                dataKey="total"
                                fill="oklch(var(--system-color-03))"
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
