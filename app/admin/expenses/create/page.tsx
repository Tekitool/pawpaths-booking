'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import ServiceTable, { QuoteItem } from '@/components/quotes/ServiceTable';
import QuoteSummary from '@/components/quotes/QuoteSummary';
import { createFinanceDocument, getVendorEntities } from '@/lib/actions/finance-actions';
import { toast } from 'sonner';

export default function CreateExpensePage() {
    const router = useRouter();
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);

    const [docType, setDocType] = useState<'vendor_bill' | 'expense_claim'>('vendor_bill');
    const [entityId, setEntityId] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        getVendorEntities().then((res) => {
            if (res.success) setVendors(res.data || []);
        });
    }, []);

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
        if (!entityId) { toast.error('Please select a vendor'); return; }
        if (!issueDate) { toast.error('Issue date is required'); return; }
        if (items.length === 0) { toast.error('Add at least one line item'); return; }

        setIsSaving(true);
        try {
            const result = await createFinanceDocument({
                doc_type: docType,
                entity_id: entityId,
                issue_date: issueDate,
                due_date: dueDate || null,
                currency: 'AED',
                notes: notes || null,
                status: 'draft',
                items: items.map((item) => ({
                    description: item.title,
                    quantity: item.quantity,
                    unit_price: item.rate,
                    tax_rate: item.taxType === 'standard' ? 5 : 0,
                })),
            });

            if (result.success) {
                toast.success('Expense saved');
                router.push('/admin/expenses');
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
                <Link href="/admin/expenses" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">New Expense</h1>
            </div>

            <div className="max-w-[1600px] mx-auto p-8">
                {/* Meta Form */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Expense Type</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDocType('vendor_bill')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${docType === 'vendor_bill' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Vendor Bill
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDocType('expense_claim')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${docType === 'expense_claim' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Expense Claim
                                </button>
                            </div>
                        </div>

                        {/* Vendor */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-red-500">Vendor / Claimant *</label>
                            <select
                                value={entityId}
                                onChange={(e) => setEntityId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm bg-white"
                            >
                                <option value="">Select vendor...</option>
                                {vendors.map((v) => (
                                    <option key={v.id} value={v.id}>{v.display_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-red-500">Date *</label>
                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Notes</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                <ServiceTable items={items} setItems={setItems} />

                <div className="flex justify-end mt-8">
                    <QuoteSummary subtotal={subtotal} vat={vat} grandTotal={grandTotal} />
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-[1600px] mx-auto flex items-center justify-start gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-brand-color-03 text-white font-medium rounded-lg hover:bg-brand-color-03/90 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Expense
                    </button>
                    <Link href="/admin/expenses" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
}
