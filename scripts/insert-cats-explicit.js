const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const newCats = [
    {
        name: 'Norwegian Forest Cat',
        is_brachycephalic: false,
        is_restricted: false,
        iata_crate_rule: 'Standard Feline',
        avg_weight_kg: 6.0,
        is_verified: true
    },
    {
        name: 'Birman',
        is_brachycephalic: false,
        is_restricted: false,
        iata_crate_rule: 'Standard Feline',
        avg_weight_kg: 4.5,
        is_verified: true
    },
    {
        name: 'Oriental Shorthair',
        is_brachycephalic: false,
        is_restricted: false,
        iata_crate_rule: 'Standard Feline',
        avg_weight_kg: 4.0,
        is_verified: true
    },
    {
        name: 'Cornish Rex',
        is_brachycephalic: false,
        is_restricted: false,
        iata_crate_rule: 'Standard Feline',
        avg_weight_kg: 3.5,
        is_verified: true
    },
    {
        name: 'Ragamuffin',
        is_brachycephalic: false,
        is_restricted: false,
        iata_crate_rule: 'Standard Feline',
        avg_weight_kg: 6.5,
        is_verified: true
    }
];

async function insertCats() {
    const { data: species } = await supabase.from('species').select('id').eq('name', 'Cat').single();
    if (!species) {
        console.error('Cat species not found!');
        return;
    }

    // Get max ID
    const { data: breeds, error: maxIdError } = await supabase
        .from('breeds')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

    let nextId = breeds.length > 0 ? breeds[0].id + 1 : 1;

    const payload = newCats.map(cat => ({
        ...cat,
        id: nextId++,
        species_id: species.id
    }));

    const { data, error } = await supabase
        .from('breeds')
        .insert(payload)
        .select();

    if (error) {
        console.error('Error adding breeds:', JSON.stringify(error, null, 2));
    } else {
        console.log('Successfully added breeds:', data.map(b => b.name));
    }
}

insertCats();
