/**
 * Script to verify Hashif Haneef user
 * Run with: node scripts/verify-hashif-user.js
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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function verifyHashifUser() {
    console.log('🔍 Verifying user: hashif@pawpathsae.com');
    console.log('━'.repeat(50));

    try {
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', 'hashif@pawpathsae.com')
            .single();

        if (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }

        if (!profile) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log('✅ User found!');
        console.log('\n📊 User Details:');
        console.log(`   ID: ${profile.id}`);
        console.log(`   Name: ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Avatar: ${profile.avatar_url}`);
        console.log(`   Created: ${profile.created_at}`);
        console.log('\n━'.repeat(50));

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyHashifUser().then(() => process.exit(0));
