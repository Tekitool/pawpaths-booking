import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const customerTypeCode = searchParams.get('customerTypeCode'); // e.g., 'EXP', 'IMP', 'LOCL'
        const transportMode = searchParams.get('transportMode'); // e.g., 'manifest_cargo', 'in_cabin'
        const status = searchParams.get('status');

        console.log('Fetching services for:', { customerTypeCode, transportMode, status });

        let query = supabase
            .from('service_catalog')
            .select(`
                *,
                category:service_categories(name, display_order)
            `)
            .order('base_price', { ascending: true });

        if (status === 'active') {
            query = query.eq('is_active', true);
        }

        // Execute query
        const { data: services, error } = await query;

        if (error) throw error;

        // If filtering for booking wizard (customerTypeCode is present)
        if (customerTypeCode) {
            const filteredServices = services.filter(service => {
                const tags = service.applicability || [];

                // 1. Must match Customer Type (EXP, IMP, LOCL)
                const matchesType = tags.includes(customerTypeCode);

                // 2. If Transport Mode is provided, check if service is restricted to specific modes
                // If a service has NO transport mode tags, it applies to all.
                // If it HAS transport mode tags, it must match the selected one.
                const transportModes = ['manifest_cargo', 'in_cabin', 'excess_baggage', 'ground_transport', 'private_charter'];
                const serviceModes = tags.filter(t => transportModes.includes(t));

                const matchesMode = serviceModes.length === 0 || (transportMode && serviceModes.includes(transportMode));

                return matchesType && matchesMode;
            });

            return NextResponse.json({
                success: true,
                count: filteredServices.length,
                data: filteredServices
            });
        }

        // Return all services (for admin page)
        return NextResponse.json({
            success: true,
            count: services.length,
            data: services
        });

        return NextResponse.json({
            success: true,
            count: filteredServices.length,
            data: filteredServices
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
