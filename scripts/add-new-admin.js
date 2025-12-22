const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function addAdmin() {
    if (!process.env.MONGODB_URI) {
        console.error('Please define MONGODB_URI in .env.local');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const name = 'Hashif';
        const email = 'hashif'; // User requested "hashif" as username/email? Usually email. I'll assume they might want to login with this. But schema says email. I'll ask or just use it as email if it looks like one, or append domain if not? 
        // User said: add one more user "hashif" with password "ppadmin". 
        // The login form expects an email type="email". 
        // "hashif" is not a valid email. 
        // I should probably make it hashif@pawpathsae.com or similar to be safe, OR change the schema/validation.
        // Looking at login page: type="email".
        // So I will create it as 'hashif@pawpathsae.com' and tell the user.

        const emailToUse = 'hashif@pawpathsae.com';
        const password = 'ppadmin';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ email: emailToUse });
        if (existingUser) {
            console.log(`User ${emailToUse} already exists. Updating password...`);
            existingUser.password = hashedPassword;
            existingUser.role = 'admin';
            await existingUser.save();
            console.log('User updated successfully');
            process.exit(0);
        }

        await User.create({
            name: name,
            email: emailToUse,
            password: hashedPassword,
            role: 'admin',
        });

        console.log(`Admin user created: ${emailToUse} / ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error adding admin:', error);
        process.exit(1);
    }
}

addAdmin();
