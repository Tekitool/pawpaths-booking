const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, '');
    }
});

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('Host:', env.EMAIL_HOST);
    console.log('Port:', env.EMAIL_PORT);
    console.log('User:', env.EMAIL_USER);
    // console.log('Pass:', env.EMAIL_PASSWORD); // Don't log password

    const transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: Number(env.EMAIL_PORT),
        secure: false,
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"${env.COMPANY_NAME || 'Pawpaths Test'}" <${env.EMAIL_FROM || env.EMAIL_USER}>`,
            to: env.EMAIL_USER, // Send to self
            subject: 'Test Email from Script',
            text: 'If you receive this, the email configuration is working.',
            html: '<p>If you receive this, the <strong>email configuration is working</strong>.</p>'
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Email Test Failed:', error);
    }
}

testEmail();
