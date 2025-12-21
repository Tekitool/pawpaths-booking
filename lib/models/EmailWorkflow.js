import mongoose from 'mongoose';

const EmailWorkflowSchema = new mongoose.Schema({
    name: String,
    trigger: String, // 'booking.created', 'status.changed', etc.
    conditions: Object, // JSON conditions
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
    delay: Number, // Minutes to wait before sending
    recipients: [String], // ['customer', 'admin', 'assigned_staff']
    channels: [String], // ['email', 'sms', 'whatsapp', 'push']
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.models.EmailWorkflow || mongoose.model('EmailWorkflow', EmailWorkflowSchema);
