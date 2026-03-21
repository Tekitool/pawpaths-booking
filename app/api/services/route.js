import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request) {
    try {
        // Rate-limit public service catalog requests
        const ip = getClientIP(request);
        const { allowed, retryAfterMs } = await checkRateLimit(`services:${ip}`, RATE_LIMITS.api);
        if (!allowed) {
            return NextResponse.json(
                { success: false, message: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
            );
        }

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
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureException(error);
        return NextResponse.json(
            { success: false, message: 'Unable to load services. Please try again.' },
            { status: 500 }
        );
    }
}
