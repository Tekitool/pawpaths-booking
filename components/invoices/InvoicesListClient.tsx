'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FileText, Send, Clock, CheckCircle2, AlertTriangle,
    Search, Plus, MoreHorizontal, Download, CreditCard, Trash2,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { deleteFinanceDocument, updateDocumentStatus } from '@/lib/actions/finance-actions';
import { generateInvoicePDF } from '@/lib/utils/pdf-generator';
import { toast } from 'sonner';

// ── Sub-components ─────────────────────────────────────────────────────────

const KPICard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => {
    const colorMap: Record<string, string> = {
        red: 'text-red-500 bg-red-50 border-red-200',
        orange: 'text-orange-500 bg-orange-50 border-orange-200',
        green: 'text-green-500 bg-green-50 border-green-200',
        gray: 'text-gray-500 bg-gray-50 border-gray-200',
        blue: 'text-blue-500 bg-blue-50 border-blue-200',
    };
    return (
        <div className={`flex flex-col p-4 rounded-xl border bg-white ${colorMap[color]}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</span>
                <Icon size={18} />
            </div>
            <span className="text-xl font-bold text-gray-900">{value}</span>
        </div>
    );
};

const PaymentBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        unpaid: 'bg-red-100 text-red-700 border-red-200',
        partial: 'bg-orange-100 text-orange-700 border-orange-200',
        paid: 'bg-green-100 text-green-700 border-green-200',
        overpaid: 'bg-blue-100 text-blue-700 border-blue-200',
        refunded: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    const labels: Record<string, string> = {
        unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid', overpaid: 'Overpaid', refunded: 'Refunded',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.unpaid}`}>
            {labels[status] || status}
        </span>
    );
};

// ── Types ──────────────────────────────────────────────────────────────────

interface InvoiceDoc {
    id: string;
    doc_number: string;
    status: string;
    payment_status: string;
    grand_total: number;
    paid_amount: number;
    balance_amount: number;
    currency: string;
    issue_date: string;
    due_date: string | null;
    entity?: { id: string; display_name: string; contact_info?: any };
    items?: any[];
}

interface InvoicesListClientProps {
    invoices: InvoiceDoc[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function InvoicesListClient({
    invoices,
    currentPage,
    totalPages,
    totalItems,
}: InvoicesListClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    // KPIs from current data
    const totalOutstanding = invoices.reduce((s, i) => s + Number(i.balance_amount || 0), 0);
    const overdue = invoices.filter((i) => i.due_date && new Date(i.due_date) < new Date() && i.payment_status !== 'paid').length;
    const paidCount = invoices.filter((i) => i.payment_status === 'paid').length;
    const draftCount = invoices.filter((i) => i.status === 'draft').length;

    const filtered = invoices.filter((inv) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return inv.doc_number?.toLowerCase().includes(q) ||
            inv.entity?.display_name?.toLowerCase().includes(q);
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this invoice?')) return;
        startTransition(async () => {
            const result = await deleteFinanceDocument(id);
            if (result.success) { toast.success('Invoice deleted'); router.refresh(); }
            else toast.error(result.message || 'Failed to delete');
        });
    };

    const handleDownload = async (inv: InvoiceDoc) => {
        await generateInvoicePDF(inv, inv.items || [], inv.entity);
    };

    return (
        <div className="min-h-screen bg-surface-cool p-6 space-y-6">
            {/* KPI Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={AlertTriangle} label="Outstanding" value={`AED ${totalOutstanding.toLocaleString()}`} color="red" />
                <KPICard icon={Clock} label="Overdue" value={String(overdue)} color="orange" />
                <KPICard icon={CheckCircle2} label="Paid" value={String(paidCount)} color="green" />
                <KPICard icon={FileText} label="Draft" value={String(draftCount)} color="gray" />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Invoice# or Client..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Link
                    href="/admin/invoices/create"
                    className="flex items-center gap-2 px-6 py-2 bg-brand-color-03 text-white rounded-lg font-medium hover:bg-brand-color-03/90 transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus size={18} />
                    Create Invoice
                </Link>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice#</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right hidden md:table-cell">Paid</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right hidden md:table-cell">Balance</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date / Due</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length > 0 ? filtered.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="py-4 px-6">
                                        <Link href={`/admin/invoices/${inv.id}`} className="font-mono text-sm font-medium text-blue-600 hover:underline">
                                            {inv.doc_number}
                                        </Link>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                        {inv.entity?.display_name || 'N/A'}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-gray-900 text-right">
                                        {inv.currency} {Number(inv.grand_total || 0).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-right hidden md:table-cell text-green-600">
                                        {Number(inv.paid_amount || 0).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-right hidden md:table-cell text-red-600">
                                        {Number(inv.balance_amount || 0).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 hidden md:table-cell">
                                        <div className="flex flex-col text-sm">
                                            <span className="text-gray-600">{inv.issue_date}</span>
                                            {inv.due_date && <span className="text-xs text-slate-400">Due: {inv.due_date}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <PaymentBadge status={inv.payment_status} />
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="relative inline-block text-left group/menu">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 hidden group-hover/menu:block animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                <div className="py-1">
                                                    <Link href={`/admin/invoices/${inv.id}`} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        <FileText size={14} /> View
                                                    </Link>
                                                    {inv.payment_status !== 'paid' && (
                                                        <Link href={`/admin/invoices/${inv.id}?pay=true`} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                                                            <CreditCard size={14} /> Record Payment
                                                        </Link>
                                                    )}
                                                    <button onClick={() => handleDownload(inv)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                                                        <Download size={14} /> Download PDF
                                                    </button>
                                                    <div className="border-t border-gray-100 my-1" />
                                                    <button onClick={() => handleDelete(inv.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-500">
                                        <p className="text-sm font-medium">No invoices found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-gray-200">
                    <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={15} />
                </div>
            </div>
        </div>
    );
}
