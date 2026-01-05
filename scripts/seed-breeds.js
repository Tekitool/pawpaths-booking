const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DOG_BREEDS = [
    'Golden Retriever', 'Labrador Retriever', 'French Bulldog', 'German Shepherd',
    'Poodle', 'Bulldog', 'Beagle', 'Rottweiler', 'Dachshund', 'Corgi',
    'Australian Shepherd', 'Yorkshire Terrier', 'Boxer', 'Spaniel', 'Husky',
    'Chihuahua', 'Pug', 'Mixed Breed'
];

const CAT_BREEDS = [
    'Domestic Short Hair', 'Persian', 'Maine Coon', 'Siamese', 'Ragdoll',
    'Bengal', 'Sphynx', 'British Shorthair', 'Scottish Fold', 'Abyssinian',
    'Domestic Long Hair', 'Mixed Breed'
];

async function seedBreeds() {
    console.log('🌱 Seeding Breeds...');

    // 1. Get Species IDs
    const { data: species, error: sError } = await supabase.from('species').select('id, name');
    if (sError) throw sError;

    const dogId = species.find(s => s.name === 'Dog')?.id;
    const catId = species.find(s => s.name === 'Cat')?.id;

    if (!dogId || !catId) {
        console.error('❌ Could not find Dog or Cat species IDs');
        return;
    }

    const breedsToInsert = [];

    // Dogs
    DOG_BREEDS.forEach(name => {
        breedsToInsert.push({ species_id: dogId, name });
    });

    // Cats
    CAT_BREEDS.forEach(name => {
        breedsToInsert.push({ species_id: catId, name });
    });

    // 2. Insert
    const { error: insertError } = await supabase.from('breeds').upsert(breedsToInsert, { onConflict: 'species_id, name' });

    if (insertError) {
        console.error('❌ Error inserting breeds:', insertError);
    } else {
        console.log(`✅ Successfully seeded ${breedsToInsert.length} breeds.`);
    }
}

seedBreeds().catch(console.error);
