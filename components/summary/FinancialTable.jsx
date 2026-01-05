import React from 'react';
import { Info } from 'lucide-react';

export default function FinancialTable() {
    const rows = [
        { label: 'Today', sales: 1499.00, receipts: 750.00, due: 749.00 },
        { label: 'This Week', sales: 28196.00, receipts: 12250.00, due: 13447.00 },
        { label: 'This Month', sales: 28196.00, receipts: 19350.00, due: 14646.00 },
        { label: 'This Quarter', sales: 30946.00, receipts: 25100.00, due: 14646.00 },
        { label: 'This Year', sales: 30946.00, receipts: 26100.00, due: 14646.00 },
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
                                <td className="py-4 text-right text-sm font-medium text-system-color-03 cursor-pointer hover:underline">
                                    AED{row.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-4 text-right text-sm font-medium text-system-color-03 cursor-pointer hover:underline">
                                    AED{row.receipts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-4 text-right text-sm font-medium text-system-color-03 cursor-pointer hover:underline">
                                    AED{row.due.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
