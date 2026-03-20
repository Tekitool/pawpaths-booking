'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import QuoteMetaForm, { QuoteFormState } from '@/components/quotes/QuoteMetaForm';
import ServiceTable, { QuoteItem } from '@/components/quotes/ServiceTable';
import QuoteSummary from '@/components/quotes/QuoteSummary';
import { getAdminBookingDetails } from '@/lib/actions/admin-booking-actions';
import { createFinanceDocument, getClientEntities } from '@/lib/actions/finance-actions';
import { getServiceCatalog } from '@/lib/actions/service-actions';
import { toast } from 'sonner';

export default function CreateQuotePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const relocationId = searchParams.get('relocationId');

    const [items, setItems] = useState<QuoteItem[]>([]);
    const [isSimplifiedView, setIsSimplifiedView] = useState(false);
    const [isLoading, setIsLoading] = useState(!!relocationId);
    const [isSaving, setIsSaving] = useState(false);
    const [entities, setEntities] = useState<any[]>([]);
    const [catalogServices, setCatalogServices] = useState<any[]>([]);
    const [customerNotes, setCustomerNotes] = useState('We look forward to assisting you and providing the best possible care and support throughout the relocation process.');
    const [terms, setTerms] = useState('Terms & Conditions: This estimate is valid for 30 days and requires a 50% deposit to confirm the booking.');

    const [formState, setFormState] = useState<QuoteFormState>({
        entity_id: '',
        customer_name: '',
        reference: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        subject: '',
    });

    const handleFieldChange = (field: keyof QuoteFormState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    // Fetch entities and service catalog on mount
    useEffect(() => {
        async function loadData() {
            const [entitiesRes, servicesRes] = await Promise.all([
                getClientEntities(),
                getServiceCatalog(),
            ]);
            if (entitiesRes.success) setEntities(entitiesRes.data || []);
            if (servicesRes) {
                const mapped = (Array.isArray(servicesRes) ? servicesRes : []).map((s: any) => ({
                    id: s.id?.toString() || s.code,
                    name: s.name,
                    rate: Number(s.base_price || 0),
                    description: s.description || '',
                }));
                setCatalogServices(mapped);
            }
        }
        loadData();
    }, []);

    // Fetch booking data if relocationId provided
    useEffect(() => {
        if (!relocationId) return;

        async function fetchBooking() {
            try {
                const booking = await getAdminBookingDetails(relocationId);
                if (!booking) return;

                // Map booking services to quote items
                if (booking.items?.length) {
                    const mappedItems: QuoteItem[] = booking.items.map((item: any) => ({
                        id: item.id || Math.random().toString(36).substr(2, 9),
                        title: item.name,
                        description: item.description || '',
                        quantity: item.quantity || 1,
                        rate: item.unitPrice || item.unit_price || 0,
                        discount: 0,
                        taxType: 'standard' as const,
                        isPackage: false,
                    }));
                    setItems(mappedItems);
                }

                // Build subject line
                const pets = booking.pets || [];
                let petString = 'Pets';
                if (pets.length === 1) {
                    const p = pets[0];
                    const name = p.pet?.name || p.name || 'Unknown';
                    const species = p.pet?.species?.name || p.type || 'Pet';
                    petString = `${name} (${species})`;
                } else if (pets.length > 1) {
                    const p = pets[0];
                    petString = `${p.pet?.name || p.name || 'Unknown'} +${pets.length - 1} others`;
                }

                const origin = booking.travelDetails?.originAirport || booking.origin?.iata_code || '?';
                const destination = booking.travelDetails?.destinationAirport || booking.destination?.iata_code || '?';
                const subject = `Relocation for ${petString}: ${origin} → ${destination} (Ref: ${booking.booking_number || booking.bookingId})`;

                setFormState((prev) => ({
                    ...prev,
                    customer_name: booking.customerInfo?.fullName || '',
                    reference: booking.bookingId || '',
                    subject,
                }));

                // Try to match entity
                if (booking.customer?.id) {
                    setFormState((prev) => ({ ...prev, entity_id: booking.customer.id }));
                }
            } catch (error) {
                console.error('Failed to fetch relocation details:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBooking();
    }, [relocationId]);

    // Calculations
    const { subtotal, vat, grandTotal } = useMemo(() => {
        let sub = 0;
        let v = 0;
        items.forEach((item) => {
            const base = item.quantity * item.rate;
            const discountAmount = (base * item.discount) / 100;
            const itemTotal = base - discountAmount;
            sub += itemTotal;
            if (item.taxType === 'standard') v += itemTotal * 0.05;
        });
        return { subtotal: sub, vat: v, grandTotal: sub + v };
    }, [items]);

    const handleSave = async (status: 'draft' | 'sent') => {
        if (!formState.entity_id) {
            toast.error('Please select a customer');
            return;
        }
        if (!formState.issue_date) {
            toast.error('Issue date is required');
            return;
        }
        if (items.length === 0) {
            toast.error('Please add at least one line item');
            return;
        }

        setIsSaving(true);
        try {
            const result = await createFinanceDocument({
                doc_type: 'quotation',
                entity_id: formState.entity_id,
                booking_id: relocationId || null,
                issue_date: formState.issue_date,
                due_date: formState.due_date || null,
                currency: 'AED',
                notes: customerNotes || null,
                status,
                items: items.map((item) => ({
                    description: item.title,
                    quantity: item.quantity,
                    unit_price: item.rate,
                    tax_rate: item.taxType === 'standard' ? 5 : 0,
                })),
            });

            if (result.success) {
                toast.success(status === 'draft' ? 'Quote saved as draft' : 'Quote created and marked as sent');
                router.push('/admin/quotes');
            } else if (result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, errors]) => {
                    if (Array.isArray(errors)) errors.forEach((msg) => toast.error(`${field}: ${msg}`));
                });
            } else {
                toast.error(result.message || 'Failed to save quote');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/admin/quotes" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            New Quote {relocationId ? `(From ${formState.reference || 'Relocation'})` : ''}
                        </h1>
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-color-03" />
                    </div>
                ) : (
                    <>
                        {/* Meta Form */}
                        <QuoteMetaForm
                            formState={formState}
                            onFieldChange={handleFieldChange}
                            entities={entities}
                        />

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
                                        value={customerNotes}
                                        onChange={(e) => setCustomerNotes(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none resize-none h-32 text-gray-600"
                                        placeholder="Terms and conditions..."
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                    />
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
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save as Draft
                    </button>
                    <button
                        onClick={() => handleSave('sent')}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-brand-color-03 text-white font-medium rounded-lg hover:bg-brand-color-03/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                        Save and Send
                    </button>
                    <Link
                        href="/admin/quotes"
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
}
