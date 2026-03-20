import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: services, error } = await supabase
            .from('service_catalog')
            .select(`
                *,
                category:service_categories(name, display_order)
            `)
            .is('deleted_at', null)
            .order('base_price', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            count: services.length,
            data: services,
        });

    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching services', error: error.message },
            { status: 500 }
        );
    }
}
