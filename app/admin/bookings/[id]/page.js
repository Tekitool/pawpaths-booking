import { getBookingById } from '@/lib/actions/booking-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Mail, Phone, MapPin, Calendar, Plane, FileText, AlertCircle, CheckCircle, Clock, Eye, Download, Users, FileX } from 'lucide-react';
import BookingStatusControl from '@/components/admin/BookingStatusControl';
import Image from 'next/image';

export default async function BookingDetailPage(props) {
    const params = await props.params;
    const booking = await getBookingById(params.id);

    if (!booking) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/bookings" className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-pawpaths-brown hover:border-pawpaths-brown/30 transition-all duration-300 group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                            Booking {booking.bookingId}
                            <span className="px-4 py-1.5 bg-pawpaths-brown/10 text-pawpaths-brown text-sm rounded-full font-bold border border-pawpaths-brown/20">
                                {booking.status?.current || booking.status || 'enquiry_received'}
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Clock size={14} />
                            Created on {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-pawpaths-brown hover:border-pawpaths-brown/30 transition-all duration-300 font-medium shadow-sm">
                        <Printer size={18} /> Print
                    </button>
                    <BookingStatusControl bookingId={booking.bookingId} currentStatus={booking.status?.current || booking.status || 'enquiry_received'} />
                </div>
            </div>

            {/* Main Content - Row-Based Layout */}
            <div className="max-w-7xl mx-auto space-y-8">
                {/* ROW 1: Owner Details + Travel Itinerary (Fixed Height, Side by Side) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Owner Details */}
                    <div className="bg-[#fffadc]/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/60 border border-[#fff39c] overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Users size={100} />
                        </div>
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                            <div className="p-2 bg-pawpaths-cream rounded-xl text-pawpaths-brown">
                                <Users size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-gray-800">Owner Details</h3>
                        </div>
                        <div className="p-6 space-y-6 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{booking.customerInfo.fullName}</h3>
                                <p className="text-sm text-gray-500 flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                                    {booking.customerInfo.address?.city || booking.customerInfo.city || 'No city/place provided'}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <a href={`tel:${booking.customerInfo.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-pawpaths-brown hover:text-white transition-all group border border-gray-100">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 group-hover:text-pawpaths-brown transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <span className="font-medium">{booking.customerInfo.phone}</span>
                                </a>
                                <a href={`mailto:${booking.customerInfo.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-pawpaths-brown hover:text-white transition-all group border border-gray-100">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 group-hover:text-pawpaths-brown transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <span className="font-medium truncate">{booking.customerInfo.email}</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Travel Itinerary */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg shadow-gray-200/60 border border-blue-100 overflow-hidden relative h-full">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Plane size={120} />
                        </div>
                        <div className="p-6 border-b border-blue-100/50 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                <Plane size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-blue-900">Travel Itinerary</h3>
                        </div>
                        <div className="p-6 relative z-10">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 shadow-sm">
                                        <span className="text-2xl font-bold text-blue-600">{booking.travelDetails.originAirport}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{booking.travelDetails.originCountry}</p>
                                    <p className="text-sm text-gray-600 mt-1">Origin</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Plane className="text-blue-400 mb-2" size={24} />
                                    <div className="h-0.5 w-20 bg-blue-200 rounded-full"></div>
                                </div>
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-3 shadow-sm">
                                        <span className="text-2xl font-bold text-indigo-600">{booking.travelDetails.destinationAirport}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{booking.travelDetails.destinationCountry}</p>
                                    <p className="text-sm text-gray-600 mt-1">Destination</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Travel Date</p>
                                        <p className="font-bold text-gray-800">{new Date(booking.travelDetails.travelDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                                    {booking.travel?.travelMode || 'Mode Not Set'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Pet Details (Expandable Grid with Individual Notes) */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Pet Details</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {booking.pets.map((pet, idx) => (
                            <div key={idx} className={`backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-100/50 border overflow-hidden group hover:shadow-xl transition-all duration-300 ${pet.type?.toLowerCase() === 'dog'
                                ? 'bg-[#ffe2c7]/80 border-[#d8a979]'
                                : pet.type?.toLowerCase() === 'cat'
                                    ? 'bg-[#fffbd9]/80 border-[#fff064]'
                                    : 'bg-white/80 border-gray-100'
                                }`}>
                                {/* Pet Photo */}
                                <div className="aspect-square w-full bg-gray-100 relative overflow-hidden">
                                    {pet.photos && pet.photos.length > 0 ? (
                                        <Image src={pet.photos[0]} alt={pet.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                                            <span className="text-6xl mb-3">🐾</span>
                                            <span className="text-sm font-medium">No Photo</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <h2 className="text-white text-2xl font-bold">{pet.name}</h2>
                                    </div>
                                </div>

                                {/* Pet Info */}
                                <div className="p-6 space-y-4">
                                    <h2 className="text-2xl font-bold text-gray-800 group-hover:text-pawpaths-brown transition-colors">{pet.name}</h2>

                                    {/* Stats */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-pawpaths-cream/30 border border-pawpaths-brown/10">
                                            <span className="w-8 h-8 flex items-center justify-center bg-pawpaths-cream text-pawpaths-brown rounded-full text-lg">🐾</span>
                                            <div className="flex-1">
                                                <span className="font-bold text-gray-800 block">{pet.type}</span>
                                                <span className="text-gray-600 text-xs">{pet.breed}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                                            <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-lg">⚖️</span>
                                            <div className="flex-1">
                                                <span className="font-bold text-gray-800 block">Stats</span>
                                                <span className="text-gray-600 text-xs">Age: {pet.age} {pet.ageUnit} | Weight: {pet.weight} kg</span>
                                            </div>
                                        </div>
                                        {pet.gender && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-100">
                                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold ${pet.gender?.toLowerCase() === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                    {pet.gender?.toLowerCase() === 'male' ? '♂' : '♀'}
                                                </span>
                                                <div className="flex-1">
                                                    <span className="font-bold text-gray-800 block">Gender</span>
                                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold inline-block ${pet.gender?.toLowerCase() === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                                        {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Important Notes for THIS Pet */}
                                    {pet.specialRequirements && (
                                        <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl border border-amber-200 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-amber-200 flex items-center gap-2 bg-amber-100/50">
                                                <FileText size={16} className="text-amber-700" />
                                                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Important Notes</h4>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-sm text-gray-700 leading-relaxed">{pet.specialRequirements}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Medical Conditions */}
                                    {pet.health?.medicalConditions && (
                                        <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-red-200 flex items-center gap-2 bg-red-100/50">
                                                <AlertCircle size={16} className="text-red-700" />
                                                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">Medical Conditions</h4>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-sm text-gray-700 leading-relaxed">{pet.health.medicalConditions}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dietary Requirements */}
                                    {pet.diet && (
                                        <div className="bg-yellow-50/80 backdrop-blur-sm rounded-2xl border border-yellow-200 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-yellow-200 flex items-center gap-2 bg-yellow-100/50">
                                                <span className="text-yellow-700">🍽️</span>
                                                <h4 className="text-xs font-bold text-yellow-900 uppercase tracking-wide">Dietary Requirements</h4>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-sm text-gray-700 leading-relaxed">{pet.diet}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Vaccination Warning */}
                                    {pet.health?.vaccinationUpToDate === false && (
                                        <div className="px-4 py-3 bg-red-100 text-red-800 text-sm rounded-xl flex items-center gap-3 font-bold border border-red-200">
                                            <AlertCircle size={18} />
                                            Vaccination Expired
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ROW 3: Documents Section (With Thumbnails) */}
                <div className="bg-[#f8f5ff]/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/60 border border-[#cdb8ff] overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-xl text-gray-600">
                            <FileText size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">Uploaded Documents</h3>
                    </div>
                    <div className="p-6">
                        {booking.customer?.documents?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {booking.customer.documents.map((doc, idx) => (
                                    <div key={idx} className="group relative aspect-square bg-gray-50 rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-pawpaths-brown/30 transition-all hover:shadow-lg">
                                        {/* Thumbnail Preview */}
                                        {doc.url && (doc.name.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
                                            <Image src={doc.url} alt={doc.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                <FileText size={48} className="text-gray-300 mb-2" />
                                                <span className="text-xs text-gray-500 font-medium px-2 text-center">{doc.type || 'Document'}</span>
                                            </div>
                                        )}
                                        {/* Overlay with Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <p className="text-white text-xs font-bold text-center px-2">{doc.name}</p>
                                            <div className="flex gap-2">
                                                <a href={doc.url} target="_blank" className="p-2 bg-white/90 hover:bg-white rounded-lg text-pawpaths-brown transition-all shadow-sm" title="Preview">
                                                    <Eye size={18} />
                                                </a>
                                                <a href={doc.url} download={doc.name} className="p-2 bg-white/90 hover:bg-white rounded-lg text-pawpaths-brown transition-all shadow-sm" title="Download">
                                                    <Download size={18} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No documents uploaded yet</p>
                            </div>
                        )}

                        {/* Required Documents Checklist */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <CheckCircle size={16} className="text-gray-400" />
                                Required Documents Status
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {['Pet Photo', 'Pet Passport', 'Vaccination Records', 'Rabies Certificate'].map((docType, idx) => {
                                    const hasDoc = booking.customer?.documents?.some(doc =>
                                        doc.type?.toLowerCase().includes(docType.toLowerCase()) ||
                                        doc.name?.toLowerCase().includes(docType.toLowerCase())
                                    );
                                    return (
                                        <div key={idx} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${hasDoc ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                            {hasDoc ? (
                                                <CheckCircle size={24} className="text-green-600" />
                                            ) : (
                                                <FileX size={24} className="text-gray-400" />
                                            )}
                                            <span className={`text-xs font-bold text-center ${hasDoc ? 'text-green-700' : 'text-gray-500'}`}>
                                                {docType}
                                            </span>
                                            {hasDoc && (
                                                <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Uploaded</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
