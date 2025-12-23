import SearchBar from '@/components/admin/SearchBar';
import BookingTable from '@/components/admin/BookingTable';
import { getBookings } from '@/lib/actions/booking-actions';
import { Suspense } from 'react';
import YearFilter from '@/components/admin/YearFilter';
import MonthFilter from '@/components/admin/MonthFilter';
import TypeFilter from '@/components/admin/TypeFilter';

export default async function BookingsPage(props) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const page = Number(searchParams?.page) || 1;
    const year = searchParams?.year || '';
    const month = searchParams?.month || '';
    const type = searchParams?.type || '';

    const { bookings, totalPages } = await getBookings(query, page, year, month, type);

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage all your pet relocation requests</p>
                </div>
            </div>

            {/* Filters Bar - Bento Style */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-3">
                <div className="flex-1 w-full min-w-[200px]">
                    <Suspense fallback={
                        <div className="block w-full rounded-2xl border border-gray-200 py-3 pl-10 text-sm bg-gray-50 animate-pulse">
                            <span className="text-gray-400">Loading search...</span>
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
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading bookings...</div>}>
                    <BookingTable bookings={bookings} totalPages={totalPages} currentPage={page} />
                </Suspense>
            </div>
        </div>
    );
}
