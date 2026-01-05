/**
 * Script to update System Admin user's avatar
 * Run with: node scripts/update-system-admin-avatar.js
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

async function updateSystemAdminAvatar() {
    console.log('🔍 Finding "System Admin" user...');
    console.log('━'.repeat(50));

    try {
        // Step 1: Find the System Admin user
        console.log('\n📋 Step 1: Searching for user with name "System Admin"...');

        const { data: profiles, error: searchError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .ilike('full_name', '%System Admin%');

        if (searchError) {
            console.error('❌ Error searching for user:', searchError);
            throw searchError;
        }

        if (!profiles || profiles.length === 0) {
            console.log('❌ No user found with name containing "System Admin"');
            console.log('\n📋 Searching all users to help identify the correct one...');

            const { data: allProfiles } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name, email, role')
                .order('created_at', { ascending: true });

            if (allProfiles && allProfiles.length > 0) {
                console.log('\n👥 Available users:');
                allProfiles.forEach((profile, index) => {
                    console.log(`   ${index + 1}. ${profile.full_name} (${profile.email}) - Role: ${profile.role}`);
                });
            }
            process.exit(1);
        }

        if (profiles.length > 1) {
            console.log(`⚠️  Found ${profiles.length} users matching "System Admin":`);
            profiles.forEach((profile, index) => {
                console.log(`   ${index + 1}. ${profile.full_name} (${profile.email}) - ID: ${profile.id}`);
            });
            console.log('\n📝 Using the first match...');
        }

        const systemAdmin = profiles[0];
        console.log('✅ User found!');
        console.log(`   ID: ${systemAdmin.id}`);
        console.log(`   Name: ${systemAdmin.full_name}`);
        console.log(`   Email: ${systemAdmin.email}`);
        console.log(`   Current Avatar: ${systemAdmin.avatar_url || 'None'}`);

        // Step 2: Construct the new avatar URL
        const newAvatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/users/ansar.webp`;

        console.log('\n📋 Step 2: Updating avatar URL...');
        console.log(`   New Avatar: ${newAvatarUrl}`);

        // Step 3: Update the profile
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                avatar_url: newAvatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', systemAdmin.id);

        if (updateError) {
            console.error('❌ Failed to update avatar:', updateError);
            throw updateError;
        }

        console.log('✅ Avatar updated successfully!');

        // Step 4: Verify the update
        console.log('\n📋 Step 3: Verifying update...');

        const { data: updatedProfile, error: verifyError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', systemAdmin.id)
            .single();

        if (verifyError) {
            console.error('❌ Failed to verify update:', verifyError);
            throw verifyError;
        }

        console.log('✅ Update verified!');
        console.log('\n━'.repeat(50));
        console.log('🎉 AVATAR UPDATE COMPLETE!');
        console.log('━'.repeat(50));
        console.log('\n📊 Updated User Details:');
        console.log(`   ID: ${updatedProfile.id}`);
        console.log(`   Name: ${updatedProfile.full_name}`);
        console.log(`   Email: ${updatedProfile.email}`);
        console.log(`   Role: ${updatedProfile.role}`);
        console.log(`   Avatar URL: ${updatedProfile.avatar_url}`);
        console.log(`   Updated: ${updatedProfile.updated_at}`);
        console.log('\n✨ The avatar will now display for this user!');
        console.log('━'.repeat(50));

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run the script
updateSystemAdminAvatar()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
