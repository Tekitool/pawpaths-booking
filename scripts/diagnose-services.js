const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseServices() {
    console.log('🔍 Diagnosing Services Table...\n');

    // 1. Check if service_catalog table exists and count rows
    const { data: services, error, count } = await supabase
        .from('service_catalog')
        .select('*', { count: 'exact' })
        .limit(5);

    if (error) {
        console.error('❌ Error fetching services:', error.message);
        return;
    }

    console.log(`📊 Total Services in Database: ${count}`);

    if (count === 0) {
        console.log('\n⚠️  NO SERVICES FOUND!');
        console.log('💡 Run the seed script to populate services:');
        console.log('   node scripts/seed-services.js\n');
        return;
    }

    console.log('\n📋 Sample Services (first 5):\n');
    services.forEach((service, i) => {
        console.log(`${i + 1}. ${service.name || service.code}`);
        console.log(`   ID: ${service.id}`);
        console.log(`   Code: ${service.code}`);
        console.log(`   Base Price: ${service.base_price}`);
        console.log(`   Base Cost: ${service.base_cost || 'N/A'}`);
        console.log(`   Mandatory: ${service.is_mandatory}`);
        console.log(`   Active: ${service.is_active}`);
        console.log(`   Applicability: ${service.applicability?.join(', ') || 'None'}`);
        console.log('');
    });

    // 2. Test the API endpoint simulation
    console.log('🧪 Testing field mapping...');
    const sampleService = services[0];
    console.log('\nDatabase Fields (snake_case):');
    console.log('- name:', sampleService.name);
    console.log('- base_price:', sampleService.base_price);
    console.log('- base_cost:', sampleService.base_cost);
    console.log('- is_mandatory:', sampleService.is_mandatory);
    console.log('- is_active:', sampleService.is_active);
    console.log('- short_description:', sampleService.short_description || 'NULL');

    console.log('\n✅ Diagnosis complete!');
}

diagnoseServices().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
