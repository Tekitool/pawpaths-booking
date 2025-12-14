export function generateEmailTemplate(booking, type = 'customer') {
  const { bookingId, customerInfo, travelDetails, pets, totalWeight } = booking;

  const isCompany = type === 'company';

  const greeting = isCompany
    ? `<h2 style="color: #d9534f;">🔔 NEW BOOKING ALERT!</h2>
       <p style="font-size: 18px;">A new pet relocation booking has been submitted.</p>`
    : `<h2 style="color: #4d341a;">✓ Pet Relocation Request Received!</h2>
       <p>Dear ${customerInfo.fullName},</p>
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
        .header { background-color: #4d341a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #fff2b1; }
        .section { margin-bottom: 20px; background-color: white; padding: 15px; border-radius: 5px; }
        h2 { color: #4d341a; margin-top: 0; }
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
            
            <div style="background-color: #fff2b1; color: #4d341a; padding: 10px; border-radius: 4px; text-align: center; font-weight: bold; border: 1px solid #ffeeba;">
              Status: Pending Confirmation
            </div>
          </div>

          <div class="section">
            <h2>Travel Information</h2>
            
            <div style="background-color: #fff2b1; color: #4d341a; padding: 12px; border-radius: 4px; text-align: center; font-weight: bold; font-size: 18px; border: 1px solid #d6d8db; margin-bottom: 15px;">
              Date of Travel: ${new Date(travelDetails.travelDate).toLocaleDateString('en-GB')}
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; width: 50%;"><strong>Origin Country:</strong> ${travelDetails.originCountry}</td>
                <td style="padding: 8px; border: 1px solid #ddd; width: 50%;"><strong>Origin Airport:</strong> ${travelDetails.originAirport}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destination Country:</strong> ${travelDetails.destinationCountry}</td>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destination Airport:</strong> ${travelDetails.destinationAirport}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px; border: 1px solid #ddd; font-size: 16px;"><strong>Client Traveling with Pet:</strong> <span style="font-weight: bold; color: ${travelDetails.clientTravelingWithPet === 'yes' ? '#28a745' : '#dc3545'};">${travelDetails.clientTravelingWithPet === 'yes' ? 'Yes' : 'No'}</span></td>
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
            <p style="margin-top: 15px; font-size: 18px; font-weight: bold; text-align: right;">Total Weight: ${totalWeight} kg</p>
          </div>

          <p>We will review your booking and contact you shortly at ${customerInfo.phone} or via email.</p>
        </div>

        <div class="footer">
          <p>Pawpaths Pets Relocation Services</p>
          <p>Phone: +971586947755 | Email: bookings@pawpaths.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
}
