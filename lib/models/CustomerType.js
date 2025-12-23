import mongoose from 'mongoose';

const CustomerTypeSchema = new mongoose.Schema({
    type_code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        maxLength: 10
    },
    description: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.models.CustomerType || mongoose.model('CustomerType', CustomerTypeSchema);
