import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function GET() {
    try {
        await dbConnect();

        // Get the latest booking
        const latestBooking = await Booking.findOne()
            .sort({ createdAt: -1 })
            .populate('customer.customerType');

        if (!latestBooking) {
            return NextResponse.json({
                success: false,
                message: 'No bookings found'
            });
        }

        return NextResponse.json({
            success: true,
            bookingId: latestBooking.bookingId,
            customerType: latestBooking.customer.customerType,
            travel: latestBooking.travel
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
