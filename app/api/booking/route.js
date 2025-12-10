import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { generateEmailTemplate } from '@/lib/utils/emailTemplate';
import { generateWhatsAppMessage, generateWhatsAppLink } from '@/lib/utils/whatsappMessage';
import { validateBookingData } from '@/lib/utils/validation';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        await dbConnect();

        const data = await req.json();

        // Validate data
        const validation = validateBookingData(data);
        if (!validation.isValid) {
            return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
        }

        // Calculate total weight
        const totalWeight = data.pets.reduce((acc, pet) => acc + Number(pet.weight), 0);

        // Create booking object
        const bookingData = {
            ...data,
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

            const emailContent = generateEmailTemplate(booking);
            const companyEmailContent = generateEmailTemplate(booking, 'company');

            // Define email promise
            const sendEmailsPromise = async () => {
                // 1. Send Customer Confirmation Email
                await transporter.sendMail({
                    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: booking.customerInfo.email,
                    subject: `Booking Confirmation - ${booking.bookingId} | Pawpaths`,
                    html: emailContent,
                });

                // 2. Send Company Notification Email
                await transporter.sendMail({
                    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: process.env.EMAIL_USER,
                    subject: `[NEW BOOKING] ${booking.bookingId} - ${booking.customerInfo.fullName}`,
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
