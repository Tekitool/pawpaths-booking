'use client';

import React from 'react';
import { Badge } from 'lucide-react'; // Using Lucide icons as badges for now, or just styled divs

export default function RelocationHeader({ booking }) {
    return (
        <div className="px-6 py-4 flex items-center justify-between">
            {/* Left: Booking Ref & Badges */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-gray-900">{booking.booking_number}</h1>
                    <p className="text-xs text-brand-text-02/80 font-mono">{booking.id}</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-success/15 text-success' :
                        booking.status === 'pending' ? 'bg-accent/15 text-orange-700' :
                            'bg-brand-text-02/10 text-brand-text-02'
                        }`}>
                        {booking.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-info/10 text-info border border-system-color-03">
                        {booking.service_type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-text-03/10 text-brand-text-03 border border-stats-purple">
                        {booking.transport_mode}
                    </span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white border border-brand-text-02/20 text-brand-text-02 rounded-lg text-sm font-medium hover:bg-brand-text-02/5 transition-colors shadow-sm">
                    Edit Logistics
                </button>
                <button className="px-4 py-2 bg-white border border-brand-text-02/20 text-brand-text-02 rounded-lg text-sm font-medium hover:bg-brand-text-02/5 transition-colors shadow-sm">
                    Create Invoice
                </button>
                <button className="px-4 py-2 bg-error/10 border border-system-color-01 text-error rounded-lg text-sm font-medium hover:bg-error/10 transition-colors shadow-sm">
                    Cancel File
                </button>
            </div>
        </div>
    );
}
