import mongoose from 'mongoose';

const PetSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'], required: true },
    breed: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    ageUnit: { type: String, enum: ['months', 'years'], default: 'years' },
    weight: { type: Number, required: true }, // in kg
    gender: { type: String, enum: ['Male', 'Female'] },
    color: String,

    microchip: {
        number: String,
        implantDate: Date,
        location: String
    },

    health: {
        vaccinationUpToDate: Boolean,
        lastVaccinationDate: Date,
        medications: String,
        allergies: String,
        medicalConditions: String
    },

    specialRequirements: String,
    diet: String,
    temperament: String,

    photos: [String], // URLs

    documents: [{
        type: { type: String, enum: ['vaccination_certificate', 'passport', 'other'] },
        name: String,
        url: String,
        expiryDate: Date
    }]
}, {
    timestamps: true
});

export default mongoose.models.Pet || mongoose.model('Pet', PetSchema);
