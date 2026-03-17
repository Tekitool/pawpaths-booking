const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

s.from('profiles').select('*').then(({ data, error }) => {
    if (error) { console.log('ERROR:', error.message); return; }
    console.log('TOTAL ROWS:', data.length);
    if (data.length > 0) {
        console.log('\nCOLUMNS:', Object.keys(data[0]).join(' | '));
        console.log('\n' + '='.repeat(60));
        data.forEach((r, i) => {
            console.log(`\nROW ${i + 1}:`);
            Object.entries(r).forEach(([k, v]) => {
                console.log(`  ${k.padEnd(20)} = ${JSON.stringify(v)}`);
            });
        });
    }
});
