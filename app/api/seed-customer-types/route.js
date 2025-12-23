import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CustomerType from '@/lib/models/CustomerType';

export async function GET() {
    try {
        await dbConnect();

        const customerTypes = [
            { type_code: 'EX-A', description: 'Export - UAE to Overseas (Owner Traveling)' },
            { type_code: 'EX-U', description: 'Export - UAE to Overseas (Owner Not Traveling)' },
            { type_code: 'IM-A', description: 'Import - Overseas to UAE (Owner Traveling)' },
            { type_code: 'IM-U', description: 'Import - Overseas to UAE (Owner Not Traveling)' },
            { type_code: 'LOCL', description: 'Local - Relocation inside UAE' }
        ];

        const results = [];

        for (const type of customerTypes) {
            const updatedType = await CustomerType.findOneAndUpdate(
                { type_code: type.type_code },
                type,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            results.push(updatedType);
        }

        return NextResponse.json({
            success: true,
            message: 'Customer types seeded successfully',
            data: results
        });

    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error seeding customer types',
            error: error.message
        }, { status: 500 });
    }
}
