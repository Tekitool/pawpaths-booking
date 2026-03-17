export function generateWhatsAppMessage(booking) {
    // Handle both the saved booking format (customer, travel) and legacy format (customerInfo, travelDetails)
    const customerInfo = booking.customer || booking.customerInfo || {};
    const travelDetails = booking.travel || booking.travelDetails || {};
    const { bookingId, pets = [] } = booking;

    const date = travelDetails.departureDate
        ? new Date(travelDetails.departureDate).toLocaleDateString('en-GB')
        : travelDetails.travelDate
            ? new Date(travelDetails.travelDate).toLocaleDateString('en-GB')
            : 'TBD';

    const clientTraveling = travelDetails.travelingWithPet ? 'Yes' : 'No';

    const origin = travelDetails.origin || {};
    const destination = travelDetails.destination || {};

    const petDetails = pets.map((pet, index) =>
        `${index + 1}. ${pet.type || 'Pet'} - ${pet.breed || 'Unknown'} - ${pet.name || 'Unnamed'} - ${pet.weight || '?'}kg`
    ).join('\n');

    const message = `Hi Pawpaths,
Hello, I have just submitted a pet relocation enquiry with Pawpaths. Please call me back at your earliest convenience to review my enquiry and discuss the details. Thank you!

*ENQUIRY DETAILS* 📋
Enquiry ID: ${bookingId || 'Pending'}
Name: ${customerInfo.fullName || 'Unknown'}
Date: ${date}
Origin: ${origin.country || travelDetails.originCountry || 'Unknown'} (${origin.airport || travelDetails.originAirport || 'N/A'})
Destination: ${destination.country || travelDetails.destinationCountry || 'Unknown'} (${destination.airport || travelDetails.destinationAirport || 'N/A'})
Client Traveling: ${clientTraveling}

🐕 PETS:
${petDetails}

📞 Contact: ${customerInfo.phone || 'N/A'}
✉️ Email: ${customerInfo.email || 'N/A'}`;

    return message;
}

export function generateWhatsAppLink(message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/971586947755?text=${encodedMessage}`;
}
