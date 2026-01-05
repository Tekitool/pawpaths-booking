'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    PenTool,
    Send,
    AlertCircle,
    CheckCircle2,
    FileCheck,
    Search,
    Calendar,
    Plus,
    ArrowRight,
    MoreHorizontal,
    Filter,
    Download,
    Trash2,
    Briefcase
} from 'lucide-react';

// --- Mock Data ---
const MOCK_QUOTES = [
    {
        id: 'QT-2026-001',
        clientName: 'Sarah Jenkins',
        petDetails: 'Max (Golden Retriever)',
        origin: 'DXB',
        destination: 'LHR',
        value: 4500,
        currency: 'AED',
        createdDate: '2026-01-02',
        expiryDate: '2026-02-02',
        status: 'drafting'
    },
    {
        id: 'QT-2026-002',
        clientName: 'Michael Chen',
        petDetails: 'Luna (Siamese Cat)',
        origin: 'SIN',
        destination: 'DXB',
        value: 3200,
        currency: 'AED',
        createdDate: '2025-12-28',
        expiryDate: '2026-01-28',
        status: 'sent'
    },
    {
        id: 'QT-2026-003',
        clientName: 'Emma Wilson',
        petDetails: 'Bella (French Bulldog)',
        origin: 'DXB',
        destination: 'JFK',
        value: 8500,
        currency: 'AED',
        createdDate: '2025-12-20',
        expiryDate: '2026-01-05', // Close to expiry
        status: 'needs_action'
    },
    {
        id: 'QT-2026-004',
        clientName: 'James Rodriguez',
        petDetails: 'Rocky (German Shepherd)',
        origin: 'MAD',
        destination: 'DXB',
        value: 5600,
        currency: 'AED',
        createdDate: '2025-12-15',
        expiryDate: '2026-01-15',
        status: 'accepted'
    },
    {
        id: 'QT-2026-005',
        clientName: 'Sophie Turner',
        petDetails: 'Charlie (Labrador)',
        origin: 'DXB',
        destination: 'SYD',
        value: 12000,
        currency: 'AED',
        createdDate: '2025-12-10',
        expiryDate: '2026-01-10',
        status: 'invoiced'
    },
    {
        id: 'QT-2026-006',
        clientName: 'David Kim',
        petDetails: 'Milo (Poodle)',
        origin: 'ICN',
        destination: 'DXB',
        value: 4100,
        currency: 'AED',
        createdDate: '2026-01-03',
        expiryDate: '2026-02-03',
        status: 'drafting'
    }
];

// --- Components ---

