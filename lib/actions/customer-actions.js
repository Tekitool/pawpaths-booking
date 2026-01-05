'use server';

import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function getCustomers() {
    noStore();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('entities')
        .select('*, bookings!customer_id(total_amount)')
        .eq('is_client', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }

    return data;
}
