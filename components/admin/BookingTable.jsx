'use client';

import Link from 'next/link';
import { Plane, FileText, Mail } from 'lucide-react';
import {
    getStatusLabel,
    getStatusColor,
    getDatePillStyle,
    formatTransportMode,
    formatDate,
    buildWhatsAppMessage,
    buildEmailBody,
} from '@/lib/utils/booking-table-helpers';

function BookingTableRow({ booking }) {
    const petNames = booking.pets.map(p => p.name).join(' & ');
    const msgContext = {
        bookingId: booking.bookingId,
        customerName: booking.customerInfo.fullName,
        petNames,
    };

    return (
        <tr className="hover:bg-brand-color-02/30 transition-all duration-200 group">
            {/* Ref */}
            <td className="px-4 py-4 font-medium text-brand-color-01 pl-6">
                <Link
                    href={`/admin/relocations/${booking.bookingId}`}
                    className="text-[11px] hover:underline bg-white px-2 py-1 rounded-md border border-brand-text-02/20 shadow-sm block w-fit max-w-[120px] break-words"
                >
                    {booking.bookingId}
                </Link>
            </td>

            {/* Customer */}
            <td className="px-4 py-4">
                <Link
                    href={`/admin/relocations/${booking.bookingId}`}
                    className="block group-hover:translate-x-1 transition-transform duration-200 mb-1"
                >
                    <div className="text-gray-900 font-bold text-sm truncate group-hover:text-brand-color-01" title={booking.customerInfo.fullName}>
                        {booking.customerInfo.fullName}
                    </div>
                </Link>

                <a
                    href={`https://wa.me/${booking.customerInfo.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(buildWhatsAppMessage(msgContext))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-brand-text-02 text-xs font-bold truncate mb-1 hover:text-success hover:bg-success/15 px-2 py-0.5 rounded-full w-fit transition-colors"
                    title="Send WhatsApp Message"
                >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="text-system-color-02 flex-shrink-0">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    {booking.customerInfo.phone}
                </a>

                <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${booking.customerInfo.email}&su=${encodeURIComponent(`Pawpaths Pets Relocation Services : Relocation ${booking.bookingId}`)}&body=${encodeURIComponent(buildEmailBody(msgContext))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-brand-text-02/80 text-[11px] truncate hover:text-brand-color-01 hover:bg-info/10 px-2 py-0.5 rounded-full w-fit transition-colors"
                    title="Send Email via Gmail"
                >
                    <Mail className="w-3 h-3 flex-shrink-0 text-system-color-03" />
                    {booking.customerInfo.email}
                </a>
            </td>

            {/* Pet */}
            <td className="px-4 py-4">
                <div className="space-y-2">
                    {booking.pets?.map((pet, idx) => (
                        <div key={idx} className="bg-brand-text-02/5 p-2 rounded-lg border border-brand-text-02/20">
                            <Link href={`/admin/relocations/${booking.bookingId}`} className="block group">
                                <div className="text-gray-900 font-bold text-sm truncate mb-0.5 group-hover:text-brand-color-01">{pet.name}</div>
                            </Link>
                            <div className="text-brand-text-02 text-xs truncate mb-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-color-01/40" />
                                {pet.type}
                            </div>
                            <div className="text-brand-text-02/60 text-[10px] truncate italic pl-2.5">{pet.breed}</div>
                        </div>
                    ))}
                </div>
            </td>

            {/* Route */}
            <td className="px-4 py-4">
                <div className="flex items-center gap-3 bg-brand-text-02/5 p-2 rounded-lg border border-brand-text-02/20 w-fit">
                    <div className="flex flex-col max-w-[120px]">
                        <span className="font-bold text-brand-text-02 text-xs truncate" title={booking.travelDetails.originAirport}>{booking.travelDetails.originAirport}</span>
                        <span className="text-[9px] text-brand-text-02/80 uppercase tracking-wide truncate" title={booking.travelDetails.originCountry}>{booking.travelDetails.originCountry}</span>
                    </div>
                    <Plane className="w-3 h-3 text-brand-color-01/40 flex-shrink-0" />
                    <div className="flex flex-col text-right max-w-[120px]">
                        <span className="font-bold text-brand-text-02 text-xs truncate" title={booking.travelDetails.destinationAirport}>{booking.travelDetails.destinationAirport}</span>
                        <span className="text-[9px] text-brand-text-02/80 uppercase tracking-wide truncate" title={booking.travelDetails.destinationCountry}>{booking.travelDetails.destinationCountry}</span>
                    </div>
                </div>
            </td>

            {/* Travel Date */}
            <td className="px-4 py-4">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getDatePillStyle(booking.travelDetails.travelDate)}`}>
                    {formatDate(booking.travelDetails.travelDate)}
                </span>
            </td>

            {/* Service & Mode */}
            <td className="px-4 py-4">
                <div className="flex flex-col gap-1">
                    {booking.serviceType && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold border border-brand-text-02/20 bg-brand-text-02/5 text-brand-text-02 w-fit">
                            {booking.serviceType.toUpperCase()}
                        </span>
                    )}
                    {booking.transportMode && (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border w-fit ${booking.transportMode === 'in_cabin'
                            ? 'bg-success/15 text-success border-system-color-02'
                            : 'bg-info/10 text-info border-system-color-03'
                            }`}>
                            {formatTransportMode(booking.transportMode)}
                        </span>
                    )}
                </div>
            </td>

            {/* Status */}
            <td className="px-4 py-4">
                <Link href={`/admin/relocations/${booking.bookingId}`}>
                    <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-sm border ${getStatusColor(booking.status?.current || booking.status || 'enquiry_received').replace('text-', 'border-').replace('bg-', 'border-opacity-20 ')}`}>
                        {getStatusLabel(booking.status?.current || booking.status || 'enquiry_received')}
                    </span>
                </Link>
            </td>
        </tr>
    );
}

export default function BookingTable({ bookings, totalPages, currentPage }) {
    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-[#fffbdc] border-b border-brand-text-02/20 shadow-sm shadow-gray-100/50">
                        <tr>
                            <th className="px-4 py-4 font-bold text-brand-text-02 text-xs uppercase tracking-wider w-24 pl-6">Relocation Ref</th>
                            <th className="px-4 py-4 font-bold text-brand-text-02 text-xs uppercase tracking-wider w-56">Customer</th>
                            <th className="px-4 py-4 font-bold text-brand-text-02 text-xs uppercase tracking-wider w-32">Pet</th>
                            <th className="px-4 py-4 font-bold text-brand-text-02 text-xs uppercase tracking-wider w-48">Route</th>
                            <th className="px-4 py-4 font-bold text-brand-text-02 text-xs uppercase tracking-wider w-32">Travelling Date</th>
                            <th className="px-4 py-4 font-bold text-brand-text-02 text-xs uppercase tracking-wider w-36">Service & Mode</th>
                            <th className="px-4 py-4 font-bold text-brand-text-02 text-xs uppercase tracking-wider w-32">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {bookings.map((booking) => (
                            <BookingTableRow key={booking.bookingId} booking={booking} />
                        ))}
                    </tbody>
                </table>
            </div>
            {bookings.length === 0 && (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-brand-text-02/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-brand-text-02/60" />
                    </div>
                    <h3 className="text-gray-900 mb-1">No relocations found</h3>
                    <p className="text-brand-text-02/80 text-sm">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
