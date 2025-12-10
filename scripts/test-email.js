const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Manually load .env.local to avoid installing dotenv
try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split(/\r?\n/).forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('='); // Rejoin if value contained =
                process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
            }
        });
    }
} catch (e) {
    console.error('Warning: Could not load .env.local', e);
}

async function testEmail() {
    console.log('Testing Email Configuration...');
    console.log(`Host: ${process.env.EMAIL_HOST}`);
    console.log(`Port: ${process.env.EMAIL_PORT}`);
    console.log(`User: ${process.env.EMAIL_USER}`);
    // Do not log the password!

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection successful! Your credentials are correct.');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Pawpaths',
            text: 'If you see this, your email configuration is working correctly!',
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Email Test Failed:');
        console.error(error);

        if (error.code === 'EAUTH') {
            console.log('\n--- TROUBLESHOOTING ---');
            console.log('1. Ensure you are using an App Password, NOT your regular login password.');
            console.log('2. Check if 2-Step Verification is enabled on your Google Account.');
            console.log('3. Verify there are no extra spaces in your password in .env.local');
        }
    }
}

testEmail();
