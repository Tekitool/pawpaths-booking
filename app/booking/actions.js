'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import nodemailer from 'nodemailer'
import { generateEmailTemplate } from '@/lib/utils/emailTemplate'
import { getPublicUrl, STORAGE_BUCKETS } from '@/lib/services/storage'

import { EnquirySchema } from '@/lib/schemas';
import { COUNTRIES } from '@/lib/constants/countries';
import { isUAE } from '@/lib/utils/uae';

export async function submitEnquiry(formData) {
    const supabase = createAdminClient()

    try {

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
            console.error('Validation Failed:', Object.keys(formattedErrors));

            return {
                success: false,
                message: 'Validation failed. Please check your inputs.',
                errors: formattedErrors
            };
        }

        const { travelDetails, pets, services, contactInfo } = validationResult.data;

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
            // Resolve WhatsApp number
            const whatsappNumber = contactInfo.whatsappSameAsPhone
                ? contactInfo.phone
                : (contactInfo.whatsapp || contactInfo.phone);

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
                        whatsapp: whatsappNumber,
                        address: contactInfo.address?.street
                            ? contactInfo.address
                            : (contactInfo.city || null),
                    }
                })
                .select('id')
                .single()

            if (createError) throw new Error(`Error creating customer: ${createError.message}`)
            customerId = newCustomer.id
        }

        // ── Idempotency trap ──────────────────────────────────────────────────────
        // If a booking was already created for this customer in the last 60 seconds,
        // treat this as a duplicate submission (double-click, network retry, aggressive
        // browser re-send). Return the existing reference so the frontend routes the
        // user to the success page without creating a second record or sending more email.
        const sixtySecondsAgo = new Date(Date.now() - 60_000).toISOString()
        const { data: recentBooking } = await supabase
            .from('bookings')
            .select('id, booking_number')
            .eq('customer_id', customerId)
            .gte('created_at', sixtySecondsAgo)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (recentBooking) {
            console.warn(`[IDEMPOTENCY] Duplicate submission detected — returning existing reference ${recentBooking.booking_number}`)
            return { success: true, bookingReference: recentBooking.booking_number }
        }

        // 2. Create Pets (single batch insert — avoids N+1 round-trips)
        const validGenders = ['Male', 'Female', 'Male_Neutered', 'Female_Spayed', 'Unknown'];
        const petInserts = pets.map(pet => {
            const dbGender = validGenders.includes(pet.gender) ? pet.gender : 'Unknown';
            const ageNum = Number(pet.age) || 0;
            const ageUnit = pet.ageUnit || 'years';
            const ageYears = ageUnit === 'months' ? Math.floor(ageNum / 12) : ageNum;
            const ageMonths = ageUnit === 'months' ? ageNum : ageNum * 12;
            return {
                owner_id: customerId,
                name: pet.name,
                species_id: parseInt(pet.species_id) || null,
                breed_id: parseInt(pet.breed_id) || null,
                gender: dbGender,
                weight_kg: parseFloat(pet.weight) || 0,
                age_years: ageYears,
                age_months: ageMonths,
                microchip_id: pet.microchip_id || null,
                passport_number: pet.passport_number || null,
                date_of_birth: pet.date_of_birth || null,
                is_dob_estimated: !pet.date_of_birth,
                medical_alerts: pet.medical_alerts ? [pet.medical_alerts] : (pet.specialRequirements ? [pet.specialRequirements] : []),
            };
        });

        const { data: newPets, error: petError } = await supabase
            .from('pets')
            .insert(petInserts)
            .select('id')

        if (petError) throw new Error(`Error creating pets: ${petError.message}`)
        const petIds = newPets.map(p => p.id)

        // 2b. Resolve & persist a photo for EVERY pet
        // Priority: uploaded photo → copy breed default to photos bucket → avatars ref → frontend URL
        const sessionId = formData.enquiry_session_id
        // Access raw (pre-Zod) pets array for breedDefaultImageUrl — Zod strips unknown keys
        const rawPets = formData.pets || []

        for (let i = 0; i < pets.length; i++) {
            const uploadedPath = formData[`pet_${i}_photo_path`]
            let photoEntry = null

            if (uploadedPath) {
                // User uploaded a custom photo — already in the photos bucket
                photoEntry = {
                    url: getPublicUrl(STORAGE_BUCKETS.PHOTOS, uploadedPath),
                    storage_path: uploadedPath,
                    bucket: STORAGE_BUCKETS.PHOTOS,
                    source: 'user_upload',
                }
                console.log(`[PHOTO] Pet ${i}: using user-uploaded photo at ${uploadedPath}`)
            } else {
                // No upload — copy the breed default image into the photos bucket
                // so each pet owns an independent file under their enquiry folder
                const breedId = pets[i].breed_id
                const frontendBreedUrl = rawPets[i]?.breedDefaultImageUrl || null
                console.log(`[PHOTO] Pet ${i}: no upload. breedId=${breedId}, frontendBreedUrl=${frontendBreedUrl}`)

                if (breedId) {
                    const { data: breedRow, error: breedErr } = await supabase
                        .from('breeds')
                        .select('default_image_path, name')
                        .eq('id', breedId)
                        .single()

                    if (breedErr) {
                        console.error(`[PHOTO] Pet ${i}: breed query failed for id=${breedId}:`, breedErr.message)
                    }

                    if (breedRow?.default_image_path) {
                        console.log(`[PHOTO] Pet ${i}: breed "${breedRow.name}" default_image_path="${breedRow.default_image_path}"`)
                        try {
                            // 1. Download the original from the avatars bucket
                            const { data: fileBlob, error: downloadErr } = await supabase.storage
                                .from(STORAGE_BUCKETS.AVATARS)
                                .download(breedRow.default_image_path)

                            if (downloadErr) throw downloadErr

                            // 2. Determine extension and build the destination path
                            const ext = breedRow.default_image_path.split('.').pop() || 'webp'
                            const destPath = `enquiries/${sessionId}/pet-${i}/photos/breed-default.${ext}`

                            // 3. Upload the copy into the photos bucket
                            const { data: uploadData, error: uploadErr } = await supabase.storage
                                .from(STORAGE_BUCKETS.PHOTOS)
                                .upload(destPath, fileBlob, {
                                    cacheControl: '3600',
                                    upsert: true,
                                    contentType: fileBlob.type || `image/${ext}`,
                                })

                            if (uploadErr) throw uploadErr

                            photoEntry = {
                                url: getPublicUrl(STORAGE_BUCKETS.PHOTOS, uploadData.path),
                                storage_path: uploadData.path,
                                bucket: STORAGE_BUCKETS.PHOTOS,
                                source: 'breed_default',
                                original_breed: breedRow.name,
                            }
                            console.log(`[PHOTO] Pet ${i}: breed default copied to ${uploadData.path}`)
                        } catch (copyErr) {
                            console.error(`[PHOTO] Pet ${i}: copy failed:`, copyErr.message)
                            // Fallback: store a reference to the original avatars image
                            photoEntry = {
                                url: getPublicUrl(STORAGE_BUCKETS.AVATARS, breedRow.default_image_path),
                                storage_path: breedRow.default_image_path,
                                bucket: STORAGE_BUCKETS.AVATARS,
                                source: 'breed_default_ref',
                                original_breed: breedRow.name,
                            }
                        }
                    } else {
                        console.warn(`[PHOTO] Pet ${i}: breed id=${breedId} has no default_image_path in DB`)
                    }
                }

                // Ultimate fallback: use the breed image URL the frontend already resolved
                if (!photoEntry && frontendBreedUrl) {
                    console.warn(`[PHOTO] Pet ${i}: all DB paths failed — using frontend breedDefaultImageUrl`)
                    photoEntry = {
                        url: frontendBreedUrl,
                        storage_path: null,
                        bucket: null,
                        source: 'breed_default_frontend',
                    }
                }
            }

            if (photoEntry) {
                const { error: photoError } = await supabase
                    .from('pets')
                    .update({ photos: [photoEntry] })
                    .eq('id', petIds[i])

                if (photoError) {
                    console.error(`[PHOTO] Failed to save photo for pet ${petIds[i]}:`, photoError.message)
                } else {
                    console.log(`[PHOTO] Pet ${i} (id=${petIds[i]}): saved photo (source=${photoEntry.source})`)
                }
            } else {
                console.warn(`[PHOTO] Pet ${i} (id=${petIds[i]}): NO photo resolved — photos column will be empty`)
            }
        }

        // 3. Create Booking
        // Determine Service Type
        let serviceType = 'local'; // Default
        const origin = travelDetails.originCountry?.toLowerCase();
        const dest = travelDetails.destinationCountry?.toLowerCase();

        const isOriginUAE = isUAE(origin);
        const isDestUAE = isUAE(dest);

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
                traveling_with_pet: travelDetails.travelingWithPet || false,
                number_of_pets: pets.length,
                scheduled_departure_date: travelDetails.travelDate,
                origin_node_id: originNodeId,
                destination_node_id: destinationNodeId,
                origin_raw: {
                    country: travelDetails.originCountry,
                    airport: travelDetails.originAirport
                },
                destination_raw: {
                    country: travelDetails.destinationCountry,
                    airport: travelDetails.destinationAirport
                },
                customer_contact_snapshot: contactInfo,
                internal_notes: '',
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

        // 5. Add Services (handles both object and plain-ID formats)
        let servicesList = [];
        if (services && services.length > 0) {

            // Normalise: accept [{ serviceId, petId, quantity }] or plain ["uuid"]
            const selections = services.map(s =>
                typeof s === 'string'
                    ? { serviceId: s, petId: null, quantity: 1 }
                    : { serviceId: s.serviceId || s.id || s, petId: s.petId || null, quantity: s.quantity || 1 }
            );

            const uniqueServiceIds = [...new Set(selections.map(s => s.serviceId))];

            // 1. Fetch matching services from catalog
            const { data: catalogServices, error: catalogError } = await supabase
                .from('service_catalog')
                .select('id, code, base_price, base_cost, tax_rate, pricing_model, name')
                .in('id', uniqueServiceIds);

            if (catalogError) {
                console.error('Error fetching service catalog:', catalogError);
            }

            const catalogMap = new Map((catalogServices || []).map(s => [s.id, s]));
            const unmappedIds = uniqueServiceIds.filter(id => !catalogMap.has(id));

            // 2. Prepare inserts — one row per selection (preserves pet association)
            const serviceInserts = selections
                .filter(sel => catalogMap.has(sel.serviceId))
                .map(sel => {
                    const catalog = catalogMap.get(sel.serviceId);
                    return {
                        booking_id: newBooking.id,
                        service_id: catalog.id,
                        pet_id: sel.petId || null,
                        quantity: sel.quantity,
                        unit_price: catalog.base_price || 0,
                        unit_cost: catalog.base_cost || 0,
                        tax_rate: catalog.tax_rate ?? 5.0,
                        pricing_model: catalog.pricing_model || 'fixed',
                    };
                });

            if (serviceInserts.length > 0) {
                const { error: servicesInsertError } = await supabase
                    .from('booking_services')
                    .insert(serviceInserts);

                if (servicesInsertError) {
                    console.error('Error inserting booking services:', servicesInsertError);
                }
            }

            if (unmappedIds.length > 0) {
                console.warn(`[Unmapped Service IDs in booking ${newBooking.booking_number}]: ${unmappedIds.join(', ')}`);
            }

            if (catalogMap.size > 0) {
                servicesList = [...catalogMap.values()].map(s => s.name);
            }
        }

        // --- EMAIL NOTIFICATION LOGIC ---
        try {

            // Verify contact info
            if (!contactInfo?.email) {
                console.error('No customer email provided, skipping email notification')
                throw new Error('No customer email provided')
            }

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT) || 587,
                secure: Number(process.env.EMAIL_PORT) === 465,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
                tls: {
                    // Enforce certificate validation in production to prevent MITM.
                    // Set EMAIL_TLS_REJECT_UNAUTHORIZED=false ONLY in dev with self-signed certs.
                    rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
                },
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

            const petsForEmail = await Promise.all(pets.map(async (p, petIdx) => {
                // Resolve pet photo: uploaded path → public URL, else breed default
                let photoUrl = null;
                const uploadedPath = formData[`pet_${petIdx}_photo_path`];
                if (uploadedPath) {
                    photoUrl = getPublicUrl(STORAGE_BUCKETS.PHOTOS, uploadedPath);
                } else {
                    photoUrl = formData.pets?.[petIdx]?.breedDefaultImageUrl || null;
                }

                return {
                    name: p.name,
                    type: await getSpeciesName(p.species_id),
                    breed: await getBreedName(p.breed_id),
                    age: `${p.age} ${p.ageUnit || 'years'}`,
                    weight: p.weight,
                    specialRequirements: p.specialRequirements,
                    photoUrl
                };
            }));

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

            const emailContent = generateEmailTemplate(bookingObj)
            const companyEmailContent = generateEmailTemplate(bookingObj, 'company')

            const fromAddress = `"${process.env.COMPANY_NAME || 'Pawpaths'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`

            // ── Build both mail payloads ─────────────────────────────────────
            const customerMailPayload = {
                from: fromAddress,
                to: contactInfo.email,
                subject: `Enquiry Confirmation - ${bookingObj.bookingId} | Pawpaths`,
                html: emailContent,
            }

            const companyMailPayload = {
                from: fromAddress,
                // Use dedicated notification address if set; fall back to the sending account
                to: process.env.COMPANY_NOTIFICATION_EMAIL || process.env.EMAIL_USER,
                // Reply-To lets the admin hit "Reply" in their inbox and land directly in the
                // client's inbox — no copy-pasting required
                replyTo: contactInfo.email,
                subject: `[NEW ENQUIRY] ${bookingObj.bookingId} - ${contactInfo.fullName}`,
                html: companyEmailContent,
            }

            // ── Parallel dispatch with Promise.allSettled ────────────────────
            // allSettled is used instead of Promise.all because it waits for every
            // promise to settle regardless of outcome. With Promise.all, a single
            // failed send would reject the whole group and surface as an uncaught
            // error — potentially hiding which email actually failed and making the
            // booking appear to error even though the DB write succeeded. allSettled
            // gives us an independent result for each send so we can log precisely.
            console.log(`[EMAIL] Dispatching in parallel → client + company`)
            const [customerResult, companyResult] = await Promise.allSettled([
                transporter.sendMail(customerMailPayload),
                transporter.sendMail(companyMailPayload),
            ])

            // ── Diagnostic logging ───────────────────────────────────────────
            if (customerResult.status === 'fulfilled') {
                console.log('[EMAIL] Customer confirmation sent | messageId:', customerResult.value?.messageId ?? customerResult.value?.response)
            } else {
                console.error('[EMAIL] Customer email FAILED:', customerResult.reason)
            }

            if (companyResult.status === 'fulfilled') {
                console.log('[EMAIL] Company notification sent | messageId:', companyResult.value?.messageId ?? companyResult.value?.response)
            } else {
                console.error('[EMAIL] Company email FAILED:', companyResult.reason)
            }

        } catch (emailError) {
            // Catches SMTP connection/verify failures — the DB write already succeeded
            console.error('[EMAIL] Fatal dispatch error (non-fatal to booking):', emailError)
        }

        return { success: true, bookingReference: newBooking.booking_number }

    } catch (error) {
        console.error('Submit Enquiry Error:', error.message)
        return { success: false, message: error.message }
    }
}
