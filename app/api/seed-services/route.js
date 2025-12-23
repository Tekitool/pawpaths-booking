import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import CustomerType from '@/lib/models/CustomerType';

export async function GET() {
    try {
        await dbConnect();

        // 1. Fetch Customer Types
        const types = await CustomerType.find({});
        const typeMap = types.reduce((acc, type) => {
            acc[type.type_code] = type._id;
            return acc;
        }, {});

        if (Object.keys(typeMap).length === 0) {
            return NextResponse.json({ success: false, message: 'No Customer Types found. Please seed them first.' }, { status: 400 });
        }

        // 2. Define Services
        const services = [
            // Import Services (IM-U, IM-A)
            {
                name: 'Customs Clearance',
                shortDescription: 'Official customs processing for pet entry.',
                longDescription: 'Complete handling of all customs formalities upon arrival. Includes document verification, duty payments, and release authorization.',
                requirements: 'Original Passport, Airway Bill, Health Certificate',
                baseCost: 800,
                isMandatory: true,
                icon: 'FileText',
                customerTypes: [typeMap['IM-U'], typeMap['IM-A']]
            },
            {
                name: 'Home Delivery',
                shortDescription: 'Safe transport from airport to your door.',
                longDescription: 'Climate-controlled pet taxi service from the airport cargo terminal directly to your residence.',
                requirements: 'Valid UAE Address, Receiver Contact Details',
                baseCost: 450,
                isMandatory: false,
                icon: 'Truck',
                customerTypes: [typeMap['IM-U'], typeMap['IM-A']]
            },
            {
                name: 'Vet Inspection',
                shortDescription: 'Mandatory arrival health check.',
                longDescription: 'Coordination with Ministry of Climate Change and Environment (MOCCAE) vet for arrival inspection.',
                requirements: 'Pet must be present',
                baseCost: 500,
                isMandatory: true,
                icon: 'Stethoscope',
                customerTypes: [typeMap['IM-U']] // Maybe mandatory for all imports, but user said IM-U specifically in prompt example
            },
            {
                name: 'UAE Vet Clearance',
                shortDescription: 'Official veterinary clearance for entry.',
                longDescription: 'Processing of veterinary release documents required for all pets entering the UAE.',
                requirements: 'Import Permit, Vaccination Record',
                baseCost: 350,
                isMandatory: true,
                icon: 'CheckCircle',
                customerTypes: [typeMap['IM-A'], typeMap['IM-U']]
            },

            // Export Services (EX-A, EX-U)
            {
                name: 'IATA Crate Rental',
                shortDescription: 'Airline-approved travel crate.',
                longDescription: 'Rental of a fully IATA-compliant travel crate sized perfectly for your pet. Includes water bowls and absorbent bedding.',
                requirements: 'Pet Measurements (Length, Height, Width)',
                baseCost: 300,
                isMandatory: false,
                icon: 'Box',
                customerTypes: [typeMap['EX-A'], typeMap['EX-U']]
            },
            {
                name: 'Export Permit',
                shortDescription: 'MOCCAE Export Health Certificate.',
                longDescription: 'Obtaining the official Export Health Certificate from the UAE Ministry. Valid for 30 days.',
                requirements: 'Vaccination Book, Microchip Certificate',
                baseCost: 600,
                isMandatory: true,
                icon: 'FileText',
                customerTypes: [typeMap['EX-A'], typeMap['EX-U']]
            },
            {
                name: 'Airport Assistance',
                shortDescription: 'Check-in and porter service.',
                longDescription: 'Professional assistance at the airport departure terminal. We help with check-in, crate sealing, and porter services.',
                requirements: 'Flight Ticket',
                baseCost: 250,
                isMandatory: false,
                icon: 'User',
                customerTypes: [typeMap['EX-A']]
            },
            {
                name: 'Flight Booking',
                shortDescription: 'Cargo flight reservation.',
                longDescription: 'Booking of pet cargo space on the most direct and pet-friendly airlines.',
                requirements: 'Preferred Travel Dates',
                baseCost: 1500,
                isMandatory: false, // Could be mandatory for EX-U
                icon: 'Plane',
                customerTypes: [typeMap['EX-U']]
            },

            // Local Services (LOCL)
            {
                name: 'Inter-Emirate Pet Taxi',
                shortDescription: 'Transport between UAE cities.',
                longDescription: 'Door-to-door transport between any two cities in the UAE (e.g., Dubai to Abu Dhabi).',
                requirements: 'Pickup and Drop-off Locations',
                baseCost: 350,
                isMandatory: false,
                icon: 'Car',
                customerTypes: [typeMap['LOCL']]
            },
            {
                name: 'Local Boarding',
                shortDescription: 'Temporary stay at partner kennels.',
                longDescription: 'Overnight boarding at our trusted partner facilities. Includes feeding, walking, and 24/7 supervision.',
                requirements: 'Vaccination Up-to-Date',
                baseCost: 150,
                isMandatory: false,
                icon: 'Home',
                customerTypes: [typeMap['LOCL']]
            }
        ];

        const results = [];

        for (const service of services) {
            // Remove undefined customerTypes (if a type wasn't found)
            service.customerTypes = service.customerTypes.filter(Boolean);

            const updatedService = await Service.findOneAndUpdate(
                { name: service.name },
                service,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            results.push(updatedService);
        }

        return NextResponse.json({
            success: true,
            message: 'Services seeded successfully',
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error seeding services',
            error: error.message
        }, { status: 500 });
    }
}
