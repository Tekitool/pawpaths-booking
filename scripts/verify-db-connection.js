const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Try to use Service Role Key for verification to bypass RLS and see all data
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

console.log(`\n🔐 Using ${isServiceKey ? 'SERVICE_ROLE_KEY (Admin Access)' : 'ANON_KEY (RLS Restricted)'} for verification.`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableCount(tableName) {
    try {
        const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ ${tableName}: Error (${error.message})`);
            return 0;
        }

        const statusIcon = count > 0 ? '✅' : '⚠️ ';
        console.log(`${statusIcon} ${tableName}: ${count} records`);
        return count;
    } catch (err) {
        console.log(`❌ ${tableName}: Unexpected Error`);
        return 0;
    }
}

async function verify() {
    console.log('\n--- 📊 Database Population Report ---');

    const counts = {
        profiles: await checkTableCount('profiles'),
        entities: await checkTableCount('entities'),
        pets: await checkTableCount('pets'),
        bookings: await checkTableCount('bookings'),
        finance_documents: await checkTableCount('finance_documents'),
        finance_items: await checkTableCount('finance_items'),
    };

    console.log('\n--- 🧪 Integrity Check ---');
    if (counts.entities > 0 && counts.pets > 0 && counts.bookings > 0) {
        console.log('✅ SEEDING SUCCESSFUL: Data detected in all core tables.');
    } else {
        console.log('⚠️  SEEDING INCOMPLETE: Some tables are empty.');
        if (!isServiceKey) {
            console.log('   (Note: This might be due to RLS hiding data. Add SUPABASE_SERVICE_ROLE_KEY to .env.local to verify properly.)');
        }
    }
}

verify();
