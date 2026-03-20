'use server';

import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function getCustomers({ page = 1, pageSize = 15, query = '' } = {}) {
    noStore();
    const supabase = await createClient();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
        .from('entities')
        .select('*, bookings!customer_id(total_amount, booking_number, created_at)', { count: 'exact' })
        .eq('is_client', true)
        .is('deleted_at', null);

    if (query) {
        q = q.or(`display_name.ilike.%${query}%,contact_info->>email.ilike.%${query}%`);
    }

    const { data, count, error } = await q
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching customers:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    return {
        data: data || [],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
    };
}
