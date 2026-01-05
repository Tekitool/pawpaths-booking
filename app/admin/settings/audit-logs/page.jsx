import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AuditLogFilters from '@/components/admin/settings/AuditLogFilters';

export const dynamic = "force-dynamic";

export default async function AuditLogsPage({ searchParams }) {
    const supabase = await createClient();

    const params = await searchParams;
    const search = params?.search || '';
    const action = params?.action || '';
    const range = params?.range || 'all';

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Current User Profile
    let currentUserProfile = null;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        currentUserProfile = profile;
    }

    let query = supabase
        .from('system_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

    // Apply Filters
    if (action) {
        query = query.eq('action_type', action);
    }

    if (search) {
        query = query.or(`reason_note.ilike.%${search}%,entity_id.ilike.%${search}%,entity_table.ilike.%${search}%`);
    }

    if (range !== 'all') {
        const now = new Date();
        let startDate = new Date();

        if (range === '24h') startDate.setHours(now.getHours() - 24);
        if (range === '7d') startDate.setDate(now.getDate() - 7);
        if (range === '30d') startDate.setDate(now.getDate() - 30);

        query = query.gte('created_at', startDate.toISOString());
    }

    // Limit results
    query = query.limit(100);

    const { data: rawLogs, error } = await query;

    if (error) {
        console.error('Error fetching audit logs:', error);
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error loading logs: </strong>
                    <span className="block sm:inline">{error.message}</span>
                </div>
            </div>
        );
    }

    // Manually fetch actor profiles
    let logs = [];
    if (rawLogs && rawLogs.length > 0) {
        const actorIds = [...new Set(rawLogs.map(log => log.actor_id).filter(Boolean))];

        let profilesMap = {};
        if (actorIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email, full_name, avatar_url')
                .in('id', actorIds);

            if (profiles) {
                profiles.forEach(p => {
                    profilesMap[p.id] = p;
                });
            }
        }

        logs = rawLogs.map(log => ({
            ...log,
            actor: profilesMap[log.actor_id] || { email: 'Unknown User', full_name: 'Unknown' }
        }));
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-brand-text-02 flex items-center gap-3">
                        <ShieldAlert className="text-brand-color-01" size={28} />
                        System Audit Logs
                    </h1>
                    <p className="text-brand-text-02/80 mt-1">Track all sensitive actions and security events.</p>
                </div>
                <Link
                    href="/admin/settings"
                    className="px-4 py-2 bg-white border border-brand-text-02/20 rounded-xl text-brand-text-02 font-medium hover:bg-brand-text-02/5 transition-colors"
                >
                    Back to Settings
                </Link>
            </div>

            {/* User Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-brand-text-02/10 shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-brand-color-02/20 flex items-center justify-center border-2 border-white shadow-md overflow-hidden relative">
                    {currentUserProfile?.avatar_url ? (
                        <Image
                            src={currentUserProfile.avatar_url}
                            alt="User"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <span className="text-2xl font-bold text-brand-color-01">
                            {currentUserProfile?.full_name?.[0] || currentUserProfile?.email?.[0] || 'U'}
                        </span>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-brand-text-02">
                        {currentUserProfile?.full_name || currentUserProfile?.email || 'Authenticated User'}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-brand-text-02/70">
                        <span className="flex items-center gap-1 bg-brand-color-02/10 px-2 py-0.5 rounded-md text-brand-color-01 font-medium uppercase text-xs">
                            {currentUserProfile?.role || 'User'}
                        </span>
                        <span>•</span>
                        <span>{logs?.length || 0} Logs Found</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <AuditLogFilters />

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-brand-text-02/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-text-02/5 border-b border-brand-text-02/10">
                                <th className="p-4 text-xs font-bold text-brand-text-02 uppercase tracking-wider w-40">Time</th>
                                <th className="p-4 text-xs font-bold text-brand-text-02 uppercase tracking-wider w-48">User</th>
                                <th className="p-4 text-xs font-bold text-brand-text-02 uppercase tracking-wider w-24">Action</th>
                                <th className="p-4 text-xs font-bold text-brand-text-02 uppercase tracking-wider w-32">Page</th>
                                <th className="p-4 text-xs font-bold text-brand-text-02 uppercase tracking-wider w-64">Reason</th>
                                <th className="p-4 text-xs font-bold text-brand-text-02 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-text-02/5">
                            {logs?.map((log) => (
                                <tr key={log.id} className="hover:bg-brand-text-02/5 transition-colors group">
                                    <td className="p-4 text-sm text-brand-text-02/80 align-top">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-brand-text-02">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs opacity-60">
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-text-02/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                                {log.actor?.avatar_url ? (
                                                    <Image
                                                        src={log.actor.avatar_url}
                                                        alt="Actor"
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <span className="text-xs font-bold text-brand-text-02/60">
                                                        {log.actor?.full_name?.[0] || log.actor?.email?.[0] || '?'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium text-brand-text-02 truncate">
                                                    {log.actor?.full_name || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-brand-text-02/60 truncate">
                                                    {log.actor?.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <span className={`
                                            inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border
                                            ${log.action_type === 'DELETE' ? 'bg-red-50 text-red-700 border-red-100' :
                                                log.action_type === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    log.action_type === 'CREATE' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        'bg-gray-50 text-gray-700 border-gray-100'}
                                        `}>
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-brand-text-02/80 align-top">
                                        <div className="flex flex-col">
                                            <span className="font-medium bg-brand-text-02/5 px-2 py-0.5 rounded w-fit text-xs uppercase tracking-wide">
                                                {log.entity_table}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-brand-text-02 align-top">
                                        <div className="bg-brand-text-02/5 rounded-lg p-2 text-[10px] italic border border-brand-text-02/5 leading-relaxed">
                                            &quot;{log.reason_note}&quot;
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="text-xs font-mono text-brand-text-02/70 bg-gray-50 rounded-lg p-3 border border-gray-100 overflow-x-auto">
                                            {Object.entries(log.metadata || {}).map(([key, value]) => (
                                                <div key={key} className="flex gap-2 mb-0.5 last:mb-0">
                                                    <span className="font-semibold text-brand-text-02/50">{key}:</span>
                                                    <span className="text-brand-text-02">{String(value)}</span>
                                                </div>
                                            ))}
                                            {(!log.metadata || Object.keys(log.metadata).length === 0) && (
                                                <span className="opacity-50">-</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-brand-text-02/40">
                                            <ShieldAlert size={48} className="mb-4 opacity-20" />
                                            <p className="text-lg font-medium">No audit logs found</p>
                                            <p className="text-sm">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
