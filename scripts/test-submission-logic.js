const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function testSubmission() {
    console.log('Testing submission logic...');

    const formData = {
        travelDetails: {
            originCountry: 'GB',
            originAirport: 'LHR',
            destinationCountry: 'AE',
            destinationAirport: 'DXB',
            travelDate: '2026-01-15',
        },
        pets: [
            {
                name: 'BuddyTest',
                type: 'Dog',
                breed: 'Golden Retriever',
                gender: 'Male',
                weight: '30',
                age: '3',
            }
        ],
        services: ['door_to_door'],
        contactInfo: {
            fullName: 'Test User Script',
            email: 'test_script@example.com',
            phone: '+971500000000',
            city: 'Dubai'
        }
    };

    try {
        const { travelDetails, pets, services, contactInfo } = formData;

        // 1. Find or Create Entity (Customer)
        console.log('1. Searching/Creating Customer...');
        let customerId;
        const { data: existingCustomers, error: searchError } = await supabase
            .from('entities')
            .select('id')
            .eq('contact_info->>email', contactInfo.email)
            .limit(1);

        if (searchError) throw new Error(`Error searching customer: ${searchError.message}`);

        if (existingCustomers && existingCustomers.length > 0) {
            console.log('Customer found:', existingCustomers[0].id);
            customerId = existingCustomers[0].id;
        } else {
            console.log('Creating new customer...');
            const { data: newCustomer, error: createError } = await supabase
                .from('entities')
                .insert({
                    type: 'individual',
                    is_client: true,
                    display_name: contactInfo.fullName,
                    contact_info: {
                        email: contactInfo.email,
                        phone: contactInfo.phone,
                        city: contactInfo.city
                    }
                })
                .select('id')
                .single();

            if (createError) throw new Error(`Error creating customer: ${createError.message}`);
            customerId = newCustomer.id;
            console.log('New customer created:', customerId);
        }

        // 2. Create Pets
        console.log('2. Creating Pets...');
        const petIds = [];
        for (const pet of pets) {
            const { data: newPet, error: petError } = await supabase
                .from('pets')
                .insert({
                    owner_id: customerId,
                    name: pet.name,
                    gender: pet.gender === 'Male' ? 'Male' : (pet.gender === 'Female' ? 'Female' : 'Unknown'),
                    weight_kg: parseFloat(pet.weight) || 0,
                    age_years: parseInt(pet.age) || 0,
                })
                .select('id')
                .single();

            if (petError) throw new Error(`Error creating pet ${pet.name}: ${petError.message}`);
            petIds.push(newPet.id);
            console.log('Pet created:', newPet.id);
        }

        // 3. Create Booking
        console.log('3. Creating Booking...');
        let serviceType = 'relocation';
        if (travelDetails.originCountry === 'AE' && travelDetails.destinationCountry !== 'AE') serviceType = 'export';
        if (travelDetails.originCountry !== 'AE' && travelDetails.destinationCountry === 'AE') serviceType = 'import';

        const { data: newBooking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                customer_id: customerId,
                status: 'enquiry',
                service_type: serviceType,
                scheduled_departure_date: travelDetails.travelDate,
                internal_notes: `Origin: ${travelDetails.originCountry} (${travelDetails.originAirport})\nDestination: ${travelDetails.destinationCountry} (${travelDetails.destinationAirport})`
            })
            .select('id, booking_number')
            .single();

        if (bookingError) throw new Error(`Error creating booking: ${bookingError.message}`);
        console.log('Booking created:', newBooking.booking_number);

        // 4. Link Pets to Booking
        console.log('4. Linking Pets...');
        if (petIds.length > 0) {
            const bookingPetsData = petIds.map(petId => ({
                booking_id: newBooking.id,
                pet_id: petId
            }));

            const { error: linkError } = await supabase
                .from('booking_pets')
                .insert(bookingPetsData);

            if (linkError) throw new Error(`Error linking pets: ${linkError.message}`);
        }

        console.log('SUCCESS! Booking Reference:', newBooking.booking_number);

    } catch (error) {
        console.error('TEST FAILED:', error.message);
        if (error.details) console.error('Details:', error.details);
        if (error.hint) console.error('Hint:', error.hint);
    }
}

testSubmission();
