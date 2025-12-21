import { Suspense } from 'react';
import { auth } from '@/auth';

export default async function AdminDashboard() {
    const session = await auth();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Bookings</h3>
                    <p className="text-3xl font-bold text-pawpaths-brown mt-2">12</p>
                    <span className="text-green-500 text-sm font-medium">+2 this week</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Actions</h3>
                    <p className="text-3xl font-bold text-orange-500 mt-2">4</p>
                    <span className="text-gray-400 text-sm">Requires attention</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Active Relocations</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
                    <span className="text-blue-400 text-sm">In transit</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <p className="text-gray-500">No recent activity to show.</p>
            </div>
        </div>
    );
}
