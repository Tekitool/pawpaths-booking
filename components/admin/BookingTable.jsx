'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateBookingStatus } from '@/lib/actions/booking-actions';
import { CheckCircle, XCircle, Truck, Download, Plane, FileText, Mail } from 'lucide-react';

const STATUS_PHASES = {
    'Phase 1: Lead & Booking': [
        { value: 'enquiry_received', label: 'Enquiry Received' },
        { value: 'quote_sent', label: 'Quote Sent' },
        { value: 'booking_confirmed', label: 'Booking Confirmed' },
        { value: 'deposit_paid', label: 'Deposit Paid' },
        { value: 'awaiting_payment', label: 'Awaiting Payment' },
    ],
    'Phase 2: Documentation & Compliance': [
        { value: 'vet_coordination', label: 'Vet Coordination' },
        { value: 'permit_pending', label: 'Permit Pending' },
        { value: 'permit_approved', label: 'Permit Approved' },
        { value: 'crate_sizing', label: 'Crate Sizing' },
        { value: 'docs_verified', label: 'Docs Verified' },
    ],
    'Phase 3: Logistics & Flight': [
        { value: 'flight_booked', label: 'Flight Booked' },
        { value: 'flight_confirmed', label: 'Flight Confirmed' },
        { value: 'manifest_cargo', label: 'Manifest Cargo' },
        { value: 'baggage_avih', label: 'Baggage AVIH' },
        { value: 'petc_cabin', label: 'PETC Cabin' },
    ],
    'Phase 4: In-Transit': [
        { value: 'pet_collected', label: 'Pet Collected' },
        { value: 'airport_checkin', label: 'Airport Check-in' },
        { value: 'departed', label: 'Departed' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'arrived_clearing', label: 'Arrived/Clearing' },
    ],
    'Phase 5: Completion & Closed': [
        { value: 'delivered', label: 'Delivered' },
        { value: 'move_completed', label: 'Move Completed' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'cancelled', label: 'Canceled' },
        { value: 'refunded', label: 'Refunded' },
    ]
};

