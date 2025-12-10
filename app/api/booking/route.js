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

        // Send Email
        try {
            console.log('Attempting to send email...');
            console.log('SMTP Config:', {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                user: process.env.EMAIL_USER,
                // pass: '***' // Hide password
            });

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const emailContent = generateEmailTemplate(booking);
            console.log('Email content generated successfully');

            // 1. Send Customer Confirmation Email
            const infoCustomer = await transporter.sendMail({
                from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                to: booking.customerInfo.email,
                subject: `Booking Confirmation - ${booking.bookingId} | Pawpaths`,
                html: emailContent,
            });
            console.log('Customer email sent:', infoCustomer.messageId);

            // 2. Send Company Notification Email
            const companyEmailContent = generateEmailTemplate(booking, 'company');

            const infoCompany = await transporter.sendMail({
                from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
                to: process.env.EMAIL_USER, // Send to company email
                subject: `[NEW BOOKING] ${booking.bookingId} - ${booking.customerInfo.fullName}`,
                html: companyEmailContent,
            });
            console.log('Company notification email sent:', infoCompany.messageId);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
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
