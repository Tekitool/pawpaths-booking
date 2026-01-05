import { getAdminBookingDetails } from '@/lib/actions/admin-booking-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Mail, Phone, MapPin, Calendar, Plane, FileText, AlertCircle, CheckCircle, Clock, Eye, Download, Users, FileX, Edit, Plus, Truck, Package } from 'lucide-react';
import BookingStatusControl from '@/components/admin/BookingStatusControl';
import JobCostingTable from '@/components/admin/JobCostingTable';
import TimelineWidget from '@/components/relocation/TimelineWidget';
import DocumentStatusSection from '@/components/enquiry/DocumentStatusSection';
import Image from 'next/image';

export default async function BookingDetailPage(props) {
    const params = await props.params;
    const booking = await getAdminBookingDetails(params.id);

    if (!booking) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-brand-text-02/5/50 p-8">
            {/* 1. PAGE HEADER */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/relocations" className="p-3 bg-white rounded-xl shadow-sm border border-brand-text-02/20 text-brand-text-02/80 hover:text-brand-color-01 hover:border-brand-color-01/30 transition-all duration-300 group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-gray-900 flex flex-wrap items-center gap-3">
                                {booking.customerInfo.fullName}
                                <span className="px-3 py-1 bg-brand-text-02/10 text-brand-text-02 text-xs rounded-full border border-brand-text-02/20 font-mono">
                                    {booking.bookingId}
                                </span>
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-brand-text-02/80 flex items-center gap-2 text-sm font-medium">
                                    <Clock size={14} />
                                    Created on {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                                <span className="text-brand-text-02/60">|</span>
                                <span className={`px-3 py-0.5 text-sm rounded-full font-bold border ${booking.status?.current === 'completed' ? 'bg-success/15 text-success border-success/30' :
                                    booking.status?.current === 'cancelled' ? 'bg-error/10 text-error border-error/30' :
                                        'bg-info/10 text-info border-info/30'
                                    }`}>
                                    {booking.status?.current || booking.status || 'Enquiry'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-white border border-brand-text-02/20 rounded-lg text-brand-text-02 hover:bg-brand-text-02/5 font-medium text-sm shadow-sm transition-all">
                            Edit Logistics
                        </button>
                        <button className="px-4 py-2 bg-white border border-error/30 text-error rounded-lg hover:bg-error/10 font-medium text-sm shadow-sm transition-all">
                            Cancel File
                        </button>
                        <BookingStatusControl bookingId={booking.bookingId} currentStatus={booking.status?.current || booking.status || 'enquiry_received'} />
                    </div>
                </div>
            </div>

            {/* 2. THE NEW GRID LAYOUT (2x3 Matrix) */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ROW 1: THE ACTORS */}

                {/* Left Card: Customer Profile */}
                <div className="bg-brand-color-02/10 rounded-2xl shadow-sm border-[0.5px] border-brand-color-02/20 p-6 flex flex-col h-full">
                    {/* ... Customer Profile content ... */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-accent/10 text-accent rounded-xl border border-accent/20">
                                <Users size={24} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-accent">Customer Profile</h2>
                                <p className="text-xs text-brand-text-02/80 uppercase font-bold tracking-wider">Client</p>
                            </div>
                        </div>
                        <button className="text-sm font-medium text-brand-color-01 hover:text-brand-color-01/80 flex items-center gap-1">
                            <Edit size={14} /> Edit Profile
                        </button>
                    </div>

                    <div className="space-y-4 flex-grow">
                        <div className="grid grid-cols-1 gap-4">
                            {/* 1. Full Name */}
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-brand-color-02/20">
                                <Users size={18} className="text-brand-text-02/60" />
                                <div>
                                    <p className="text-xs text-brand-text-02/80 font-bold uppercase">Full Name</p>
                                    <p className="font-medium text-gray-900">{booking.customerInfo.fullName}</p>
                                </div>
                            </div>

                            {/* 2. Location */}
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-brand-color-02/20">
                                <MapPin size={18} className="text-brand-text-02/60" />
                                <div>
                                    <p className="text-xs text-brand-text-02/80 font-bold uppercase">Location</p>
                                    <p className="font-medium text-gray-900">{booking.customerInfo.city || 'Not specified'}</p>
                                </div>
                            </div>

                            {/* 3. Phone / WhatsApp */}
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-brand-color-02/20">
                                <Phone size={18} className="text-brand-text-02/60" />
                                <div>
                                    <p className="text-xs text-brand-text-02/80 font-bold uppercase">Phone / WhatsApp</p>
                                    <p className="font-medium text-gray-900">{booking.customerInfo.phone}</p>
                                </div>
                            </div>

                            {/* 4. Email Address */}
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-brand-color-02/20">
                                <Mail size={18} className="text-brand-text-02/60" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs text-brand-text-02/80 font-bold uppercase">Email Address</p>
                                    <p className="font-medium text-gray-900 truncate" title={booking.customerInfo.email}>{booking.customerInfo.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-brand-color-02/20">
                            <label className="text-xs font-bold text-brand-text-02/80 uppercase mb-2 block">Internal Notes</label>
                            <textarea
                                className="w-full text-sm p-3 bg-white/50 border border-brand-color-02/20 rounded-xl focus:ring-2 focus:ring-brand-color-02/20 outline-none resize-none h-24"
                                placeholder="Add internal notes about this customer..."
                                defaultValue={booking.internal_notes || ''}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Timeline Widget */}
                <TimelineWidget bookingId={booking.id} />

                {/* Right Card: Pet Details */}
                <div className="bg-brand-text-03/5 rounded-2xl shadow-sm border-[0.5px] border-brand-text-03/20 p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-text-03/10 text-brand-text-03 rounded-xl border border-brand-text-03/20">
                                <span className="text-xl">🐾</span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-brand-text-03">Pet Profiles</h2>
                                <p className="text-xs text-brand-text-02/80 uppercase font-bold tracking-wider">{booking.pets.length} Pet{booking.pets.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 text-brand-text-02/60 hover:text-brand-color-01 hover:bg-brand-text-02/5 rounded-lg transition-colors">
                                <Edit size={16} />
                            </button>
                            <button className="p-2 text-brand-text-02/60 hover:text-brand-color-01 hover:bg-brand-text-02/5 rounded-lg transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 flex-grow overflow-y-auto max-h-[500px] pr-2">
                        {booking.pets.map((pet, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-xl border border-brand-text-03/20 bg-white/60 hover:border-brand-text-03/40 hover:bg-white/80 transition-all group">
                                <div className="w-16 h-16 rounded-lg bg-brand-text-03/10 relative overflow-hidden flex-shrink-0">
                                    {pet.photoUrl ? (
                                        <Image
                                            src={pet.photoUrl}
                                            alt={pet.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🐶</div>
                                    )}
                                </div>
                                <div className="flex-grow flex flex-col justify-center">
                                    {/* Line 1: Name (Left) ... Type (Breed) (Right) */}
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold text-gray-900">{pet.name}</h3>
                                        <span className="text-brand-text-02/80 text-xs font-medium bg-brand-text-03/10 px-2 py-1 rounded border border-brand-text-03/20">
                                            {pet.type} <span className="text-brand-text-02/60">({pet.breed})</span>
                                        </span>
                                    </div>

                                    {/* Line 2: Gender Pill | Age | Weight */}
                                    <div className="flex items-center gap-3 text-xs text-brand-text-02 font-medium">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pet.gender?.toLowerCase() === 'male'
                                            ? 'bg-info/10 text-info border-system-color-03'
                                            : 'bg-pink-50 text-pink-600 border-pink-100'
                                            }`}>
                                            {pet.gender || 'Unknown'}
                                        </span>
                                        <span className="text-brand-text-02/60">|</span>
                                        <span>{pet.age} {pet.ageUnit}</span>
                                        <span className="text-brand-text-02/60">|</span>
                                        <span>{pet.weight} KG</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {booking.pets.length === 0 && (
                            <div className="text-center py-8 text-brand-text-02/60 italic">No pets added to manifest.</div>
                        )}
                    </div>
                </div>

                {/* ROW 2: THE LOGISTICS */}

                {/* Left Card: Journey & Timeline */}
                <div className="bg-system-color-03/5 rounded-2xl shadow-sm border-[0.5px] border-system-color-03/20 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-system-color-03/10 text-system-color-03 rounded-xl border border-system-color-03/20">
                                <Plane size={24} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-system-color-03">Journey & Timeline</h2>
                                <p className="text-xs text-brand-text-02/80 uppercase font-bold tracking-wider">Logistics</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative py-4">
                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div className="text-center flex flex-col items-center">
                                <p className="text-xs text-brand-text-02/80 mb-2 font-bold uppercase tracking-wider">Origin</p>
                                <div className="w-[100px] h-[100px] bg-white rounded-full flex items-center justify-center text-base font-bold text-system-color-03 mb-2 border-4 border-system-color-03/10 shadow-sm px-2 leading-tight">
                                    {booking.travelDetails.originAirport || 'ORG'}
                                </div>
                                <p className="font-bold text-gray-900">{booking.travelDetails.originCountry}</p>
                            </div>

                            <div className="flex-grow px-4 relative flex flex-col items-center">
                                <div className="w-full h-0.5 bg-system-color-03/20 absolute top-[74px] -translate-y-1/2"></div>
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-system-color-03/20 shadow-sm relative z-10 mb-2 mt-[46px]">
                                    <Plane className="text-system-color-03 rotate-90" size={24} />
                                </div>
                                <span className="px-3 py-1 bg-white text-system-color-03 text-[10px] font-bold rounded-full border border-system-color-03/20 shadow-sm relative z-10">
                                    {booking.travelDetails.transportMode ? booking.travelDetails.transportMode.replace(/_/g, ' ').toUpperCase() : 'MANIFEST CARGO'}
                                </span>
                            </div>

                            <div className="text-center flex flex-col items-center">
                                <p className="text-xs text-brand-text-02/80 mb-2 font-bold uppercase tracking-wider">Destination</p>
                                <div className="w-[100px] h-[100px] bg-white rounded-full flex items-center justify-center text-base font-bold text-system-color-03 mb-2 border-4 border-system-color-03/10 shadow-sm px-2 leading-tight">
                                    {booking.travelDetails.destinationAirport || 'DST'}
                                </div>
                                <p className="font-bold text-gray-900">{booking.travelDetails.destinationCountry}</p>
                            </div>
                        </div>

                        <div className="bg-white/60 rounded-xl p-4 border border-system-color-03/20 flex items-center justify-between cursor-pointer hover:bg-white/80 transition-colors group">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-system-color-03 group-hover:text-brand-color-01" size={20} />
                                <div>
                                    <p className="text-xs text-brand-text-02/80 font-bold uppercase">Scheduled Departure</p>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {booking.travelDetails.travelDate ? new Date(booking.travelDetails.travelDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date Not Set'}
                                    </p>
                                </div>
                            </div>
                            <Edit size={16} className="text-system-color-03 group-hover:text-brand-color-01" />
                        </div>
                    </div>
                </div>



                {/* ROW 3: DOCUMENT STATUS (Full Width) */}
                <div className="md:col-span-2">
                    <DocumentStatusSection booking={booking} />
                </div>

                {/* ROW 4: THE FINANCIAL ENGINE (Full Width) */}
                <div className="md:col-span-2">
                    <JobCostingTable items={booking.items} relocationId={booking.id} />
                </div>

            </div>
        </div>
    );
}
