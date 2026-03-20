'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    PenTool, Send, AlertCircle, CheckCircle2, FileCheck,
    Search, Calendar, Plus, ArrowRight, MoreHorizontal,
    Filter, Download, Trash2, Briefcase, FileText,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { deleteFinanceDocument, convertQuoteToInvoice, updateDocumentStatus } from '@/lib/actions/finance-actions';
import { generateQuotePDF } from '@/lib/utils/pdf-generator';
import { toast } from 'sonner';

// ── Sub-components ─────────────────────────────────────────────────────────

const StatusCard = ({ icon: Icon, label, count, value, color, isActive, onClick }) => {
    const colorStyles = {
        gray: 'text-gray-500 bg-gray-50 border-gray-200',
        blue: 'text-blue-500 bg-blue-50 border-blue-200',
        orange: 'text-orange-500 bg-orange-50 border-orange-200',
        green: 'text-green-500 bg-green-50 border-green-200',
        purple: 'text-purple-500 bg-purple-50 border-purple-200',
    };

    const activeRing = isActive ? 'ring-2 ring-brand-color-03 ring-offset-2' : '';

    return (
        <button
            onClick={onClick}
            className={`flex flex-col p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${colorStyles[color]} ${activeRing} bg-white`}
        >
            <div className="flex items-center justify-between w-full mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</span>
                <Icon size={18} />
            </div>
            <div className="flex items-end justify-between w-full">
                <span className="text-2xl font-bold text-gray-900">{count}</span>
                <span className="text-xs font-medium opacity-70">AED {((value || 0) / 1000).toFixed(1)}k</span>
            </div>
        </button>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        draft: 'bg-gray-100 text-gray-700 border-gray-200',
        sent: 'bg-blue-100 text-blue-700 border-blue-200',
        needs_action: 'bg-orange-100 text-orange-700 border-orange-200',
        accepted: 'bg-green-100 text-green-700 border-green-200',
        invoiced: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    const labels = {
        draft: 'Draft',
        sent: 'Sent to Client',
        needs_action: 'Needs Action',
        accepted: 'Accepted',
        invoiced: 'Invoiced',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
            {labels[status] || status}
        </span>
    );
};

// ── Props ──────────────────────────────────────────────────────────────────

interface FunnelStats {
    [status: string]: { count: number; value: number };
}

interface QuoteDoc {
    id: string;
    doc_number: string;
    status: string;
    grand_total: number;
    currency: string;
    issue_date: string;
    due_date: string | null;
    entity?: { id: string; display_name: string; contact_info?: any };
    booking?: {
        booking_number: string;
        pets?: { pet: { name: string; species?: { name: string }; breed?: { name: string } } }[];
        origin?: { city: string; iata_code: string };
        destination?: { city: string; iata_code: string };
    };
    items?: any[];
}

interface QuotesListClientProps {
    quotes: QuoteDoc[];
    funnelStats: FunnelStats;
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function QuotesListClient({
    quotes,
    funnelStats,
    currentPage,
    totalPages,
    totalItems,
}: QuotesListClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isPending, startTransition] = useTransition();

    const getStat = (status: string) => funnelStats[status] || { count: 0, value: 0 };

    // Client-side search within current page
    const filteredQuotes = quotes.filter((q) => {
        const matchesSearch = !searchQuery ||
            q.doc_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.entity?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleStatusFilter = (status: string) => {
        const newFilter = activeFilter === status ? 'all' : status;
        setActiveFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        if (newFilter === 'all') {
            params.delete('status');
        } else {
            params.set('status', newFilter);
        }
        params.delete('page');
        router.push(`/admin/quotes?${params.toString()}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quote?')) return;
        startTransition(async () => {
            const result = await deleteFinanceDocument(id);
            if (result.success) {
                toast.success('Quote deleted');
                router.refresh();
            } else {
                toast.error(result.message || 'Failed to delete');
            }
        });
    };

    const handleConvert = async (id: string) => {
        if (!confirm('Convert this quote to an invoice?')) return;
        startTransition(async () => {
            const result = await convertQuoteToInvoice(id);
            if (result.success) {
                toast.success(`Invoice ${result.data?.doc_number} created`);
                router.push(`/admin/invoices/${result.data?.id}`);
            } else {
                toast.error(result.message || 'Failed to convert');
            }
        });
    };

    const handleDownloadPDF = async (quote: QuoteDoc) => {
        await generateQuotePDF(quote, quote.items || [], quote.entity);
    };

    const handleSend = async (id: string) => {
        startTransition(async () => {
            const result = await updateDocumentStatus(id, 'sent');
            if (result.success) {
                toast.success('Quote marked as sent');
                router.refresh();
            } else {
                toast.error(result.message || 'Failed to update');
            }
        });
    };

    // Pet details helper
    const getPetSummary = (booking: QuoteDoc['booking']) => {
        if (!booking?.pets?.length) return 'N/A';
        const first = booking.pets[0]?.pet;
        if (!first) return 'N/A';
        const name = first.name || 'Unknown';
        const species = first.species?.name || '';
        return booking.pets.length > 1
            ? `${name} (${species}) +${booking.pets.length - 1}`
            : `${name} (${species})`;
    };

    const getRoute = (booking: QuoteDoc['booking']) => {
        if (!booking?.origin || !booking?.destination) return null;
        return {
            origin: booking.origin.iata_code || booking.origin.city || '?',
            destination: booking.destination.iata_code || booking.destination.city || '?',
        };
    };

    return (
        <div className="min-h-screen bg-surface-cool p-6 space-y-6">
            {/* 1. Sales Funnel Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatusCard icon={PenTool} label="Draft" count={getStat('draft').count} value={getStat('draft').value} color="gray" isActive={activeFilter === 'draft'} onClick={() => handleStatusFilter('draft')} />
                <StatusCard icon={Send} label="Sent" count={getStat('sent').count} value={getStat('sent').value} color="blue" isActive={activeFilter === 'sent'} onClick={() => handleStatusFilter('sent')} />
                <StatusCard icon={AlertCircle} label="Needs Action" count={getStat('needs_action').count} value={getStat('needs_action').value} color="orange" isActive={activeFilter === 'needs_action'} onClick={() => handleStatusFilter('needs_action')} />
                <StatusCard icon={CheckCircle2} label="Accepted" count={getStat('accepted').count} value={getStat('accepted').value} color="green" isActive={activeFilter === 'accepted'} onClick={() => handleStatusFilter('accepted')} />
                <StatusCard icon={FileCheck} label="Invoiced" count={getStat('invoiced').count} value={getStat('invoiced').value} color="purple" isActive={activeFilter === 'invoiced'} onClick={() => handleStatusFilter('invoiced')} />
            </div>

            {/* 2. Smart Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Ref or Client Name..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Link
                    href="/admin/quotes/create"
                    className="flex items-center gap-2 px-6 py-2 bg-brand-color-03 text-white rounded-lg font-medium hover:bg-brand-color-03/90 transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus size={18} />
                    Create New Quote
                </Link>
            </div>

            {/* 3. Rich Data Grid */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quote Ref</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client & Pet</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Route</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Value</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Created / Expiry</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredQuotes.length > 0 ? (
                                filteredQuotes.map((quote) => {
                                    const route = getRoute(quote.booking);
                                    return (
                                        <tr key={quote.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="py-4 px-6 align-top">
                                                <Link href={`/admin/quotes/${quote.id}`} className="font-mono text-sm font-medium text-blue-600 hover:underline">
                                                    {quote.doc_number}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-6 align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-sm">{quote.entity?.display_name || 'N/A'}</span>
                                                    <span className="text-xs text-slate-500">{getPetSummary(quote.booking)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 align-top hidden md:table-cell">
                                                {route ? (
                                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 w-fit px-3 py-1 rounded-full">
                                                        <span>{route.origin}</span>
                                                        <ArrowRight size={14} className="text-gray-400" />
                                                        <span>{route.destination}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 align-top text-right">
                                                <span className="font-bold text-gray-900 text-sm">
                                                    {quote.currency} {Number(quote.grand_total || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 align-top hidden md:table-cell">
                                                <div className="flex flex-col text-sm">
                                                    <span className="text-gray-600">{quote.issue_date}</span>
                                                    {quote.due_date && (
                                                        <span className="text-xs text-slate-400">Expires: {quote.due_date}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 align-top">
                                                <StatusBadge status={quote.status} />
                                            </td>
                                            <td className="py-4 px-6 align-top text-right">
                                                <div className="relative inline-block text-left group/menu">
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 hidden group-hover/menu:block animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                        <div className="py-1">
                                                            {quote.status === 'draft' && (
                                                                <Link href={`/admin/quotes/${quote.id}/edit`} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                                                                    <PenTool size={14} /> Edit Quote
                                                                </Link>
                                                            )}
                                                            {quote.status === 'draft' && (
                                                                <button onClick={() => handleSend(quote.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                                                                    <Send size={14} /> Mark as Sent
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleDownloadPDF(quote)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                                                                <Download size={14} /> Download PDF
                                                            </button>
                                                            {(quote.status === 'accepted' || quote.status === 'sent') && (
                                                                <button onClick={() => handleConvert(quote.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 text-left">
                                                                    <Briefcase size={14} /> Convert to Invoice
                                                                </button>
                                                            )}
                                                            <div className="border-t border-gray-100 my-1" />
                                                            <button onClick={() => handleDelete(quote.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                <Filter size={24} />
                                            </div>
                                            <p className="text-sm font-medium">No quotes found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-gray-200">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={15}
                    />
                </div>
            </div>
        </div>
    );
}
