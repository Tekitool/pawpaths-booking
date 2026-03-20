// components/reports/ProfitLossChart.jsx
'use client';

import React from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

function KPICard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={color} />
                <span className="text-sm text-brand-text-02">{label}</span>
            </div>
            <span className="text-xl font-bold text-brand-text-01">AED {Number(value || 0).toLocaleString()}</span>
        </div>
    );
}

export default function ProfitLossChart({ data = { months: [], totals: { revenue: 0, expenses: 0, netProfit: 0 } } }) {
    const { months, totals } = data;

    return (
        <div className="space-y-4">
            {/* KPI summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KPICard label="Total Revenue" value={totals.revenue} icon={TrendingUp} color="text-system-color-03" />
                <KPICard label="Total Expenses" value={totals.expenses} icon={TrendingDown} color="text-status-warning" />
                <KPICard
                    label="Net Profit"
                    value={totals.netProfit}
                    icon={DollarSign}
                    color={totals.netProfit >= 0 ? 'text-status-success' : 'text-status-error'}
                />
            </div>

            {/* Chart */}
            <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-brand-text-01 mb-4">Profit & Loss</h2>

                {months.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-brand-text-02 text-sm">
                        No data for this period
                    </div>
                ) : (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={months} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
                                    formatter={(value, name) => [`AED ${Number(value).toLocaleString()}`, name]}
                                />
                                <Legend />
                                <Bar dataKey="revenue" name="Revenue" fill="oklch(var(--system-color-03))" radius={[2, 2, 0, 0]} barSize={12} />
                                <Bar dataKey="expenses" name="Expenses" fill="oklch(var(--status-warning))" radius={[2, 2, 0, 0]} barSize={12} />
                                <Line
                                    type="monotone"
                                    dataKey="netProfit"
                                    name="Net Profit"
                                    stroke="oklch(var(--system-color-02))"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: 'oklch(var(--system-color-02))' }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
