import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription: {
        type: String,
        required: true,
        maxLength: 150
    },
    longDescription: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        default: ''
    },
    baseCost: {
        type: Number,
        required: true,
        min: 0
    },
    isMandatory: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'seasonal'],
        default: 'active'
    },
    icon: {
        type: String,
        default: 'Box' // Default icon name from Lucide
    },
    customerTypes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomerType'
    }]
}, {
    timestamps: true
});

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
