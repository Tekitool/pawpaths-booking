const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateServices() {
    console.log('🔧 Updating services with missing fields...\n');

    // Get all services
    const { data: services, error } = await supabase
        .from('service_catalog')
        .select('*');

    if (error) {
        console.error('❌ Error fetching services:', error.message);
        return;
    }

    console.log(`Found ${services.length} services to update\n`);

    // Update each service with base_cost (70% of base_price as a reasonable markup)
    for (const service of services) {
        const baseCost = Math.round(service.base_price * 0.7);

        const { error: updateError } = await supabase
            .from('service_catalog')
            .update({
                base_cost: baseCost
            })
            .eq('id', service.id);

        if (updateError) {
            console.error(`❌ Failed to update ${service.name}:`, updateError.message);
        } else {
            console.log(`✅ Updated ${service.name}: base_cost = ${baseCost}`);
        }
    }

    console.log('\n✨ Update complete!');
}

updateServices().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
