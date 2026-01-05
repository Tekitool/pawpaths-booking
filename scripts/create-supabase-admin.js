const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function debugAndCreateAdmin() {
    console.log('--- Debugging Profiles ---');
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('role')
        .limit(10);

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError.message);
    } else {
        console.log('Existing roles in DB:', profiles.map(p => p.role));
    }
    console.log('--------------------------');

    const email = 'admin@pawpathsae.com';
    const password = 'PawPaths2025!';
    const fullName = 'System Admin';

    // 1. Create or Get User
    let userId;
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const existingUser = users?.find(u => u.email === email);

    if (existingUser) {
        console.log('User already exists:', existingUser.id);
        userId = existingUser.id;
    } else {
        console.log(`Creating user ${email}...`);
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (createError) {
            console.error('Error creating user:', createError.message);
            process.exit(1);
        }
        userId = user.id;
        console.log('User created:', userId);
    }

    // 2. Update Profile
    // Try 'admin' first, if fails, try 'super_admin'
    const rolesToTry = ['admin', 'super_admin', 'manager', 'staff'];

    for (const role of rolesToTry) {
        console.log(`Attempting to set role to '${role}'...`);
        const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                full_name: fullName,
                role: role
            });

        if (!updateError) {
            console.log(`Success! Role set to '${role}'`);
            console.log('---------------------------------------------------');
            console.log('Email:    admin@pawpathsae.com');
            console.log('Password: PawPaths2025!');
            console.log('---------------------------------------------------');
            return;
        } else {
            console.log(`Failed to set '${role}':`, updateError.message);
        }
    }

    console.error('Could not set admin role. Check database constraints.');
}

debugAndCreateAdmin();
