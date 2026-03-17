const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listDogBreeds() {
    try {
        // 1. Get Dog Species ID
        const { data: species, error: speciesError } = await supabase
            .from('species')
            .select('id, name')
            .ilike('name', 'dog')
            .single();

        if (speciesError) {
            console.error('Error fetching species:', speciesError);
            return;
        }

        console.log(`Checking breeds for Species: ${species.name} (ID: ${species.id})\n`);

        // 2. Get Breeds
        const { data: breeds, error: breedsError } = await supabase
            .from('breeds')
            .select('id, name, default_image_path')
            .eq('species_id', species.id)
            .order('name');

        if (breedsError) {
            console.error('Error fetching breeds:', breedsError);
            return;
        }

        if (breeds.length === 0) {
            console.log('No breeds found for dogs.');
        } else {
            console.log('START_BREED_LIST');
            breeds.forEach(b => {
                console.log(`${b.id}|${b.name}|${b.default_image_path || 'NULL'}`);
            });
            console.log('END_BREED_LIST');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

listDogBreeds();
