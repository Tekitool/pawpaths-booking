'use client';

import React from 'react';
import useBookingStore from '@/lib/store/booking-store';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plane, MapPin, Calendar, PlaneTakeoff } from 'lucide-react';

import { COUNTRIES } from '@/lib/constants/countries';

export default function Step1Travel({ countriesList = [] }) {
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

    // Sort Countries: UAE first, then others alphabetically
    const sortedCountries = React.useMemo(() => {
        if (!countriesList.length) return COUNTRIES;

        const uae = countriesList.find(c => c.iso_code === 'AE');
        const others = countriesList.filter(c => c.iso_code !== 'AE').sort((a, b) => a.name.localeCompare(b.name));

        return uae ? [uae, ...others] : others;
    }, [countriesList]);

    const countryOptions = sortedCountries.map(c => ({ value: c.iso_code, label: c.name }));

    // Determine Transport Mode Options
    // Determine Transport Mode Options
    const transportOptions = React.useMemo(() => {
        const origin = (travelDetails.originCountry || '').toLowerCase();
        const dest = (travelDetails.destinationCountry || '').toLowerCase();

        const isOriginUAE = origin === 'ae' || origin === 'uae';
        const isDestUAE = dest === 'ae' || dest === 'uae';
        const isLocal = isOriginUAE && isDestUAE;

        if (isLocal) {
            return [
                { value: 'ground_transport', label: 'Ground Transport (Road)' },
            ];
        }

        return [
            { value: 'in_cabin', label: 'In Cabin (Accompanied)' },
            { value: 'excess_baggage', label: 'Excess Baggage (Accompanied)' },
            { value: 'manifest_cargo', label: 'Manifest Cargo (Unaccompanied)' },
            { value: 'private_charter', label: 'Private Charter (VIP)' },
        ];
    }, [travelDetails.originCountry, travelDetails.destinationCountry]);

    // Auto-select valid transport mode
    React.useEffect(() => {
        const currentMode = travelDetails.transportMode;
        const isValid = transportOptions.some(opt => opt.value === currentMode);

        if (!isValid && transportOptions.length > 0) {
            updateTravelDetails({ transportMode: transportOptions[0].value });
        }
    }, [transportOptions, travelDetails.transportMode, updateTravelDetails]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <h2 className="text-brand-color-01 tracking-tight">Travel Details</h2>
                <p className="text-brand-text-02/80 mt-2">Tell us about your journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Origin Section - Glass Card */}
                <div className="bg-system-color-03/5 backdrop-blur-xl border-[0.5px] border-system-color-03/30 shadow-glow-info rounded-3xl p-6 hover:shadow-glow-info hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-system-color-03 font-bold text-lg mb-6 pb-4 border-b border-brand-text-02/20">
                        <div className="p-2 bg-system-color-03/10 rounded-xl text-system-color-03 group-hover:scale-110 transition-transform duration-300">
                            <PlaneTakeoff size={22} />
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
                            options={countryOptions}
                            className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                        />
                        <Input
                            id="originAirport"
                            name="originAirport"
                            label="Airport / City"
                            value={travelDetails.originAirport || ''}
                            onChange={handleChange}
                            placeholder="e.g. Dubai (DXB)"
                            className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Destination Section - Glass Card */}
                <div className="bg-system-color-02/5 backdrop-blur-xl border-[0.5px] border-system-color-02/30 shadow-glow-success rounded-3xl p-6 hover:shadow-glow-success hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-system-color-02 font-bold text-lg mb-6 pb-4 border-b border-brand-text-02/20">
                        <div className="p-2 bg-system-color-02/10 rounded-xl text-system-color-02 group-hover:scale-110 transition-transform duration-300">
                            <MapPin size={22} />
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
                            options={countryOptions}
                            className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                        />
                        <Input
                            id="destinationAirport"
                            name="destinationAirport"
                            label="Airport / City"
                            value={travelDetails.destinationAirport || ''}
                            onChange={handleChange}
                            placeholder="e.g. London (LHR)"
                            className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Travel Date - Full Width Glass Card */}
                <div className="md:col-span-2 bg-brand-text-03/5 backdrop-blur-xl border-[0.5px] border-brand-text-03/20 shadow-glow-accent rounded-3xl p-6 hover:shadow-glow-accent hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-brand-text-03 font-bold text-lg mb-6 pb-4 border-b border-brand-text-02/20">
                        <div className="p-2 bg-brand-text-03/10 rounded-xl text-brand-text-03 group-hover:scale-110 transition-transform duration-300">
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
                            className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                        />

                        <div className="flex items-center h-full pt-2">
                            <Select
                                id="transportMode"
                                name="transportMode"
                                label="How is the pet traveling?"
                                value={travelDetails.transportMode || (transportOptions[0]?.value)}
                                onChange={handleChange}
                                options={transportOptions}
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300 w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
