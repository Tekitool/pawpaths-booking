'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import QuoteMetaForm, { QuoteFormState } from '@/components/quotes/QuoteMetaForm';
import ServiceTable, { QuoteItem } from '@/components/quotes/ServiceTable';
import QuoteSummary from '@/components/quotes/QuoteSummary';
import {
    createFinanceDocument,
    getClientEntities,
    getFinanceDocument,
} from '@/lib/actions/finance-actions';
import { toast } from 'sonner';

export default function CreateInvoicePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromQuote = searchParams.get('fromQuote');

    const [items, setItems] = useState<QuoteItem[]>([]);
    const [isLoading, setIsLoading] = useState(!!fromQuote);
    const [isSaving, setIsSaving] = useState(false);
    const [entities, setEntities] = useState<any[]>([]);

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

    // Load entities
    useEffect(() => {
        getClientEntities().then((res) => {
            if (res.success) setEntities(res.data || []);
        });
    }, []);

    // Pre-fill from quote
    useEffect(() => {
        if (!fromQuote) return;
        async function loadQuote() {
            try {
                const result = await getFinanceDocument(fromQuote);
                if (!result.success || !result.data) return;

                const q = result.data;
                setFormState((prev) => ({
                    ...prev,
                    entity_id: q.entity_id || '',
                    customer_name: q.entity?.display_name || '',
                    reference: q.doc_number || '',
                }));

                if (q.items?.length) {
                    setItems(
                        q.items.map((item: any) => ({
                            id: item.id || Math.random().toString(36).substr(2, 9),
                            title: item.description || '',
                            description: '',
                            quantity: Number(item.quantity) || 1,
                            rate: Number(item.unit_price) || 0,
                            discount: 0,
                            taxType: Number(item.tax_rate) > 0 ? 'standard' as const : 'zero' as const,
                            isPackage: false,
                        }))
                    );
                }
            } catch {
                // silent
            } finally {
                setIsLoading(false);
            }
        }
        loadQuote();
    }, [fromQuote]);

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
        if (!formState.entity_id) { toast.error('Please select a customer'); return; }
        if (!formState.issue_date) { toast.error('Issue date is required'); return; }
        if (items.length === 0) { toast.error('Add at least one line item'); return; }

        setIsSaving(true);
        try {
            const result = await createFinanceDocument({
                doc_type: 'invoice',
                entity_id: formState.entity_id,
                issue_date: formState.issue_date,
                due_date: formState.due_date || null,
                currency: 'AED',
                notes: null,
                status,
                items: items.map((item) => ({
                    description: item.title,
                    quantity: item.quantity,
                    unit_price: item.rate,
                    tax_rate: item.taxType === 'standard' ? 5 : 0,
                })),
            });

            if (result.success) {
                toast.success(status === 'draft' ? 'Invoice saved as draft' : 'Invoice created');
                router.push('/admin/invoices');
            } else if (result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, errors]) => {
                    if (Array.isArray(errors)) errors.forEach((msg) => toast.error(`${field}: ${msg}`));
                });
            } else {
                toast.error(result.message || 'Failed to save');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4 shadow-sm">
                <Link href="/admin/invoices" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">
                    New Invoice {fromQuote ? '(From Quote)' : ''}
                </h1>
            </div>

            <div className="max-w-[1600px] mx-auto p-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-color-03" />
                    </div>
                ) : (
                    <>
                        <QuoteMetaForm
                            formState={formState}
                            onFieldChange={handleFieldChange}
                            entities={entities}
                        />
                        <ServiceTable items={items} setItems={setItems} />
                        <div className="flex justify-end mt-8">
                            <QuoteSummary subtotal={subtotal} vat={vat} grandTotal={grandTotal} />
                        </div>
                    </>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-[1600px] mx-auto flex items-center justify-start gap-4">
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save as Draft
                    </button>
                    <button
                        onClick={() => handleSave('sent')}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-brand-color-03 text-white font-medium rounded-lg hover:bg-brand-color-03/90 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                        Save and Send
                    </button>
                    <Link href="/admin/invoices" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
}
