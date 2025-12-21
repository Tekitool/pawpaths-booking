import SearchBar from '@/components/admin/SearchBar';
import BookingTable from '@/components/admin/BookingTable';
import { getBookings } from '@/lib/actions/booking-actions';
import { Suspense } from 'react';

export default async function BookingsPage(props) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    const { bookings, totalPages } = await getBookings(query, currentPage);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-6">
                <SearchBar placeholder="Search bookings..." />
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <BookingTable bookings={bookings} totalPages={totalPages} currentPage={currentPage} />
            </Suspense>

            {/* Pagination could go here */}
        </div>
    );
}
