/**
 * Script to reset System Admin password
 * Run with: node scripts/reset-system-admin-password.js
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
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// New password for System Admin
const NEW_PASSWORD = 'admin123'; // You can change this to any password you want

async function resetSystemAdminPassword() {
    console.log('🔐 Resetting System Admin password...');
    console.log('━'.repeat(50));

    try {
        // Step 1: Find the System Admin user
        console.log('\n📋 Step 1: Finding System Admin user...');

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('email', 'admin@pawpathsae.com')
            .single();

        if (profileError || !profile) {
            console.error('❌ System Admin user not found');
            process.exit(1);
        }

        console.log('✅ User found!');
        console.log(`   ID: ${profile.id}`);
        console.log(`   Name: ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role}`);

        // Step 2: Reset password using Admin API
        console.log('\n📋 Step 2: Resetting password...');

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            profile.id,
            { password: NEW_PASSWORD }
        );

        if (updateError) {
            console.error('❌ Failed to reset password:', updateError);
            throw updateError;
        }

        console.log('✅ Password reset successfully!');

        console.log('\n━'.repeat(50));
        console.log('🎉 PASSWORD RESET COMPLETE!');
        console.log('━'.repeat(50));
        console.log('\n🔐 New Login Credentials:');
        console.log(`   Email: admin@pawpathsae.com`);
        console.log(`   Password: ${NEW_PASSWORD}`);
        console.log('\n⚠️  IMPORTANT: Please change this password after logging in!');
        console.log('━'.repeat(50));

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run the script
resetSystemAdminPassword()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
