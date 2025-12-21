'use server';

import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getBookings(query = '', page = 1) {
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
            ]
        };

        const bookings = await Booking.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Booking.countDocuments(filter);

        // Convert _id and dates to string to pass to client
        const serializedBookings = bookings.map(booking => ({
            ...booking,
            _id: booking._id.toString(),
            createdAt: booking.createdAt.toISOString(),
            updatedAt: booking.updatedAt.toISOString(),
            travelDetails: {
                ...booking.travelDetails,
                travelDate: new Date(booking.travelDetails.travelDate).toISOString(),
            },
            pets: booking.pets.map(pet => ({
                ...pet,
                _id: pet._id ? pet._id.toString() : undefined,
            }))
        }));

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
        return { success: true };
    } catch (error) {
        console.error('Failed to update status:', error);
        return { success: false, error: error.message };
    }
}
