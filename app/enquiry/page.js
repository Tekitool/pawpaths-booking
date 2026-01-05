import React from 'react';
import BookingWizard from '@/components/booking/BookingWizard';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Start Your Relocation Enquiry | Pawpaths',
};

export default async function NewBookingPage() {
    const supabase = await createClient();

    // Fetch Species
    const { data: speciesList, error: speciesError } = await supabase
        .from('species')
        .select('id, name, iata_code')
        .order('name');

    if (speciesError) {
        console.error('Error fetching species:', speciesError);
    }

    // Fetch Breeds
    const { data: breedsList, error: breedsError } = await supabase
        .from('breeds')
        .select('id, species_id, name')
        .order('name');

    if (breedsError) {
        console.error('Error fetching breeds:', breedsError);
    }

    // Fetch Countries
    const { data: countriesList, error: countriesError } = await supabase
        .from('countries')
        .select('id, name, iso_code')
        .order('name');

    if (countriesError) {
        console.error('Error fetching countries:', countriesError);
    }

    // Fetch Pet Gender Enum
    let genderOptions = [];
    const { data: genderData, error: genderError } = await supabase
        .rpc('get_enum_values', { enum_name: 'pet_gender_enum' });

    if (genderError) {
        console.error('Error fetching gender enum:', genderError);
        // Fallback if RPC fails or doesn't exist yet
        genderOptions = [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Male_Neutered', label: 'Male Neutered' },
            { value: 'Female_Spayed', label: 'Female Spayed' },
            { value: 'Unknown', label: 'Unknown' }
        ];
    } else {
        genderOptions = genderData.map(item => ({
            value: item.value,
            label: item.value.replace(/_/g, ' ') // Format 'Male_Neutered' -> 'Male Neutered'
        }));
    }


    return (
        <BookingWizard
            speciesList={speciesList || []}
            breedsList={breedsList || []}
            countriesList={countriesList || []}
            genderOptions={genderOptions}
        />
    );
}
