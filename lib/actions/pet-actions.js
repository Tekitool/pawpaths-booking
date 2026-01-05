'use server';
import { createClient } from '@/lib/supabase/server';

import { unstable_noStore as noStore } from 'next/cache';

export async function getPets() {
    noStore();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('pets')
        .select(`
            *,
            species:species_id(name),
            breed:breed_id(name, is_brachycephalic),
            owner:owner_id(display_name, id)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pets:', error);
        return [];
    }

    return data;
}
