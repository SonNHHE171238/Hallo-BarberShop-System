const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerServiceHistorySchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    barberId: {
        type: Schema.Types.ObjectId,
        ref: 'Barber',
        required: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

customerServiceHistorySchema.index({ customerId: 1, completedAt: -1 });
customerServiceHistorySchema.index({ barberId: 1, completedAt: -1 });

module.exports = mongoose.model('CustomerServiceHistory', customerServiceHistorySchema);
