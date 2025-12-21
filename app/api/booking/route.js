import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
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

        // Parse JSON fields
        const travelDetails = JSON.parse(formData.get('travelDetails'));
        const pets = JSON.parse(formData.get('pets'));
        const services = JSON.parse(formData.get('services'));
        const contactInfo = JSON.parse(formData.get('contactInfo'));

        // Handle file uploads
        const uploadedDocuments = [];
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Ensure upload directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            console.error('Error creating upload directory:', err);
        }

        const fileFields = ['passport', 'vaccination', 'rabies'];
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

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
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                const filePath = path.join(uploadDir, fileName);

                await writeFile(filePath, buffer);

                uploadedDocuments.push({
                    type: field,
                    name: file.name,
                    url: `/uploads/${fileName}`
                });
            }
        }

        // Calculate total weight
        const totalWeight = pets.reduce((acc, pet) => acc + Number(pet.weight), 0);

        // Transform data to match Booking model schema
        const bookingData = {
            customer: {
                fullName: contactInfo.fullName,
                email: contactInfo.email,
                phone: contactInfo.phone,
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
            pets: pets,
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
                // 1. Send Customer Confirmation Email
                await transporter.sendMail({
                    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: bookingObj.customerInfo.email,
                    subject: `Booking Confirmation - ${bookingObj.bookingId} | Pawpaths`,
                    html: emailContent,
                });

                // 2. Send Company Notification Email
                await transporter.sendMail({
                    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: process.env.EMAIL_USER,
                    subject: `[NEW BOOKING] ${bookingObj.bookingId} - ${bookingObj.customerInfo.fullName}`,
                    html: companyEmailContent,
                });
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
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
