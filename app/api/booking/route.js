import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import CustomerType from '@/lib/models/CustomerType';
import { generateEmailTemplate } from '@/lib/utils/emailTemplate';
import { generateWhatsAppMessage, generateWhatsAppLink } from '@/lib/utils/whatsappMessage';
import { validateBookingData } from '@/lib/utils/validation';
import nodemailer from 'nodemailer';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
    try {
        await dbConnect();

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

        // Import storage service dynamically to avoid issues if not fully set up
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

                // File is valid, proceed with upload using storage service
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

        // Check for UAE (case-insensitive)
        const isOriginUAE = originCountry?.toLowerCase().includes('united arab emirates') || originCountry?.toLowerCase() === 'uae';
        const isDestUAE = destinationCountry?.toLowerCase().includes('united arab emirates') || destinationCountry?.toLowerCase() === 'uae';

        if (isOriginUAE && isDestUAE) {
            customerTypeCode = 'LOCL';
        } else if (isOriginUAE && !isDestUAE) {
            // Export
            customerTypeCode = isTravelingWithPet ? 'EX-A' : 'EX-U';
        } else if (!isOriginUAE && isDestUAE) {
            // Import
            customerTypeCode = isTravelingWithPet ? 'IM-A' : 'IM-U';
        }
        // Note: For Overseas -> Overseas, we might default to LOCL or handle differently, but requirements didn't specify. 
        // Keeping default LOCL or maybe we should log it. For now, following the main 5 types.

        // Fetch the CustomerType ObjectId
        const customerTypeDoc = await CustomerType.findOne({ type_code: customerTypeCode });

        // Transform data to match Booking model schema
        const bookingData = {
            customer: {
                customerType: customerTypeDoc?._id,
                fullName: contactInfo.fullName,
                email: contactInfo.email,
                phone: contactInfo.phone,
                address: {
                    city: contactInfo.city || ''
                },
                documents: uploadedDocuments
            },
            travel: {
                origin: {
                    country: travelDetails.originCountry,
                    airport: travelDetails.originAirport,
                },
                destination: {
                    country: travelDetails.destinationCountry,
                    airport: travelDetails.destinationAirport,
                },
                departureDate: new Date(travelDetails.travelDate),
                travelingWithPet: travelDetails.travelingWithPet || false,
                numberOfPets: pets.length
            },
            pets: pets.map(pet => ({
                ...pet,
                gender: pet.gender === '' ? undefined : pet.gender, // Handle empty gender for enum validation
                age: Number(pet.age),
                weight: Number(pet.weight)
            })),
            services: {
                selected: (services || []).map(serviceId => {
                    const SERVICES = require('@/lib/constants/services').SERVICES;
                    const service = SERVICES.find(s => s.id === serviceId);
                    return service ? {
                        serviceId: service.id,
                        name: service.title,
                        description: service.description,
                        price: service.basePrice
                    } : null;
                }).filter(Boolean)
            },
            // Additional fields for compatibility
            customerInfo: {
                fullName: contactInfo.fullName,
                email: contactInfo.email,
                phone: contactInfo.phone,
            },
            travelDetails: travelDetails,
            totalWeight
        };

        // Save to database
        const booking = await Booking.create(bookingData);

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
                // Add connection timeout
                connectionTimeout: 5000, // 5 seconds
                greetingTimeout: 5000,
                socketTimeout: 10000,
            });

            // Convert to plain object to ensure all virtuals/getters are available
            const bookingObj = booking.toObject();

            const emailContent = generateEmailTemplate(bookingObj);
            const companyEmailContent = generateEmailTemplate(bookingObj, 'company');

            console.log('Email content generated. Length:', emailContent.length);

            // Define email promise
            const sendEmailsPromise = async () => {
                // Get customer info with fallback for both formats
                const customerEmail = bookingObj.customer?.email || bookingObj.customerInfo?.email;
                const customerName = bookingObj.customer?.fullName || bookingObj.customerInfo?.fullName;

                if (!customerEmail) {
                    throw new Error('Customer email not found in booking');
                }

                // 1. Send Customer Confirmation Email
                await transporter.sendMail({
                    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: customerEmail,
                    subject: `Booking Confirmation - ${bookingObj.bookingId} | Pawpaths`,
                    html: emailContent,
                });
                console.log(`Customer email sent to: ${customerEmail}`);

                // 2. Send Company Notification Email
                await transporter.sendMail({
                    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: process.env.EMAIL_USER,
                    subject: `[NEW BOOKING] ${bookingObj.bookingId} - ${customerName || 'Customer'}`,
                    html: companyEmailContent,
                });
                console.log(`Company email sent to: ${process.env.EMAIL_USER}`);
            };

            // Race against a 10-second timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Email sending timed out')), 10000)
            );

            await Promise.race([sendEmailsPromise(), timeoutPromise]);
            console.log('Emails sent successfully');

        } catch (emailError) {
            console.error('Email sending failed (Non-blocking):', emailError.message);
            // Continue execution, don't fail the booking just because email failed
        }

        // Generate WhatsApp Link
        const whatsappMessage = generateWhatsAppMessage(booking);
        const whatsappLink = generateWhatsAppLink(whatsappMessage);

        return NextResponse.json({
            success: true,
            bookingId: booking.bookingId,
            booking: booking, // Return full booking object
            message: 'Booking confirmed successfully',
            whatsappLink,
            whatsappMessage
        }, { status: 201 });

    } catch (error) {
        console.error('Booking submission error:', error);

        // Handle Mongoose Validation Errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({
                success: false,
                message: 'Validation Error',
                errors: validationErrors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
