// components/reports/RevenueOverTimeChart.jsx
'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueOverTimeChart({ data = [] }) {
    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm h-full">
            <h2 className="text-lg font-semibold text-brand-text-01 mb-4">Revenue Over Time</h2>

            {data.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-brand-text-02 text-sm">
                    No revenue data for this period
                </div>
            ) : (
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(var(--system-color-03))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="oklch(var(--system-color-03))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--brand-color-02))" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'oklch(var(--brand-text-02))', fontSize: 11 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'oklch(var(--brand-text-02))', fontSize: 11 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [`AED ${Number(value).toLocaleString()}`, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="oklch(var(--system-color-03))"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
