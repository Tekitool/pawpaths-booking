const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkAvatars() {
    if (!process.env.MONGODB_URI) {
        console.error('Please define MONGODB_URI in .env.local');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        users.forEach(user => {
            console.log(`User: ${user.name} (${user.email}) - Avatar: ${user.avatar}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error checking avatars:', error);
        process.exit(1);
    }
}

checkAvatars();
