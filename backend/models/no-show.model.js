const mongoose = require('mongoose');
const { Schema } = mongoose;

const noShowSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true
    },
    barberId: {
        type: Schema.Types.ObjectId,
        ref: 'Barber',
        required: true
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    originalBookingDate: {
        type: Date,
        required: true
    },
    cancelledDate: {
        type: Date,
        default: Date.now
    },
    markedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        enum: ['customer_cancelled', 'no_show', 'late_cancellation'],
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    // Track if this was within the cancellation policy (e.g., less than 2 hours before)
    isWithinPolicy: {
        type: Boolean,
        default: true
    },
    // Admin can mark as excused (doesn't count toward limit)
    isExcused: {
        type: Boolean,
        default: false
    },
    excusedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User' // Admin who excused
    },
    excusedReason: {
        type: String,
        trim: true
    },
    excusedDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
noShowSchema.index({ customerId: 1, createdAt: -1 });
noShowSchema.index({ customerId: 1, isExcused: 1 });
noShowSchema.index({ customerPhone: 1, createdAt: -1 });
noShowSchema.index({ customerPhone: 1, isExcused: 1 });
noShowSchema.index({ barberId: 1, createdAt: -1 });

// Static method to get customer's no-show count
noShowSchema.statics.getCustomerNoShowCount = async function(customerId) {
    if (!customerId) return 0;
    return await this.countDocuments({
        customerId,
        isExcused: false,
        $or: [
            { reason: 'no_show' },
            { reason: 'late_cancellation' },
            { isWithinPolicy: false }
        ]
    });
};

// Static method to get customer's no-show count by phone
noShowSchema.statics.getNoShowCountByPhone = async function(customerPhone) {
    if (!customerPhone) return 0;
    return await this.countDocuments({
        customerPhone,
        isExcused: false,
        $or: [
            { reason: 'no_show' },
            { reason: 'late_cancellation' },
            { isWithinPolicy: false }
        ]
    });
};

// Static method to check if customer is blocked from booking
noShowSchema.statics.isCustomerBlocked = async function(customerId, limit = 3) {
    if (!customerId) return false;
    const count = await this.getCustomerNoShowCount(customerId);
    return count >= limit;
};

// Static method to check if customer is blocked from booking by phone
noShowSchema.statics.isCustomerBlockedByPhone = async function(customerPhone, limit = 3) {
    if (!customerPhone) return false;
    const count = await this.getNoShowCountByPhone(customerPhone);
    return count >= limit;
};

// Static method to get customer's no-show history
noShowSchema.statics.getCustomerHistory = async function(customerId, limit = 10) {
    return await this.find({ customerId })
        .populate('bookingId', 'bookingDate status')
        .populate('barberId', 'userId')
        .populate('serviceId', 'name')
        .populate({
            path: 'barberId',
            populate: {
                path: 'userId',
                select: 'name'
            }
        })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to get customer's no-show history by phone
noShowSchema.statics.getCustomerHistoryByPhone = async function(customerPhone, limit = 10) {
    return await this.find({ customerPhone })
        .populate('bookingId', 'bookingDate status')
        .populate('barberId', 'userId')
        .populate('serviceId', 'name')
        .populate({
            path: 'barberId',
            populate: {
                path: 'userId',
                select: 'name'
            }
        })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to reset customer's no-show count (admin function)
noShowSchema.statics.resetCustomerNoShows = async function(customerId, adminId, reason) {
    const result = await this.updateMany(
        { customerId, isExcused: false },
        {
            isExcused: true,
            excusedBy: adminId,
            excusedReason: reason,
            excusedDate: new Date()
        }
    );

    return result;
};

// Static method to reset customer's no-show count by phone (admin function)
noShowSchema.statics.resetCustomerNoShowsByPhone = async function(customerPhone, adminId, reason) {
    const result = await this.updateMany(
        { customerPhone, isExcused: false },
        {
            isExcused: true,
            excusedBy: adminId,
            excusedReason: reason,
            excusedDate: new Date()
        }
    );

    return result;
};

// Method to excuse this specific no-show
noShowSchema.methods.excuse = async function(adminId, reason) {
    this.isExcused = true;
    this.excusedBy = adminId;
    this.excusedReason = reason;
    this.excusedDate = new Date();
    return await this.save();
};

const NoShow = mongoose.model('NoShow', noShowSchema);
module.exports = NoShow;