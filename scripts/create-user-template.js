/**
 * Generic User Creation Script Template
 * Copy this file and modify the userData object to create new users
 * Run with: node scripts/create-user.js
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

// ============================================================
// MODIFY THIS SECTION TO CREATE A NEW USER
// ============================================================

const userData = {
    firstName: 'John',              // First name
    lastName: 'Doe',                // Last name
    email: 'john.doe@example.com',  // Email (must be unique)
    password: 'password123',        // Temporary password
    role: 'customer',               // Role: 'super_admin' | 'admin' | 'staff' | 'customer'
    avatarUrl: null                 // Avatar URL from Supabase storage (optional)
};

// Available roles:
// - super_admin: Full system access
// - admin: Administrative access
// - staff: Staff member access
// - customer: Regular customer access

// ============================================================

async function createUser() {
    console.log(`🚀 Creating user: ${userData.firstName} ${userData.lastName}`);
    console.log('━'.repeat(50));

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
            console.log('\n💡 If you want to update this user, manually edit the profile or delete and recreate.');
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

        const profileUpdate = {
            full_name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role,
            updated_at: new Date().toISOString()
        };

        if (userData.avatarUrl) {
            profileUpdate.avatar_url = userData.avatarUrl;
        }

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update(profileUpdate)
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
        console.log(`   Avatar: ${profile.avatar_url || 'None'}`);
        console.log(`   Created: ${profile.created_at}`);
        console.log('\n🔐 Login Credentials:');
        console.log(`   Email: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log('\n⚠️  IMPORTANT: User should change their password after first login!');
        console.log('━'.repeat(50));

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run the script
createUser()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
