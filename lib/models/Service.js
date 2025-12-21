import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
    category: { type: String, enum: ['transport', 'veterinary', 'handling', 'insurance', 'other'] },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
