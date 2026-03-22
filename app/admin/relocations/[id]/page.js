import { getAdminBookingDetails } from '@/lib/actions/admin-booking-actions';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import JobCostingTable from '@/components/admin/JobCostingTable';
import TimelineWidget from '@/components/relocation/TimelineWidget';
import DocumentStatusSection from '@/components/admin/DocumentStatusSection';
import PetProfilesSection from '@/components/admin/PetProfilesSection';
import JourneyCard from '@/components/admin/JourneyCard';
import CustomerProfileCard from '@/components/admin/CustomerProfileCard';

export default async function BookingDetailPage(props) {
    try {
        const params = await props.params;

        const booking = await getAdminBookingDetails(params.id);

        if (!booking) {
            notFound();
        }

        // Fetch reference data for the pet drawer — non-critical, page still loads on failure
        let speciesList = [];
        let breedsList = [];
        let genderOptions = [];
        let countriesList = [];
        try {
            const supabase = await createClient();
            const [{ data: speciesData }, { data: breedsData }, { data: genderEnums }, { data: countriesData }] = await Promise.all([
                supabase.from('species').select('id, name').order('name'),
                supabase.from('breeds').select('id, name, species_id, default_image_path').order('name'),
                supabase.rpc('get_enum_values', { enum_name: 'pet_gender_enum' }),
                supabase.from('countries').select('id, name, iso_code').order('name'),
            ]);
            speciesList = speciesData || [];
            breedsList = breedsData || [];
            countriesList = countriesData || [];
            genderOptions = (genderEnums || []).map(v => {
                const val = v?.value ?? v;
                return { value: String(val), label: String(val).replace(/_/g, ' ') };
            });
        } catch (e) {
            console.warn('[BookingDetailPage] Non-critical: failed to load pet form reference data', e?.message);
        }

        return (
            <div className="min-h-screen bg-brand-text-02/5 p-8">
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
                    </div>
                </div>

                {/* 2. THE NEW GRID LAYOUT (2x3 Matrix) */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ROW 1: THE ACTORS */}

                    {/* Left Card: Customer Profile (inline-editable) */}
                    <CustomerProfileCard
                        customerInfo={booking.customerInfo}
                        bookingId={booking.id}
                        initialNotes={booking.internal_notes}
                    />

                    {/* Timeline Widget */}
                    <TimelineWidget bookingId={booking.id} />

                    {/* Right Card: Pet Details */}
                    <PetProfilesSection
                        initialPets={booking.pets}
                        bookingUUID={booking.id}
                        speciesList={speciesList || []}
                        breedsList={breedsList || []}
                        genderOptions={genderOptions}
                    />

                    {/* ROW 2: THE LOGISTICS */}

                    {/* Left Card: Journey & Timeline */}
                    <JourneyCard
                        bookingUUID={booking.id}
                        travelDetails={booking.travelDetails}
                        countriesList={countriesList}
                    />



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
    } catch (e) {
        // Output exactly what crashed during Server rendering!
        return (
            <div className="p-12 min-h-screen bg-brand-text-02/5 flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 max-w-2xl text-center">
                    <div className="text-4xl mb-4">🚨</div>
                    <h2 className="text-xl font-bold text-red-600 mb-4">Diagnostics: Render Crash</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Unable to load booking details. Please refresh or contact support.
                    </p>
                </div>
            </div>
        );
    }
}