const StatusCard = ({ icon: Icon, label, count, value, color, isActive, onClick }) => {
    const colorStyles = {
        gray: 'text-gray-500 bg-gray-50 border-gray-200',
        blue: 'text-blue-500 bg-blue-50 border-blue-200',
        orange: 'text-orange-500 bg-orange-50 border-orange-200',
        green: 'text-green-500 bg-green-50 border-green-200',
        purple: 'text-purple-500 bg-purple-50 border-purple-200',
    };

    const activeRing = isActive ? `ring-2 ring-brand-color-03 ring-offset-2` : '';

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
                <span className="text-xs font-medium opacity-70">AED {(value / 1000).toFixed(1)}k</span>
            </div>
        </button>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        drafting: 'bg-gray-100 text-gray-700 border-gray-200',
        sent: 'bg-blue-100 text-blue-700 border-blue-200',
        needs_action: 'bg-orange-100 text-orange-700 border-orange-200',
        accepted: 'bg-green-100 text-green-700 border-green-200',
        invoiced: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    const labels = {
        drafting: 'Drafting',
        sent: 'Sent to Client',
        needs_action: 'Needs Action',
        accepted: 'Accepted',
        invoiced: 'Invoiced',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

export default function QuotesPage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter Logic
    const filteredQuotes = MOCK_QUOTES.filter(quote => {
        const matchesStatus = activeFilter === 'all' || quote.status === activeFilter;
        const matchesSearch =
            quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quote.petDetails.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Stats Calculation
    const getStats = (status) => {
        const items = MOCK_QUOTES.filter(q => q.status === status);
        return {
            count: items.length,
            value: items.reduce((acc, curr) => acc + curr.value, 0)
        };
    };

    return (
        <div className="min-h-screen bg-surface-cool p-6 space-y-6">

            {/* 1. Sales Funnel Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatusCard
                    icon={PenTool}
                    label="Drafting"
                    count={getStats('drafting').count}
                    value={getStats('drafting').value}
                    color="gray"
                    isActive={activeFilter === 'drafting'}
                    onClick={() => setActiveFilter(activeFilter === 'drafting' ? 'all' : 'drafting')}
                />
                <StatusCard
                    icon={Send}
                    label="Sent"
                    count={getStats('sent').count}
                    value={getStats('sent').value}
                    color="blue"
                    isActive={activeFilter === 'sent'}
                    onClick={() => setActiveFilter(activeFilter === 'sent' ? 'all' : 'sent')}
                />
                <StatusCard
                    icon={AlertCircle}
                    label="Needs Action"
                    count={getStats('needs_action').count}
                    value={getStats('needs_action').value}
                    color="orange"
                    isActive={activeFilter === 'needs_action'}
                    onClick={() => setActiveFilter(activeFilter === 'needs_action' ? 'all' : 'needs_action')}
                />
                <StatusCard
                    icon={CheckCircle2}
                    label="Accepted"
                    count={getStats('accepted').count}
                    value={getStats('accepted').value}
                    color="green"
                    isActive={activeFilter === 'accepted'}
                    onClick={() => setActiveFilter(activeFilter === 'accepted' ? 'all' : 'accepted')}
                />
                <StatusCard
                    icon={FileCheck}
                    label="Invoiced"
                    count={getStats('invoiced').count}
                    value={getStats('invoiced').value}
                    color="purple"
                    isActive={activeFilter === 'invoiced'}
                    onClick={() => setActiveFilter(activeFilter === 'invoiced' ? 'all' : 'invoiced')}
                />
            </div>

            {/* 2. Smart Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Ref, Client, or Pet Name..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        <Calendar size={16} />
                        <span>Last 30 Days</span>
                    </button>
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
                                filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="py-4 px-6 align-top">
                                            <Link href={`/admin/quotes/${quote.id}`} className="font-mono text-sm font-medium text-blue-600 hover:underline">
                                                {quote.id}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 align-top">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm">{quote.clientName}</span>
                                                <span className="text-xs text-slate-500">{quote.petDetails}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 align-top hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 w-fit px-3 py-1 rounded-full">
                                                <span>{quote.origin}</span>
                                                <ArrowRight size={14} className="text-gray-400" />
                                                <span>{quote.destination}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 align-top text-right">
                                            <span className="font-bold text-gray-900 text-sm">
                                                {quote.currency} {quote.value.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 align-top hidden md:table-cell">
                                            <div className="flex flex-col text-sm">
                                                <span className="text-gray-600">{quote.createdDate}</span>
                                                {/* Logic to show red text if expiry is soon could go here */}
                                                <span className="text-xs text-slate-400">Expires: {quote.expiryDate}</span>
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
                                                {/* Dropdown Menu (Simplified for this example using group-hover) */}
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 hidden group-hover/menu:block animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                    <div className="py-1">
                                                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                                                            <PenTool size={14} /> Edit Quote
                                                        </button>
                                                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                                                            <Download size={14} /> Download PDF
                                                        </button>
                                                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 text-left">
                                                            <Briefcase size={14} /> Convert to Job
                                                        </button>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                <Filter size={24} />
                                            </div>
                                            <p className="text-sm font-medium">No quotes found matching your criteria.</p>
                                            <button
                                                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                                                className="text-brand-color-03 hover:underline text-sm"
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer (Static for now) */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Showing {filteredQuotes.length} of {MOCK_QUOTES.length} results</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
