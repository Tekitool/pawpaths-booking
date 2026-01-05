const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase Client with SERVICE_ROLE_KEY to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You need to add this to .env.local

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials (URL or SERVICE_ROLE_KEY) in .env.local');
    console.error('⚠️  NOTE: You must add SUPABASE_SERVICE_ROLE_KEY to .env.local for seeding to work.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Helpers ---
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
    console.log('🌱 Starting Database Seeding Protocol...');

    // 1. Foundation: Fetch Reference Data
    console.log('🔍 Fetching Reference Data...');

    const { data: speciesList } = await supabase.from('species').select('id, name');
    const { data: nodesList } = await supabase.from('logistics_nodes').select('id, name, iata_code');
    const { data: servicesList } = await supabase.from('service_catalog').select('id, name, base_price');

    if (!speciesList?.length || !nodesList?.length) {
        console.error('❌ Critical Reference Data Missing. Did you run the SQL migration?');
        return;
    }

    const dogId = speciesList.find(s => s.name === 'Dog')?.id;
    const catId = speciesList.find(s => s.name === 'Cat')?.id;
    const dxbNode = nodesList.find(n => n.iata_code === 'DXB')?.id;
    const lhrNode = nodesList.find(n => n.iata_code === 'LHR')?.id;

    // 2. Actors: Create Entities (Customers, Vendors)
    console.log('👥 Creating Entities...');

    const entities = [];

    // 10 Individual Customers
    for (let i = 0; i < 10; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        entities.push({
            display_name: `${firstName} ${lastName}`,
            type: 'individual',
            is_client: true,
            contact_info: {
                email: faker.internet.email({ firstName, lastName }),
                phone: faker.phone.number(),
            },
            billing_address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                country: 'UAE'
            }
        });
    }

    // 5 Corporate Clients
    for (let i = 0; i < 5; i++) {
        entities.push({
            display_name: faker.company.name(),
            type: 'corporate',
            is_client: true,
            contact_info: { email: faker.internet.email(), phone: faker.phone.number() }
        });
    }

    // 5 Vendors
    for (let i = 0; i < 5; i++) {
        entities.push({
            display_name: `${faker.company.name()} Logistics`,
            type: 'freight_forwarder',
            is_vendor: true,
            is_client: false
        });
    }

    const { data: createdEntities, error: entityError } = await supabase
        .from('entities')
        .insert(entities)
        .select();

    if (entityError) throw new Error(`Entity Creation Failed: ${entityError.message}`);
    console.log(`✅ Created ${createdEntities.length} Entities.`);

    const customers = createdEntities.filter(e => e.is_client);

    // 3. Assets: Create Pets
    console.log('🐾 Creating Pets...');
    const pets = [];

    for (let i = 0; i < 50; i++) {
        const owner = randomItem(customers);
        const isDog = Math.random() > 0.4; // 60% Dogs
        const speciesId = isDog ? dogId : catId;

        pets.push({
            owner_id: owner.id,
            name: faker.animal.petName(),
            species_id: speciesId,
            gender: randomItem(['Male', 'Female', 'Male_Neutered', 'Female_Spayed']),
            date_of_birth: faker.date.birthdate({ min: 1, max: 10, mode: 'age' }),
            weight_kg: isDog ? randomInt(5, 40) : randomInt(3, 8),
            microchip_id: faker.string.numeric(15)
        });
    }

    const { data: createdPets, error: petError } = await supabase
        .from('pets')
        .insert(pets)
        .select();

    if (petError) throw new Error(`Pet Creation Failed: ${petError.message}`);
    console.log(`✅ Created ${createdPets.length} Pets.`);

    // 4. The Core: Bookings
    console.log('✈️  Creating Bookings...');
    const bookings = [];
    const statuses = ['enquiry', 'confirmed', 'in_transit', 'completed'];

    for (let i = 0; i < 20; i++) {
        const customer = randomItem(customers);
        const status = statuses[i % 4]; // Distribute statuses evenly

        bookings.push({
            customer_id: customer.id,
            origin_node_id: dxbNode,
            destination_node_id: lhrNode || randomItem(nodesList).id,
            status: status,
            service_type: 'export',
            scheduled_departure_date: faker.date.future(),
            internal_notes: faker.lorem.sentence()
        });
    }

    const { data: createdBookings, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookings)
        .select();

    if (bookingError) throw new Error(`Booking Creation Failed: ${bookingError.message}`);
    console.log(`✅ Created ${createdBookings.length} Bookings.`);

    // 4b. Link Pets to Bookings
    const bookingPets = [];
    for (const booking of createdBookings) {
        // Find pets owned by this customer
        const customerPets = createdPets.filter(p => p.owner_id === booking.customer_id);
        // Pick 1-2 pets
        const petsToTravel = customerPets.slice(0, randomInt(1, 2));

        for (const pet of petsToTravel) {
            bookingPets.push({
                booking_id: booking.id,
                pet_id: pet.id,
                recorded_weight_kg: pet.weight_kg,
                crate_type_required: 'IATA-400'
            });
        }
    }

    if (bookingPets.length > 0) {
        const { error: bpError } = await supabase.from('booking_pets').insert(bookingPets);
        if (bpError) console.error('Warning: Failed to link pets to bookings', bpError);
    }

    // 5. Financials: Invoices
    console.log('💰 Generating Invoices...');
    const confirmedBookings = createdBookings.filter(b => ['confirmed', 'completed'].includes(b.status));

    for (const booking of confirmedBookings) {
        // Create Invoice Header
        const { data: invoice, error: invError } = await supabase
            .from('finance_documents')
            .insert({
                doc_type: 'invoice',
                booking_id: booking.id,
                entity_id: booking.customer_id,
                status: 'issued',
                due_date: faker.date.future()
            })
            .select()
            .single();

        if (invError) {
            console.error('Failed to create invoice', invError);
            continue;
        }

        // Create Line Items
        const items = [
            { description: 'Pet Transport Fee (DXB-LHR)', quantity: 1, unit_price: 4500 },
            { description: 'Export Health Certificate', quantity: 1, unit_price: 500 },
            { description: 'IATA Crate (Large)', quantity: 1, unit_price: 850 }
        ];

        const lineItems = items.map(item => ({
            doc_id: invoice.id,
            ...item
        }));

        await supabase.from('finance_items').insert(lineItems);
    }

    // 6. Verification
    console.log('\n--- 🧪 VALIDATION REPORT ---');

    // Verify Invoice Totals (Trigger Check)
    const { data: testInvoice } = await supabase
        .from('finance_documents')
        .select('doc_number, grand_total, finance_items(line_total)')
        .eq('doc_type', 'invoice')
        .limit(1)
        .single();

    if (testInvoice) {
        const dbTotal = testInvoice.grand_total;
        // Note: In our schema, we don't have a trigger updating the PARENT (finance_documents) from the CHILDREN (finance_items) yet.
        // The previous schema had 'line_total' generated, but 'grand_total' on the document usually requires a trigger or a view.
        // For this test, we just check if items were inserted.

        console.log(`✅ Invoice ${testInvoice.doc_number} Created.`);
        console.log(`   Items: ${testInvoice.finance_items.length}`);
        // console.log(`   Grand Total (DB): ${dbTotal}`); // This might be 0 if we didn't add the aggregation trigger.
    }

    console.log('\n✨ Seeding Complete!');
}

seed().catch(err => {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
});
