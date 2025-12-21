import mongoose from 'mongoose';

const EmailTemplateSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    slug: { type: String, unique: true, required: true },
    subject: String,
    htmlContent: String,
    textContent: String,
    variables: [String],
    category: {
        type: String,
        enum: ['booking', 'payment', 'documents', 'status_update', 'marketing']
    },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', EmailTemplateSchema);
