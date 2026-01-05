require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Use SERVICE_ROLE_KEY if available to bypass RLS, otherwise ANON
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

async function checkEntities() {
    console.log('Checking entities table...');

    // 1. Check count
    const { count, error: countError } = await supabase
        .from('entities')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting entities:', countError);
    } else {
        console.log(`Total entities in DB: ${count}`);
    }

    // 2. Fetch sample
    const { data, error } = await supabase
        .from('entities')
        .select('*, bookings!customer_id(total_amount)')
        .limit(5);

    if (error) {
        console.error('Error fetching entities:', error);
    } else {
        console.log(`Fetched ${data.length} sample entities.`);
        if (data.length > 0) {
            console.log('Sample entity:', JSON.stringify(data[0], null, 2));
            console.log('is_client values:', data.map(e => e.is_client));
        }
    }
}

checkEntities();
