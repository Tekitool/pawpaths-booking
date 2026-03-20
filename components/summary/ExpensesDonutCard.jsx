'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';

const COLORS = [
    'oklch(var(--system-color-02))',
    '#e76e50',
    'oklch(var(--system-color-03))',
    'oklch(var(--status-warning))',
    '#8b5cf6',
    '#60a5fa',
];

export default function ExpensesDonutCard({ data = [] }) {
    const chartData = data.length > 0 ? data : [{ name: 'No data', value: 1 }];
    const hasData = data.length > 0;

    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-brand-text-01 border-b border-dashed border-brand-text-02 pb-0.5">Top Expenses</h2>
                <button className="flex items-center gap-2 text-brand-text-02 text-sm font-medium hover:text-brand-text-01">
                    This Fiscal Year <ChevronDown size={16} />
                </button>
            </div>

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
                                    <Cell key={`cell-${index}`} fill={hasData ? COLORS[index % COLORS.length] : '#e5e7eb'} />
                                ))}
                            </Pie>
                            {hasData && <Tooltip />}
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-brand-text-01 uppercase text-center w-16 leading-tight">Top Expenses</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-1/2 pl-4 space-y-3">
                    {hasData ? data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-brand-text-02 truncate" title={item.name}>{item.name}</span>
                            </div>
                            <span className="font-semibold text-brand-text-01 shrink-0">AED{item.value.toLocaleString()}</span>
                        </div>
                    )) : (
                        <p className="text-xs text-brand-text-02">No expense data yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
