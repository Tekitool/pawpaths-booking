'use client';

import React from 'react';
import useBookingStore from '@/lib/store/booking-store';
import Button from '@/components/ui/Button';
import { CheckCircle, FileDown, MessageCircle, Plus, LogOut, MapPin, Calendar, Dog, User, Mail, Phone, CreditCard, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SERVICES } from '@/lib/constants/services';
import { COUNTRIES } from '@/lib/constants/countries';

export default function Step6Success() {
    const router = useRouter();
    const { formData, resetForm } = useBookingStore();
    const { travelDetails, pets, services, contactInfo } = formData;

    const handleBookAnother = () => {
        resetForm();
    };

    const handleDownloadPDF = () => {
        alert('Downloading Booking PDF... (Demo)');
    };

    const handleWhatsApp = () => {
        window.open('https://wa.me/971586947755?text=Hi,%20Pawpaths,%0a%0aI%20just%20made%20a%20booking%20and%20would%20like%20to%20confirm%20the%20details.', '_blank');
    };

    const handleLogout = () => {
        router.push('/');
    };

    // Helper to get label from value
    const getCountryLabel = (code) => COUNTRIES.find(c => c.value === code)?.label || code;
    const getServiceDetails = (id) => SERVICES.find(s => s.id === id);

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

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-12">

            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow shadow-sm">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-primary">Booking Successful!</h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Thank you for choosing Pawpaths. Your pet's journey has been tentatively scheduled.
                        We have sent a confirmation email to <span className="font-semibold text-primary">{contactInfo?.email}</span>.
                    </p>
                </div>
            </div>

            {/* Booking Summary Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-level-1 overflow-hidden">
                <div className="bg-primary/5 p-4 border-b border-primary/10 flex justify-between items-center">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                        <FileText size={20} /> Booking Summary
                    </h3>
                    <span className="text-sm text-gray-500 font-mono">ID: #{(Math.random() * 1000000).toFixed(0)}</span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 1. Customer Info */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User size={14} /> Customer Details
                        </h4>
                        <div className="text-sm space-y-1 text-gray-700">
                            <p className="font-semibold">{contactInfo?.fullName}</p>
                            <p className="flex items-center gap-2"><Mail size={12} className="text-gray-400" /> {contactInfo?.email}</p>
                            <p className="flex items-center gap-2"><Phone size={12} className="text-gray-400" /> {contactInfo?.phone}</p>
                        </div>
                    </div>

                    {/* 2. Travel Info */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <MapPin size={14} /> Travel Route
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">{getCountryLabel(travelDetails.originCountry)}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-semibold text-gray-900">{getCountryLabel(travelDetails.destinationCountry)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar size={14} />
                                <span>{travelDetails.travelDate || 'Date TBD'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Pets */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Dog size={14} /> Pets ({pets.length})
                        </h4>
                        <div className="space-y-2">
                            {pets.map((pet, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-gray-900">{pet.name}</span>
                                    <span className="text-gray-500 text-xs">({pet.breed})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Financials */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CreditCard size={14} /> Payment Details
                        </h4>
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Services Total</span>
                                <span>AED {calculateTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end pt-2 border-t border-primary/10">
                                <span className="font-bold text-primary">Total Paid</span>
                                <span className="font-bold text-xl text-primary">AED {(calculateTotal() * 1.05).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-surface border border-outline-variant rounded-xl p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 text-center">What would you like to do next?</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                        className="flex items-center justify-center gap-2 h-14 text-lg"
                    >
                        <FileDown size={20} />
                        Download PDF
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleWhatsApp}
                        className="flex items-center justify-center gap-2 h-14 text-lg border-green-500 text-green-600 hover:bg-green-50"
                    >
                        <MessageCircle size={20} />
                        WhatsApp Us
                    </Button>
                </div>

                <Button
                    onClick={handleBookAnother}
                    className="w-full h-14 text-lg flex items-center justify-center gap-2 shadow-level-2 hover:shadow-level-3"
                >
                    <Plus size={20} />
                    Book Another Pet
                </Button>
            </div>

            <div className="pt-4 text-center">
                <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-primary flex items-center gap-2 mx-auto transition-colors text-sm"
                >
                    <LogOut size={16} />
                    Return to Home
                </button>
            </div>
        </div>
    );
}
