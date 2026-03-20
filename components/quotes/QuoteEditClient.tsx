'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import QuoteMetaForm, { QuoteFormState } from '@/components/quotes/QuoteMetaForm';
import ServiceTable, { QuoteItem } from '@/components/quotes/ServiceTable';
import QuoteSummary from '@/components/quotes/QuoteSummary';
import { updateFinanceDocument } from '@/lib/actions/finance-actions';
import { toast } from 'sonner';

interface QuoteEditClientProps {
    doc: any;
    entities: any[];
}

export default function QuoteEditClient({ doc, entities }: QuoteEditClientProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Map DB items to QuoteItem format
    const [items, setItems] = useState<QuoteItem[]>(
        (doc.items || []).map((item: any) => ({
            id: item.id,
            title: item.description || '',
            description: '',
            quantity: Number(item.quantity) || 1,
            rate: Number(item.unit_price) || 0,
            discount: 0,
            taxType: Number(item.tax_rate) > 0 ? 'standard' as const : 'zero' as const,
            isPackage: false,
        }))
    );

    const [formState, setFormState] = useState<QuoteFormState>({
        entity_id: doc.entity_id || '',
        customer_name: doc.entity?.display_name || '',
        reference: '',
        issue_date: doc.issue_date || new Date().toISOString().split('T')[0],
        due_date: doc.due_date || '',
        subject: '',
    });

    const handleFieldChange = (field: keyof QuoteFormState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

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

    const handleSave = async () => {
        if (!formState.entity_id) {
            toast.error('Please select a customer');
            return;
        }
        if (items.length === 0) {
            toast.error('Please add at least one line item');
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateFinanceDocument(doc.id, {
                entity_id: formState.entity_id,
                issue_date: formState.issue_date,
                due_date: formState.due_date || null,
                items: items.map((item) => ({
                    description: item.title,
                    quantity: item.quantity,
                    unit_price: item.rate,
                    tax_rate: item.taxType === 'standard' ? 5 : 0,
                })),
            });

            if (result.success) {
                toast.success('Quote updated');
                router.push(`/admin/quotes/${doc.id}`);
            } else {
                toast.error(result.message || 'Failed to update');
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
                    <Link href={`/admin/quotes/${doc.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Edit {doc.doc_number}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-8">
                <QuoteMetaForm
                    formState={formState}
                    onFieldChange={handleFieldChange}
                    entities={entities}
                    docNumber={doc.doc_number}
                />

                <ServiceTable items={items} setItems={setItems} />

                <div className="flex justify-end mt-8">
                    <QuoteSummary subtotal={subtotal} vat={vat} grandTotal={grandTotal} />
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-[1600px] mx-auto flex items-center justify-start gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-brand-color-03 text-white font-medium rounded-lg hover:bg-brand-color-03/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                    <Link
                        href={`/admin/quotes/${doc.id}`}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
}
