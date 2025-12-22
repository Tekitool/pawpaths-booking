import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'pawpaths-secure-seed-2025') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        await dbConnect();
        const latestBooking = await Booking.findOne().sort({ createdAt: -1 }).lean();

        return NextResponse.json({
            message: 'Latest booking retrieved',
            booking: latestBooking
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
