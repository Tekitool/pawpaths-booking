import { Suspense } from 'react';
import { getDashboardStats } from '@/lib/actions/booking-actions';
import {
    LayoutDashboard,
    Clock,
    Plane,
    CheckCircle,
    TrendingUp,
    Users,
    Calendar,
    ArrowRight,
    Activity
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Overview of your pet relocation operations</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Bento Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Bookings - Large Card */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-pawpaths-cream to-amber-200 rounded-3xl p-8 text-pawpaths-brown shadow-md shadow-amber-200/70 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                            <LayoutDashboard size={120} className="text-orange-400" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/40 rounded-lg backdrop-blur-sm">
                                    <LayoutDashboard className="w-6 h-6 text-orange-500" />
                                </div>
                                <span className="font-bold text-pawpaths-brown/90">Total Bookings</span>
                            </div>
                            <div className="text-5xl font-extrabold mb-2">{stats.totalBookings}</div>
                            <div className="flex items-center gap-2 text-pawpaths-brown/80 text-sm font-medium">
                                <TrendingUp className="w-4 h-4" />
                                <span>All time records</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Relocations */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                    <Plane className="w-6 h-6" />
                                </div>
                                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">Active</span>
                            </div>
                            <h3 className="text-gray-500 font-medium mb-1">In Transit</h3>
                            <p className="text-3xl font-bold text-gray-800">{stats.activeRelocations}</p>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full">Pending</span>
                            </div>
                            <h3 className="text-gray-500 font-medium mb-1">Actions Required</h3>
                            <p className="text-3xl font-bold text-gray-800">{stats.pendingActions}</p>
                        </div>
                    </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity List */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-pawpaths-brown" />
                                Recent Activity
                            </h2>
                            <Link href="/admin/bookings" className="flex items-center justify-between px-4 py-2 rounded-xl bg-white/60 hover:bg-pawpaths-brown hover:text-white transition-all group border border-white/50 shadow-sm text-sm font-medium text-gray-700">
                                <span>View All</span>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white ml-2" />
                            </Link>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {stats.recentBookings.length > 0 ? (
                                    stats.recentBookings.map((booking) => (
                                        <div key={booking._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 font-bold text-xs border border-gray-100">
                                                    {booking.bookingId.split('-').pop()}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/admin/bookings/${booking.bookingId}`}
                                                        target="_blank"
                                                        className="font-bold text-gray-800 text-sm group-hover:text-pawpaths-brown transition-colors hover:underline"
                                                    >
                                                        {booking.customerInfo.fullName}
                                                    </Link>
                                                    <p className="text-xs text-gray-500">
                                                        {booking.pets.map(p => p.name).join(', ')} • {booking.travelDetails.originCountry} to {booking.travelDetails.destinationCountry}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                    ${['delivered', 'move_completed'].includes(booking.status?.current || booking.status) ? 'bg-green-100 text-green-700' :
                                                        ['cancelled', 'refunded'].includes(booking.status?.current || booking.status) ? 'bg-red-100 text-red-700' :
                                                            ['in_transit', 'departed'].includes(booking.status?.current || booking.status) ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {(booking.status?.current || booking.status || 'enquiry_received').replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-xs text-gray-400 hidden sm:block">
                                                    {new Date(booking.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">No recent activity</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / Completed */}
                    <div className="flex flex-col gap-6 h-full">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-md shadow-green-500/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CheckCircle size={80} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <span className="font-medium text-white/90">Completed Moves</span>
                                </div>
                                <div className="text-4xl font-bold">{stats.completedRelocations}</div>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#e6f2ef] backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-gray-800 font-bold mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link href="/admin/bookings" className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-pawpaths-brown hover:text-white transition-all group border border-white/50 shadow-sm">
                                    <span className="text-sm font-medium">View All Bookings</span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                </Link>
                                <Link href="/admin/settings" className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-pawpaths-brown hover:text-white transition-all group border border-white/50 shadow-sm">
                                    <span className="text-sm font-medium">System Settings</span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
