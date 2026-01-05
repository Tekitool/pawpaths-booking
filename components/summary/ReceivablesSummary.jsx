import React from 'react';
import { Plus } from 'lucide-react';

export default function ReceivablesSummary() {
    // Mock Data
    const totalReceivables = 14646.00;
    const current = 1948.00;
    const overdue1_15 = 12698.00;
    const overdue16_30 = 0.00;
    const overdue31_45 = 0.00;
    const overdue45plus = 0.00;

    // Calculate percentages for the progress bar
    const total = current + overdue1_15 + overdue16_30 + overdue31_45 + overdue45plus;
    const currentPercent = (current / total) * 100;
    const overduePercent = (overdue1_15 / total) * 100;
    // ... others are 0 in this example

    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-brand-text-01">Total Receivables</h2>
                <button className="flex items-center gap-1 text-brand-color-03 font-medium hover:underline">
                    <div className="w-4 h-4 rounded-full bg-brand-color-03 text-white flex items-center justify-center">
                        <Plus size={12} />
                    </div>
                    New
                </button>
            </div>

            <div className="mb-2 text-xs text-brand-text-02 font-medium">
                Total Receivables AED{totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-brand-color-02 rounded-full overflow-hidden flex mb-8">
                <div style={{ width: `${currentPercent}%` }} className="h-full bg-system-color-03"></div>
                <div style={{ width: `${overduePercent}%` }} className="h-full bg-status-warning"></div>
                {/* Add other segments if needed */}
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="pl-4 border-l-2 border-system-color-03">
                    <div className="text-xs text-system-color-03 font-semibold uppercase mb-1">Current</div>
                    <div className="text-xl font-bold text-brand-text-01">AED{current.toLocaleString()}</div>
                </div>

                <div className="pl-4 border-l-2 border-status-warning">
                    <div className="text-xs text-status-warning font-semibold uppercase mb-1">Overdue</div>
                    <div className="text-xl font-bold text-brand-text-01">AED{overdue1_15.toLocaleString()}</div>
                    <div className="text-xs text-brand-text-02 mt-1">1-15 Days</div>
                </div>

                <div className="pl-4 border-l-2 border-transparent"> {/* Placeholder for alignment if needed, or just standard */}
                    <div className="text-xl font-bold text-brand-text-01">AED{overdue16_30.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs text-brand-text-02 mt-1">16-30 Days</div>
                </div>

                <div className="pl-4 border-l-2 border-transparent">
                    <div className="text-xl font-bold text-brand-text-01">AED{overdue31_45.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs text-brand-text-02 mt-1">31-45 Days</div>
                </div>

                <div className="pl-4 border-l-2 border-transparent">
                    <div className="text-xl font-bold text-brand-text-01">AED{overdue45plus.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs text-brand-text-02 mt-1">Above 45 days</div>
                </div>
            </div>
        </div>
    );
}
