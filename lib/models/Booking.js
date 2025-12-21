import mongoose from 'mongoose';
import Counter from './Counter';

const BookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        index: true,
    },

    // Customer Information
    customer: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fullName: { type: String, required: true },
        email: { type: String, required: true, index: true },
        phone: { type: String, required: true, index: true },
        alternatePhone: String,
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        },
        passport: {
            number: String,
            nationality: String,
            expiryDate: Date
        },
        documents: [{
            type: { type: String, enum: ['passport', 'vaccination', 'rabies', 'other'] },
            name: String,
            url: String,
            uploadedAt: { type: Date, default: Date.now }
        }]
    },

    // Travel Details
    travel: {
        origin: {
            country: { type: String, required: true },
            city: String,
            airport: { type: String, required: true },
            airportCode: String,
            pickupAddress: {
                street: String,
                city: String,
                zipCode: String,
                coordinates: { lat: Number, lng: Number }
            }
        },
        destination: {
            country: { type: String, required: true },
            city: String,
            airport: { type: String, required: true },
            airportCode: String,
            deliveryAddress: {
                street: String,
                city: String,
                zipCode: String,
                coordinates: { lat: Number, lng: Number }
            }
        },
        departureDate: { type: Date, required: true, index: true },
        estimatedArrivalDate: Date,
        actualDepartureDate: Date,
        actualArrivalDate: Date,
        flightDetails: {
            airline: String,
            flightNumber: String,
            bookingReference: String
        },
        travelingWithPet: { type: Boolean, default: false },
        numberOfPets: { type: Number, required: true, min: 1 }
    },

    // Pet Details Array
    pets: [{
        petNumber: Number,
        type: { type: String, enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'] },
        breed: { type: String, required: true },
        name: { type: String, required: true },
        age: { type: Number, required: true },
        ageUnit: { type: String, enum: ['months', 'years'] },
        weight: { type: Number, required: true },
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
        crate: {
            required: Boolean,
            size: { type: String, enum: ['Small', 'Medium', 'Large', 'Extra Large'] },
            owned: Boolean,
            rentalFee: Number
        },
        documents: [{
            type: { type: String, enum: ['vaccination_certificate', 'health_certificate', 'passport', 'microchip_certificate', 'import_permit', 'export_permit', 'other'] },
            name: String,
            url: String,
            uploadedAt: Date,
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            verified: { type: Boolean, default: false },
            verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            verifiedAt: Date,
            expiryDate: Date
        }],
        photos: [String]
    }],

    // Services & Pricing
    services: {
        selected: [{
            serviceId: String,
            name: String,
            description: String,
            price: Number,
            quantity: { type: Number, default: 1 }
        }],
        pricing: {
            basePrice: Number,
            servicesTotal: Number,
            crateRental: Number,
            discount: {
                amount: Number,
                percentage: Number,
                code: String,
                reason: String
            },
            tax: Number,
            taxRate: { type: Number, default: 5 },
            totalPrice: Number,
            currency: { type: String, default: 'AED' }
        }
    },

    // Payment Information
    payment: {
        status: { type: String, enum: ['pending', 'partial', 'paid', 'refunded', 'cancelled'], default: 'pending' },
        method: { type: String, enum: ['card', 'bank_transfer', 'cash', 'wallet'] },
        transactions: [{
            transactionId: String,
            amount: Number,
            currency: String,
            method: String,
            status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'refunded'] },
            gatewayResponse: Object,
            timestamp: Date,
            processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }],
        depositPaid: { type: Boolean, default: false },
        depositAmount: Number,
        depositPaidDate: Date,
        balancePaid: { type: Boolean, default: false },
        balanceAmount: Number,
        balancePaidDate: Date,
        refunds: [{
            amount: Number,
            reason: String,
            processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            processedAt: Date,
            transactionId: String
        }],
        invoices: [{
            invoiceNumber: String,
            pdfUrl: String,
            generatedAt: Date,
            sentToCustomer: Boolean,
            sentAt: Date
        }]
    },

    // Status Management
    status: {
        current: {
            type: String,
            enum: [
                'draft', 'pending_review', 'documents_pending', 'documents_review',
                'quote_sent', 'payment_pending', 'confirmed', 'scheduled',
                'preparation', 'ready_for_pickup', 'picked_up', 'in_transit',
                'customs_clearance', 'out_for_delivery', 'delivered',
                'completed', 'cancelled', 'on_hold'
            ],
            default: 'draft'
        },
        history: [{
            status: String,
            timestamp: Date,
            changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            notes: String,
            automated: { type: Boolean, default: false }
        }]
    },

    // Assignment & Team
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String,
        assignedAt: Date
    }],

    // Real-Time Tracking
    tracking: {
        enabled: { type: Boolean, default: true },
        currentLocation: {
            coordinates: { lat: Number, lng: Number },
            address: String,
            timestamp: Date
        },
        updates: [{
            timestamp: Date,
            location: {
                coordinates: { lat: Number, lng: Number },
                address: String
            },
            status: String,
            description: String,
            photos: [String],
            videos: [String],
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }],
        milestones: [{
            name: String,
            timestamp: Date,
            location: String,
            completed: Boolean
        }]
    },

    // Communications Log
    communications: [{
        type: { type: String, enum: ['email', 'sms', 'whatsapp', 'call', 'internal_note', 'chat'] },
        direction: { type: String, enum: ['inbound', 'outbound'] },
        subject: String,
        content: String,
        sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sentTo: String,
        timestamp: Date,
        status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'] },
        attachments: [String],
        automated: { type: Boolean, default: false }
    }],

    // Internal Notes
    internalNotes: [{
        note: { type: String, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: Date,
        isImportant: { type: Boolean, default: false },
        isPinned: { type: Boolean, default: false },
        tags: [String],
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],

    // Feedback
    feedback: {
        rating: Number,
        review: String,
        submittedAt: Date,
        categories: {
            communication: Number,
            petCare: Number,
            timeliness: Number,
            value: Number
        },
        wouldRecommend: Boolean,
        testimonialApproved: { type: Boolean, default: false }
    },

    // Metadata
    source: { type: String, enum: ['website', 'whatsapp', 'phone_call', 'referral', 'social_media', 'repeat_customer'] },
    referralCode: String,
    utmParameters: {
        source: String,
        medium: String,
        campaign: String
    },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'] },
    tags: [String],
    estimatedDeliveryDate: Date,
    completedAt: Date
}, {
    timestamps: true,
});

// Pre-save hook to generate Booking ID
BookingSchema.pre('save', async function (next) {
    if (this.isNew && !this.bookingId) {
        try {
            const Counter = mongoose.models.Counter || mongoose.model('Counter');
            const counter = await Counter.findOneAndUpdate(
                { _id: 'bookingId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );

            const year = new Date().getFullYear();
            const sequence = counter.seq.toString().padStart(4, '0');
            this.bookingId = `PW-${year}-${sequence}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
