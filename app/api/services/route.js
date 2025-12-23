import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import CustomerType from '@/lib/models/CustomerType';

export async function GET(req) {
    try {
        await dbConnect();

        const searchParams = req.nextUrl.searchParams;
        const customerTypeId = searchParams.get('customerTypeId');
        const customerTypeCode = searchParams.get('customerTypeCode');
        const status = searchParams.get('status') || 'active';

        let query = { status };

        if (customerTypeCode) {
            const typeDoc = await CustomerType.findOne({ type_code: customerTypeCode });
            if (typeDoc) {
                query.customerTypes = typeDoc._id;
            } else {
                // If code provided but not found, return empty or error? 
                // Let's return empty to be safe
                return NextResponse.json({ success: true, count: 0, data: [] });
            }
        } else if (customerTypeId) {
            query.customerTypes = customerTypeId;
        }

        const services = await Service.find(query).sort({ isMandatory: -1, baseCost: 1 });

        return NextResponse.json({
            success: true,
            count: services.length,
            data: services
        });

    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json({
            success: false,
            message: 'Error fetching services',
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        const service = await Service.create(body);

        return NextResponse.json({
            success: true,
            message: 'Service created successfully',
            data: service
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating service:', error);
        return NextResponse.json({
            success: false,
            message: 'Error creating service',
            error: error.message
        }, { status: 500 });
    }
}
