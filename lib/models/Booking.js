import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
    },
    customerInfo: {
        fullName: {
            type: String,
            required: [true, 'Please provide full name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide email address'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Please provide phone number'],
            trim: true,
        },
    },
    travelDetails: {
        numberOfPets: {
            type: Number,
            required: [true, 'Please specify number of pets'],
            min: 1,
            max: 10,
        },
        originCountry: {
            type: String,
            required: [true, 'Please provide origin country'],
        },
        originAirport: {
            type: String,
            required: [true, 'Please provide origin airport'],
        },
        destinationCountry: {
            type: String,
            required: [true, 'Please provide destination country'],
        },
        destinationAirport: {
            type: String,
            required: [true, 'Please provide destination airport'],
        },
        travelDate: {
            type: Date,
            required: [true, 'Please provide travel date'],
        },
    },
    pets: [{
        petNumber: Number,
        type: {
            type: String,
            enum: ['Dog', 'Cat'],
            required: true,
        },
        breed: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        weight: {
            type: Number,
            required: true,
        },
        specialRequirements: {
            type: String,
        },
    }],
    totalWeight: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending',
    },
}, {
    timestamps: true,
    collection: 'bookings'
});

// Pre-save hook to generate bookingId
BookingSchema.pre('save', async function () {
    if (!this.bookingId) {
        const date = new Date();
        const year = date.getFullYear();
        const count = await mongoose.models.Booking.countDocuments();
        const sequence = (count + 1).toString().padStart(3, '0');
        this.bookingId = `PW-${year}-${sequence}`;
    }
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
