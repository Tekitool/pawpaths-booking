import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookingId: String,
    type: {
        type: String,
        enum: ['booking_update', 'payment', 'document_request', 'message', 'system']
    },
    title: String,
    message: String,
    link: String,
    isRead: { type: Boolean, default: false },
    readAt: Date
}, {
    timestamps: true
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
