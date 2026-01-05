const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data: species, error: sError } = await supabase.from('species').select('*');
    if (sError) console.error('Species Error:', sError);
    else console.log('Species:', species);

    const { data: breeds, error: bError } = await supabase.from('breeds').select('*').limit(5);
    if (bError) console.error('Breeds Error:', bError);
    else console.log('Breeds Sample:', breeds);
}

check();
