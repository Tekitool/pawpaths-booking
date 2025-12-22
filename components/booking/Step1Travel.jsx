'use client';

import React from 'react';
import useBookingStore from '@/lib/store/booking-store';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plane, MapPin, Calendar } from 'lucide-react';

import { COUNTRIES } from '@/lib/constants/countries';

export default function Step1Travel() {
    const { formData, updateTravelDetails } = useBookingStore();
    const { travelDetails } = formData;

    // Ensure values are never undefined to prevent uncontrolled input warning
    const getValue = (val) => val === undefined || val === null ? '' : val;
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        updateTravelDetails({
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-primary tracking-tight">Travel Details</h2>
                <p className="text-gray-500 mt-2">Tell us about your journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Origin Section - Glass Card */}
                <div className="bg-gradient-to-br from-[#ebf8ff] to-[#dcf3ff] backdrop-blur-xl border-[0.5px] border-[#8ddfff] shadow-[0_8px_30px_rgba(141,223,255,0.2)] rounded-3xl p-6 hover:shadow-[0_12px_40px_rgba(141,223,255,0.3)] transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-primary font-bold text-lg mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-[#dcf3ff] rounded-xl text-[#3b9dff] group-hover:scale-110 transition-transform duration-300">
                            <MapPin size={22} />
                        </div>
                        <h3>Origin</h3>
                    </div>
                    <div className="space-y-5">
                        <Select
                            id="originCountry"
                            name="originCountry"
                            label="Country"
                            value={travelDetails.originCountry || ''}
                            onChange={handleChange}
                            options={COUNTRIES}
                            className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                        />
                        <Input
                            id="originAirport"
                            name="originAirport"
                            label="Airport / City"
                            value={travelDetails.originAirport || ''}
                            onChange={handleChange}
                            placeholder="e.g. Dubai (DXB)"
                            className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Destination Section - Glass Card */}
                <div className="bg-gradient-to-br from-[#f3ffeb] to-[#eaffdc] backdrop-blur-xl border-[0.5px] border-[#c8ffa4] shadow-[0_8px_30px_rgba(200,255,164,0.2)] rounded-3xl p-6 hover:shadow-[0_12px_40px_rgba(200,255,164,0.3)] transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-primary font-bold text-lg mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-[#eaffdc] rounded-xl text-[#6bc44a] group-hover:scale-110 transition-transform duration-300">
                            <Plane size={22} className="rotate-90" />
                        </div>
                        <h3>Destination</h3>
                    </div>
                    <div className="space-y-5">
                        <Select
                            id="destinationCountry"
                            name="destinationCountry"
                            label="Country"
                            value={travelDetails.destinationCountry || ''}
                            onChange={handleChange}
                            options={COUNTRIES}
                            className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                        />
                        <Input
                            id="destinationAirport"
                            name="destinationAirport"
                            label="Airport / City"
                            value={travelDetails.destinationAirport || ''}
                            onChange={handleChange}
                            placeholder="e.g. London (LHR)"
                            className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Travel Date - Full Width Glass Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-[#f8f5ff] to-[#f1ebff] backdrop-blur-xl border-[0.5px] border-[#e7e0fc] shadow-[0_8px_30px_rgba(231,224,252,0.2)] rounded-3xl p-6 hover:shadow-[0_12px_40px_rgba(231,224,252,0.3)] transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-primary font-bold text-lg mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-[#f1ebff] rounded-xl text-[#9b7edb] group-hover:scale-110 transition-transform duration-300">
                            <Calendar size={22} />
                        </div>
                        <h3>Travel Date</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            id="travelDate"
                            name="travelDate"
                            type="date"
                            label="Preferred Date"
                            value={travelDetails.travelDate || ''}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                        />

                        <div className="flex items-center h-full pt-2">
                            <label className="flex items-center gap-4 cursor-pointer group/check select-none p-4 rounded-2xl bg-white/50 border border-transparent hover:border-pawpaths-brown/20 hover:bg-white/80 transition-all duration-300 w-full">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="travelingWithPet"
                                        checked={!!travelDetails.travelingWithPet}
                                        onChange={handleChange}
                                        className="peer sr-only"
                                    />
                                    <div className="w-6 h-6 rounded-lg border-2 border-gray-300 bg-white peer-checked:border-[#ea4d2c] peer-checked:bg-[#ea4d2c] transition-all duration-300 flex items-center justify-center"></div>
                                    <svg className="w-4 h-4 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity duration-300 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 font-medium group-hover/check:text-primary transition-colors">
                                    I am traveling with my pet
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
