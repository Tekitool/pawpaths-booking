'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Calendar, X, ChevronDown } from 'lucide-react';

export default function AuditLogFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [actionType, setActionType] = useState(searchParams.get('action') || '');
    const [dateRange, setDateRange] = useState(searchParams.get('range') || 'all');

    const updateFilters = (updates) => {
        const params = new URLSearchParams(searchParams.toString());

        // Merge updates
        const currentFilters = {
            search: updates.search !== undefined ? updates.search : search,
            action: updates.action !== undefined ? updates.action : actionType,
            range: updates.range !== undefined ? updates.range : dateRange,
        };

        if (currentFilters.search) params.set('search', currentFilters.search);
        else params.delete('search');

        if (currentFilters.action) params.set('action', currentFilters.action);
        else params.delete('action');

        if (currentFilters.range && currentFilters.range !== 'all') params.set('range', currentFilters.range);
        else params.delete('range');

        router.push(`/admin/settings/audit-logs?${params.toString()}`);
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search });
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-brand-text-02/10 flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-02/40" size={18} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search reason, entity ID..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-brand-text-02/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-color-01/20 transition-all"
                />
                {search && (
                    <button
                        onClick={() => { setSearch(''); updateFilters({ search: '' }); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-02/40 hover:text-brand-text-02"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Action Filter */}
            <div className="relative min-w-[180px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-02/60">
                    <Filter size={16} />
                </div>
                <select
                    value={actionType}
                    onChange={(e) => {
                        setActionType(e.target.value);
                        updateFilters({ action: e.target.value });
                    }}
                    className="w-full pl-10 pr-8 py-2 bg-white border border-brand-text-02/10 rounded-xl text-brand-text-02 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-brand-color-01/20 cursor-pointer hover:bg-brand-text-02/5 transition-all"
                >
                    <option value="">All Actions</option>
                    <option value="DELETE">Delete</option>
                    <option value="UPDATE">Update</option>
                    <option value="CREATE">Create</option>
                    <option value="LOGIN">Login</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-02/40 pointer-events-none" size={14} />
            </div>

            {/* Date Range Filter */}
            <div className="relative min-w-[180px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-02/60">
                    <Calendar size={16} />
                </div>
                <select
                    value={dateRange}
                    onChange={(e) => {
                        setDateRange(e.target.value);
                        updateFilters({ range: e.target.value });
                    }}
                    className="w-full pl-10 pr-8 py-2 bg-white border border-brand-text-02/10 rounded-xl text-brand-text-02 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-brand-color-01/20 cursor-pointer hover:bg-brand-text-02/5 transition-all"
                >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-02/40 pointer-events-none" size={14} />
            </div>
        </div>
    );
}
