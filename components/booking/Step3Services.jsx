'use client';

import React, { useState, useEffect } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { SERVICES } from '@/lib/constants/services';
import { Truck, Plane, FileText, Box, Car, Stethoscope, Check } from 'lucide-react';

export default function Step3Services() {
    const { formData, updateServices } = useBookingStore();
    const { pets } = formData;

    // Use local state for immediate UI feedback, synced with store
    const [selectedServices, setSelectedServices] = useState([]);

    // Sync with store on mount
    useEffect(() => {
        if (formData.services) {
            setSelectedServices(formData.services);
        }
    }, [formData.services]);

    const handleServiceToggle = (serviceId) => {
        const newSelectedServices = selectedServices.includes(serviceId)
            ? selectedServices.filter(id => id !== serviceId)
            : [...selectedServices, serviceId];

        setSelectedServices(newSelectedServices);

        // Also update the store
        if (updateServices) {
            updateServices(newSelectedServices);
        }
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Truck': return <Truck size={24} />;
            case 'Plane': return <Plane size={24} />;
            case 'FileText': return <FileText size={24} />;
            case 'Box': return <Box size={24} />;
            case 'Car': return <Car size={24} />;
            case 'Stethoscope': return <Stethoscope size={24} />;
            default: return <Box size={24} />;
        }
    };

    // Calculate estimated total
    const calculateTotal = () => {
        let total = 0;
        const petCount = Math.max(1, pets?.length || 0);

        selectedServices.forEach(serviceId => {
            const service = SERVICES.find(s => s.id === serviceId);
            if (service) {
                total += service.basePrice * petCount;
            }
        });

        return total;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary">Select Services</h2>
                <p className="text-gray-600">Customize your pet's journey</p>
            </div>

            {/* Grid Layout: 2 Columns on MD+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SERVICES.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    return (
                        <div
                            key={service.id}
                            onClick={() => handleServiceToggle(service.id)}
                            className={`
                                relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ease-in-out group select-none
                                hover:shadow-level-3 hover:-translate-y-1
                                ${isSelected
                                    ? 'border-[#4d341a] bg-[#fff2b1] shadow-level-1 ring-1 ring-[#4d341a]'
                                    : 'border-outline-variant bg-surface hover:border-[#4d341a]/50'
                                }
                            `}
                        >
                            {/* Checkbox with Tick Mark */}
                            <div className={`
                                absolute top-4 right-4 w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 pointer-events-none
                                ${isSelected
                                    ? 'bg-[#4d341a] border-[#4d341a]'
                                    : 'border-gray-400 bg-white group-hover:border-[#4d341a]'
                                }
                            `}>
                                {isSelected && (
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                )}
                            </div>

                            <div className="flex flex-col h-full">
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-200
                                    ${isSelected ? 'bg-[#4d341a] text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-[#4d341a]/10 group-hover:text-[#4d341a]'}
                                `}>
                                    {React.cloneElement(getIcon(service.icon), {
                                        className: isSelected ? 'text-white' : 'currentColor'
                                    })}
                                </div>

                                <h3 className={`font-semibold text-lg mb-2 pr-8 ${isSelected ? 'text-black' : 'text-gray-900'}`}>{service.title}</h3>
                                <p className={`text-sm flex-grow mb-4 ${isSelected ? 'text-black/80' : 'text-gray-600'}`}>{service.description}</p>

                                <div className={`font-bold text-lg ${isSelected ? 'text-black' : 'text-[#4d341a]'}`}>
                                    AED {service.basePrice.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Live Pricing Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Estimated Total</h3>
                        <p className="text-sm text-gray-500">
                            Based on {Math.max(1, pets?.length || 0)} Pet{(pets?.length || 0) !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                        AED {calculateTotal().toLocaleString()}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">*Final price may vary based on exact weight and route.</p>
            </div>
        </div>
    );
}
