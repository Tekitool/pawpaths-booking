const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetPasswords() {
    const users = [
        { email: 'admin@pawpathsae.com', password: 'PawPaths2025!', role: 'super_admin' },
        { email: 'hashif@pawpathsae.com', password: 'PawPaths2025!', role: 'super_admin' }
    ];

    for (const u of users) {
        console.log(`Setting password for ${u.email}...`);

        // 1. Find user in Auth
        const { data: { users: authUsers }, error: listError } = await supabase.auth.admin.listUsers();
        const authUser = authUsers.find(au => au.email === u.email);

        if (!authUser) {
            console.log(`User ${u.email} not found in Auth, creating...`);
            const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { full_name: u.email === 'admin@pawpathsae.com' ? 'System Admin' : 'Hashif Haneef' }
            });
            if (createError) {
                console.error(`Error creating ${u.email}:`, createError.message);
                continue;
            }
            console.log(`User ${u.email} created with ID ${user.id}`);
        } else {
            // Update password
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                authUser.id,
                { password: u.password }
            );
            if (updateError) {
                console.error(`Error updating password for ${u.email}:`, updateError.message);
            } else {
                console.log(`Password updated for ${u.email}`);
            }
        }

        // 2. Ensure Profile exists and has correct role
        const { data: profile } = await supabase.from('profiles').select('id').eq('email', u.email).single();

        const profileData = {
            email: u.email,
            role: u.role,
            full_name: u.email === 'admin@pawpathsae.com' ? 'System Admin' : 'Hashif Haneef'
        };

        if (profile) {
            const { error: pUpdateError } = await supabase.from('profiles').update(profileData).eq('id', profile.id);
            if (pUpdateError) console.error(`Error updating profile for ${u.email}:`, pUpdateError.message);
            else console.log(`Profile updated for ${u.email}`);
        } else {
            const { data: { user: newUser } } = await supabase.auth.admin.listUsers().then(d => ({ data: { user: d.data.users.find(au => au.email === u.email) } }));
            const { error: pInsertError } = await supabase.from('profiles').insert({ id: newUser.id, ...profileData });
            if (pInsertError) console.error(`Error creating profile for ${u.email}:`, pInsertError.message);
            else console.log(`Profile created for ${u.email}`);
        }
    }
}

resetPasswords().then(() => process.exit(0));
