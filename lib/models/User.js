import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        index: true,
    },
    phone: String,
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    password: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'manager', 'staff', 'customer'],
        default: 'customer',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    phoneVerified: {
        type: Boolean,
        default: false,
    },
    avatar: String,

    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            whatsapp: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
        },
        language: { type: String, default: 'en' },
        timezone: { type: String, default: 'Asia/Dubai' },
    },

    pushSubscription: Object,

    // For staff members
    department: String,
    assignedBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],

    lastLogin: Date,
    loginHistory: [{
        timestamp: Date,
        ipAddress: String,
        userAgent: String,
    }],
}, {
    timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
