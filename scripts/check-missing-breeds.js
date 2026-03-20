const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const breedsToCheck = [
    'Norwegian Forest Cat',
    'Birman',
    'Oriental Shorthair',
    'Cornish Rex',
    'Ragamuffin'
];

async function checkBreeds() {
    const { data: species } = await supabase.from('species').select('id').eq('name', 'Cat').single();
    if (!species) {
        console.error('Cat species not found!');
        return;
    }

    const { data: foundBreeds, error } = await supabase
        .from('breeds')
        .select('name')
        .eq('species_id', species.id)
        .in('name', breedsToCheck);

    if (error) {
        console.error('Error checking breeds:', error);
    } else {
        const foundNames = foundBreeds.map(b => b.name);
        console.log('Found Breeds:', foundNames);
        const missing = breedsToCheck.filter(name => !foundNames.includes(name));
        console.log('Missing Breeds:', missing);
    }
}

checkBreeds();
