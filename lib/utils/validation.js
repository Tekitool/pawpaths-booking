import validator from 'validator';

export function validateBookingData(data) {
    const errors = [];

    if (!data.customerInfo?.fullName || validator.isEmpty(data.customerInfo.fullName)) {
        errors.push('Full name is required');
    }

    if (!data.customerInfo?.email || !validator.isEmail(data.customerInfo.email)) {
        errors.push('Valid email is required');
    }

    if (!data.customerInfo?.phone || validator.isEmpty(data.customerInfo.phone)) {
        errors.push('Phone number is required');
    }

    if (!data.travelDetails?.originCountry) errors.push('Origin country is required');
    if (!data.travelDetails?.originAirport) errors.push('Origin airport is required');
    if (!data.travelDetails?.destinationCountry) errors.push('Destination country is required');
    if (!data.travelDetails?.destinationAirport) errors.push('Destination airport is required');

    if (!data.travelDetails?.travelDate || !validator.isAfter(new Date(data.travelDetails.travelDate).toString())) {
        errors.push('Valid future travel date is required');
    }

    if (!data.pets || !Array.isArray(data.pets) || data.pets.length === 0) {
        errors.push('At least one pet is required');
    } else {
        data.pets.forEach((pet, index) => {
            if (!pet.type) errors.push(`Pet ${index + 1}: Type is required`);
            if (!pet.breed) errors.push(`Pet ${index + 1}: Breed is required`);
            if (!pet.name) errors.push(`Pet ${index + 1}: Name is required`);
            if (!pet.age || pet.age <= 0) errors.push(`Pet ${index + 1}: Valid age is required`);
            if (!pet.weight || pet.weight <= 0) errors.push(`Pet ${index + 1}: Valid weight is required`);
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
