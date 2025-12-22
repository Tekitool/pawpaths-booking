'use client';

import React from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { SERVICES } from '@/lib/constants/services';
import { Truck, Plane, FileText, Box, Car, Stethoscope, Check } from 'lucide-react';

export default function Step3Services() {
    const { formData, updateServices } = useBookingStore();
    const { pets } = formData;

    // Derive state directly from store
    const selectedServices = formData.services || [];

    const handleServiceToggle = (serviceId) => {
        const newSelectedServices = selectedServices.includes(serviceId)
            ? selectedServices.filter(id => id !== serviceId)
            : [...selectedServices, serviceId];

        // Update the store directly
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
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-primary tracking-tight">Select Services</h2>
                <p className="text-gray-500 mt-2">Customize your pet&apos;s journey</p>
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
                                relative p-8 rounded-3xl cursor-pointer transition-all duration-300 ease-in-out group select-none
                                bg-gradient-to-br from-[#fffbd9] to-[#fff19f]
                                ${isSelected
                                    ? 'border-[0.5px] border-[#FF881B] shadow-[0_8px_30px_rgba(255,136,27,0.3)] scale-[1.02] ring-2 ring-[#FF881B]/50'
                                    : 'border-[0.5px] border-[#fff064] shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_25px_rgba(255,207,27,0.2)] hover:-translate-y-1'
                                }
                            `}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm bg-[#fff097] text-[#4d341a] shadow-[0_4px_12px_rgba(255,240,100,0.3)] group-hover:scale-105">
                                    {React.cloneElement(getIcon(service.icon), {
                                        className: 'text-[#4d341a]',
                                        size: 28
                                    })}
                                </div>
                                <div className={`
                                    w-8 h-8 rounded-full border-[0.5px] border-[#ffcf1b] flex items-center justify-center transition-all duration-300
                                    ${isSelected ? 'bg-[#FF881B] scale-110' : 'bg-white/50'}
                                `}>
                                    {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-3 transition-colors duration-300 text-[#4d341a]">
                                {service.title}
                            </h3>
                            <p className="text-sm leading-relaxed mb-6 transition-colors duration-300 text-[#4d341a]/80">
                                {service.description}
                            </p>

                            <div className="inline-flex items-center gap-1 text-lg font-bold transition-colors duration-300 text-[#4d341a]">
                                <span>{service.basePrice.toLocaleString()}</span>
                                <span className="text-xs font-normal text-[#4d341a]/60">AED</span>
                            </div>
                        </div>
                    );
                })}
            </div >

            {/* Live Pricing Summary */}
            <div className="bg-gradient-to-br from-[#ff881b] to-[#ea4d2c] backdrop-blur-xl border-[0.5px] border-[#ea4d2c] rounded-3xl p-8 mt-10 shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Box size={120} className="text-white" />
                </div>
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1 drop-shadow-sm">Estimated Total</h3>
                        <p className="text-white/90 font-medium">
                            Based on {Math.max(1, pets?.length || 0)} Pet{(pets?.length || 0) !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="text-4xl font-bold text-white tracking-tight drop-shadow-md">
                        AED {calculateTotal().toLocaleString()}
                    </div>
                </div>
                <p className="text-xs text-white/80 mt-4 text-right relative z-10 font-medium">*Final price may vary based on exact weight and route.</p>
            </div>
        </div >
    );
}
