'use client';

import React from 'react';

interface QuoteSummaryProps {
    subtotal: number;
    vat: number;
    grandTotal: number;
}

export default function QuoteSummary({ subtotal, vat, grandTotal }: QuoteSummaryProps) {
    return (
        <div className="bg-gray-50/50 rounded-xl p-6 w-full max-w-md ml-auto">
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Sub Total</span>
                    <span className="font-medium text-gray-900">{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>(Tax Inclusive)</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <span className="font-medium text-gray-600">Round Off</span>
                    <span className="font-medium text-gray-900">0.00</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="font-bold text-gray-800 text-base">Total ( AED )</span>
                    <span className="font-bold text-brand-color-03 text-xl">{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                    Show Total Summary
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
