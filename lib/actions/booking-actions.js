'use server';

import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getBookings(query = '', page = 1, year = '', month = '') {
    try {
        await dbConnect();
        const session = await auth();
        if (!session) throw new Error('Unauthorized');

        const limit = 10;
        const skip = (page - 1) * limit;

        const searchRegex = new RegExp(query, 'i');

        const filter = {
            $or: [
                { bookingId: searchRegex },
                { 'customerInfo.fullName': searchRegex },
                { 'customerInfo.email': searchRegex },
                { status: searchRegex },
                { 'pets.name': searchRegex },
                { 'travelDetails.originAirport': searchRegex },
                { 'travelDetails.destinationAirport': searchRegex },
                { 'travelDetails.originCountry': searchRegex },
                { 'travelDetails.destinationCountry': searchRegex },
            ]
        };

        if (year) {
            const yearNum = parseInt(year);
            let startDate, endDate;

            if (month) {
                const monthNum = parseInt(month);
                startDate = new Date(yearNum, monthNum - 1, 1);
                endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
            } else {
                startDate = new Date(yearNum, 0, 1);
                endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
            }

            filter['travelDetails.travelDate'] = {
                $gte: startDate,
                $lte: endDate
            };
        } else if (month) {
            // If year is not selected but month is, filter by month across all years
            filter['$expr'] = {
                $eq: [{ $month: '$travelDetails.travelDate' }, parseInt(month)]
            };
        }

        const bookings = await Booking.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Booking.countDocuments(filter);

        // Convert _id and dates to string to pass to client
        const serializedBookings = bookings.map(booking => {
            // Handle both formats: saved booking (travel) and legacy (travelDetails)
            const travelData = booking.travel || booking.travelDetails || {};
            const customerData = booking.customer || booking.customerInfo || {};

            return {
                ...booking,
                _id: booking._id.toString(),
                createdAt: booking.createdAt.toISOString(),
                updatedAt: booking.updatedAt.toISOString(),
                // Serialize travel details with fallback
                travel: travelData.departureDate ? {
                    ...travelData,
                    departureDate: new Date(travelData.departureDate).toISOString(),
                } : travelData,
                // Legacy support
                travelDetails: travelData.travelDate ? {
                    ...travelData,
                    travelDate: new Date(travelData.travelDate).toISOString(),
                } : travelData,
                // Ensure customer info is available
                customer: customerData,
                customerInfo: customerData,
                // Serialize status object properly
                status: booking.status ? {
                    current: booking.status.current || 'enquiry_received',
                    history: (booking.status.history || []).map(h => ({
                        ...h,
                        timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : null,
                        changedBy: h.changedBy ? h.changedBy.toString() : null,
                    }))
                } : { current: 'enquiry_received', history: [] },
                pets: (booking.pets || []).map(pet => ({
                    ...pet,
                    _id: pet._id ? pet._id.toString() : undefined,
                }))
            };
        });

        return { bookings: serializedBookings, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        throw new Error('Failed to fetch bookings');
    }
}

export async function updateBookingStatus(bookingId, newStatus) {
    try {
        await dbConnect();
        const session = await auth();
        if (!session) throw new Error('Unauthorized');

        await Booking.findOneAndUpdate(
            { bookingId },
            { status: newStatus },
            { new: true }
        );

        revalidatePath('/admin/bookings');
        revalidatePath(`/admin/bookings/${bookingId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to update status:', error);
        return { success: false, error: error.message };
    }
}

export async function getBookingById(bookingId) {
    try {
        await dbConnect();
        const session = await auth();
        if (!session) throw new Error('Unauthorized');

        const booking = await Booking.findOne({ bookingId }).lean();
        if (!booking) return null;

        // Serialize
        const travelData = booking.travel || booking.travelDetails || {};
        const customerData = booking.customer || booking.customerInfo || {};

        return {
            ...booking,
            _id: booking._id.toString(),
            createdAt: booking.createdAt.toISOString(),
            updatedAt: booking.updatedAt.toISOString(),
            // Serialize travel details with fallback
            travel: travelData.departureDate ? {
                ...travelData,
                departureDate: new Date(travelData.departureDate).toISOString(),
            } : travelData,
            // Legacy support
            travelDetails: travelData.travelDate ? {
                ...travelData,
                travelDate: new Date(travelData.travelDate).toISOString(),
            } : travelData,
            // Ensure customer info is available
            customer: customerData,
            customerInfo: customerData,
            // Serialize status object properly
            status: booking.status ? {
                current: booking.status.current || 'enquiry_received',
                history: (booking.status.history || []).map(h => ({
                    ...h,
                    timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : null,
                    changedBy: h.changedBy ? h.changedBy.toString() : null,
                }))
            } : { current: 'enquiry_received', history: [] },
            pets: (booking.pets || []).map(pet => ({
                ...pet,
                _id: pet._id ? pet._id.toString() : undefined,
            }))
        };
    } catch (error) {
        console.error('Failed to fetch booking:', error);
        return null;
    }
}

export async function getDashboardStats() {
    try {
        await dbConnect();
        const session = await auth();
        if (!session) throw new Error('Unauthorized');

        const totalBookings = await Booking.countDocuments();

        const activeStatuses = ['pet_collected', 'airport_checkin', 'departed', 'in_transit', 'arrived_clearing'];
        const activeRelocations = await Booking.countDocuments({ status: { $in: activeStatuses } });

        const pendingStatuses = ['enquiry_received', 'quote_sent', 'booking_confirmed', 'deposit_paid', 'awaiting_payment', 'vet_coordination', 'permit_pending', 'permit_approved', 'crate_sizing', 'docs_verified', 'flight_booked', 'flight_confirmed', 'manifest_cargo', 'baggage_avih', 'petc_cabin'];
        const pendingActions = await Booking.countDocuments({ status: { $in: pendingStatuses } });

        const completedStatuses = ['delivered', 'move_completed'];
        const completedRelocations = await Booking.countDocuments({ status: { $in: completedStatuses } });

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const serializedRecentBookings = recentBookings.map(booking => {
            // Handle both travel and travelDetails structures
            const travelData = booking.travel || booking.travelDetails || {};
            const customerData = booking.customer || booking.customerInfo || {};

            return {
                ...booking,
                _id: booking._id.toString(),
                createdAt: booking.createdAt.toISOString(),
                updatedAt: booking.updatedAt.toISOString(),
                // Handle legacy travelDetails
                travelDetails: travelData.travelDate ? {
                    ...travelData,
                    travelDate: new Date(travelData.travelDate).toISOString(),
                } : travelData.departureDate ? {
                    ...travelData,
                    travelDate: new Date(travelData.departureDate).toISOString(),
                    departureDate: new Date(travelData.departureDate).toISOString(),
                } : travelData,
                // Handle new travel structure
                travel: travelData.departureDate ? {
                    ...travelData,
                    departureDate: new Date(travelData.departureDate).toISOString(),
                } : travelData,
                // Handle customer info
                customerInfo: customerData,
                customer: customerData,
                pets: (booking.pets || []).map(pet => ({
                    ...pet,
                    _id: pet._id ? pet._id.toString() : undefined,
                })),
                status: booking.status ? {
                    current: booking.status.current || 'enquiry_received',
                    history: (booking.status.history || []).map(h => ({
                        ...h,
                        timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : null,
                        changedBy: h.changedBy ? h.changedBy.toString() : null,
                    }))
                } : { current: 'enquiry_received', history: [] },
            };
        });

        return {
            totalBookings,
            activeRelocations,
            pendingActions,
            completedRelocations,
            recentBookings: serializedRecentBookings
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Failed to fetch dashboard stats');
    }
}
