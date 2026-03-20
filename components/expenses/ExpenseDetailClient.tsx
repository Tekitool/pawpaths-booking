'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Trash2, Calendar, User, FileText } from 'lucide-react';
import { deleteFinanceDocument } from '@/lib/actions/finance-actions';
import { toast } from 'sonner';

const DocTypeBadge = ({ docType }: { docType: string }) => {
    const isVendor = docType === 'vendor_bill';
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${isVendor ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
            {isVendor ? 'Vendor Bill' : 'Expense Claim'}
        </span>
    );
};

export default function ExpenseDetailClient({ doc }: { doc: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const items = doc.items || [];
    const entity = doc.entity;

    const handleDelete = () => {
        if (!confirm('Delete this expense?')) return;
        startTransition(async () => {
            const result = await deleteFinanceDocument(doc.id);
            if (result.success) { toast.success('Deleted'); router.push('/admin/expenses'); }
            else toast.error(result.message || 'Failed');
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white border-b border-gray-200 px-8 py-5">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/expenses" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-gray-900">{doc.doc_number}</h1>
                                <DocTypeBadge docType={doc.doc_type} />
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Created {new Date(doc.created_at).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDelete} disabled={isPending} className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User size={14} /> Vendor / Claimant
                        </h3>
                        <p className="text-lg font-bold text-gray-900">{entity?.display_name || 'N/A'}</p>
                        {entity?.contact_info?.email && <p className="text-sm text-gray-600 mt-1">{entity.contact_info.email}</p>}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar size={14} /> Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-500">Date</span><p className="font-medium">{doc.issue_date || '-'}</p></div>
                            <div><span className="text-gray-500">Due Date</span><p className="font-medium">{doc.due_date || '-'}</p></div>
                            <div><span className="text-gray-500">Currency</span><p className="font-medium">{doc.currency}</p></div>
                            <div><span className="text-gray-500">Status</span><p className="font-medium capitalize">{doc.status}</p></div>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={16} /> Line Items</h3>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase w-10">#</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Description</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Qty</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Unit Price</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Tax</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item: any, i: number) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="py-3 px-6 text-sm text-gray-500">{i + 1}</td>
                                    <td className="py-3 px-6 text-sm font-medium text-gray-900">{item.description}</td>
                                    <td className="py-3 px-6 text-sm text-right">{Number(item.quantity).toFixed(2)}</td>
                                    <td className="py-3 px-6 text-sm text-right">{doc.currency} {Number(item.unit_price).toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
                                    <td className="py-3 px-6 text-sm text-right">{Number(item.tax_rate)}%</td>
                                    <td className="py-3 px-6 text-sm font-medium text-right">{doc.currency} {Number(item.line_total).toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">{doc.currency} {Number(doc.subtotal).toLocaleString('en-AE', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-medium">{doc.currency} {Number(doc.tax_total).toLocaleString('en-AE', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
                            <span>Total</span>
                            <span className="text-brand-color-03">{doc.currency} {Number(doc.grand_total).toLocaleString('en-AE', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
