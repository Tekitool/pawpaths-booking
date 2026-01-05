import { BRAND_COLORS } from '@/lib/theme-config';

export function generateEmailTemplate(booking, type = 'customer') {
  // Handle both formats: saved booking (customer, travel) and legacy (customerInfo, travelDetails)
  const customerInfo = booking.customer || booking.customerInfo || {};
  const travelDetails = booking.travel || booking.travelDetails || {};
  const { bookingId, pets = [], totalWeight = 0 } = booking;

  const isCompany = type === 'company';

  const greeting = isCompany
    ? `<h2 style="color: ${BRAND_COLORS.system.color01.hex};">🔔 NEW BOOKING ALERT!</h2>
       <p style="font-size: 18px;">A new pet relocation booking has been submitted.</p>`
    : `<h2 style="color: ${BRAND_COLORS.brand01.hex};">✓ Pet Relocation Request Received!</h2>
       <p>Dear ${customerInfo.fullName || 'Customer'},</p>
       <p>Thank you for choosing Pawpaths! We have successfully received your booking request and your confirmation is currently pending. A Pawpaths agent will contact you shortly to finalize your booking details and ensure a safe, comfortable relocation for your beloved pet.</p>`;

  const petRows = pets.map((pet, index) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${index + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.type} (${pet.breed})</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.age}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.weight} kg</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${pet.specialRequirements || '-'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${BRAND_COLORS.brand01.hex}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: ${BRAND_COLORS.brand02.hex}; }
        .section { margin-bottom: 20px; background-color: white; padding: 15px; border-radius: 5px; }
        h2 { color: ${BRAND_COLORS.brand01.hex}; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 8px; background-color: #f2f2f2; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.NEXT_PUBLIC_API_URL}/pplogo.svg" alt="Pawpaths Logo" style="max-width: 200px; height: auto;" />
          <p style="font-size: 18px; font-weight: bold; margin-top: 10px;">Booking Confirmation</p>
        </div>
        
        <div class="content">
          ${greeting}
          
          <div class="section">
            <h2>Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; width: 50%;"><strong>Booking ID:</strong> ${bookingId}</td>
                <td style="padding: 8px; border: 1px solid #ddd; width: 50%;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px; border: 1px solid #ddd;"><strong>Customer Name:</strong> ${customerInfo.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contact No:</strong> ${customerInfo.phone}</td>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong> ${customerInfo.email}</td>
              </tr>
            </table>
            
            <div style="background-color: ${BRAND_COLORS.brand02.hex}; color: ${BRAND_COLORS.brand01.hex}; padding: 10px; border-radius: 4px; text-align: center; font-weight: bold; border: 1px solid #ffeeba;">
              Status: Pending Confirmation
            </div>
          </div>

          <div class="section">
            <h2>Travel Information</h2>
            
            <p style="text-align: left; font-size: 14px; color: #666; margin-top: -10px; margin-bottom: 15px;">
              ${travelDetails.serviceString || ''}
            </p>
            
            <div style="background-color: ${BRAND_COLORS.brand02.hex}; color: ${BRAND_COLORS.brand01.hex}; padding: 12px; border-radius: 4px; text-align: center; font-weight: bold; font-size: 18px; border: 1px solid #d6d8db; margin-bottom: 15px;">
              Date of Travel: ${travelDetails.departureDate ? new Date(travelDetails.departureDate).toLocaleDateString('en-GB') : travelDetails.travelDate ? new Date(travelDetails.travelDate).toLocaleDateString('en-GB') : 'TBD'}
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; width: 50%;"><strong>Origin Country:</strong> ${(travelDetails.origin && travelDetails.origin.country) || travelDetails.originCountry || 'Unknown'}</td>
                <td style="padding: 8px; border: 1px solid #ddd; width: 50%;"><strong>Origin Airport:</strong> ${(travelDetails.origin && travelDetails.origin.airport) || travelDetails.originAirport || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destination Country:</strong> ${(travelDetails.destination && travelDetails.destination.country) || travelDetails.destinationCountry || 'Unknown'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destination Airport:</strong> ${(travelDetails.destination && travelDetails.destination.airport) || travelDetails.destinationAirport || 'N/A'}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px; border: 1px solid #ddd; font-size: 16px;"><strong>Client Traveling with Pet:</strong> <span style="font-weight: bold; color: ${(travelDetails.travelingWithPet || travelDetails.clientTravelingWithPet === 'yes') ? '#28a745' : '#dc3545'};">${(travelDetails.travelingWithPet || travelDetails.clientTravelingWithPet === 'yes') ? 'Yes' : 'No'}</span></td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h2>Pet Details</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type/Breed</th>
                  <th>Age</th>
                  <th>Weight</th>
                  <th>Special Req.</th>
                </tr>
              </thead>
              <tbody>
                ${petRows}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Pawpaths Pet Relocation Services | Dubai, UAE</p>
            <p><a href="https://pawpathsae.com">www.pawpathsae.com</a></p>
            ${isCompany ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard">Go to Admin Dashboard</a></p>` : ''}
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
}
