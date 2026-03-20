import React from 'react';
import { Info } from 'lucide-react';

export default function FinancialTable({ data = [] }) {
    const rows = data.length > 0 ? data : [
        { label: 'Today', sales: 0, receipts: 0, due: 0 },
        { label: 'This Week', sales: 0, receipts: 0, due: 0 },
        { label: 'This Month', sales: 0, receipts: 0, due: 0 },
        { label: 'This Quarter', sales: 0, receipts: 0, due: 0 },
        { label: 'This Year', sales: 0, receipts: 0, due: 0 },
    ];

    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-lg font-semibold text-brand-text-01">Sales, Receipts, and Dues</h2>
                <Info size={16} className="text-brand-text-02 cursor-pointer" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-brand-color-02">
                            <th className="text-left py-3 text-xs font-semibold text-brand-text-02 uppercase tracking-wider"></th>
                            <th className="text-right py-3 text-xs font-semibold text-brand-text-02 uppercase tracking-wider w-1/4">Sales</th>
                            <th className="text-right py-3 text-xs font-semibold text-brand-text-02 uppercase tracking-wider w-1/4">Receipts</th>
                            <th className="text-right py-3 text-xs font-semibold text-brand-text-02 uppercase tracking-wider w-1/4">Due</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-color-02">
                        {rows.map((row, index) => (
                            <tr key={index} className="hover:bg-surface-warm transition-colors">
                                <td className="py-4 text-sm font-medium text-brand-text-01">{row.label}</td>
                                <td className="py-4 text-right text-sm font-medium text-system-color-03">
                                    AED{Number(row.sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-4 text-right text-sm font-medium text-system-color-03">
                                    AED{Number(row.receipts || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-4 text-right text-sm font-medium text-system-color-03">
                                    AED{Number(row.due || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
