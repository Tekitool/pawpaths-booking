import React from 'react';
import { Info } from 'lucide-react';

export default function SummaryHeader() {
    return (
        <div className="space-y-6 mb-8">
            {/* Greeting */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-pearl border border-brand-color-02 flex items-center justify-center overflow-hidden">
                    {/* Since I don't have the image, I'll just use a fallback or leave it empty/styled */}
                    <div className="text-brand-text-02 font-bold">A</div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-brand-text-01">Hello, Ansar</h1>
                    <p className="text-brand-text-02">Pawpaths pets relocation services</p>
                </div>
            </div>

            {/* Navigation Tabs - Visual only as per image */}
            <div className="flex gap-6 border-b border-brand-color-02">
                <button className="pb-2 border-b-2 border-brand-color-03 text-brand-text-01 font-medium">Dashboard</button>
                <button className="pb-2 text-brand-text-02 font-medium hover:text-brand-text-01 transition-colors">Recent Updates</button>
            </div>

            {/* Banner */}
            <div className="bg-surface-warm border border-brand-color-02 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm border border-brand-color-02 shrink-0">
                        {/* PayPal Logo Placeholder */}
                        <span className="font-bold text-xl italic text-brand-text-01">PayPal</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-brand-text-01">Upgrade now for a seamless checkout experience</h3>
                        <p className="text-brand-text-02 text-sm max-w-2xl">
                            Upgrade to the latest version of PayPal for a seamless checkout experience, and offer Pay Later and Venmo options to your customers.
                        </p>
                    </div>
                </div>
                <button className="px-6 py-2 bg-status-warning text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
                    Upgrade
                </button>
            </div>
        </div>
    );
}