export default function BookingTable({ bookings, totalPages, currentPage }) {
    const getStatusLabel = (statusValue) => {
        for (const phase in STATUS_PHASES) {
            const status = STATUS_PHASES[phase].find(s => s.value === statusValue);
            if (status) return status.label;
        }
        return statusValue; // Fallback
    };

    const getStatusColor = (status) => {
        if (['delivered', 'move_completed'].includes(status)) return 'bg-success/15 text-system-color-02';
        if (['cancelled', 'refunded'].includes(status)) return 'bg-error/10 text-system-color-01';
        if (['in_transit', 'departed'].includes(status)) return 'bg-info/10 text-system-color-03';
        return 'bg-warning/10 text-yellow-800';
    };

    const getDatePillStyle = (dateString) => {
        if (!dateString) return 'bg-brand-text-02/5 text-brand-text-02/60 border-brand-text-02/20';

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 15 && diffDays >= 0) {
            return 'bg-error/10 text-error border-system-color-01';
        }
        return 'bg-success/15 text-success border-system-color-02';
    };

    const formatTransportMode = (mode) => {
        if (!mode) return '';
        return mode.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

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
                            <tr key={booking.bookingId} className="hover:bg-brand-color-02/30 transition-all duration-200 group">
                                <td className="px-4 py-4 font-medium text-brand-color-01 pl-6">
                                    <Link
                                        href={`/admin/relocations/${booking.bookingId}`}
                                        target="_blank"
                                        className="text-[11px] hover:underline bg-white px-2 py-1 rounded-md border border-brand-text-02/20 shadow-sm block w-fit max-w-[120px] break-words"
                                    >
                                        {booking.bookingId}
                                    </Link>
                                </td>
                                <td className="px-4 py-4">
                                    {/* Name - Linked to Booking Details */}
                                    <Link
                                        href={`/admin/relocations/${booking.bookingId}`}
                                        target="_blank"
                                        className="block group-hover:translate-x-1 transition-transform duration-200 mb-1"
                                    >
                                        <div className="text-gray-900 font-bold text-sm truncate group-hover:text-brand-color-01" title={booking.customerInfo.fullName}>
                                            {booking.customerInfo.fullName}
                                        </div>
                                    </Link>

                                    {/* Phone - Linked to WhatsApp */}
                                    <a
                                        href={`https://wa.me/${booking.customerInfo.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                            `*PawPaths Pets Relocation Services* - Your Trusted Travel Partner!\n` +
                                            `(Relocation Ref: ${booking.bookingId})\n` +
                                            `Dear ${booking.customerInfo.fullName},\n` +
                                            `Hope you are having a great day! This is from the PawPaths team.\n` +
                                            `Thank you for choosing PawPaths for the relocation of ${booking.pets.map(p => p.name).join(' & ')}. We are delighted to have you with us!\n` +
                                            `To finalize the IATA-compliant travel itinerary and documentation, we require a few specific details to ensure a seamless experience:\n` +
                                            `*Final Logistics Details:*\n` +
                                            `* Pickup Address: (Building/Villa & Area in UAE)\n` +
                                            `* Delivery Address: (Full destination address)\n` +
                                            `* Owner's Passport Copy: (Needed for permit filing)\n` +
                                            `* Current Vaccination Record: (Please send a clear photo)\n` +
                                            `* Specific Pet Measurements (for Crate Customization):\n` +
                                            `........\n` +
                                            `........\n` +
                                            `Once these are received, your dedicated coordinator will finalize all the requirements for ${booking.pets.map(p => p.name).join(' & ')}'s relocation, including the full travel itinerary, documentation schedule, and compliance checks.\n\n` +
                                            `We are committed to making this a stress-free move for you and a first-class journey for ${booking.pets.map(p => p.name).join(' & ')}.\n\n` +
                                            `Best regards,\n` +
                                            `The PawPaths Team \n` +
                                            `*+971 58 694 7755* \n` +
                                            `www.pawpathsae.com`
                                        )}`}
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

                                    {/* Email - Linked to Gmail Compose */}
                                    <a
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${booking.customerInfo.email}&su=${encodeURIComponent(`Pawpaths Pets Relocation Services : Relocation ${booking.bookingId}`)}&body=${encodeURIComponent(
                                            `PawPaths Pets Relocation Services - Your Trusted Travel Partner!\n` +
                                            `(Relocation Ref: ${booking.bookingId})\n` +
                                            `Dear ${booking.customerInfo.fullName},\n` +
                                            `Hope you are having a great day! This is from the PawPaths team.\n` +
                                            `Thank you for choosing PawPaths for the relocation of ${booking.pets.map(p => p.name).join(' & ')}. We are delighted to have you with us!\n` +
                                            `To finalize the IATA-compliant travel itinerary and documentation, we require a few specific details to ensure a seamless experience:\n` +
                                            `Final Logistics Details:\n` +
                                            `* Pickup Address: (Building/Villa & Area in UAE)\n` +
                                            `* Delivery Address: (Full destination address)\n` +
                                            `* Owner's Passport Copy: (Needed for permit filing)\n` +
                                            `* Current Vaccination Record: (Please send a clear photo)\n` +
                                            `* Specific Pet Measurements (for Crate Customization):\n` +
                                            `........\n` +
                                            `........\n` +
                                            `Once these are received, your dedicated coordinator will finalize all the requirements for ${booking.pets.map(p => p.name).join(' & ')}'s relocation, including the full travel itinerary, documentation schedule, and compliance checks.\n\n` +
                                            `We are committed to making this a stress-free move for you and a first-class journey for ${booking.pets.map(p => p.name).join(' & ')}.\n\n` +
                                            `Best regards,\n` +
                                            `The PawPaths Team \n` +
                                            `*+971 58 694 7755* \n` +
                                            `www.pawpathsae.com`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-brand-text-02/80 text-[11px] truncate hover:text-brand-color-01 hover:bg-info/10 px-2 py-0.5 rounded-full w-fit transition-colors"
                                        title="Send Email via Gmail"
                                    >
                                        <Mail className="w-3 h-3 flex-shrink-0 text-system-color-03" />
                                        {booking.customerInfo.email}
                                    </a>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="space-y-2">
                                        {booking.pets && booking.pets.map((pet, idx) => (
                                            <div key={idx} className="bg-brand-text-02/5 p-2 rounded-lg border border-brand-text-02/20">
                                                <Link
                                                    href={`/admin/relocations/${booking.bookingId}`}
                                                    target="_blank"
                                                    className="block group"
                                                >
                                                    <div className="text-gray-900 font-bold text-sm truncate mb-0.5 group-hover:text-brand-color-01">
                                                        {pet.name}
                                                    </div>
                                                </Link>
                                                <div className="text-brand-text-02 text-xs truncate mb-0.5 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-color-01/40"></span>
                                                    {pet.type}
                                                </div>
                                                <div className="text-brand-text-02/60 text-[10px] truncate italic pl-2.5">
                                                    {pet.breed}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
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
                                <td className="px-4 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getDatePillStyle(booking.travelDetails.travelDate)}`}>
                                        {formatDate(booking.travelDetails.travelDate)}
                                    </span>
                                </td>
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
                                <td className="px-4 py-4">
                                    <Link
                                        href={`/admin/relocations/${booking.bookingId}`}
                                        target="_blank"
                                    >
                                        <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-sm border ${getStatusColor(booking.status?.current || booking.status || 'enquiry_received').replace('text-', 'border-').replace('bg-', 'border-opacity-20 ')}`}>
                                            {getStatusLabel(booking.status?.current || booking.status || 'enquiry_received')}
                                        </span>
                                    </Link>
                                </td>
                            </tr>
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
