const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    // 1. Find all tables that might hold user info
    const candidates = ['admin_users', 'users', 'profiles', 'customers', 'staff', 'members', 'accounts', 'contacts'];

    for (const table of candidates) {
        const { data, error } = await s.from(table).select('*').limit(2);

        if (error) {
            console.log(`[SKIP] ${table} — ${error.message}`);
            continue;
        }

        console.log(`\n========================================`);
        console.log(`TABLE: ${table}`);
        console.log(`========================================`);

        if (!data || data.length === 0) {
            console.log('  (table exists but is empty)');
            continue;
        }

        // Print column names and types from first row
        const sample = data[0];
        const keys = Object.keys(sample);
        console.log(`COLUMNS (${keys.length} total):`);
        keys.forEach(k => {
            const val = sample[k];
            const type = val === null ? 'null' : typeof val;
            console.log(`  - ${k.padEnd(30)} type: ${type}  |  sample: ${String(val).substring(0, 60)}`);
        });
    }

    // 2. Also inspect Supabase auth.users metadata fields
    console.log('\n\n========================================');
    console.log('TABLE: auth.users (Supabase Built-in)');
    console.log('========================================');
    const { data: authData, error: authErr } = await s.auth.admin.listUsers({ perPage: 1 });
    if (authErr) {
        console.log('Error:', authErr.message);
        return;
    }
    if (authData.users.length > 0) {
        const u = authData.users[0];
        console.log('Top-level fields:');
        Object.keys(u).forEach(k => {
            const val = u[k];
            const display = typeof val === 'object' ? JSON.stringify(val).substring(0, 80) : String(val).substring(0, 80);
            console.log(`  - ${k.padEnd(30)} | ${display}`);
        });
    }
}

run();
