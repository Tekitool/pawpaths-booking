import React from 'react';
import { Calendar } from 'lucide-react';
import QuickActions from '../../../components/dashboard/QuickActions';
import RecentEnquiries from '../../../components/dashboard/RecentEnquiries';
import StatsGrid from '../../../components/dashboard/StatsGrid';
import CurrentDate from '../../../components/dashboard/CurrentDate';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
    const supabase = await createClient();

    // Parallel Data Fetching
    const [
        { count: totalCount },
        { count: pendingCount },
        { count: activeCount },
        { count: completedCount },
        { data: recentEnquiries }
    ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'in_progress']),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('bookings')
            .select(`
                id,
                booking_number,
                status,
                service_type,
                scheduled_departure_date,
                created_at,
                customer:customer_id ( display_name ),
                origin:origin_node_id ( country:countries(iso_code) ),
                destination:destination_node_id ( country:countries(iso_code) ),
                pets:booking_pets (
                    pet:pet_id ( name, species(name), breed:breeds(name) )
                )
            `)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(5)
    ]);

    const stats = {
        total: totalCount || 0,
        pending: pendingCount || 0,
        active: activeCount || 0,
        completed: completedCount || 0
    };

    return (
        <div className="space-y-8 min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100/50 p-2 rounded-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-gray-900">Dashboard</h1>
                    <p className="text-brand-text-02/80 mt-1 font-medium">Overview of system status and quick actions.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-brand-text-02/10 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="p-1.5 bg-brand-color-01/5 rounded-lg group-hover:bg-brand-color-01/10 transition-colors">
                        <Calendar className="w-4 h-4 text-brand-color-01" />
                    </div>
                    <span className="text-sm font-semibold text-brand-text-02 tracking-tight">
                        <CurrentDate />
                    </span>
                </div>
            </div>

            {/* Top Row: Stats */}
            <StatsGrid stats={stats} />

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Recent Enquiries (Takes up 2/3 space) */}
                <div className="lg:col-span-2 h-full min-h-[400px]">
                    <RecentEnquiries enquiries={recentEnquiries || []} />
                </div>

                {/* Right Column: Quick Actions (Takes up 1/3 space) */}
                <div className="space-y-6">
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}
