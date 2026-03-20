const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCols() {
    const { data, error } = await supabase.from('booking_pets').select('passport_path').limit(1);
    console.log(error ? 'Error / Column missing: ' + error.message : 'Column exists on booking_pets!');
}
testCols();
