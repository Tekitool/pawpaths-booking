'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import QuoteMetaForm from '@/components/quotes/QuoteMetaForm';
import ServiceTable, { QuoteItem } from '@/components/quotes/ServiceTable';
import QuoteSummary from '@/components/quotes/QuoteSummary';
import { useSearchParams } from 'next/navigation';
import { getAdminBookingDetails } from '@/lib/actions/admin-booking-actions';

// Mock initial data
const INITIAL_ITEMS: QuoteItem[] = [
    {
        id: 'init-1',
        title: 'Australia Blood Works & Treatment Package for Cats',
        description: 'Identity verification, Rabies titre test, Rnatt declarations, External & Internal treatments x2, Final Health certificate.',
        quantity: 1,
        rate: 1630,
        discount: 0,
        taxType: 'zero',
        isPackage: true,
        image: '/images/cat-package.jpg' // Placeholder
    },
    {
        id: 'init-2',
        title: 'Australia Blood Works & Treatment Package for Dogs',
        description: 'Identity verification, Lieshmania test, Brucella canis test, Rabies titre test, Rnatt declarations, External & Internal treatments x2 & Final Health certificate.',
        quantity: 1,
        rate: 2650,
        discount: 0,
        taxType: 'zero',
        isPackage: true,
        image: '/images/dog-package.jpg' // Placeholder
    }
];

