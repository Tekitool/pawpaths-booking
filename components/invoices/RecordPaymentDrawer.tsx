'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { recordPayment } from '@/lib/actions/finance-actions';
import { toast } from 'sonner';

interface RecordPaymentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    docId: string;
    balance: number;
    currency: string;
}

const PAYMENT_METHODS = [
    'Bank Transfer',
    'Cash',
    'Credit Card',
    'Cheque',
    'Online Payment',
];

export default function RecordPaymentDrawer({
    isOpen,
    onClose,
    docId,
    balance,
    currency,
}: RecordPaymentDrawerProps) {
    const router = useRouter();
    const [amount, setAmount] = useState(String(balance));
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState('Bank Transfer');
    const [reference, setReference] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            toast.error('Enter a valid payment amount');
            return;
        }

        setIsSaving(true);
        try {
            const result = await recordPayment(docId, {
                amount: numAmount,
                payment_date: paymentDate,
                payment_method: method,
                reference,
            });

            if (result.success) {
                toast.success('Payment recorded');
                onClose();
                router.refresh();
            } else {
                toast.error(result.message || 'Failed to record payment');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <CreditCard size={20} className="text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-800">Record Payment</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <span className="text-sm text-gray-500">Balance Due</span>
                        <p className="text-2xl font-bold text-gray-900">{currency} {balance.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Payment Amount *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Payment Date</label>
                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm bg-white"
                        >
                            {PAYMENT_METHODS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Reference / Transaction ID</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="e.g. TXN-12345"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                        Record Payment
                    </button>
                    <button onClick={onClose} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
