'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
    { name: 'Alpha Rnatt Test', value: 1837.50, color: 'oklch(var(--system-color-02))' }, // Green
    { name: 'Moccae Export permit', value: 1208.58, color: 'oklch(var(--status-error))' }, // Red/Orange
    { name: 'IATA Approved Travel C...', value: 1100.00, color: 'oklch(var(--system-color-03))' }, // Blue
    { name: 'Alpha Package for Docum...', value: 1000.00, color: 'oklch(var(--status-warning))' }, // Yellow/Orange
    { name: 'Alpha Leishmania Test', value: 1050.00, color: '#8884d8' }, // Purple (Custom or variable)
    { name: 'Others', value: 2120.72, color: '#82ca9d' }, // Light Blue/Green
];

// Using system colors where possible, falling back to hex for variety if needed
const COLORS = [
    'oklch(var(--system-color-02))',
    '#e76e50', // Custom reddish
    'oklch(var(--system-color-03))',
    'oklch(var(--status-warning))',
    '#8b5cf6', // Purple
    '#60a5fa'  // Light Blue
];

export default function ExpensesDonutCard() {
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
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-brand-text-01 uppercase text-center w-16 leading-tight">Top Expenses</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-1/2 pl-4 space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-brand-text-02 truncate" title={item.name}>{item.name}</span>
                            </div>
                            <span className="font-semibold text-brand-text-01 shrink-0">AED{item.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
