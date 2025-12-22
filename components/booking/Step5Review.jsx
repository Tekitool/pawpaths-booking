'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { SERVICES } from '@/lib/constants/services';
import { COUNTRIES } from '@/lib/constants/countries';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CheckCircle, MapPin, Calendar, Dog, Truck, FileText, AlertCircle, User, Mail, Phone, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Step5Review = forwardRef((props, ref) => {
    const router = useRouter();
    const { formData, resetForm, updateContactInfo, setStep } = useBookingStore();
    const { travelDetails, pets, services, contactInfo } = formData;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showError, setShowError] = useState(false);

    // Helper to get label from value
    const getCountryLabel = (code) => COUNTRIES.find(c => c.value === code)?.label || code;
    const getServiceDetails = (id) => SERVICES.find(s => s.id === id);

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
        (services || []).forEach(serviceId => {
            const service = getServiceDetails(serviceId);
            if (service) total += service.basePrice * petCount;
        });
        return total;
    };

    const handleSubmit = async () => {
        if (!contactInfo?.fullName || !contactInfo?.email || !contactInfo?.phone) {
            setShowError(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSubmit = new FormData();

            // Append basic info
            formDataToSubmit.append('travelDetails', JSON.stringify(travelDetails));
            formDataToSubmit.append('pets', JSON.stringify(pets));
            formDataToSubmit.append('services', JSON.stringify(services));
            formDataToSubmit.append('contactInfo', JSON.stringify(contactInfo));

            // Append files
            if (formData.documents) {
                if (formData.documents.passport) formDataToSubmit.append('passport', formData.documents.passport);
                if (formData.documents.vaccination) formDataToSubmit.append('vaccination', formData.documents.vaccination);
                if (formData.documents.rabies) formDataToSubmit.append('rabies', formData.documents.rabies);
                if (formData.documents.petPhoto) formDataToSubmit.append('petPhoto', formData.documents.petPhoto);
            }

            const response = await fetch('/api/booking', {
                method: 'POST',
                body: formDataToSubmit,
            });

            const result = await response.json();

            if (result.success) {
                // Move to Success Step (Step 6)
                setStep(6);
            } else {
                alert(result.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit booking. Please check your connection.');
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
                <h2 className="text-3xl font-bold text-primary tracking-tight mb-2">Review & Confirm</h2>
                <p className="text-gray-500">Finalize your booking details below</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Details (Full Width) */}
                <div className="lg:col-span-12 space-y-8">

                    {/* Customer Details Section - Full Width */}
                    <section className="bg-gradient-to-br from-[#fff0f5] to-[#ffe8f1] backdrop-blur-xl border-[0.5px] border-[#ffc4e0] shadow-[0_4px_20px_rgba(255,196,224,0.3)] rounded-3xl p-8 hover:shadow-[0_8px_30px_rgba(255,196,224,0.4)] transition-all duration-300 group">
                        <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-4 border-b border-gray-100 pb-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
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
                                icon={<User size={18} className="text-primary" />}
                                className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                            />
                            <Input
                                id="city"
                                name="city"
                                type="text"
                                label="City / Place"
                                value={contactInfo?.city || ''}
                                onChange={handleContactChange}
                                placeholder="Dubai, Abu Dhabi, etc."
                                icon={<MapPin size={18} className="text-primary" />}
                                className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
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
                                icon={<Phone size={18} className="text-primary" />}
                                className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                            />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                label="Email Address"
                                value={contactInfo?.email || ''}
                                onChange={handleContactChange}
                                placeholder="e.g. john@example.com"
                                icon={<Mail size={18} className="text-primary" />}
                                className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Travel & Pet Details + Order Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Travel & Pets (8 cols) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Travel Details Section */}
                    <section className="bg-gradient-to-br from-[#ebf8ff] to-[#dcf3ff] backdrop-blur-xl border-[0.5px] border-[#8ddfff] shadow-[0_4px_20px_rgba(141,223,255,0.3)] rounded-3xl p-8 hover:shadow-[0_8px_30px_rgba(141,223,255,0.4)] transition-all duration-300 group">
                        <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-4 border-b border-gray-100 pb-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                <MapPin size={22} />
                            </div>
                            Travel Itinerary
                        </h3>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/40 p-8 rounded-2xl border border-white/60 shadow-inner">
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Origin</p>
                                <p className="text-xl font-bold text-gray-800">{getCountryLabel(travelDetails.originCountry)}</p>
                                <p className="text-sm text-gray-500 mt-1 font-medium">{travelDetails.originAirport || 'Airport not specified'}</p>
                            </div>

                            <div className="flex flex-col items-center justify-center px-4 w-full md:w-auto">
                                <div className="w-full md:w-32 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent relative my-4 md:my-0">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-sm border border-primary/10">
                                        <Truck size={20} className="text-primary" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                                    <Calendar size={14} />
                                    {travelDetails.travelDate || 'Date TBD'}
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-right">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Destination</p>
                                <p className="text-xl font-bold text-gray-800">{getCountryLabel(travelDetails.destinationCountry)}</p>
                                <p className="text-sm text-gray-500 mt-1 font-medium">{travelDetails.destinationAirport || 'Airport not specified'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Pets Section */}
                    <section className="bg-gradient-to-br from-[#fffdee] to-[#fffbd9] backdrop-blur-xl border-[0.5px] border-[#fff7c0] shadow-[0_4px_20px_rgba(255,247,192,0.3)] rounded-3xl p-8 hover:shadow-[0_8px_30px_rgba(255,247,192,0.4)] transition-all duration-300 group">
                        <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-4 border-b border-gray-100 pb-4">
                            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform duration-300">
                                <Dog size={22} />
                            </div>
                            Pet Profiles
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {pets.map((pet, index) => (
                                <div key={index} className="flex items-center p-5 rounded-2xl border border-white/60 bg-white/40 hover:bg-white/60 hover:shadow-md transition-all duration-300 group/pet">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-bold text-xl mr-5 shadow-sm group-hover/pet:scale-110 transition-transform duration-300">
                                        {index + 1}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-gray-800 text-lg">{pet.name || 'Unnamed Pet'}</p>
                                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-xs font-bold text-gray-500 uppercase">{pet.type}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">
                                            {pet.breed}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50/50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                                            <span>{pet.gender}</span>
                                            <span className="text-gray-300">|</span>
                                            <span>{pet.age} {pet.ageUnit}</span>
                                            <span className="text-gray-300">|</span>
                                            <span>{pet.weight} kg</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Summary (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-[#f8f5ff] to-[#f1ebff] backdrop-blur-xl border-[0.5px] border-[#e7e0fc] shadow-[0_4px_20px_rgba(231,224,252,0.3)] rounded-3xl sticky top-6 overflow-hidden h-full">
                        <div className="bg-[#f1ebff] p-6 text-[#6b4db8] relative overflow-hidden border-b border-[#e7e0fc]">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CreditCard size={80} />
                            </div>
                            <h3 className="text-xl font-bold flex items-center gap-3 relative z-10">
                                <CreditCard size={24} /> Order Summary
                            </h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Services List */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Selected Services</h4>
                                <div className="space-y-4">
                                    {(services || []).map(serviceId => {
                                        const service = getServiceDetails(serviceId);
                                        if (!service) return null;
                                        return (
                                            <div key={serviceId} className="flex justify-between items-start text-sm group">
                                                <span className="text-gray-600 font-medium group-hover:text-primary transition-colors">{service.title}</span>
                                                <span className="font-bold text-primary whitespace-nowrap ml-2">AED {service.basePrice.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                    {(!services || services.length === 0) && (
                                        <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-xl text-center border border-dashed border-gray-200">No additional services selected</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 my-4"></div>

                            {/* Totals */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">AED {calculateTotal().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Taxes & Fees (5%)</span>
                                    <span className="font-medium">AED {(calculateTotal() * 0.05).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-primary/5 -mx-6 px-6 py-6 mt-4 border-t border-primary/10">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-600 mb-1">Total Amount</span>
                                    <span className="text-3xl font-bold text-primary tracking-tight">AED {(calculateTotal() * 1.05).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <AlertCircle size={16} className="shrink-0 mt-0.5 text-primary" />
                                <p className="leading-relaxed">By confirming, you agree to our Terms of Service. A confirmation email will be sent to <span className="font-bold text-gray-700">{contactInfo?.email || 'your email'}</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            {
                showError && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-red-100 relative animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowError(false)}
                                className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Missing Information</h3>
                                <p className="text-gray-500 mb-6">
                                    Please fill in all required contact details (Name, Phone, and Email) to proceed with your booking.
                                </p>
                                <Button
                                    onClick={() => setShowError(false)}
                                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all duration-300"
                                >
                                    Okay, I&apos;ll fix it
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
});

Step5Review.displayName = 'Step5Review';

export default Step5Review;
