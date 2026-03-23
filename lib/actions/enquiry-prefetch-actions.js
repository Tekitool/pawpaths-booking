'use server';

// ─── Enquiry Wizard Prefetch Actions ──────────────────────────────────────────
// These server actions are called from the client in the background to
// pre-warm the Zustand cache WHILE the user interacts with earlier steps.
// They run on the server (not in the browser), so we get fast DB access
// without exposing Supabase credentials or increasing bundle size.

import { createClient } from '@/lib/supabase/server';

/**
 * Prefetch all data required by Step 2 (Pets).
 * Fetches species, breeds, and gender options in parallel.
 *
 * Called ~1 second after Step 1 mounts (background idle time).
 * Results are stored in Zustand `_cache` and consumed by Step2Pets.
 */
export async function prefetchBreedData() {
    const supabase = await createClient();

    const [speciesRes, breedsRes, genderRes] = await Promise.all([
        supabase.from('species').select('id, name, iata_code').order('name'),
        supabase.from('breeds').select('id, species_id, name, default_image_path').order('name'),
        supabase.rpc('get_enum_values', { enum_name: 'pet_gender_enum' }),
    ]);

    // Build gender options with fallback
    let genderOptions;
    if (genderRes.error || !genderRes.data?.length) {
        genderOptions = [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Male_Neutered', label: 'Male Neutered' },
            { value: 'Female_Spayed', label: 'Female Spayed' },
            { value: 'Unknown', label: 'Unknown' },
        ];
    } else {
        genderOptions = genderRes.data.map((item) => ({
            value: item.value,
            label: item.value.replace(/_/g, ' '),
        }));
    }

    return {
        species: speciesRes.data || [],
        breeds: breedsRes.data || [],
        genderOptions,
    };
}

/**
 * Prefetch services available for a given travel + pet configuration.
 * Mirrors the logic in `useAvailableServices` but runs server-side.
 *
 * Called in the background when the user has selected a pet species
 * in Step 2, so Step 3 can mount with data already cached.
 *
 * @param {string} serviceType  - 'export' | 'import' | 'local' | 'transit'
 * @param {string} transportMode - e.g. 'manifest_cargo'
 * @param {string[]} petSpeciesNames - e.g. ['Dog', 'Cat']
 */
export async function prefetchServices(serviceType, transportMode, petSpeciesNames) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_valid_services', {
        target_type: serviceType,
        target_mode: transportMode || 'manifest_cargo',
        pet_species: petSpeciesNames || [],
    });

    if (error) {
        console.error('[prefetchServices] RPC error:', error.message);
        return [];
    }

    return data || [];
}
