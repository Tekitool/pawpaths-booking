'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Receipt, FileText, Wallet, Search, Plus, MoreHorizontal, Trash2, Download,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { deleteFinanceDocument } from '@/lib/actions/finance-actions';
import { toast } from 'sonner';

const KPICard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => {
    const colorMap: Record<string, string> = {
        red: 'text-red-500 bg-red-50 border-red-200',
        blue: 'text-blue-500 bg-blue-50 border-blue-200',
        orange: 'text-orange-500 bg-orange-50 border-orange-200',
        green: 'text-green-500 bg-green-50 border-green-200',
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

const DocTypeBadge = ({ docType }: { docType: string }) => {
    const isVendor = docType === 'vendor_bill';
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${isVendor ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
            {isVendor ? 'Vendor Bill' : 'Expense Claim'}
        </span>
    );
};

interface ExpenseDoc {
    id: string;
    doc_number: string;
    doc_type: string;
    status: string;
    grand_total: number;
    currency: string;
    issue_date: string;
    entity?: { id: string; display_name: string };
    booking?: { booking_number: string };
}

interface ExpensesListClientProps {
    expenses: ExpenseDoc[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

export default function ExpensesListClient({
    expenses,
    currentPage,
    totalPages,
    totalItems,
}: ExpensesListClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    const totalAmount = expenses.reduce((s, e) => s + Number(e.grand_total || 0), 0);
    const vendorBills = expenses.filter((e) => e.doc_type === 'vendor_bill').length;
    const expenseClaims = expenses.filter((e) => e.doc_type === 'expense_claim').length;

    const filtered = expenses.filter((e) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return e.doc_number?.toLowerCase().includes(q) ||
            e.entity?.display_name?.toLowerCase().includes(q);
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this expense?')) return;
        startTransition(async () => {
            const result = await deleteFinanceDocument(id);
            if (result.success) { toast.success('Deleted'); router.refresh(); }
            else toast.error(result.message || 'Failed');
        });
    };

    return (
        <div className="min-h-screen bg-surface-cool p-6 space-y-6">
            {/* KPI Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KPICard icon={Wallet} label="Total Expenses" value={`AED ${totalAmount.toLocaleString()}`} color="red" />
                <KPICard icon={Receipt} label="Vendor Bills" value={String(vendorBills)} color="blue" />
                <KPICard icon={FileText} label="Expense Claims" value={String(expenseClaims)} color="orange" />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Ref# or Vendor..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Link
                    href="/admin/expenses/create"
                    className="flex items-center gap-2 px-6 py-2 bg-brand-color-03 text-white rounded-lg font-medium hover:bg-brand-color-03/90 transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus size={18} />
                    New Expense
                </Link>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref#</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor / Claimant</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Booking</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length > 0 ? filtered.map((exp) => (
                                <tr key={exp.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="py-4 px-6">
                                        <Link href={`/admin/expenses/${exp.id}`} className="font-mono text-sm font-medium text-blue-600 hover:underline">
                                            {exp.doc_number}
                                        </Link>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                        {exp.entity?.display_name || 'N/A'}
                                    </td>
                                    <td className="py-4 px-6"><DocTypeBadge docType={exp.doc_type} /></td>
                                    <td className="py-4 px-6 text-sm text-gray-600 hidden md:table-cell">
                                        {exp.booking?.booking_number || '-'}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-gray-900 text-right">
                                        {exp.currency} {Number(exp.grand_total || 0).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600 hidden md:table-cell">{exp.issue_date}</td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="relative inline-block text-left group/menu">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                <MoreHorizontal size={18} />
                                            </button>
                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10 hidden group-hover/menu:block animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                <div className="py-1">
                                                    <Link href={`/admin/expenses/${exp.id}`} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        <FileText size={14} /> View
                                                    </Link>
                                                    <div className="border-t border-gray-100 my-1" />
                                                    <button onClick={() => handleDelete(exp.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">
                                        <p className="text-sm font-medium">No expenses found.</p>
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
