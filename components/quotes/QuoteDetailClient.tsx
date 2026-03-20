'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, PenTool, Send, Download, Briefcase, Trash2,
    Calendar, User, FileText, ArrowRight,
} from 'lucide-react';
import { updateDocumentStatus, convertQuoteToInvoice, deleteFinanceDocument } from '@/lib/actions/finance-actions';
import { generateQuotePDF } from '@/lib/utils/pdf-generator';
import { toast } from 'sonner';

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700 border-gray-200',
        sent: 'bg-blue-100 text-blue-700 border-blue-200',
        needs_action: 'bg-orange-100 text-orange-700 border-orange-200',
        accepted: 'bg-green-100 text-green-700 border-green-200',
        invoiced: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    const labels: Record<string, string> = {
        draft: 'Draft', sent: 'Sent', needs_action: 'Needs Action', accepted: 'Accepted', invoiced: 'Invoiced',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.draft}`}>
            {labels[status] || status}
        </span>
    );
};

export default function QuoteDetailClient({ doc }: { doc: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const items = doc.items || [];
    const entity = doc.entity;
    const booking = doc.booking;

    const handleStatusChange = (newStatus: string) => {
        startTransition(async () => {
            const result = await updateDocumentStatus(doc.id, newStatus);
            if (result.success) {
                toast.success(`Status updated to ${newStatus}`);
                router.refresh();
            } else {
                toast.error(result.message || 'Failed to update');
            }
        });
    };

    const handleConvert = () => {
        if (!confirm('Convert this quote to an invoice?')) return;
        startTransition(async () => {
            const result = await convertQuoteToInvoice(doc.id);
            if (result.success) {
                toast.success(`Invoice ${result.data?.doc_number} created`);
                router.push(`/admin/invoices/${result.data?.id}`);
            } else {
                toast.error(result.message || 'Failed to convert');
            }
        });
    };

    const handleDelete = () => {
        if (!confirm('Delete this quote?')) return;
        startTransition(async () => {
            const result = await deleteFinanceDocument(doc.id);
            if (result.success) {
                toast.success('Quote deleted');
                router.push('/admin/quotes');
            } else {
                toast.error(result.message || 'Failed to delete');
            }
        });
    };

    const handleDownload = async () => {
        await generateQuotePDF(doc, items, entity);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-5">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/quotes" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-gray-900">{doc.doc_number}</h1>
                                <StatusBadge status={doc.status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Created {new Date(doc.created_at).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {doc.status === 'draft' && (
                            <Link
                                href={`/admin/quotes/${doc.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <PenTool size={14} /> Edit
                            </Link>
                        )}
                        {doc.status === 'draft' && (
                            <button onClick={() => handleStatusChange('sent')} disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                                <Send size={14} /> Mark as Sent
                            </button>
                        )}
                        {doc.status === 'sent' && (
                            <button onClick={() => handleStatusChange('accepted')} disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50">
                                Accept
                            </button>
                        )}
                        {(doc.status === 'accepted' || doc.status === 'sent') && (
                            <button onClick={handleConvert} disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-brand-color-03 text-white rounded-lg text-sm font-medium hover:bg-brand-color-03/90 disabled:opacity-50">
                                <Briefcase size={14} /> Convert to Invoice
                            </button>
                        )}
                        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Download size={14} /> PDF
                        </button>
                        <button onClick={handleDelete} disabled={isPending} className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto p-8 space-y-6">
                {/* Customer & Booking Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User size={14} /> Customer
                        </h3>
                        <p className="text-lg font-bold text-gray-900">{entity?.display_name || 'N/A'}</p>
                        {entity?.contact_info?.email && (
                            <p className="text-sm text-gray-600 mt-1">{entity.contact_info.email}</p>
                        )}
                        {entity?.contact_info?.phone && (
                            <p className="text-sm text-gray-600">{entity.contact_info.phone}</p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar size={14} /> Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Issue Date</span>
                                <p className="font-medium text-gray-900">{doc.issue_date || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Expiry Date</span>
                                <p className="font-medium text-gray-900">{doc.due_date || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Currency</span>
                                <p className="font-medium text-gray-900">{doc.currency}</p>
                            </div>
                            {booking && (
                                <div>
                                    <span className="text-gray-500">Booking</span>
                                    <p className="font-medium text-gray-900">
                                        <Link href={`/admin/relocations/${booking.booking_number}`} className="text-blue-600 hover:underline">
                                            {booking.booking_number}
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </div>
                        {booking?.origin && booking?.destination && (
                            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 w-fit px-3 py-1 rounded-full">
                                <span>{booking.origin.iata_code || booking.origin.city}</span>
                                <ArrowRight size={14} className="text-gray-400" />
                                <span>{booking.destination.iata_code || booking.destination.city}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={16} /> Line Items
                        </h3>
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

                {/* Totals */}
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
                            <span className="text-gray-800">Total</span>
                            <span className="text-brand-color-03">{doc.currency} {Number(doc.grand_total).toLocaleString('en-AE', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
