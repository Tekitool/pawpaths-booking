'use client';

import React from 'react';
import { Plane, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function RouteTimeline({ booking }) {
    const origin = booking.origin;
    const destination = booking.destination;
    const departureDate = booking.scheduled_departure_date;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/20 p-6">
            <h3 className="text-gray-900 mb-6 flex items-center gap-2">
                <Plane size={20} className="text-system-color-03" />
                Journey & Timeline
            </h3>

            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-12 left-10 right-10 h-0.5 bg-brand-text-02/10 -z-10"></div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full border border-brand-text-02/20 text-brand-text-02/60">
                    <Plane size={20} className="transform rotate-90" />
                </div>

                <div className="flex justify-between items-start">
                    {/* Origin */}
                    <div className="flex flex-col items-center text-center w-1/3">
                        <div className="w-24 h-24 rounded-full bg-info/10 border-4 border-white shadow-sm flex flex-col items-center justify-center mb-4 z-10">
                            <span className="text-2xl font-black text-info">{origin?.iata_code || 'ORG'}</span>
                            <span className="text-[10px] font-bold text-system-color-03 uppercase">{origin?.country?.iso_code}</span>
                        </div>
                        <h4 className="text-gray-900">{origin?.city || 'Origin'}</h4>
                        <p className="text-xs text-brand-text-02/80">{origin?.name}</p>
                    </div>

                    {/* Destination */}
                    <div className="flex flex-col items-center text-center w-1/3">
                        <div className="w-24 h-24 rounded-full bg-brand-text-03/10 border-4 border-white shadow-sm flex flex-col items-center justify-center mb-4 z-10">
                            <span className="text-2xl font-black text-brand-text-03">{destination?.iata_code || 'DST'}</span>
                            <span className="text-[10px] font-bold text-purple-400 uppercase">{destination?.country?.iso_code}</span>
                        </div>
                        <h4 className="text-gray-900">{destination?.city || 'Destination'}</h4>
                        <p className="text-xs text-brand-text-02/80">{destination?.name}</p>
                    </div>
                </div>
            </div>

            {/* Date Picker / Display */}
            <div className="mt-8 bg-brand-text-02/5 rounded-xl p-4 flex items-center justify-between border border-brand-text-02/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-brand-text-02/80">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-brand-text-02/80 font-medium">Scheduled Departure</p>
                        <p className="font-bold text-gray-900">
                            {departureDate ? new Date(departureDate).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'Date Not Set'}
                        </p>
                    </div>
                </div>
                <button className="text-sm font-medium text-info hover:text-info hover:underline">
                    Change Date
                </button>
            </div>
        </div>
    );
}
