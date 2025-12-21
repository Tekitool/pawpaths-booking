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
            alert('Please fill in your contact details.');
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
                <h2 className="text-3xl font-bold text-primary mb-2">Review & Confirm</h2>
                <p className="text-gray-600">Finalize your booking details below</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Details (8 cols) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Customer Details Section */}
                    <section className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3 border-b border-outline-variant pb-4">
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                <User size={20} />
                            </div>
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                id="fullName"
                                name="fullName"
                                label="Full Name"
                                value={contactInfo?.fullName || ''}
                                onChange={handleContactChange}
                                placeholder="e.g. John Doe"
                                icon={<User size={18} className="text-primary" />}
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
                            />
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                label="Phone Number"
                                value={contactInfo?.phone || ''}
                                onChange={handleContactChange}
                                placeholder="e.g. +971 50 123 4567"
                                icon={<Phone size={18} className="text-primary" />}
                                className="md:col-span-2"
                            />
                        </div>
                    </section>

                    {/* Travel Details Section */}
                    <section className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3 border-b border-outline-variant pb-4">
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                <MapPin size={20} />
                            </div>
                            Travel Itinerary
                        </h3>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-surface-variant/20 p-6 rounded-lg border border-outline-variant/50">
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Origin</p>
                                <p className="text-lg font-semibold text-on-surface">{getCountryLabel(travelDetails.originCountry)}</p>
                                <p className="text-sm text-gray-500">{travelDetails.originAirport || 'Airport not specified'}</p>
                            </div>

                            <div className="flex flex-col items-center justify-center px-4">
                                <div className="w-full h-[2px] bg-primary/20 w-24 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface p-1 rounded-full border border-primary/20">
                                        <Truck size={16} className="text-primary" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded">
                                    <Calendar size={12} />
                                    {travelDetails.travelDate || 'Date TBD'}
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-right">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Destination</p>
                                <p className="text-lg font-semibold text-on-surface">{getCountryLabel(travelDetails.destinationCountry)}</p>
                                <p className="text-sm text-gray-500">{travelDetails.destinationAirport || 'Airport not specified'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Pets Section */}
                    <section className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3 border-b border-outline-variant pb-4">
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                <Dog size={20} />
                            </div>
                            Pet Profiles
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {pets.map((pet, index) => (
                                <div key={index} className="flex items-center p-4 rounded-lg border border-outline-variant bg-surface hover:border-primary/50 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mr-4 shadow-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-on-surface text-xl mb-1">{pet.name || 'Unnamed Pet'}</p>
                                        <p className="text-lg font-semibold text-gray-700 mb-1">
                                            {pet.type} ({pet.breed})
                                        </p>
                                        <div className="text-sm text-gray-600 font-medium flex items-center gap-2">
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
                    <div className="bg-surface rounded-xl border border-outline-variant shadow-lg sticky top-6 overflow-hidden">
                        <div className="bg-primary p-4 text-on-primary">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <CreditCard size={20} /> Order Summary
                            </h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Services List */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Selected Services</h4>
                                <div className="space-y-3">
                                    {(services || []).map(serviceId => {
                                        const service = getServiceDetails(serviceId);
                                        if (!service) return null;
                                        return (
                                            <div key={serviceId} className="flex justify-between items-start text-sm group">
                                                <span className="text-gray-700 group-hover:text-primary transition-colors">{service.title}</span>
                                                <span className="font-semibold text-primary whitespace-nowrap ml-2">AED {service.basePrice.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                    {(!services || services.length === 0) && (
                                        <p className="text-sm text-gray-400 italic bg-gray-50 p-2 rounded text-center">No additional services selected</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-dashed border-outline-variant my-4"></div>

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>AED {calculateTotal().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Taxes & Fees (5%)</span>
                                    <span>AED {(calculateTotal() * 0.05).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-primary/5 -mx-6 px-6 py-4 mt-4 border-t border-primary/10">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-700">Total Amount</span>
                                    <span className="text-2xl font-bold text-primary">AED {(calculateTotal() * 1.05).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-100">
                                <AlertCircle size={14} className="shrink-0 mt-0.5 text-primary" />
                                <p>By confirming, you agree to our Terms of Service. A confirmation email will be sent to {contactInfo?.email || 'your email'}.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

Step5Review.displayName = 'Step5Review';

export default Step5Review;
