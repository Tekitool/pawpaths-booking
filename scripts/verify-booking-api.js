async function verifyBooking() {
    const baseUrl = 'http://localhost:3000';

    // 1. Create Booking Payload (EX-A Scenario)
    const formData = new FormData();

    const travelDetails = {
        originCountry: 'United Arab Emirates',
        originAirport: 'Dubai (DXB)',
        destinationCountry: 'United Kingdom',
        destinationAirport: 'London (LHR)',
        travelDate: '2026-01-15',
        travelingWithPet: true // EX-A
    };

    const pets = [{
        type: 'Dog',
        breed: 'Labrador',
        name: 'Max',
        age: 3,
        weight: 20,
        gender: 'Male'
    }];

    const contactInfo = {
        fullName: 'API Test User',
        email: 'api.test@example.com',
        phone: '+971500000000',
        city: 'Dubai'
    };

    formData.append('travelDetails', JSON.stringify(travelDetails));
    formData.append('pets', JSON.stringify(pets));
    formData.append('services', '[]');
    formData.append('contactInfo', JSON.stringify(contactInfo));

    try {
        console.log('Sending booking request...');
        const response = await fetch(`${baseUrl}/api/booking`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log('Booking Response:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('Booking created successfully. Verifying Customer Type...');

            // 2. Verify Customer Type
            const verifyResponse = await fetch(`${baseUrl}/api/verify-customer-type`);
            const verifyResult = await verifyResponse.json();

            console.log('Verification Result:', JSON.stringify(verifyResult, null, 2));

            if (verifyResult.customerType?.type_code === 'EX-A') {
                console.log('SUCCESS: Customer Type is EX-A');
            } else {
                console.error('FAILURE: Expected EX-A, got', verifyResult.customerType?.type_code);
            }
        } else {
            console.error('Booking failed:', result.message);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyBooking();
