'use client';

import { useState } from 'react';
import { updateBookingStatus } from '@/lib/actions/booking-actions';
import { Eye, MoreHorizontal, CheckCircle, XCircle, Truck, Clock, Download } from 'lucide-react';

export default function BookingTable({ bookings, totalPages, currentPage }) {
    const [updating, setUpdating] = useState(null);

    const handleStatusChange = async (bookingId, newStatus) => {
        setUpdating(bookingId);
        await updateBookingStatus(bookingId, newStatus);
        setUpdating(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Booking ID</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Customer</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Route</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Documents</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => (
                            <tr key={booking.bookingId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-pawpaths-brown">
                                    {booking.bookingId}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{booking.customerInfo.fullName}</div>
                                    <div className="text-gray-500 text-xs">{booking.customerInfo.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{booking.travelDetails.originAirport}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-medium">{booking.travelDetails.destinationAirport}</span>
                                    </div>
                                    <div className="text-gray-500 text-xs">{booking.travelDetails.originCountry} to {booking.travelDetails.destinationCountry}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(booking.travelDetails.travelDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        {booking.customer?.documents?.length > 0 ? (
                                            booking.customer.documents.map((doc, idx) => (
                                                <a
                                                    key={idx}
                                                    href={doc.url}
                                                    download={doc.name}
                                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                    title={doc.name}
                                                >
                                                    <Download size={12} /> {doc.type}
                                                </a>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No docs</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative group">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                            <MoreHorizontal size={18} />
                                        </button>
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 hidden group-hover:block z-10">
                                            <div className="p-1">
                                                <button
                                                    onClick={() => handleStatusChange(booking.bookingId, 'confirmed')}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                                >
                                                    <CheckCircle size={16} className="text-green-500" /> Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(booking.bookingId, 'completed')}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                                >
                                                    <Truck size={16} className="text-blue-500" /> Complete
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(booking.bookingId, 'cancelled')}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                                >
                                                    <XCircle size={16} className="text-red-500" /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {bookings.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No bookings found matching your search.
                </div>
            )}
        </div>
    );
}
