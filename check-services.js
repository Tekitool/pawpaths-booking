const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // remove quotes
            env[key] = value;
        }
    });
} catch (e) {
    console.error('Could not read .env.local', e);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    console.log('Found keys:', Object.keys(env));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkServices() {
    console.log('Checking service_catalog...');
    const { data, error } = await supabase
        .from('service_catalog')
        .select('id, name, scope, service_type, transport_mode, is_mandatory, is_recommended')
        .order('name');

    if (error) {
        console.error('Error fetching services:', error);
    } else {
        console.log('Total Services:', data.length);
        // Filter to show what we are interested in (per_pet vs per_booking)
        const perPet = data.filter(s => s.scope === 'per_pet');
        const perBooking = data.filter(s => s.scope === 'per_booking' || !s.scope);

        console.log('\n--- PER PET SERVICES ---');
        if (perPet.length === 0) console.log('No services with scope = per_pet');
        else console.table(perPet.map(s => ({ name: s.name, scope: s.scope, type: s.service_type })));

        console.log('\n--- PER BOOKING SERVICES ---');
        console.table(perBooking.map(s => ({ name: s.name, scope: s.scope || 'NULL (default)', type: s.service_type })));
    }
}

checkServices();
