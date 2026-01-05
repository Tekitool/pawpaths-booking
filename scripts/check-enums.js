require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEnums() {
    const { data, error } = await supabase.rpc('get_enum_values', { enum_type: 'user_role_type' });

    if (error) {
        // Fallback if RPC doesn't exist (it might not be in the DB yet)
        console.error('RPC error:', error.message);

        // Try inserting a dummy profile with a bad role to see the error message details? No, that's what we just saw.
        // Let's try to fetch a profile and see its role.
        const { data: profiles } = await supabase.from('profiles').select('role').limit(1);
        console.log('Sample profile role:', profiles?.[0]?.role);
        return;
    }

    console.log('Enum values:', data);
}

checkEnums();