export default function CreateQuotePage() {
    const [items, setItems] = useState<QuoteItem[]>(INITIAL_ITEMS);
    const [isSimplifiedView, setIsSimplifiedView] = useState(false);
    const searchParams = useSearchParams();
    const relocationId = searchParams.get('relocationId');
    const [isLoading, setIsLoading] = useState(!!relocationId);
    const [customerData, setCustomerData] = useState<any>(null);

    useEffect(() => {
        if (relocationId) {
            const fetchRelocationData = async () => {
                try {
                    // Since getAdminBookingDetails is a server action, we can call it here.
                    // However, server actions are usually imported from a file marked 'use server'.
                    // Let's assume getAdminBookingDetails is available or we need to fetch via API.
                    // If getAdminBookingDetails is strictly server-side, we might need an API route or pass data differently.
                    // For now, I'll assume we can use the server action if it's set up for client use, or I'll simulate/fetch.
                    // Actually, importing server actions directly into client components is supported in Next.js App Router.

                    const booking = await getAdminBookingDetails(relocationId);

                    if (booking) {
                        // Populate Items
                        if (booking.items && booking.items.length > 0) {
                            const mappedItems: QuoteItem[] = booking.items.map((item: any) => ({
                                id: item.id || Math.random().toString(36).substr(2, 9),
                                title: item.name,
                                description: item.description || '',
                                quantity: item.quantity || 1,
                                rate: item.unitPrice || item.unit_price || 0,
                                discount: 0,
                                taxType: 'standard', // Defaulting to standard
                                isPackage: false // Defaulting to false unless we have logic
                            }));
                            setItems(mappedItems);
                        } else {
                            // Keep initial items or clear them? User said "add all details", implying replace.
                            setItems([]);
                        }

                        // Generate Subject Line
                        const generateSubject = (data: any) => {
                            // 1. Format Pets
                            const pets = data.pets || [];

                            let petString = "";

                            if (pets.length === 1) {
                                const p = pets[0];
                                const name = p.pet?.name || p.name || 'Unknown';
                                const species = p.pet?.species?.name || p.type || 'Pet';
                                const breed = p.pet?.breed?.name || p.breed || '';
                                petString = `${name} (${species}${breed ? ` - ${breed}` : ''})`;
                            } else if (pets.length === 2) {
                                const p1 = pets[0];
                                const p2 = pets[1];
                                const name1 = p1.pet?.name || p1.name || 'Unknown';
                                const species1 = p1.pet?.species?.name || p1.type || 'Pet';
                                const name2 = p2.pet?.name || p2.name || 'Unknown';
                                const species2 = p2.pet?.species?.name || p2.type || 'Pet';
                                petString = `${name1} (${species1}) & ${name2} (${species2})`;
                            } else if (pets.length > 2) {
                                const p1 = pets[0];
                                const name1 = p1.pet?.name || p1.name || 'Unknown';
                                const species1 = p1.pet?.species?.name || p1.type || 'Pet';
                                petString = `${name1} (${species1}) + ${pets.length - 1} others`;
                            } else {
                                petString = "Pets";
                            }

                            // 2. Format Route
                            // Try travelDetails first (mapped structure), then direct objects (raw structure)
                            const origin = data.travelDetails?.originAirport || data.origin?.iata_code || data.origin?.city || '???';
                            const destination = data.travelDetails?.destinationAirport || data.destination?.iata_code || data.destination?.city || '???';
                            const route = `${origin} ➔ ${destination}`;

                            // 3. Combine
                            return `Relocation for ${petString}: ${route} (Ref: ${data.booking_number || data.bookingId})`;
                        };

                        // Set Customer Data for Meta Form (We'll need to pass this to QuoteMetaForm)
                        setCustomerData({
                            name: booking.customerInfo?.fullName,
                            reference: booking.bookingId,
                            subject: generateSubject(booking)
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch relocation details:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchRelocationData();
        }
    }, [relocationId]);

    // Calculations
    const { subtotal, vat, grandTotal } = useMemo(() => {
        let sub = 0;
        let v = 0;

        items.forEach(item => {
            const base = item.quantity * item.rate;
            const discountAmount = (base * item.discount) / 100;
            const itemTotal = base - discountAmount;

            sub += itemTotal;

            if (item.taxType === 'standard') {
                v += itemTotal * 0.05;
            }
        });

        return {
            subtotal: sub,
            vat: v,
            grandTotal: sub + v
        };
    }, [items]);

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin/quotes" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">New Quote {relocationId ? `(From ${customerData?.reference || 'Relocation'})` : ''}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Use Simplified View</span>
                    <button
                        onClick={() => setIsSimplifiedView(!isSimplifiedView)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${isSimplifiedView ? 'bg-brand-color-03' : 'bg-gray-200'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isSimplifiedView ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-color-03"></div>
                    </div>
                ) : (
                    <>
                        {/* Meta Form */}
                        <QuoteMetaForm initialData={customerData} />

                        {/* Service Table */}
                        <ServiceTable items={items} setItems={setItems} />

                        {/* Footer Section: Notes & Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none resize-none h-24"
                                        placeholder="Notes for the customer..."
                                        defaultValue="We look forward to assisting you and providing the best possible care and support throughout the relocation process."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none resize-none h-32 text-gray-600"
                                        placeholder="Terms and conditions..."
                                        defaultValue="Terms & Conditions: This estimate is valid for 30 days and requires a 50% deposit to confirm the booking. Costs are based on the pet's details and listed services; additional services or changes may incur extra charges. Cancellations are subject to fees as outlined in the estimate. Pawpaths coordinates travel and..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <p className="text-sm text-gray-500 italic">
                                        Additional Fields: Start adding custom fields for your quotes by going to <span className="text-blue-500 cursor-pointer hover:underline">Settings ➡ Quotes</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-6">
                                <QuoteSummary subtotal={subtotal} vat={vat} grandTotal={grandTotal} />

                                <div className="w-full max-w-md bg-white border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Attach File(s) to Quote</p>
                                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                        Upload File
                                    </button>
                                    <p className="text-xs text-gray-400 mt-2">You can upload a maximum of 3 files, 10MB each</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-[1600px] mx-auto flex items-center justify-start gap-4">
                    <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        Save as Draft
                    </button>
                    <button className="px-6 py-2.5 bg-brand-color-03 text-white font-medium rounded-lg hover:bg-brand-color-03/90 transition-colors shadow-sm flex items-center gap-2">
                        Save and Send
                    </button>
                    <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
