'use client';

import React, { useState, useEffect } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { Truck, Plane, FileText, Box, Car, Stethoscope, Check, Info, Home, User, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAvailableServices } from '@/hooks/useAvailableServices';
import { detectBookingContext } from '@/utils/bookingLogic';

export default function Step3Services() {
    const { formData, updateServices } = useBookingStore();
    const { pets, travelDetails } = formData;
    const selectedServices = formData.services || [];

    // Use the new hook for fetching and filtering
    const { services: rawServices, loading } = useAvailableServices(travelDetails, pets);
    const [selectedServiceDetails, setSelectedServiceDetails] = useState(null); // For modal

    // Memoize the mapped services
    const availableServices = React.useMemo(() => {
        if (!rawServices) return [];
        return rawServices.map(s => ({
            ...s,
            baseCost: s.base_price, // Map base_price to baseCost
            isMandatory: s.is_mandatory, // Map snake_case to camelCase
            shortDescription: s.short_description,
            longDescription: s.long_description,
            requirements: s.requirements,
            // Ensure icon is valid or fallback
            icon: s.icon || 'Box'
        }));
    }, [rawServices]);

    // Auto-select mandatory services logic
    useEffect(() => {
        if (availableServices.length > 0) {
            const mandatoryIds = availableServices.filter(s => s.isMandatory).map(s => s.id);

            // Only update if there are mandatory services not yet selected
            const missingMandatory = mandatoryIds.some(id => !selectedServices.includes(id));

            if (missingMandatory) {
                const newSelectedIds = [...new Set([...selectedServices, ...mandatoryIds])];
                const newSelectedData = availableServices.filter(s => newSelectedIds.includes(s.id));
                updateServices(newSelectedIds, newSelectedData);
            }
        }
    }, [availableServices, selectedServices, updateServices]);

    // Helper to get icon component
    const getIcon = (iconName) => {
        const icons = { Truck, Plane, FileText, Box, Car, Stethoscope, Check, Home, User, CheckCircle };
        const IconComponent = icons[iconName] || Box;
        return <IconComponent size={24} />;
    };

    // Use shared logic for type code
    const customerTypeCode = detectBookingContext(travelDetails.originCountry, travelDetails.destinationCountry);

    // Helper for UI display details
    const getCustomerTypeDetails = (code) => {
        const types = {
            'export': { label: 'Export', color: 'bg-accent/15 text-orange-700 border-accent/50', title: 'International Export Services' },
            'import': { label: 'Import', color: 'bg-info/10 text-info border-info/30', title: 'International Import Services' },
            'local': { label: 'Local Move', color: 'bg-brand-text-03/10 text-brand-text-03 border-brand-text-03/30', title: 'Domestic Relocation Services' },
            'transit': { label: 'Transit', color: 'bg-success/15 text-success border-success/30', title: 'Transit Services' }
        };
        return types[code] || types['local'];
    };

    const handleServiceToggle = (service) => {
        const newSelectedServices = selectedServices.includes(service.id)
            ? selectedServices.filter(id => id !== service.id)
            : [...selectedServices, service.id];

        const newSelectedData = availableServices.filter(s => newSelectedServices.includes(s.id));
        updateServices(newSelectedServices, newSelectedData);
    };

    if (loading) return <div className="text-center py-20 text-brand-text-02/80">Loading services...</div>;

    const typeDetails = getCustomerTypeDetails(customerTypeCode);
    const transportModeLabel = travelDetails.transportMode
        ? travelDetails.transportMode.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Manifest Cargo';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <h2 className="text-brand-color-01 tracking-tight">Select Services</h2>
                <div className="flex justify-center mt-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${typeDetails.color}`}>
                        {customerTypeCode === 'local'
                            ? 'Domestic Relocation Services - Pawpaths Pet Taxi'
                            : `${typeDetails.title} - ${transportModeLabel}`
                        }
                    </span>
                </div>
                <p className="text-brand-text-02/80 mt-2">Customize your pet&apos;s journey based on your route</p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableServices.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    const isMandatory = service.isMandatory;

                    return (
                        <div
                            key={service.id}
                            onClick={() => handleServiceToggle(service)}
                            className={`
                                relative p-4 rounded-3xl cursor-pointer transition-all duration-300 ease-in-out group select-none
                                ${isSelected
                                    ? 'bg-brand-color-02 border-[0.5px] border-accent shadow-glow-accent scale-[1.02] ring-2 ring-accent/50'
                                    : 'bg-brand-color-02/10 border-[0.5px] border-brand-color-04 shadow-level-1 hover:shadow-glow-accent hover:-translate-y-1'
                                }
                                ${isMandatory ? 'opacity-90' : ''}
                            `}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border ${isSelected ? 'bg-brand-color-04 border-brand-color-03' : 'bg-brand-color-02 border-brand-color-04'} text-brand-color-01 shadow-glow-accent group-hover:scale-105`}>
                                    {React.cloneElement(getIcon(service.icon), {
                                        className: 'text-brand-color-01',
                                        size: 20
                                    })}
                                </div>
                                <div className={`
                                    w-8 h-8 rounded-full border-[0.5px] border-brand-color-04 flex items-center justify-center transition-all duration-300
                                    ${isSelected ? 'bg-accent scale-110' : 'bg-white/50'}
                                `}>
                                    {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                                </div>
                            </div>

                            <h3 className="mb-1 transition-colors duration-300 text-brand-color-01 flex items-center gap-2 text-sm font-bold">
                                {service.name}
                                {isMandatory && <span className="text-[10px] uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200 font-bold">Mandatory</span>}
                            </h3>
                            <p className="text-sm leading-relaxed mb-3 transition-colors duration-300 text-brand-color-01/80 line-clamp-2">
                                {service.shortDescription}
                            </p>

                            <div className="flex items-center justify-end">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedServiceDetails(service);
                                    }}
                                    className="px-4 py-1.5 rounded-full text-xs font-bold border border-accent text-accent bg-white/50 hover:bg-accent hover:text-white transition-all duration-300 shadow-sm"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Service Details Modal */}
            {selectedServiceDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedServiceDetails(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full border border-brand-text-02/20 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedServiceDetails(null)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-accent border-[0.5px] border-brand-color-04 text-white hover:bg-accent/90 transition-all shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="mb-4">
                            <div className="w-12 h-12 bg-brand-color-02 border border-brand-color-04 rounded-2xl flex items-center justify-center mb-3 text-brand-color-01">
                                {React.cloneElement(getIcon(selectedServiceDetails.icon), { size: 24 })}
                            </div>
                            <h3 className="text-gray-900 mb-2 text-sm font-bold flex items-center gap-2">
                                {selectedServiceDetails.name}
                                {selectedServiceDetails.isMandatory && <span className="text-[10px] uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200 font-bold">Mandatory</span>}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-brand-text-02 leading-relaxed text-xs">{selectedServiceDetails.longDescription}</p>
                            </div>

                            {selectedServiceDetails.requirements && (
                                <div className="bg-gradient-card-warm backdrop-blur-md p-5 rounded-2xl border-[0.5px] border-accent/50 shadow-glow-accent">
                                    <h4 className="text-accent uppercase tracking-wider mb-2 flex items-center gap-2 text-xs">
                                        <AlertCircle size={16} /> Requirements
                                    </h4>
                                    <p className="text-black text-sm font-medium leading-relaxed">{selectedServiceDetails.requirements}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <Button
                                onClick={() => setSelectedServiceDetails(null)}
                                className="w-full py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold shadow-lg shadow-accent/30 transition-all duration-300"
                            >
                                Close Details
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
