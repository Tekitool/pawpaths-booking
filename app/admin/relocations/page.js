/**
 * @typedef {Object} BookingRow
 * @property {string} booking_number
 * @property {string} status
 * @property {string} service_type
 * @property {string} transport_mode
 * @property {string} scheduled_departure_date
 * @property {Object} customer
 * @property {string} customer.display_name
 * @property {string} customer.email
 * @property {Object} customer.contact_info
 * @property {Object} origin
 * @property {string} origin.name
 * @property {string} origin.iata_code
 * @property {string} origin.city
 * @property {Object} origin.country
 * @property {string} origin.country.iso_code
 * @property {Object} destination
 * @property {string} destination.name
 * @property {string} destination.iata_code
 * @property {string} destination.city
 * @property {Object} destination.country
 * @property {string} destination.country.iso_code
 * @property {Array<{pet: {name: string, weight_kg: number, species: {name: string}, breed: {name: string}}}>} pets
 */

import SearchBar from '../../../components/admin/SearchBar';
import BookingTable from '../../../components/admin/BookingTable';
import { Suspense } from 'react';
import YearFilter from '../../../components/admin/YearFilter';
import MonthFilter from '../../../components/admin/MonthFilter';
import TypeFilter from '../../../components/admin/TypeFilter';
import { createClient } from '@/lib/supabase/server';

export default async function BookingsPage(props) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const page = Number(searchParams?.page) || 1;
    const year = searchParams?.year || '';
    const month = searchParams?.month || '';
    const type = searchParams?.type || '';

    const supabase = await createClient();

    // Construct the Supabase Query
    let supabaseQuery = supabase
        .from('bookings')
        .select(`
            id,
            booking_number,
            status,
            service_type,
            transport_mode,
            scheduled_departure_date,
            customer:customer_id ( display_name, contact_info ),
            origin:origin_node_id ( name, iata_code, city, country:countries(iso_code) ),
            destination:destination_node_id ( name, iata_code, city, country:countries(iso_code) ),
            pets:booking_pets (
                pet:pet_id ( name, weight_kg, species(name), breed:breeds(name) )
            )
        `, { count: 'exact' });

    // Apply Filters
    if (query) {
        supabaseQuery = supabaseQuery.or(`booking_number.ilike.%${query}%,customer.display_name.ilike.%${query}%`);
    }

    if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        supabaseQuery = supabaseQuery.gte('scheduled_departure_date', startDate).lte('scheduled_departure_date', endDate);
    }

    if (type && type !== 'All') {
        supabaseQuery = supabaseQuery.eq('service_type', type);
    }

    // Pagination
    const pageSize = 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    supabaseQuery = supabaseQuery.range(from, to).order('created_at', { ascending: false });

    const { data, count, error } = await supabaseQuery;

    if (error) {
        console.error('Error fetching bookings:', error);
        // Handle error gracefully
        return <div className="p-8 text-system-color-01">Error loading bookings: {error.message}</div>;
    }

    // Map Data to UI Structure (matching BookingTable expectations)
    const bookings = data.map(b => ({
        bookingId: b.booking_number,
        status: b.status,
        customerInfo: {
            fullName: b.customer?.display_name || 'Unknown',
            email: b.customer?.contact_info?.email || '',
            phone: b.customer?.contact_info?.whatsapp || b.customer?.contact_info?.phone || ''
        },
        pets: (b.pets || []).map(p => ({
            name: p.pet?.name || 'Unknown',
            type: p.pet?.species?.name || 'Pet',
            breed: p.pet?.breed?.name || ''
        })),
        travelDetails: {
            originAirport: b.origin?.iata_code || b.origin?.city || 'TBD',
            originCountry: b.origin?.country?.iso_code || '',
            destinationAirport: b.destination?.iata_code || b.destination?.city || 'TBD',
            destinationCountry: b.destination?.country?.iso_code || '',
            travelDate: b.scheduled_departure_date,
            travelingWithPet: b.transport_mode === 'in_cabin'
        },
        customerType: {
            type_code: (b.service_type || '??').substring(0, 2).toUpperCase() + '-' + (b.transport_mode ? b.transport_mode.substring(0, 1).toUpperCase() : '?')
        },
        // Pass original fields for potential future use
        serviceType: b.service_type,
        transportMode: b.transport_mode
    }));

    const totalPages = Math.ceil((count || 0) / pageSize);

    return (
        <div className="min-h-screen bg-brand-text-02/5/50 p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-brand-text-02">Relocation Management</h1>
                    <p className="text-brand-text-02/80 mt-1">Complete pet journey management—from enquiry to delivery.</p>
                </div>
            </div>

            {/* Filters Bar - Bento Style */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-brand-text-02/20 flex flex-col md:flex-row items-center gap-3">
                <div className="flex-1 w-full min-w-[200px]">
                    <Suspense fallback={
                        <div className="block w-full rounded-2xl border border-brand-text-02/20 py-3 pl-10 text-sm bg-brand-text-02/5 animate-pulse">
                            <span className="text-brand-text-02/60">Loading search...</span>
                        </div>
                    }>
                        <SearchBar placeholder="Search..." />
                    </Suspense>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar p-1">
                    <div className="w-36 flex-shrink-0">
                        <Suspense fallback={null}>
                            <TypeFilter />
                        </Suspense>
                    </div>
                    <div className="w-32 flex-shrink-0">
                        <Suspense fallback={null}>
                            <YearFilter />
                        </Suspense>
                    </div>
                    <div className="w-36 flex-shrink-0">
                        <Suspense fallback={null}>
                            <MonthFilter />
                        </Suspense>
                    </div>
                </div>
            </div>

            {/* Table Container - Glassmorphism */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-brand-text-02/20 overflow-hidden">
                <Suspense fallback={<div className="p-8 text-center text-brand-text-02/80">Loading relocations...</div>}>
                    <BookingTable bookings={bookings} totalPages={totalPages} currentPage={page} />
                </Suspense>
            </div>
        </div>
    );
}
