export function generateWhatsAppMessage(booking) {
    const { bookingId, customerInfo, travelDetails, pets } = booking;

    const date = new Date(travelDetails.travelDate).toLocaleDateString();
    const clientTraveling = travelDetails.clientTravelingWithPet === 'yes' ? 'Yes' : 'No';

    const petDetails = pets.map((pet, index) =>
        `${index + 1}. ${pet.type} - ${pet.breed} - ${pet.name} - ${pet.weight}kg`
    ).join('\n');

    const message = `Hi Pawpaths,
Hello, I have just made a booking with Pawpaths for pet relocation services. Please call me back at your earliest convenience to confirm my booking and discuss the details. Thank you!

*BOOKING DETAILS* 📋
Booking ID: ${bookingId}
Name: ${customerInfo.fullName}
Date: ${date}
Origin: ${travelDetails.originCountry} (${travelDetails.originAirport})
Destination: ${travelDetails.destinationCountry} (${travelDetails.destinationAirport})
Client Traveling: ${clientTraveling}

🐕 PETS:
${petDetails}

📞 Contact: ${customerInfo.phone}
✉️ Email: ${customerInfo.email}`;

    return message;
}

export function generateWhatsAppLink(message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/971586947755?text=${encodedMessage}`;
}
