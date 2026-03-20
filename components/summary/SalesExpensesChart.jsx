'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, ChevronDown } from 'lucide-react';

export default function SalesExpensesChart({ data = [], totals = {} }) {
    const totalSales = totals.totalSales || data.reduce((s, d) => s + (d.sales || 0), 0);
    const totalReceipts = totals.totalReceipts || data.reduce((s, d) => s + (d.receipts || 0), 0);
    const totalExpenses = totals.totalExpenses || data.reduce((s, d) => s + (d.expenses || 0), 0);

    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-brand-text-01">Sales and Expenses</h2>
                    <Info size={16} className="text-brand-text-02 cursor-pointer" />
                </div>
                <div className="relative">
                    <button className="flex items-center gap-2 text-brand-text-02 text-sm font-medium hover:text-brand-text-01">
                        This Fiscal Year <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Chart Area */}
                <div className="flex-1 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            barGap={0}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--brand-color-02))" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'oklch(var(--brand-text-02))', fontSize: 10 }}
                                interval={0}
                                height={50}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'oklch(var(--brand-text-02))', fontSize: 10 }}
                                tickFormatter={(value) => `${value / 1000} K`}
                            />
                            <Tooltip
                                cursor={{ fill: 'oklch(var(--surface-warm))' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="sales" fill="oklch(var(--system-color-03))" radius={[2, 2, 0, 0]} barSize={8} />
                            <Bar dataKey="receipts" fill="oklch(var(--system-color-02))" radius={[2, 2, 0, 0]} barSize={8} />
                            <Bar dataKey="expenses" fill="oklch(var(--status-warning))" radius={[2, 2, 0, 0]} barSize={8} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-xs text-brand-text-02">
                        * Sales value displayed is inclusive of tax and inclusive of credits.
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="w-full lg:w-48 flex flex-col justify-center space-y-8 border-l border-brand-color-02 pl-8 lg:py-8">
                    <div>
                        <div className="text-sm text-system-color-03 mb-1">Total Sales</div>
                        <div className="text-xl font-bold text-brand-text-01">AED{totalSales.toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-sm text-system-color-02 mb-1">Total Receipts</div>
                        <div className="text-xl font-bold text-brand-text-01">AED{totalReceipts.toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-sm text-status-warning mb-1">Total Expenses</div>
                        <div className="text-xl font-bold text-brand-text-01">AED{totalExpenses.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
