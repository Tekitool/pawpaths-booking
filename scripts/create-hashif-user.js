/**
 * Script to create Hashif Haneef user
 * Run with: node scripts/create-hashif-user.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createHashifUser() {
    console.log('🚀 Creating user: Hashif Haneef');
    console.log('━'.repeat(50));

    const userData = {
        email: 'hashif@pawpathsae.com',
        password: 'ppadmin',
        firstName: 'Hashif',
        lastName: 'Haneef',
        role: 'super_admin',
        avatarUrl: 'https://cmqccuszskcawmjupqjn.supabase.co/storage/v1/object/public/avatars/users/hashif.webp'
    };

    try {
        // Step 1: Check if user already exists
        console.log('\n📋 Step 1: Checking if user already exists...');
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, role')
            .eq('email', userData.email)
            .single();

        if (existingProfile) {
            console.log('⚠️  User already exists:');
            console.log(`   ID: ${existingProfile.id}`);
            console.log(`   Email: ${existingProfile.email}`);
            console.log(`   Name: ${existingProfile.full_name}`);
            console.log(`   Role: ${existingProfile.role}`);
            console.log('\n🔄 Updating existing user...');

            // Update existing user
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    full_name: `${userData.firstName} ${userData.lastName}`,
                    role: userData.role,
                    avatar_url: userData.avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingProfile.id);

            if (updateError) {
                console.error('❌ Failed to update profile:', updateError);
                return;
            }

            console.log('✅ User profile updated successfully!');
            console.log('\n📊 Updated User Details:');
            console.log(`   Name: ${userData.firstName} ${userData.lastName}`);
            console.log(`   Email: ${userData.email}`);
            console.log(`   Role: ${userData.role}`);
            console.log(`   Avatar: ${userData.avatarUrl}`);
            return;
        }

        // Step 2: Create user in Supabase Auth
        console.log('✓ User does not exist, creating new user...');
        console.log('\n📋 Step 2: Creating user in Supabase Auth...');

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
                full_name: `${userData.firstName} ${userData.lastName}`
            }
        });

        if (authError) {
            console.error('❌ Failed to create auth user:', authError);
            throw authError;
        }

        console.log('✅ Auth user created successfully!');
        console.log(`   User ID: ${authData.user.id}`);

        // Step 3: Update profile with role and avatar
        console.log('\n📋 Step 3: Updating profile with role and avatar...');

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: `${userData.firstName} ${userData.lastName}`,
                role: userData.role,
                avatar_url: userData.avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id);

        if (profileError) {
            console.error('❌ Failed to update profile:', profileError);
            throw profileError;
        }

        console.log('✅ Profile updated successfully!');

        // Step 4: Verify the created user
        console.log('\n📋 Step 4: Verifying created user...');

        const { data: profile, error: verifyError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (verifyError) {
            console.error('❌ Failed to verify user:', verifyError);
            throw verifyError;
        }

        console.log('✅ User verified successfully!');
        console.log('\n━'.repeat(50));
        console.log('🎉 USER CREATED SUCCESSFULLY!');
        console.log('━'.repeat(50));
        console.log('\n📊 User Details:');
        console.log(`   ID: ${profile.id}`);
        console.log(`   Name: ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Avatar: ${profile.avatar_url}`);
        console.log(`   Created: ${profile.created_at}`);
        console.log('\n🔐 Login Credentials:');
        console.log(`   Email: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log('\n✨ You can now login with these credentials!');
        console.log('━'.repeat(50));

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run the script
createHashifUser()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
