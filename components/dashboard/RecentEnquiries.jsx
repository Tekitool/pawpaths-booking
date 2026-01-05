import React from 'react';
import Link from 'next/link';
import { ArrowRight, Circle } from 'lucide-react';

export default function RecentEnquiries({ enquiries }) {
    if (!enquiries || enquiries.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/20 p-6 h-full flex flex-col items-center justify-center text-brand-text-02/60">
                <p>No recent enquiries found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-level-1 border border-brand-text-02/10 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-brand-text-02/10 flex justify-between items-center bg-white/30">
                <h3 className="text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-info to-system-color-03 rounded-full"></span>
                    Recent Enquiries
                </h3>
                <Link href="/admin/relocations" className="text-sm text-brand-text-02/80 hover:text-info hover:bg-info/10 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 font-medium">
                    View All <ArrowRight size={14} />
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="divide-y divide-gray-100/50">
                    {enquiries.map((enquiry) => {
                        // Data Extraction
                        const bookingIdSuffix = enquiry.booking_number ? enquiry.booking_number.slice(-3) : '???';
                        const customerName = enquiry.customer?.display_name || 'Unknown';
                        const rawDate = enquiry.scheduled_departure_date;
                        const travelDate = rawDate ? new Date(rawDate).toLocaleDateString('en-GB') : 'TBD';

                        // Pet Info (First Pet)
                        const firstPet = enquiry.pets?.[0]?.pet;
                        const petName = firstPet?.name || 'Unknown Pet';
                        const petType = firstPet?.species?.name || '?';
                        const petBreed = firstPet?.breed?.name || '?';
                        const petCount = enquiry.pets?.length || 0;
                        const petDisplay = `${petName} (${petType} | ${petBreed})${petCount > 1 ? ` +${petCount - 1}` : ''}`;

                        // Route
                        const origin = enquiry.origin?.country?.iso_code || '???';
                        const destination = enquiry.destination?.country?.iso_code || '???';

                        return (
                            <div key={enquiry.id} className="p-4 hover:bg-white/60 transition-colors flex items-center gap-4 group">
                                {/* Circle with ID Suffix */}
                                <div className={`
                                    w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-sm font-bold border 
                                    shadow-sm backdrop-blur-sm
                                    ${enquiry.status === 'confirmed' ? 'bg-success/15/80 text-success border-system-color-02' :
                                        enquiry.status === 'pending' ? 'bg-accent/15/80 text-orange-700 border-accent/15' :
                                            'bg-brand-text-02/5/80 text-brand-text-02 border-brand-text-02/20'
                                    }
                                `}>
                                    {bookingIdSuffix}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Line 1: Name - Date */}
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-bold text-gray-900 truncate flex items-center gap-2">
                                            <Link href={`/admin/relocations/${enquiry.id}`} className="hover:text-info transition-colors">
                                                {customerName}
                                            </Link>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="text-brand-text-02/80 font-medium text-xs bg-brand-text-02/10 px-2 py-0.5 rounded-full">{travelDate}</span>
                                        </div>
                                        {/* Status Badge */}
                                        <div className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider shadow-sm ${enquiry.status === 'confirmed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-success' :
                                            enquiry.status === 'pending' ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700' :
                                                'bg-brand-text-02/10 text-brand-text-02/80'
                                            }`}>
                                            {enquiry.status}
                                        </div>
                                    </div>

                                    {/* Line 2: Pet • Route */}
                                    <div className="text-xs text-brand-text-02/80 flex items-center gap-3 truncate mt-1.5">
                                        <div className="flex items-center gap-1.5 bg-brand-text-02/5/80 px-2 py-1 rounded-lg border border-brand-text-02/20">
                                            <span className="font-medium text-brand-text-02">{petDisplay}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-brand-text-02/60">
                                            <span className="font-semibold text-brand-text-02">{origin}</span>
                                            <ArrowRight size={10} />
                                            <span className="font-semibold text-brand-text-02">{destination}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
