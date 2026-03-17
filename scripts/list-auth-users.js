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

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function listAuthUsers() {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    const users = data.users;
    console.log(`\nTotal accounts: ${users.length}\n`);
    console.log('─'.repeat(80));

    users.forEach((u, i) => {
        const provider = u.app_metadata?.provider || 'email';
        const confirmed = u.email_confirmed_at ? '✓ confirmed' : '✗ unconfirmed';
        const lastSignIn = u.last_sign_in_at
            ? new Date(u.last_sign_in_at).toLocaleString()
            : 'never';
        console.log(`[${i + 1}] ${u.email || '(no email)'}`);
        console.log(`    ID:         ${u.id}`);
        console.log(`    Provider:   ${provider}  |  Email: ${confirmed}`);
        console.log(`    Role:       ${u.role}`);
        console.log(`    Created:    ${new Date(u.created_at).toLocaleString()}`);
        console.log(`    Last login: ${lastSignIn}`);
        console.log('─'.repeat(80));
    });
}

listAuthUsers();
