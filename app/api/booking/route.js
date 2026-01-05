import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateEmailTemplate } from '@/lib/utils/emailTemplate';
import { generateWhatsAppMessage, generateWhatsAppLink } from '@/lib/utils/whatsappMessage';
import nodemailer from 'nodemailer';
import { SERVICES } from '@/lib/constants/services';

export async function POST(req) {
    try {
        const formData = await req.formData();

        // Parse JSON fields with null checks
        const travelDetailsRaw = formData.get('travelDetails');
        const petsRaw = formData.get('pets');
        const servicesRaw = formData.get('services');
        const contactInfoRaw = formData.get('contactInfo');

        console.log('Received FormData fields:', {
            travelDetails: travelDetailsRaw ? 'present' : 'missing',
            pets: petsRaw ? 'present' : 'missing',
            services: servicesRaw ? 'present' : 'missing',
            contactInfo: contactInfoRaw ? 'present' : 'missing'
        });

        if (!travelDetailsRaw || !petsRaw || !contactInfoRaw) {
            return NextResponse.json({
                success: false,
                message: 'Missing required form fields',
                details: {
                    travelDetails: !!travelDetailsRaw,
                    pets: !!petsRaw,
                    contactInfo: !!contactInfoRaw
                }
            }, { status: 400 });
        }

        const travelDetails = JSON.parse(travelDetailsRaw);
        const pets = JSON.parse(petsRaw);
        const services = JSON.parse(servicesRaw || '[]');
        const contactInfo = JSON.parse(contactInfoRaw);

        // Handle file uploads
        const uploadedDocuments = [];
        const fileFields = ['passport', 'vaccination', 'rabies'];
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

        // Import storage service dynamically
        const { uploadFile } = await import('@/lib/storage-service');

        for (const field of fileFields) {
            const file = formData.get(field);
            if (file && typeof file !== 'string') {
                // Validate file size
                if (file.size > MAX_FILE_SIZE) {
                    return NextResponse.json({
                        success: false,
                        message: `File "${file.name}" is too large. Maximum size is 5MB.`,
                        error: 'FILE_TOO_LARGE'
                    }, { status: 400 });
                }

                // Validate file type
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                if (!ALLOWED_MIME_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
                    return NextResponse.json({
                        success: false,
                        message: `Invalid file type for "${file.name}". Only PDF, JPG, JPEG, and PNG files are allowed.`,
                        error: 'INVALID_FILE_TYPE'
                    }, { status: 400 });
                }

                // File is valid, proceed with upload
                try {
                    const { url } = await uploadFile(file, 'uploads');
                    uploadedDocuments.push({
                        type: field,
                        name: file.name,
                        url: url
                    });
                } catch (uploadError) {
                    console.error(`Failed to upload ${field}:`, uploadError);
                    return NextResponse.json({
                        success: false,
                        message: `Failed to upload ${file.name}. Please try again.`,
                        error: 'UPLOAD_FAILED'
                    }, { status: 500 });
                }
            }
        }

        // Calculate total weight
        const totalWeight = pets.reduce((acc, pet) => acc + Number(pet.weight), 0);

        // --- Auto-Detect Customer Type ---
        let customerTypeCode = 'LOCL'; // Default
        const originCountry = travelDetails.originCountry;
        const destinationCountry = travelDetails.destinationCountry;
        const isTravelingWithPet = travelDetails.travelingWithPet;

        const isOriginUAE = originCountry?.toLowerCase().includes('united arab emirates') || originCountry?.toLowerCase() === 'uae';
        const isDestUAE = destinationCountry?.toLowerCase().includes('united arab emirates') || destinationCountry?.toLowerCase() === 'uae';

        if (isOriginUAE && isDestUAE) {
            customerTypeCode = 'LOCL';
        } else if (isOriginUAE && !isDestUAE) {
            customerTypeCode = isTravelingWithPet ? 'EX-A' : 'EX-U';
        } else if (!isOriginUAE && isDestUAE) {
            customerTypeCode = isTravelingWithPet ? 'IM-A' : 'IM-U';
        }

        // Map to Supabase Enum
        let serviceTypeEnum = 'local';
        if (customerTypeCode.startsWith('EX')) serviceTypeEnum = 'export';
        if (customerTypeCode.startsWith('IM')) serviceTypeEnum = 'import';
        if (customerTypeCode === 'TRANSIT') serviceTypeEnum = 'transit';

        // --- Supabase Transaction ---

        // 1. Find or Create Customer Entity
        let customerId;
        const { data: existingCustomer, error: findError } = await supabaseAdmin
            .from('entities')
            .select('id')
            .eq('contact_info->>email', contactInfo.email)
            .single();

        if (existingCustomer) {
            customerId = existingCustomer.id;
        } else {
            const { data: newCustomer, error: createError } = await supabaseAdmin
                .from('entities')
                .insert({
                    display_name: contactInfo.fullName,
                    is_client: true,
                    contact_info: {
                        email: contactInfo.email,
                        phone: contactInfo.phone,
                        address: contactInfo.city
                    },
                    kyc_documents: uploadedDocuments // Storing docs here for now
                })
                .select()
                .single();

            if (createError) {
                console.error('Create Customer Error:', createError);
                throw new Error('Failed to create customer record');
            }
            customerId = newCustomer.id;
        }

        // 2. Create Booking
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .insert({
                customer_id: customerId,
                status: 'enquiry', // Default status
                service_type: serviceTypeEnum,
                scheduled_departure_date: new Date(travelDetails.travelDate),
                origin_raw: {
                    country: travelDetails.originCountry,
                    airport: travelDetails.originAirport
                },
                destination_raw: {
                    country: travelDetails.destinationCountry,
                    airport: travelDetails.destinationAirport
                },
                transport_mode: travelDetails.transportMode,
                number_of_pets: pets.length,
                traveling_with_pet: travelDetails.travelingWithPet,
                customer_contact_snapshot: contactInfo
            })
            .select()
            .single();

        if (bookingError) {
            console.error('Create Booking Error:', bookingError);
            throw new Error('Failed to create booking record');
        }

        // 3. Create Pets and Link
        for (const pet of pets) {
            // Create Pet
            const { data: newPet, error: petError } = await supabaseAdmin
                .from('pets')
                .insert({
                    owner_id: customerId,
                    name: pet.name,
                    species_id: parseInt(pet.species) || parseInt(pet.species_id) || null,
                    breed_id: parseInt(pet.breed) || parseInt(pet.breed_id) || null,
                    gender: pet.gender === 'Male' ? 'male' : (pet.gender === 'Female' ? 'female' : null),
                    weight_kg: Number(pet.weight),
                    age_years: Number(pet.age),
                })
                .select()
                .single();

            if (!petError && newPet) {
                // Link to Booking
                await supabaseAdmin
                    .from('booking_pets')
                    .insert({
                        booking_id: booking.id,
                        pet_id: newPet.id,
                        recorded_weight_kg: Number(pet.weight)
                    });
            } else {
                console.warn('Failed to create pet:', petError);
            }
        }

        // 4. Link Services
        // 4. Link Services
        for (const s of services) {
            // Handle both legacy string[] and new object[] format
            const serviceId = typeof s === 'string' ? s : s.serviceId;
            const petId = typeof s === 'object' ? s.petId : null;
            const quantity = typeof s === 'object' ? (s.quantity || 1) : 1;

            // We need the UUID of the service from service_catalog.
            // The form sends service IDs (which might be UUIDs or legacy IDs).
            // If they are UUIDs, we can insert directly.
            await supabaseAdmin
                .from('booking_services')
                .insert({
                    booking_id: booking.id,
                    service_id: serviceId,
                    quantity: quantity,
                    unit_price: 0, // Fetch price? Or set 0 for enquiry.
                    pet_id: petId // Insert specific pet ID if applicable
                });
        }

        // --- Construct Legacy Object for Email/WhatsApp ---
        const bookingObj = {
            bookingId: booking.booking_number,
            customer: {
                fullName: contactInfo.fullName,
                email: contactInfo.email,
                phone: contactInfo.phone,
            },
            travel: {
                origin: {
                    country: travelDetails.originCountry,
                    airport: travelDetails.originAirport
                },
                destination: {
                    country: travelDetails.destinationCountry,
                    airport: travelDetails.destinationAirport
                },
                departureDate: new Date(travelDetails.travelDate),
                travelingWithPet: travelDetails.travelingWithPet,
                numberOfPets: pets.length,
                transportMode: travelDetails.transportMode
            },
            pets: pets.map(p => ({
                name: p.name,
                breed: p.breed,
                type: p.species,
                weight: p.weight
            })),
            services: {
                selected: services.map(sId => {
                    const s = SERVICES.find(srv => srv.id === sId);
                    return s ? { name: s.title } : { name: 'Unknown Service' };
                })
            }
        };

        // Send Email with Timeout
        try {
            console.log('Attempting to send email...');

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
                connectionTimeout: 5000,
                greetingTimeout: 5000,
                socketTimeout: 10000,
            });

            const emailContent = generateEmailTemplate(bookingObj);
            const companyEmailContent = generateEmailTemplate(bookingObj, 'company');

            const sendEmailsPromise = async () => {
                const customerEmail = bookingObj.customer.email;
                const customerName = bookingObj.customer.fullName;

                if (!customerEmail) throw new Error('Customer email not found');

                await transporter.sendMail({
                    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: customerEmail,
                    subject: `Booking Confirmation - ${bookingObj.bookingId} | Pawpaths`,
                    html: emailContent,
                });

                await transporter.sendMail({
                    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: process.env.EMAIL_USER,
                    subject: `[NEW BOOKING] ${bookingObj.bookingId} - ${customerName}`,
                    html: companyEmailContent,
                });
            };

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Email sending timed out')), 10000)
            );

            await Promise.race([sendEmailsPromise(), timeoutPromise]);
            console.log('Emails sent successfully');

        } catch (emailError) {
            console.error('Email sending failed (Non-blocking):', emailError.message);
        }

        // Generate WhatsApp Link
        const whatsappMessage = generateWhatsAppMessage(bookingObj); // Pass the constructed object
        const whatsappLink = generateWhatsAppLink(whatsappMessage);

        return NextResponse.json({
            success: true,
            bookingId: booking.booking_number,
            booking: bookingObj,
            message: 'Booking confirmed successfully',
            whatsappLink,
            whatsappMessage
        }, { status: 201 });

    } catch (error) {
        console.error('Booking submission error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
