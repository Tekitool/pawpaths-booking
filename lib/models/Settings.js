import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    value: mongoose.Schema.Types.Mixed,
    category: String, // 'general', 'email', 'payment', 'pricing'
    description: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
