import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Check DB connection by making a lightweight query
        const { error } = await supabase.from('species').select('count', { count: 'exact', head: true });

        const dbStatus = error ? 'disconnected' : 'connected';

        if (error) {
            console.error('Health Check DB Error:', error);
        }

        return NextResponse.json({
            status: error ? 'error' : 'ok',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            environment: process.env.NODE_ENV
        }, { status: error ? 500 : 200 });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    }
}
