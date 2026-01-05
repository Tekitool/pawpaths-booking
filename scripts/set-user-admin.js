require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdminRole() {
    const email = 'hashif@pawpathsae.com';
    console.log(`Setting admin role for: ${email}`);

    // Update profiles table
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'super_admin' })
        .eq('email', email)
        .select();

    if (error) {
        console.error('Error updating profile role:', error.message);
        return;
    }

    if (data.length === 0) {
        console.log('User profile not found. The trigger might not have run yet or user does not exist.');
    } else {
        console.log('User role updated to admin:', data[0]);
    }
}

setAdminRole();
