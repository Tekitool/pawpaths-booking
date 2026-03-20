'use server';
import { createClient } from '@/lib/supabase/server';

import { unstable_noStore as noStore } from 'next/cache';

export async function getPets({ page = 1, pageSize = 15, query = '' } = {}) {
    noStore();
    const supabase = await createClient();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
        .from('pets')
        .select(`
            *,
            species:species_id(name),
            breed:breed_id(name, is_brachycephalic),
            owner:owner_id(display_name, id)
        `, { count: 'exact' })
        .is('deleted_at', null);

    if (query) {
        q = q.or(`name.ilike.%${query}%,microchip_id.ilike.%${query}%`);
    }

    const { data, count, error } = await q
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching pets:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    return {
        data: data || [],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
    };
}
