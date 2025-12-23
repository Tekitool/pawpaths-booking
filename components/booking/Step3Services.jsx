'use client';

import React, { useState, useEffect } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { Truck, Plane, FileText, Box, Car, Stethoscope, Check, Info, Home, User, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Step3Services() {
    const { formData, updateServices } = useBookingStore();
    const { pets, travelDetails } = formData;
    const selectedServices = formData.services || [];

    const [availableServices, setAvailableServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedServiceDetails, setSelectedServiceDetails] = useState(null); // For modal

    // Helper to get icon component
    const getIcon = (iconName) => {
        const icons = { Truck, Plane, FileText, Box, Car, Stethoscope, Check, Home, User, CheckCircle };
        const IconComponent = icons[iconName] || Box;
        return <IconComponent size={24} />;
    };

    // Auto-detect Customer Type Code (Same logic as backend)
    const getCustomerTypeCode = () => {
        const originCountry = travelDetails.originCountry?.toLowerCase() || '';
        const destinationCountry = travelDetails.destinationCountry?.toLowerCase() || '';
        const isTravelingWithPet = travelDetails.travelingWithPet;

        const isOriginUAE = originCountry === 'ae' || originCountry.includes('united arab emirates') || originCountry === 'uae';
        const isDestUAE = destinationCountry === 'ae' || destinationCountry.includes('united arab emirates') || destinationCountry === 'uae';

        if (isOriginUAE && isDestUAE) return 'LOCL';
        if (isOriginUAE && !isDestUAE) return isTravelingWithPet ? 'EX-A' : 'EX-U';
        if (!isOriginUAE && isDestUAE) return isTravelingWithPet ? 'IM-A' : 'IM-U';
        return 'LOCL'; // Default fallback
    };

    const getCustomerTypeDetails = (code) => {
        const types = {
            'EX-A': { label: 'Export - Accompanied', color: 'bg-orange-100 text-orange-700 border-orange-200' },
            'EX-U': { label: 'Export - Unaccompanied', color: 'bg-orange-100 text-orange-700 border-orange-200' },
            'IM-A': { label: 'Import - Accompanied', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            'IM-U': { label: 'Import - Unaccompanied', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            'LOCL': { label: 'Local Move', color: 'bg-purple-100 text-purple-700 border-purple-200' }
        };
        return types[code] || types['LOCL'];
    };

    // Fetch Services
    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const typeCode = getCustomerTypeCode();
                const response = await fetch(`/api/services?customerTypeCode=${typeCode}`);
                const result = await response.json();

                if (result.success) {
                    setAvailableServices(result.data);

                    // Auto-select mandatory services
                    const mandatoryIds = result.data.filter(s => s.isMandatory).map(s => s._id);
                    const currentSelected = new Set([...selectedServices, ...mandatoryIds]);
                    updateServices(Array.from(currentSelected));
                } else {
                    setError('Failed to load services.');
                }
            } catch (err) {
                console.error(err);
                setError('Error loading services.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [travelDetails.originCountry, travelDetails.destinationCountry, travelDetails.travelingWithPet]);

    const handleServiceToggle = (service) => {
        if (service.isMandatory) return; // Cannot toggle mandatory

        const newSelectedServices = selectedServices.includes(service._id)
            ? selectedServices.filter(id => id !== service._id)
            : [...selectedServices, service._id];

        updateServices(newSelectedServices);
    };

    // Calculate estimated total
    const calculateTotal = () => {
        let total = 0;
        const petCount = Math.max(1, pets?.length || 0);

        selectedServices.forEach(serviceId => {
            const service = availableServices.find(s => s._id === serviceId);
            if (service) {
                total += service.baseCost * petCount;
            }
        });

        return total;
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading services...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-primary tracking-tight">Select Services</h2>
                <div className="flex justify-center mt-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getCustomerTypeDetails(getCustomerTypeCode()).color}`}>
                        {getCustomerTypeDetails(getCustomerTypeCode()).label}
                    </span>
                </div>
                <p className="text-gray-500 mt-2">Customize your pet&apos;s journey based on your route</p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableServices.map((service) => {
                    const isSelected = selectedServices.includes(service._id);
                    const isMandatory = service.isMandatory;

                    return (
                        <div
                            key={service._id}
                            onClick={() => handleServiceToggle(service)}
                            className={`
                                relative p-8 rounded-3xl cursor-pointer transition-all duration-300 ease-in-out group select-none
                                bg-gradient-to-br from-[#fffbd9] to-[#fff19f]
                                ${isSelected
                                    ? 'border-[0.5px] border-[#FF881B] shadow-[0_8px_30px_rgba(255,136,27,0.3)] scale-[1.02] ring-2 ring-[#FF881B]/50'
                                    : 'border-[0.5px] border-[#fff064] shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_25px_rgba(255,207,27,0.2)] hover:-translate-y-1'
                                }
                                ${isMandatory ? 'opacity-90' : ''}
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

                            <h3 className="text-xl font-bold mb-3 transition-colors duration-300 text-[#4d341a] flex items-center gap-2">
                                {service.name}
                                {isMandatory && <span className="text-[10px] uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">Mandatory</span>}
                            </h3>
                            <p className="text-sm leading-relaxed mb-6 transition-colors duration-300 text-[#4d341a]/80 line-clamp-2">
                                {service.shortDescription}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-1 text-lg font-bold transition-colors duration-300 text-[#4d341a]">
                                    <span>{service.baseCost.toLocaleString()}</span>
                                    <span className="text-xs font-normal text-[#4d341a]/60">AED</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedServiceDetails(service);
                                    }}
                                    className="text-xs font-bold text-[#4d341a]/70 hover:text-[#4d341a] underline decoration-dotted"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

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

            {/* Service Details Modal */}
            {selectedServiceDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedServiceDetails(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-gray-100 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedServiceDetails(null)}
                            className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="mb-6">
                            <div className="w-16 h-16 bg-[#fff097] rounded-2xl flex items-center justify-center mb-4 text-[#4d341a]">
                                {React.cloneElement(getIcon(selectedServiceDetails.icon), { size: 32 })}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedServiceDetails.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-primary">AED {selectedServiceDetails.baseCost.toLocaleString()}</span>
                                {selectedServiceDetails.isMandatory && <span className="text-xs uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Mandatory</span>}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                <p className="text-gray-600 leading-relaxed">{selectedServiceDetails.longDescription}</p>
                            </div>

                            {selectedServiceDetails.requirements && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <AlertCircle size={16} /> Requirements
                                    </h4>
                                    <p className="text-gray-600 text-sm">{selectedServiceDetails.requirements}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <Button
                                onClick={() => setSelectedServiceDetails(null)}
                                className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all duration-300"
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
