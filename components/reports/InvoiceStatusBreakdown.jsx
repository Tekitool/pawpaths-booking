// components/reports/InvoiceStatusBreakdown.jsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS = {
    draft: 'oklch(var(--brand-text-02))',
    sent: 'oklch(var(--system-color-03))',
    approved: 'oklch(var(--system-color-02))',
    paid: 'oklch(var(--status-success))',
    overdue: 'oklch(var(--status-error))',
    cancelled: 'oklch(var(--status-warning))',
};

const FALLBACK_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

export default function InvoiceStatusBreakdown({ data = [] }) {
    const hasData = data.length > 0;
    const chartData = hasData
        ? data.map((d) => ({ name: d.status, value: d.value, count: d.count }))
        : [{ name: 'No data', value: 1 }];

    const totalValue = hasData ? data.reduce((s, d) => s + d.value, 0) : 0;
    const totalCount = hasData ? data.reduce((s, d) => s + d.count, 0) : 0;

    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm h-full flex flex-col">
            <h2 className="text-lg font-semibold text-brand-text-01 mb-4">Invoice Status</h2>

            <div className="flex-1 flex items-center">
                <div className="w-1/2 h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={hasData ? 2 : 0}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={hasData ? (STATUS_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]) : '#e5e7eb'}
                                    />
                                ))}
                            </Pie>
                            {hasData && (
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value, name) => [`AED ${Number(value).toLocaleString()}`, name]}
                                />
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-brand-text-01">{totalCount}</span>
                        <span className="text-[10px] text-brand-text-02 uppercase">Invoices</span>
                    </div>
                </div>

                <div className="w-1/2 pl-4 space-y-2">
                    {hasData ? data.map((item, index) => (
                        <div key={item.status} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div
                                    className="w-2 h-2 rounded-sm shrink-0"
                                    style={{ backgroundColor: STATUS_COLORS[item.status] || FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}
                                />
                                <span className="text-brand-text-02 capitalize truncate">{item.status}</span>
                                <span className="text-brand-text-02">({item.count})</span>
                            </div>
                            <span className="font-semibold text-brand-text-01 shrink-0">
                                AED {item.value.toLocaleString()}
                            </span>
                        </div>
                    )) : (
                        <p className="text-xs text-brand-text-02">No invoice data</p>
                    )}
                    {hasData && (
                        <div className="pt-2 border-t border-brand-color-02 flex items-center justify-between text-xs font-semibold">
                            <span className="text-brand-text-01">Total</span>
                            <span className="text-brand-text-01">AED {totalValue.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
