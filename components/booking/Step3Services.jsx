'use client';
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { Truck, Plane, FileText, Box, Car, Stethoscope, Check, Info, Home, User, CheckCircle, AlertCircle, Sparkles, Dog, Cat, PawPrint, Briefcase } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAvailableServices } from '@/hooks/useAvailableServices';
import { detectBookingContext } from '@/utils/bookingLogic';

export default function Step3Services() {
    const { formData, updateServices } = useBookingStore();
    const { pets, travelDetails } = formData;

    // Normalize selected services to always be an array of objects
    // Structure: { serviceId: string, petId?: string, quantity: 1 }
    const selectedServices = useMemo(() => {
        const raw = formData.services || [];
        if (raw.length === 0) return [];
        // Handle legacy string[] if any exists in state
        if (typeof raw[0] === 'string') {
            return raw.map(id => ({ serviceId: id, quantity: 1 }));
        }
        return raw;
    }, [formData.services]);

    const { services: availableServices, loading } = useAvailableServices(travelDetails, pets);
    const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);

    // Group services by scope
    const { tripEssentials, petSpecificServices } = useMemo(() => {
        if (!availableServices) return { tripEssentials: [], petSpecificServices: [] };

        const tripEssentials = availableServices.filter(s => s.scope === 'per_booking' || !s.scope);
        const petSpecificServices = availableServices.filter(s => s.scope === 'per_pet');
        return { tripEssentials, petSpecificServices };
    }, [availableServices]);

    // Flatten data for the unified grid
    const allCards = useMemo(() => {
        const tripCards = tripEssentials.map(s => ({ ...s, _ctx: { type: 'trip' } }));

        const petCards = pets.flatMap((pet, index) => {
            // Ensure we have a valid ID for the pet, fallback to index-based ID if missing (legacy state support)
            const safePetId = pet.id || `temp-pet-${index}`;

            // Filter services for this pet
            const validServices = petSpecificServices.filter(s => {
                if (s.valid_species && s.valid_species.length > 0 && pet.speciesName && !s.valid_species.includes(pet.speciesName)) return false;
                return true;
            });
            return validServices.map(s => ({ ...s, _ctx: { type: 'pet', petName: pet.name, petId: safePetId, speciesName: pet.speciesName } }));
        });

        return [...tripCards, ...petCards];
    }, [tripEssentials, petSpecificServices, pets]);

    // Auto-select mandatory services logic REMOVED to allow full user control.
    /*
    useEffect(() => {
        // ... logic removed ...
    }, [availableServices, pets, updateServices]); 
    */

    const getIcon = (iconName) => {
        const icons = { Truck, Plane, FileText, Box, Car, Stethoscope, Check, Home, User, CheckCircle, Dog, Cat, PawPrint, Briefcase };
        const IconComponent = icons[iconName] || Box;
        return <IconComponent size={24} />;
    };

    const customerTypeCode = detectBookingContext(travelDetails.originCountry, travelDetails.destinationCountry);

    const getCustomerTypeDetails = (code) => {
        const types = {
            'export': { label: 'Export', color: 'bg-accent/15 text-orange-700 border-accent/50', title: 'International Export Services' },
            'import': { label: 'Import', color: 'bg-info/10 text-info border-info/30', title: 'International Import Services' },
            'local': { label: 'Local Move', color: 'bg-brand-text-03/10 text-brand-text-03 border-brand-text-03/30', title: 'Domestic Relocation Services' },
            'transit': { label: 'Transit', color: 'bg-success/15 text-success border-success/30', title: 'Transit Services' }
        };
        return types[code] || types['local'];
    };

    const handleToggle = (service, petId = null) => {
        let newSelections = [...selectedServices];

        const existsIndex = newSelections.findIndex(s =>
            s.serviceId === service.id && s.petId === petId
        );

        if (existsIndex >= 0) {
            newSelections.splice(existsIndex, 1);
        } else {
            newSelections.push({
                serviceId: service.id,
                petId: petId,
                quantity: 1
            });
        }

        const allServiceIds = [...new Set(newSelections.map(s => s.serviceId))];
        const newSelectedData = availableServices.filter(s => allServiceIds.includes(s.id));
        updateServices(newSelections, newSelectedData);
    };

    if (loading) return <div className="text-center py-20 text-brand-text-02/80">Loading services...</div>;

    const typeDetails = getCustomerTypeDetails(customerTypeCode);
    const transportModeLabel = travelDetails.transportMode
        ? travelDetails.transportMode.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Manifest Cargo';

    // Updated Service Card Component
    const ServiceCard = ({ service }) => {
        const ctx = service._ctx;
        const petId = ctx.type === 'pet' ? ctx.petId : null;
        const isSelected = selectedServices.some(s => s.serviceId === service.id && s.petId === petId);
        const isMandatory = service.is_mandatory;
        const isRecommended = service.is_recommended;

        // Visual Variants
        const isTrip = ctx.type === 'trip';

        let headerColor = 'bg-brand-color-01';
        let cardBorderColor = 'border-brand-color-01';
        let HeaderIcon = PawPrint;
        let headerTitle = isTrip ? 'Trip Essential' : `For ${ctx.petName}`;

        if (isTrip) {
            headerColor = 'bg-brand-color-03';
            cardBorderColor = 'border-brand-color-03';
            HeaderIcon = Plane;
        } else {
            const species = (ctx.speciesName || '').toLowerCase();
            if (species.includes('dog')) {
                headerColor = 'bg-blue-600';
                cardBorderColor = 'border-blue-600';
                HeaderIcon = Dog;
            } else if (species.includes('cat')) {
                headerColor = 'bg-purple-600';
                cardBorderColor = 'border-purple-600';
                HeaderIcon = Cat;
            }
        }

        // Check Circle Logic
        // Common: Yellow border (border-brand-color-04)
        // Trip (Orange Header): Checked -> Brown fill (bg-brand-color-01)
        // Pet (Blue/Purple/Brown Header): Checked -> Orange fill (bg-brand-color-03)

        let checkCircleClasses = "w-5 h-5 rounded-full border-2 border-brand-color-04 flex items-center justify-center transition-all duration-300 ";
        if (isSelected) {
            if (isTrip) {
                checkCircleClasses += "bg-brand-color-01"; // Brown fill
            } else {
                checkCircleClasses += "bg-brand-color-03"; // Orange fill
            }
        } else {
            checkCircleClasses += "bg-white";
        }

        return (
            <div
                onClick={() => handleToggle(service, petId)}
                className={`
                    relative rounded-xl cursor-pointer transition-all duration-300 ease-in-out group select-none h-full flex flex-col overflow-hidden bg-white
                    ${isSelected
                        ? `border-[2px] ${cardBorderColor} shadow-lg scale-[1.02]`
                        : 'border border-brand-text-02/10 shadow-sm hover:shadow-md hover:-translate-y-1'
                    }
                    ${isMandatory ? 'opacity-90' : ''}
                `}
            >
                {/* Header Bar */}
                <div className={`h-9 flex items-center justify-between px-4 text-xs font-bold uppercase tracking-wide text-white ${headerColor}`}>
                    <div className="flex items-center gap-2">
                        <HeaderIcon size={14} />
                        <span>{headerTitle}</span>
                    </div>

                    {/* Check Circle in Header */}
                    <div className={checkCircleClasses}>
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                </div>

                {isRecommended && (
                    <div className="absolute top-11 right-2 bg-brand-color-03 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                        <Sparkles size={10} /> RECOMMENDED
                    </div>
                )}

                <div className="p-4 flex flex-col flex-grow">
                    {/* Title Row: Icon + Title */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="text-brand-color-01">
                            {React.cloneElement(getIcon(service.icon), { size: 22 })}
                        </div>
                        <h3 className="text-brand-color-01 text-sm font-bold leading-tight flex-1">
                            {service.name}
                            {isMandatory && <span className="ml-2 text-[10px] uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-full border-2 border-red-500 font-bold align-middle inline-block translate-y-[1px]">Mandatory</span>}
                        </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs leading-relaxed mb-3 text-brand-text-02/80 line-clamp-2 flex-grow">
                        {service.short_description}
                    </p>

                    {/* Separator */}
                    <div className="my-3 border-t border-brand-text-02/10"></div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-brand-text-02 font-medium">Our Price Starts from</span>
                            <span className="text-sm font-bold text-brand-color-01">
                                {service.base_price === 0 ? 'Free' : `AED ${service.base_price}`}
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServiceDetails(service);
                            }}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-brand-color-01/20 text-brand-color-01 bg-brand-color-02/30 hover:bg-brand-color-01 hover:text-white transition-all duration-300"
                        >
                            Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
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

            {/* Unified Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCards.map((service, index) => (
                    <ServiceCard
                        key={`${service.id}-${service._ctx.type === 'pet' ? service._ctx.petId : 'global'}-${index}`}
                        service={service}
                    />
                ))}
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
                                {selectedServiceDetails.is_mandatory && <span className="text-[10px] uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200 font-bold">Mandatory</span>}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-brand-text-02 leading-relaxed text-xs">{selectedServiceDetails.long_description}</p>
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
