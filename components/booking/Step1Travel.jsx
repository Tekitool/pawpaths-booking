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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary">Travel Details</h2>
                <p className="text-gray-600">Tell us about your journey</p>
            </div>
            <div className="border border-[#4d341a] rounded-xl p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Origin Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <MapPin size={20} />
                            <h3>Origin</h3>
                        </div>
                        <Select
                            id="originCountry"
                            name="originCountry"
                            label="Country"
                            value={travelDetails.originCountry || ''}
                            onChange={handleChange}
                            options={COUNTRIES}
                        />
                        <Input
                            id="originAirport"
                            name="originAirport"
                            label="Airport / City"
                            value={travelDetails.originAirport || ''}
                            onChange={handleChange}
                            placeholder="e.g. Dubai (DXB)"
                        />
                    </div>

                    {/* Destination Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <Plane size={20} className="rotate-90" />
                            <h3>Destination</h3>
                        </div>
                        <Select
                            id="destinationCountry"
                            name="destinationCountry"
                            label="Country"
                            value={travelDetails.destinationCountry || ''}
                            onChange={handleChange}
                            options={COUNTRIES}
                        />
                        <Input
                            id="destinationAirport"
                            name="destinationAirport"
                            label="Airport / City"
                            value={travelDetails.destinationAirport || ''}
                            onChange={handleChange}
                            placeholder="e.g. London (LHR)"
                        />
                    </div>
                </div>

                {/* Travel Date */}
                <div className="pt-6 mt-6 border-t border-[#4d341a]/10">
                    <div className="flex items-center gap-2 text-primary font-medium mb-4">
                        <Calendar size={20} />
                        <h3>Travel Date</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            id="travelDate"
                            name="travelDate"
                            type="date"
                            label="Preferred Date"
                            value={travelDetails.travelDate || ''}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                        />

                        <div className="flex items-center h-full pt-6">
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <input
                                    type="checkbox"
                                    name="travelingWithPet"
                                    checked={!!travelDetails.travelingWithPet}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-[#4d341a] text-[#4d341a] focus:ring-[#4d341a]"
                                />
                                <span className="text-body-large text-on-surface group-hover:text-primary transition-colors">
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
