'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import nodemailer from 'nodemailer'
import { generateEmailTemplate } from '@/lib/utils/emailTemplate'

import { EnquirySchema } from '@/lib/schemas';
import { COUNTRIES } from '@/lib/constants/countries';

export async function submitEnquiry(formData) {
    console.log('SERVER ACTION: submitEnquiry called');
    const supabase = createAdminClient()

    try {
        console.log('SERVER ACTION: Parsing formData...');

        // 1. Validate Data with Zod
        const validationResult = EnquirySchema.safeParse(formData);

        if (!validationResult.success) {
            // Helper to format Zod errors into dot notation (e.g. "contactInfo.email")
            const formatZodErrors = (error) => {
                const formatted = {};
                error.issues.forEach((issue) => {
                    const path = issue.path.join('.');
                    if (!formatted[path]) {
                        formatted[path] = [];
                    }
                    formatted[path].push(issue.message);
                });
                return formatted;
            };

            const formattedErrors = formatZodErrors(validationResult.error);
            console.error('Validation Failed:', formattedErrors);

            return {
                success: false,
                message: 'Validation failed. Please check your inputs.',
                errors: formattedErrors
            };
        }

        const { travelDetails, pets, services, contactInfo } = validationResult.data;
        console.log('SERVER ACTION: Contact Info received:', contactInfo);

        // 1. Find or Create Entity (Customer)
        // Check if customer exists by email
        let customerId
        const { data: existingCustomers, error: searchError } = await supabase
            .from('entities')
            .select('id')
            .eq('contact_info->>email', contactInfo.email)
            .limit(1)

        if (searchError) throw new Error(`Error searching customer: ${searchError.message}`)

        if (existingCustomers && existingCustomers.length > 0) {
            customerId = existingCustomers[0].id
        } else {
            // Create new customer
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
                .single()

            if (createError) throw new Error(`Error creating customer: ${createError.message}`)
            customerId = newCustomer.id
        }

        // 2. Create Pets
        const petIds = []
        for (const pet of pets) {
            // Map gender to DB enum
            // DB Enum: 'Male', 'Female', 'Male_Neutered', 'Female_Spayed', 'Unknown'
            // Frontend now sends these exact values if fetched from DB, but might send old values if cached or fallback used.
            let dbGender = 'Unknown'
            const validGenders = ['Male', 'Female', 'Male_Neutered', 'Female_Spayed', 'Unknown'];

            if (validGenders.includes(pet.gender)) {
                dbGender = pet.gender;
            } else if (pet.gender === 'Desexed') {
                // Handle legacy 'Desexed' by defaulting to Unknown or trying to infer? 
                // Since we don't know if it's male or female desexed, 'Unknown' is safest, 
                // or we could split it if we had sex info. But 'Desexed' was a standalone option.
                dbGender = 'Unknown';
            }

            const { data: newPet, error: petError } = await supabase
                .from('pets')
                .insert({
                    owner_id: customerId,
                    name: pet.name,
                    species_id: parseInt(pet.species_id) || null,
                    breed_id: parseInt(pet.breed_id) || null,
                    gender: dbGender,
                    weight_kg: parseFloat(pet.weight) || 0,
                    age_years: parseInt(pet.age) || 0, // Assuming age is years for now or we parse unit
                    medical_alerts: pet.specialRequirements ? [pet.specialRequirements] : [], // Store as JSONB array
                })
                .select('id')
                .single()

            if (petError) throw new Error(`Error creating pet ${pet.name}: ${petError.message}`)
            petIds.push(newPet.id)
        }

        // 3. Create Booking
        // Determine Service Type
        let serviceType = 'local'; // Default
        const origin = travelDetails.originCountry?.toLowerCase();
        const dest = travelDetails.destinationCountry?.toLowerCase();

        const isOriginUAE = origin === 'ae' || origin === 'uae' || origin?.includes('united arab emirates');
        const isDestUAE = dest === 'ae' || dest === 'uae' || dest?.includes('united arab emirates');

        if (isOriginUAE && !isDestUAE) serviceType = 'export';
        else if (!isOriginUAE && isDestUAE) serviceType = 'import';
        else if (isOriginUAE && isDestUAE) serviceType = 'local'; // or domestic
        else serviceType = 'transit';

        // Helper to find Node ID
        const findNodeId = async (countryCode, airportCode) => {
            if (!countryCode) return null;

            // 1. Try to find specific airport node if code provided
            if (airportCode) {
                const { data: airportNode } = await supabase
                    .from('logistics_nodes')
                    .select('id')
                    .eq('node_type', 'airport')
                    .or(`iata_code.eq.${airportCode},name.ilike.%${airportCode}%`)
                    .limit(1)
                    .single();

                if (airportNode) return airportNode.id;
            }

            // 2. Fallback: Find a generic 'city' or 'country' node for the country
            // First get country ID
            const { data: country } = await supabase
                .from('countries')
                .select('id')
                .or(`iso_code.eq.${countryCode},iso_code_3.eq.${countryCode},name.ilike.%${countryCode}%`)
                .limit(1)
                .single();

            if (!country) return null;

            // Find any node in this country (preferably a main city or airport)
            const { data: countryNode } = await supabase
                .from('logistics_nodes')
                .select('id')
                .eq('country_id', country.id)
                .limit(1)
                .single();

            return countryNode?.id || null;
        };

        const originNodeId = await findNodeId(travelDetails.originCountry, travelDetails.originAirport);
        const destinationNodeId = await findNodeId(travelDetails.destinationCountry, travelDetails.destinationAirport);

        const { data: newBooking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                customer_id: customerId,
                status: 'enquiry',
                service_type: serviceType,
                transport_mode: travelDetails.transportMode || 'manifest_cargo',
                scheduled_departure_date: travelDetails.travelDate,
                origin_node_id: originNodeId,
                destination_node_id: destinationNodeId,
                origin_node_id: originNodeId,
                destination_node_id: destinationNodeId,
                internal_notes: `Origin: ${travelDetails.originCountry} (${travelDetails.originAirport})\nDestination: ${travelDetails.destinationCountry} (${travelDetails.destinationAirport})`,
                // File Uploads
                pet_photo_path: formData.pet_photo_path || null,
                documents_path: formData.documents_path || null,
                passport_path: formData.passport_path || null,
                vaccination_path: formData.vaccination_path || null,
                rabies_path: formData.rabies_path || null,
                enquiry_session_id: formData.enquiry_session_id || null
            })
            .select('id, booking_number')
            .single()

        if (bookingError) throw new Error(`Error creating booking: ${bookingError.message}`)

        // 4. Link Pets to Booking
        if (petIds.length > 0) {
            const bookingPetsData = pets.map((pet, index) => ({
                booking_id: newBooking.id,
                pet_id: petIds[index], // Assuming order is preserved, which it should be
                recorded_weight_kg: parseFloat(pet.weight) || 0,
                notes: pet.specialRequirements || null
            }))

            const { error: linkError } = await supabase
                .from('booking_pets')
                .insert(bookingPetsData)

            if (linkError) throw new Error(`Error linking pets: ${linkError.message}`)
        }

        // 5. Add Services
        let servicesList = [];
        if (services && services.length > 0) {
            console.log('Processing services:', services);

            // 1. Fetch matching services from catalog
            const { data: catalogServices, error: catalogError } = await supabase
                .from('service_catalog')
                .select('id, code, base_price, name')
                .in('id', services);

            if (catalogError) {
                console.error('Error fetching service catalog:', catalogError);
            }

            const validServices = catalogServices || [];
            const validServiceIds = validServices.map(s => s.id);
            const unmappedServices = services.filter(s => !validServiceIds.includes(s));

            // 2. Prepare inserts for valid services
            const serviceInserts = validServices.map(service => ({
                booking_id: newBooking.id,
                service_id: service.id,
                quantity: 1, // Default quantity
                unit_price: service.base_price || 0,
                // notes: service.name // Removed as 'notes' might not be in booking_services schema, or keep if it is. 
                // The prompt says: booking_id, service_id, unit_price, quantity, line_total.
                // line_total is usually calculated or generated.
            }));

            if (serviceInserts.length > 0) {
                const { error: servicesInsertError } = await supabase
                    .from('booking_services')
                    .insert(serviceInserts);

                if (servicesInsertError) {
                    console.error('Error inserting booking services:', servicesInsertError);
                }
            }

            // 3. Update internal notes with summary
            let notesUpdate = `Origin: ${travelDetails.originCountry} (${travelDetails.originAirport})\nDestination: ${travelDetails.destinationCountry} (${travelDetails.destinationAirport})`;

            if (unmappedServices.length > 0) {
                notesUpdate += `\n\n[Unmapped Service IDs]: ${unmappedServices.join(', ')}`;
            }

            if (validServices.length > 0) {
                notesUpdate += `\n\n[Linked Services]: ${validServices.map(s => s.name).join(', ')}`;
                servicesList = validServices.map(s => s.name);
            }

            await supabase
                .from('bookings')
                .update({ internal_notes: notesUpdate })
                .eq('id', newBooking.id);
        } else {
            // Just update notes if no services
            await supabase
                .from('bookings')
                .update({
                    internal_notes: `Origin: ${travelDetails.originCountry} (${travelDetails.originAirport})\nDestination: ${travelDetails.destinationCountry} (${travelDetails.destinationAirport})`
                })
                .eq('id', newBooking.id);
        }

        // --- EMAIL NOTIFICATION LOGIC ---
        try {
            console.log('Starting email notification process...')

            // Verify contact info
            if (!contactInfo?.email) {
                console.error('No customer email provided, skipping email notification')
                throw new Error('No customer email provided')
            }

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false
                }
            })

            // Verify connection first
            try {
                await transporter.verify()
                console.log('SMTP Connection verified')
            } catch (verifyError) {
                console.error('SMTP Connection failed:', verifyError)
                throw verifyError
            }

            // Helper to fetch names (simple implementation, can be optimized)
            const getSpeciesName = async (id) => {
                if (!id) return 'Unknown';
                const { data } = await supabase.from('species').select('name').eq('id', id).single();
                return data?.name || 'Unknown';
            };

            const getBreedName = async (id) => {
                if (!id) return 'Unknown';
                const { data } = await supabase.from('breeds').select('name').eq('id', id).single();
                return data?.name || 'Unknown';
            };

            const petsForEmail = await Promise.all(pets.map(async p => ({
                name: p.name,
                type: await getSpeciesName(p.species_id),
                breed: await getBreedName(p.breed_id),
                age: `${p.age} ${p.ageUnit || 'years'}`,
                weight: p.weight,
                specialRequirements: p.specialRequirements
            })));

            // Helper to get country label
            const getCountryLabel = (code) => {
                if (!code) return 'Unknown';
                if (code === 'GB') return 'United Kingdom';
                const country = COUNTRIES.find(c => c.value === code);
                return country ? country.label : code;
            };

            // Determine formatted service title
            const getServiceTitle = (type) => {
                switch (type) {
                    case 'export': return 'International Export Services';
                    case 'import': return 'International Import Services';
                    case 'local': return 'Domestic Relocation Services';
                    case 'transit': return 'Transit Services';
                    default: return 'Relocation Services';
                }
            };

            const serviceTitle = getServiceTitle(serviceType);
            const transportModeLabel = travelDetails.transportMode
                ? travelDetails.transportMode.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                : 'Manifest Cargo';

            const fullServiceString = `${serviceTitle} - ${transportModeLabel}`;

            // Construct booking object for template
            const bookingObj = {
                bookingId: newBooking.booking_number,
                customer: {
                    fullName: contactInfo.fullName,
                    email: contactInfo.email,
                    phone: contactInfo.phone,
                },
                travel: {
                    origin: {
                        country: getCountryLabel(travelDetails.originCountry),
                        airport: travelDetails.originAirport,
                    },
                    destination: {
                        country: getCountryLabel(travelDetails.destinationCountry),
                        airport: travelDetails.destinationAirport,
                    },
                    departureDate: travelDetails.travelDate,
                    transportMode: travelDetails.transportMode || 'manifest_cargo',
                    serviceString: fullServiceString,
                    travelingWithPet: travelDetails.travelingWithPet || travelDetails.clientTravelingWithPet
                },
                pets: petsForEmail,
                services: servicesList,
                totalWeight: pets.reduce((acc, p) => acc + (parseFloat(p.weight) || 0), 0)
            }

            console.log('Generating email templates...')
            const emailContent = generateEmailTemplate(bookingObj)
            const companyEmailContent = generateEmailTemplate(bookingObj, 'company')

            // 1. Send Customer Confirmation Email
            console.log(`Sending customer email to ${contactInfo.email}...`)
            await transporter.sendMail({
                from: `"${process.env.COMPANY_NAME || 'Pawpaths'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: contactInfo.email,
                subject: `Booking Confirmation - ${bookingObj.bookingId} | Pawpaths`,
                html: emailContent,
            })
            console.log('Customer email sent successfully')

            // 2. Send Company Notification Email
            console.log(`Sending company email to ${process.env.EMAIL_USER}...`)
            await transporter.sendMail({
                from: `"${process.env.COMPANY_NAME || 'Pawpaths'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `[NEW BOOKING] ${bookingObj.bookingId} - ${contactInfo.fullName}`,
                html: companyEmailContent,
            })
            console.log('Company email sent successfully')

        } catch (emailError) {
            console.error('Email sending failed (non-fatal):', emailError)
            // We don't throw here to ensure the booking success is returned
        }

        return { success: true, bookingReference: newBooking.booking_number }

    } catch (error) {
        console.error('Submit Enquiry Error:', error)
        return { success: false, message: error.message }
    }
}
