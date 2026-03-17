// lib/utils/emailTemplate.js
// Premium Pawpaths booking confirmation email — two variants:
//   type = 'customer'  →  warm, reassuring confirmation sent to the client
//   type = 'company'   →  internal alert sent to the Pawpaths operations team
//
// Dynamic data injected via the `booking` object:
//   booking.bookingId              string   e.g. "PP-2026-0074"
//   booking.customer / .customerInfo   { fullName, phone, email }
//   booking.travel  / .travelDetails   { serviceString, departureDate, travelDate,
//                                        origin: { country, airport },
//                                        destination: { country, airport },
//                                        travelingWithPet / clientTravelingWithPet }
//   booking.pets                   Pet[]  { name, type, breed, age, weight, specialRequirements }

const LOGO_WHITE = 'https://www.pawpathsae.com/pplogo-white.svg';
const LOGO_COLOR = 'https://www.pawpathsae.com/logo.png';
const ICON      = 'https://www.pawpathsae.com/ppicon.svg';

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  brown:        '#4D2A00',
  brownLight:   '#6B3A00',
  orange:       '#FF6400',
  orangeLight:  '#FFF3EB',
  orangeBorder: '#FFD0B3',
  white:        '#FFFFFF',
  offWhite:     '#F9FAFB',
  bgOuter:      '#F1F5F9',
  border:       '#E5E7EB',
  textPrimary:  '#111827',
  textSecondary:'#4B5563',
  textMuted:    '#9CA3AF',
  greenBg:      '#F0FDF4',
  greenBorder:  '#BBF7D0',
  greenText:    '#15803D',
  greenDark:    '#166534',
  greenDot:     '#16A34A',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function label(text) {
  return `<p style="margin:0 0 3px;font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.2px;">${text}</p>`;
}
function value(text, size = '14px', color = C.textPrimary, weight = '600') {
  return `<p style="margin:0;font-size:${size};font-weight:${weight};color:${color};">${text}</p>`;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateEmailTemplate(booking, type = 'customer') {
  // Normalise field names from both old and new booking shapes
  const customerInfo  = booking.customer  || booking.customerInfo  || {};
  const travelDetails = booking.travel    || booking.travelDetails || {};
  const { bookingId, pets = [] } = booking;
  const isCompany = type === 'company';

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.pawpathsae.com';

  // ── Derived data ──────────────────────────────────────────────────────────
  const originCountry  = travelDetails.origin?.country      || travelDetails.originCountry      || 'UAE';
  const originAirport  = travelDetails.origin?.airport      || travelDetails.originAirport      || '—';
  const destCountry    = travelDetails.destination?.country || travelDetails.destinationCountry || 'Destination';
  const destAirport    = travelDetails.destination?.airport || travelDetails.destinationAirport || '—';
  const rawDate        = travelDetails.departureDate || travelDetails.travelDate;
  const formattedDate  = rawDate
    ? new Date(rawDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'To Be Confirmed';
  const today          = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const withPet        = travelDetails.travelingWithPet || travelDetails.clientTravelingWithPet === 'yes';
  const withPetColor   = withPet ? '#4ADE80' : '#FCA5A5';
  const year           = new Date().getFullYear();

  // ── Pet cards (shared between both variants) ──────────────────────────────
  const petCards = pets.map((pet) => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
    <tr>
      <td style="background:${C.offWhite};border:1px solid ${C.border};border-left:4px solid ${C.orange};border-radius:8px;padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;width:56px;padding-right:14px;">
              ${pet.photoUrl
                ? `<img src="${pet.photoUrl}" alt="${pet.name}" width="52" height="52" style="width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;border:2px solid ${C.orangeBorder};" />`
                : `<div style="width:52px;height:52px;background:${C.orangeLight};border-radius:50%;text-align:center;font-size:24px;line-height:52px;">🐾</div>`
              }
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0 0 5px;font-size:15px;font-weight:700;color:${C.textPrimary};">${pet.name}</p>
              <p style="margin:0;font-size:12px;color:${C.textSecondary};line-height:1.8;">
                <strong>Type:</strong> ${pet.type} &nbsp;·&nbsp;
                <strong>Breed:</strong> ${pet.breed} &nbsp;·&nbsp;
                <strong>Age:</strong> ${pet.age} &nbsp;·&nbsp;
                <strong>Weight:</strong> ${pet.weight} kg
              </p>
              ${pet.specialRequirements ? `
              <p style="margin:8px 0 0;font-size:12px;color:${C.textSecondary};background:${C.white};border-radius:4px;padding:6px 10px;border-left:2px solid ${C.orange};">
                📋 ${pet.specialRequirements}
              </p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`).join('');

  // ── Travel route block (shared) ───────────────────────────────────────────
  const travelBlock = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
      <td style="background:${C.brown};border-radius:10px;padding:24px 28px;">
        <p style="margin:0 0 18px;font-size:11px;font-weight:600;letter-spacing:1px;color:rgba(255,255,255,0.45);text-transform:uppercase;text-align:center;">Date of Travel</p>
        <p style="margin:0 0 20px;font-size:19px;font-weight:700;color:${C.white};text-align:center;">${formattedDate}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width:40%;text-align:center;vertical-align:middle;padding:0 8px;">
              <p style="margin:0 0 6px;font-size:22px;">🛫</p>
              <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${C.white};">${originCountry}</p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);">${originAirport}</p>
            </td>
            <td style="width:20%;text-align:center;vertical-align:middle;">
              <p style="margin:0;font-size:22px;">✈️</p>
            </td>
            <td style="width:40%;text-align:center;vertical-align:middle;padding:0 8px;">
              <p style="margin:0 0 6px;font-size:22px;">🛬</p>
              <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${C.white};">${destCountry}</p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);">${destAirport}</p>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
          <tr>
            ${travelDetails.serviceString ? `
            <td style="width:50%;text-align:center;">
              ${label('Service')}
              ${value(travelDetails.serviceString, '13px', C.white, '500')}
            </td>
            <td style="width:50%;text-align:center;border-left:1px solid rgba(255,255,255,0.12);">` : `<td style="width:100%;text-align:center;">`}
              ${label('Client Traveling with Pet')}
              <p style="margin:0;font-size:13px;font-weight:600;color:${withPetColor};">${withPet ? 'Yes' : 'No'}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

  // ── Booking reference card (shared) ───────────────────────────────────────
  const bookingCard = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
      <td style="background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width:50%;padding-right:16px;">
              ${label('Enquiry ID')}
              <p style="margin:0;font-size:20px;font-weight:800;color:${C.orange};">${bookingId}</p>
            </td>
            <td style="width:50%;padding-left:16px;border-left:1px solid ${C.border};">
              ${label('Submitted')}
              ${value(today)}
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;padding-top:16px;border-top:1px solid ${C.border};">
          <tr>
            <td style="width:50%;padding-right:16px;">
              ${label('Contact No.')}
              ${value(customerInfo.phone || '—', '13px', C.textSecondary, '500')}
            </td>
            <td style="width:50%;padding-left:16px;border-left:1px solid ${C.border};">
              ${label('Email')}
              ${value(customerInfo.email || '—', '13px', C.textSecondary, '500')}
            </td>
          </tr>
        </table>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid ${C.border};text-align:center;">
          <span style="display:inline-block;background:${C.orangeLight};color:${C.orange};font-size:11px;font-weight:700;letter-spacing:0.5px;padding:5px 16px;border-radius:20px;border:1px solid ${C.orangeBorder};">
            ⏳ ENQUIRY RECEIVED
          </span>
        </div>
      </td>
    </tr>
  </table>`;

  // ── Next steps (customer only) ────────────────────────────────────────────
  const steps = [
    ['1', 'Team Review',        'Our relocation specialists will review your enquiry within 24 hours.'],
    ['2', 'Specialist Contact', 'A dedicated agent will reach out to confirm pricing and travel details.'],
    ['3', 'Document Checklist', 'We will send a personalised checklist of required health certificates and permits.'],
    ['4', 'Journey Confirmed',  "Once everything's in order, your pet's journey is officially confirmed!"],
  ];

  const nextStepsRows = steps.map(([num, title, desc]) => `
  <tr>
    <td style="vertical-align:top;width:28px;padding:0 14px 16px 0;">
      <div style="width:24px;height:24px;background:${C.greenDot};border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:white;">${num}</div>
    </td>
    <td style="vertical-align:top;padding-bottom:16px;">
      <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:${C.greenText};">${title}</p>
      <p style="margin:0;font-size:13px;color:${C.greenDark};line-height:1.5;">${desc}</p>
    </td>
  </tr>`).join('');

  const nextSteps = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
      <td style="background:${C.greenBg};border:1px solid ${C.greenBorder};border-radius:10px;padding:22px 24px;">
        <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:${C.greenText};">✅ What Happens Next</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${nextStepsRows}
        </table>
      </td>
    </tr>
  </table>`;

  // ── Shared footer ─────────────────────────────────────────────────────────
  const footer = `
  <tr>
    <td style="background:${C.offWhite};border-top:1px solid ${C.border};padding:28px 40px;text-align:center;">
      <img src="${ICON}" alt="Pawpaths" width="32" style="display:block;margin:0 auto 12px;" />
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#374151;">Pawpaths Pet Relocation Services</p>
      <p style="margin:0 0 12px;font-size:12px;color:${C.textMuted};">Al Ain, Abu Dhabi, United Arab Emirates</p>
      <p style="margin:0 0 16px;">
        <a href="${siteUrl}" style="color:${C.orange};text-decoration:none;font-size:12px;font-weight:600;">www.pawpathsae.com</a>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <a href="mailto:info@pawpathsae.com" style="color:${C.orange};text-decoration:none;font-size:12px;font-weight:600;">info@pawpathsae.com</a>
      </p>
      <p style="margin:0;font-size:11px;color:#D1D5DB;line-height:1.7;">
        This is an automated message. Please do not reply directly to this email.<br>
        © ${year} Pawpaths Pet Relocation Services. All rights reserved.
      </p>
    </td>
  </tr>`;

  // ══════════════════════════════════════════════════════════════════════════
  // CUSTOMER EMAIL
  // ══════════════════════════════════════════════════════════════════════════
  if (!isCompany) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Enquiry Confirmation | Pawpaths</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bgOuter};-webkit-font-smoothing:antialiased;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bgOuter};">
  <tr>
    <td align="center" style="padding:40px 16px;">

      <!-- Outer card -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${C.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">

        <!-- ── HEADER ──────────────────────────────────────────────── -->
        <tr>
          <td style="background:${C.brown};padding:32px 40px;text-align:center;">
            <img src="${LOGO_WHITE}" alt="Pawpaths" width="160" style="display:block;margin:0 auto;" />
          </td>
        </tr>

        <!-- ── HERO ────────────────────────────────────────────────── -->
        <tr>
          <td style="background:${C.orange};padding:28px 40px;text-align:center;">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${C.white};letter-spacing:-0.3px;">Your Pet's Journey Begins Here 🐾</h1>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.85);font-weight:500;letter-spacing:0.3px;">ENQUIRY RECEIVED &nbsp;·&nbsp; UNDER REVIEW</p>
          </td>
        </tr>

        <!-- ── BODY ────────────────────────────────────────────────── -->
        <tr>
          <td style="padding:36px 40px;">

            <!-- Greeting -->
            <p style="margin:0 0 12px;font-size:16px;color:${C.textPrimary};font-weight:600;">
              Dear ${customerInfo.fullName || 'Valued Customer'},
            </p>
            <p style="margin:0 0 32px;font-size:14px;color:${C.textSecondary};line-height:1.75;">
              Thank you for trusting Pawpaths with your beloved companion's journey. We have successfully received your relocation request and our specialist team is now reviewing the details. You will hear from us within <strong style="color:${C.textPrimary};">24 hours</strong>.
            </p>

            <!-- Section label -->
            <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;">Enquiry Summary</p>

            <!-- Booking reference card -->
            ${bookingCard}

            <!-- Section label -->
            <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;">Travel Itinerary</p>

            <!-- Travel route -->
            ${travelBlock}

            <!-- Section label -->
            <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;">
              Your Pet${pets.length > 1 ? 's' : ''} &nbsp;<span style="background:${C.orangeLight};color:${C.orange};font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${C.orangeBorder};">${pets.length}</span>
            </p>

            <!-- Pet cards -->
            ${petCards}

            <!-- Next steps -->
            <div style="height:20px;"></div>
            ${nextSteps}

            <!-- CTA button -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
              <tr>
                <td align="center">
                  <a href="${siteUrl}" style="display:inline-block;background:${C.orange};color:${C.white};font-size:15px;font-weight:700;text-decoration:none;padding:14px 44px;border-radius:8px;letter-spacing:0.2px;">
                    Visit Pawpaths
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:12px;color:${C.textMuted};text-align:center;">
              Questions? Email us at
              <a href="mailto:info@pawpathsae.com" style="color:${C.orange};text-decoration:none;font-weight:600;">info@pawpathsae.com</a>
            </p>

          </td>
        </tr>

        <!-- ── FOOTER ───────────────────────────────────────────────── -->
        ${footer}

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COMPANY / ADMIN EMAIL
  // ══════════════════════════════════════════════════════════════════════════
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New Enquiry Alert | Pawpaths Admin</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bgOuter};-webkit-font-smoothing:antialiased;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bgOuter};">
  <tr>
    <td align="center" style="padding:40px 16px;">

      <!-- Outer card -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${C.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">

        <!-- ── HEADER ──────────────────────────────────────────────── -->
        <tr>
          <td style="background:${C.brown};padding:28px 40px;text-align:center;">
            <img src="${LOGO_WHITE}" alt="Pawpaths" width="140" style="display:block;margin:0 auto;" />
          </td>
        </tr>

        <!-- ── ALERT BANNER ────────────────────────────────────────── -->
        <tr>
          <td style="background:${C.orange};padding:22px 40px;text-align:center;">
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:${C.white};">🔔 New Enquiry Alert</h1>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.88);">A new pet relocation enquiry has been submitted and requires your attention.</p>
          </td>
        </tr>

        <!-- ── BODY ────────────────────────────────────────────────── -->
        <tr>
          <td style="padding:36px 40px;">

            <!-- Booking reference -->
            <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;">Enquiry Reference</p>
            ${bookingCard}

            <!-- Customer info -->
            <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;">Customer Information</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;padding:20px 24px;">
                  <p style="margin:0 0 12px;font-size:17px;font-weight:700;color:${C.textPrimary};">${customerInfo.fullName || '—'}</p>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding-top:12px;border-top:1px solid ${C.border};">
                    <tr>
                      <td style="width:50%;padding-right:16px;">
                        ${label('Phone')}
                        ${value(customerInfo.phone || '—', '13px', C.textSecondary, '500')}
                      </td>
                      <td style="width:50%;padding-left:16px;border-left:1px solid ${C.border};">
                        ${label('Email')}
                        ${value(customerInfo.email || '—', '13px', C.textSecondary, '500')}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Travel details -->
            <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;">Travel Details</p>
            ${travelBlock}

            <!-- Pets -->
            <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:${C.textMuted};text-transform:uppercase;letter-spacing:1.5px;">
              Pet${pets.length > 1 ? 's' : ''} &nbsp;<span style="background:${C.orangeLight};color:${C.orange};font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${C.orangeBorder};">${pets.length}</span>
            </p>
            ${petCards}

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
              <tr>
                <td align="center">
                  <a href="${siteUrl}/admin/dashboard" style="display:inline-block;background:${C.orange};color:${C.white};font-size:15px;font-weight:700;text-decoration:none;padding:14px 44px;border-radius:8px;letter-spacing:0.2px;">
                    Open Admin Dashboard
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── FOOTER ───────────────────────────────────────────────── -->
        ${footer}

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
