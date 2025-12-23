import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Service from '@/lib/models/Service';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await req.json();

        const updatedService = await Service.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            return NextResponse.json({ success: false, message: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Service updated successfully',
            data: updatedService
        });

    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json({
            success: false,
            message: 'Error updating service',
            error: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;

        // Hard delete for now (safe as Bookings store snapshot)
        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return NextResponse.json({ success: false, message: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({
            success: false,
            message: 'Error deleting service',
            error: error.message
        }, { status: 500 });
    }
}
