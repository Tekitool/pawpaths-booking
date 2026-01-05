'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { COUNTRIES } from '@/lib/constants/countries';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CheckCircle, MapPin, Calendar, Dog, Truck, FileText, AlertCircle, User, Mail, Phone, CreditCard, Plane, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitEnquiry } from '@/app/booking/actions';
import { toast } from '@/hooks/use-toast';
import ValidationFailureModal from './ValidationFailureModal';

const Step5Review = forwardRef((props, ref) => {
    const router = useRouter();
    const { formData, resetForm, updateContactInfo, setStep } = useBookingStore();
    const { travelDetails, pets, services, contactInfo } = formData;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showError, setShowError] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showValidationModal, setShowValidationModal] = useState(false);

    const { speciesList = [], breedsList = [] } = props;

    // Helper to get label from value
    const getCountryLabel = (code) => {
        if (code === 'GB') return 'United Kingdom';
        return COUNTRIES.find(c => c.value === code)?.label || code;
    };
    const getServiceDetails = (id) => (formData.servicesData || []).find(s => s.id === id);

    const getSpeciesName = (id) => {
        if (!id) return 'Unknown';
        const species = speciesList.find(s => s.id === id);
        return species ? species.name : 'Unknown';
    };

    const getBreedName = (id) => {
        if (!id) return 'Unknown';
        const breed = breedsList.find(b => b.id === id);
        return breed ? breed.name : 'Unknown';
    };

    // Handle Contact Info Change
    const handleContactChange = (e) => {
        const { name, value } = e.target;
        if (updateContactInfo) {
            updateContactInfo({ [name]: value });
        }
    };

    // Calculate Total
    const calculateTotal = () => {
        let total = 0;
        const petCount = Math.max(1, pets.length);
        (formData.servicesData || []).forEach(service => {
            if (service) total += Number(service.baseCost) * petCount;
        });
        return total;
    };


    // Helper to determine customer type code (Same as Step 3)
    const getCustomerTypeCode = () => {
        const originCountry = (travelDetails.originCountry || '').toLowerCase();
        const destinationCountry = (travelDetails.destinationCountry || '').toLowerCase();

        const isOriginUAE = originCountry === 'ae' || originCountry.includes('united arab emirates') || originCountry === 'uae';
        const isDestUAE = destinationCountry === 'ae' || destinationCountry.includes('united arab emirates') || destinationCountry === 'uae';

        if (isOriginUAE && isDestUAE) return 'LOCL';
        if (isOriginUAE && !isDestUAE) return 'EXP';
        if (!isOriginUAE && isDestUAE) return 'IMP';
        if (!isOriginUAE && !isDestUAE) return 'TRANSIT';
        return 'LOCL';
    };

    const getCustomerTypeDetails = (code) => {
        const types = {
            'EXP': { label: 'Export', color: 'bg-accent/15 text-orange-700 border-accent/50', title: 'International Export Services' },
            'IMP': { label: 'Import', color: 'bg-info/10 text-info border-info/30', title: 'International Import Services' },
            'LOCL': { label: 'Local Move', color: 'bg-brand-text-03/10 text-brand-text-03 border-brand-text-03/30', title: 'Domestic Relocation Services' },
            'TRANSIT': { label: 'Transit', color: 'bg-success/15 text-success border-success/30', title: 'Transit Services' }
        };
        return types[code] || types['LOCL'];
    };

    const typeCode = getCustomerTypeCode();
    const typeDetails = getCustomerTypeDetails(typeCode);
    const transportModeLabel = travelDetails.transportMode ? travelDetails.transportMode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Manifest Cargo';

    // Dynamic Tag Text Logic
    const getTagText = () => {
        if (typeCode === 'LOCL') {
            return `${typeDetails.title} - Pawpaths Pet Taxi`;
        }
        return `${typeDetails.title} - ${transportModeLabel}`;
    };

    const handleSubmit = async () => {
        // Basic client-side check
        if (!contactInfo?.fullName || !contactInfo?.email || !contactInfo?.phone || !contactInfo?.city) {
            setValidationErrors({
                "Contact Info": ["Please fill in all required contact details (Name, City/Place, Phone, and Email)."]
            });
            setShowValidationModal(true);
            return;
        }

        setIsSubmitting(true);
        setValidationErrors({}); // Clear previous errors
        console.log('Step5Review: Submitting enquiry...', formData);

        try {
            // Call Server Action directly
            const result = await submitEnquiry(formData);
            console.log('Step5Review: Submission result:', result);

            if (result.success) {
                // Save reference to store for Step 6
                if (useBookingStore.getState().setBookingReference) {
                    useBookingStore.getState().setBookingReference(result.bookingReference);
                }

                // Update pets in store with names so Step 6 can display them
                const updatedPets = pets.map(pet => ({
                    ...pet,
                    speciesName: getSpeciesName(pet.species_id),
                    breedName: getBreedName(pet.breed_id)
                }));

                useBookingStore.setState(state => ({
                    formData: {
                        ...state.formData,
                        pets: updatedPets
                    }
                }));

                toast({
                    variant: "success",
                    title: "Enquiry Submitted!",
                    description: `Booking Reference: ${result.bookingReference}`,
                });
                // Move to Success Step (Step 6)
                setStep(6);
            } else {
                // Validation or Server Error
                if (result.errors) {
                    console.log('Step5Review: Validation failed, showing modal with errors:', result.errors);
                    setValidationErrors(result.errors);
                    setShowValidationModal(true);
                } else {
                    console.error('Step5Review: Submission failed with message:', result.message);
                    toast({
                        variant: "error",
                        title: "Submission Failed",
                        description: result.message || 'Something went wrong. Please try again.',
                    });
                }
            }
        } catch (error) {
            console.error('Step5Review: Submission error (catch):', error);
            toast({
                variant: "error",
                title: "Network Error",
                description: "Failed to submit booking. Please check your connection.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Expose handleSubmit to parent via ref
    useImperativeHandle(ref, () => ({
        handleSubmit
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-brand-color-01 tracking-tight mb-2">Review & Confirm</h2>
                <p className="text-brand-text-02/80">Finalize your booking details below</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Details (Full Width) */}
                <div className="lg:col-span-12 space-y-8">

                    {/* Customer Details Section - Full Width */}
                    <section className="bg-brand-color-02/20 backdrop-blur-xl border-[0.5px] border-brand-color-02/50 shadow-glow-accent rounded-3xl p-6 hover:shadow-glow-accent hover:shadow-lg transition-all duration-300 group">
                        <h3 className="text-accent mb-6 flex items-center gap-4 border-b border-brand-text-02/20 pb-4">
                            <div className="p-3 bg-accent/10 border border-accent/30 rounded-2xl text-accent group-hover:scale-110 transition-transform duration-300">
                                <User size={22} />
                            </div>
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Row 1: Full Name + City */}
                            <Input
                                id="fullName"
                                name="fullName"
                                label="Full Name"
                                value={contactInfo?.fullName || ''}
                                onChange={handleContactChange}
                                placeholder="e.g. John Doe"
                                icon={<User size={18} className="text-brand-color-01" />}
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                            />
                            <Input
                                id="city"
                                name="city"
                                type="text"
                                label="City / Place"
                                value={contactInfo?.city || ''}
                                onChange={handleContactChange}
                                placeholder="Dubai, Abu Dhabi, etc."
                                icon={<MapPin size={18} className="text-brand-color-01" />}
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                            />
                            {/* Row 2: Phone + Email */}
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                label="Phone Number"
                                value={contactInfo?.phone || ''}
                                onChange={handleContactChange}
                                placeholder="e.g. +971 50 123 4567"
                                icon={<Phone size={18} className="text-brand-color-01" />}
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                            />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                label="Email Address"
                                value={contactInfo?.email || ''}
                                onChange={handleContactChange}
                                placeholder="e.g. john@example.com"
                                icon={<Mail size={18} className="text-brand-color-01" />}
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Travel & Pet Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Travel Details Section */}
                <section className="lg:col-span-7 bg-system-color-03/5 backdrop-blur-xl border-[0.5px] border-system-color-03/30 shadow-glow-info rounded-3xl p-6 hover:shadow-glow-info hover:shadow-lg transition-all duration-300 group h-full">
                    <h3 className="text-blue-600 mb-6 flex items-center gap-4 border-b border-brand-text-02/20 pb-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform duration-300">
                            <MapPin size={22} />
                        </div>
                        Travel Itinerary
                    </h3>
                    <div className="flex flex-col md:flex-row items-start justify-between gap-2 bg-white/40 p-4 rounded-2xl border border-blue-200 shadow-inner">
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Origin</p>
                            <p className="text-base font-bold text-brand-text-02">{getCountryLabel(travelDetails.originCountry)}</p>
                            <p className="text-sm text-brand-text-02/80 mt-1 font-medium">{travelDetails.originAirport || 'Airport not specified'}</p>
                        </div>

                        <div className="flex flex-col items-center justify-start px-2 w-full md:w-auto pt-2">
                            <div className="w-full md:w-24 h-[2px] bg-gradient-to-r from-transparent via-blue-200 to-transparent relative mb-2 mt-1">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-pearl p-2 rounded-full shadow-sm border border-blue-200">
                                    {((travelDetails.originCountry === 'AE' || travelDetails.originCountry === 'United Arab Emirates') &&
                                        (travelDetails.destinationCountry === 'AE' || travelDetails.destinationCountry === 'United Arab Emirates')) ? (
                                        <Truck size={24} className="text-blue-600" />
                                    ) : (
                                        (travelDetails.destinationCountry === 'AE' || travelDetails.destinationCountry === 'United Arab Emirates') ? (
                                            <PlaneLanding size={24} className="text-blue-600" />
                                        ) : (
                                            <PlaneTakeoff size={24} className="text-blue-600" />
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-600 bg-surface-pearl px-4 py-2 rounded-xl border border-blue-200 shadow-sm">
                                <Calendar size={16} />
                                {travelDetails.travelDate ? new Date(travelDetails.travelDate).toLocaleDateString('en-GB') : 'Date TBD'}
                            </div>
                            <div className={`mt-1 text-[10px] font-semibold px-3 py-1 rounded-xl border text-center ${typeDetails.color.replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-').replace('border-', 'border-')}`}>
                                <div className="leading-tight">{typeDetails.title}</div>
                                <div className="mt-0.5 opacity-90">- {typeCode === 'LOCL' ? 'Pawpaths Pet Taxi' : transportModeLabel}</div>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-right">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Destination</p>
                            <p className="text-base font-bold text-brand-text-02">{getCountryLabel(travelDetails.destinationCountry)}</p>
                            <p className="text-sm text-brand-text-02/80 mt-1 font-medium">{travelDetails.destinationAirport || 'Airport not specified'}</p>
                        </div>
                    </div>
                </section>

                {/* Pets Section */}
                <section className="lg:col-span-5 bg-brand-text-03/5 backdrop-blur-xl border-[0.5px] border-brand-text-03/20 shadow-glow-accent rounded-3xl p-6 hover:shadow-glow-accent hover:shadow-lg transition-all duration-300 group h-full">
                    <h3 className="text-brand-text-03 mb-6 flex items-center gap-4 border-b border-brand-text-02/20 pb-4">
                        <div className="p-3 bg-brand-text-03/10 border border-brand-text-03/30 rounded-2xl text-brand-text-03 group-hover:scale-110 transition-transform duration-300">
                            <Dog size={22} />
                        </div>
                        Pet Profiles
                    </h3>
                    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {pets.map((pet, index) => (
                            <div key={index} className="flex items-center p-4 rounded-2xl border border-brand-text-03/30 bg-white/40 hover:bg-white/60 hover:shadow-md transition-all duration-300 group/pet">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-brand-text-03 flex items-center justify-center font-bold text-lg mr-4 shadow-sm group-hover/pet:scale-110 transition-transform duration-300 shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <p className="font-bold text-brand-text-02 text-base truncate">{pet.name || 'Unnamed Pet'}</p>
                                        <span className="px-2 py-0.5 rounded-md bg-brand-text-02/10 text-[10px] font-bold text-brand-text-02/80 uppercase whitespace-nowrap">{getSpeciesName(pet.species_id)}</span>
                                    </div>
                                    <p className="text-xs font-medium text-brand-text-02 mb-2 truncate">
                                        {getBreedName(pet.breed_id)}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-brand-text-02/80 bg-brand-text-02/5/50 w-fit px-2 py-1 rounded-lg border border-brand-text-02/20">
                                        <span>{pet.gender}</span>
                                        <span className="text-brand-text-02/60">|</span>
                                        <span>{pet.age} {pet.ageUnit}</span>
                                        <span className="text-brand-text-02/60">|</span>
                                        <span>{pet.weight} kg</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Order Summary - Full Width */}
            <div className="bg-brand-color-02/20 backdrop-blur-xl border-[0.5px] border-brand-color-02/50 shadow-glow-accent rounded-3xl overflow-hidden">
                <div className="bg-brand-color-02/20 p-6 text-brand-color-01 relative overflow-hidden border-b border-brand-color-02/50">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CreditCard size={80} />
                    </div>
                    <h3 className="flex items-center gap-3 relative z-10">
                        <CreditCard size={24} /> Enquiry Summary
                    </h3>
                </div>

                <div className="p-6 space-y-6">
                    {/* Services List */}
                    <div>
                        <h4 className="text-brand-text-02/60 uppercase tracking-wider mb-4 text-xs">Selected Services</h4>
                        <div className="space-y-0.5">
                            {(() => {
                                const validServices = (services || []).filter(s => {
                                    const id = typeof s === 'string' ? s : s.serviceId;
                                    return getServiceDetails(id);
                                });

                                if (validServices.length === 0) {
                                    return (
                                        <p className="text-sm text-brand-text-02/60 italic bg-brand-text-02/5 p-3 rounded-xl text-center border border-dashed border-brand-text-02/20">(No Services Selected)</p>
                                    );
                                }

                                // Deduplicate services and filter out invalid entries
                                const uniqueServices = [];
                                const seen = new Set();
                                validServices.forEach(s => {
                                    const sId = typeof s === 'string' ? s : s.serviceId;
                                    const pId = typeof s === 'object' ? s.petId : null;
                                    const service = getServiceDetails(sId);

                                    // Filter out "ghost" entries: 
                                    // If a service is strictly per-pet but has no petId, it's invalid state -> skip it.
                                    if (service && service.scope === 'per_pet' && !pId) {
                                        return;
                                    }

                                    const key = `${sId}-${pId || 'global'}`;
                                    if (!seen.has(key)) {
                                        seen.add(key);
                                        uniqueServices.push(s);
                                    }
                                });

                                return uniqueServices.map((s, idx) => {
                                    const serviceId = typeof s === 'string' ? s : s.serviceId;
                                    const petId = typeof s === 'object' ? s.petId : null;
                                    const service = getServiceDetails(serviceId);

                                    // Find pet name if petId exists
                                    let pet = null;
                                    if (petId) {
                                        pet = pets.find(p => p.id === petId);
                                        // Fallback for legacy temp IDs
                                        if (!pet && typeof petId === 'string' && petId.startsWith('temp-pet-')) {
                                            const index = parseInt(petId.split('-')[2], 10);
                                            if (!isNaN(index) && pets[index]) {
                                                pet = pets[index];
                                            }
                                        }
                                    }

                                    return (
                                        <div key={`${serviceId}-${idx}`} className="flex items-center gap-2 p-2 rounded-lg bg-brand-color-02/5 border border-brand-color-02/10 text-brand-text-02 font-medium w-full hover:bg-brand-color-02 hover:border-brand-color-04 transition-colors">
                                            <div className="p-1.5 bg-brand-color-02/10 rounded-lg text-brand-color-01 shrink-0">
                                                <CheckCircle size={14} />
                                            </div>
                                            <div className="flex items-center flex-wrap gap-1">
                                                <span className="text-sm">{service.name}</span>
                                                {pet && (
                                                    <span className="text-sm text-brand-text-02/70 font-normal">
                                                        (For {pet.name})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Agreement */}
                    <div className="flex items-start gap-3 text-xs text-system-color-02 bg-success/15 p-4 rounded-xl border border-system-color-02">
                        <CheckCircle size={16} className="shrink-0 mt-0.5 text-success" />
                        <p className="leading-relaxed">
                            By confirming, you agree to our <a href="https://pawpathsae.com/terms-of-service/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-success">Terms of Service</a> and <a href="https://pawpathsae.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-success">privacy-policy</a>. A confirmation email will be sent to <span className="font-bold">{contactInfo?.email || 'your email'}</span>.
                        </p>
                    </div>
                </div>
            </div>

            <ValidationFailureModal
                isOpen={showValidationModal}
                onClose={() => setShowValidationModal(false)}
                errors={validationErrors}
            />
        </div >
    );
});

Step5Review.displayName = 'Step5Review';

export default Step5Review;
