const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    email: String,
    name: String,
    role: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUsers() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({});
        console.log('Users found:', users.length);
        users.forEach(u => console.log(`- ${u.name} (${u.email}) - ${u.role}`));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers();
