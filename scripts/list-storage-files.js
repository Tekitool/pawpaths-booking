const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listFiles() {
    try {
        const { data, error } = await supabase
            .storage
            .from('avatars')
            .list('breeds/dog', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) {
            console.error('Error listing files:', error);
            return;
        }

        console.log('Files in avatars/breeds/dog:');
        data.forEach(file => {
            console.log(`- ${file.name}`);
        });
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

listFiles();
