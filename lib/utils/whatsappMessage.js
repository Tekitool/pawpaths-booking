export function generateWhatsAppMessage(booking) {
    const { bookingId, customerInfo, travelDetails, pets } = booking;

    const date = new Date(travelDetails.travelDate).toLocaleDateString();

    const petDetails = pets.map((pet, index) =>
        `${index + 1}. ${pet.type} - ${pet.breed} - ${pet.name} - ${pet.weight}kg`
    ).join('\n');

    const message = `🐾 PAWPATHS PETS RELOCATION SERVICES
✅ BOOKING CONFIRMATION

📋 Booking ID: ${bookingId}
👤 Name: ${customerInfo.fullName}
✈️ Route: ${travelDetails.originCountry} → ${travelDetails.destinationCountry}
📅 Date: ${date}

🐕🐱 PETS:
${petDetails}

📞 Contact: +971586947755
✉️ Email: ${customerInfo.email}

We'll contact you soon with next steps!
Thank you for choosing Pawpaths! 🐾`;

    return message;
}

export function generateWhatsAppLink(message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/971586947755?text=${encodedMessage}`;
}
