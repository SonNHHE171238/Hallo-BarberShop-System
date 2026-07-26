const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },

  bio: {
    type: String,
    required: true
  },

  experienceYears: {
    type: Number,
    required: true
  },

  gallery: {
    type: [String],
    default: []
  },

  specialties: {
    type: [String],
    default: []
  },



  averageRating: {
    type: Number,
    required: true,
    default: 0
  },

  ratingCount: {
    type: Number,
    required: true,
    default: 0
  },

  totalBookings: {
    type: Number,
    required: true,
    default: 0
  },

  isAvailable: {
    type: Boolean,
    required: true,
    default: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  workingSince: {
    type: Date,
    required: true
  },



  level: {
    type: String,
    enum: ['standard', 'vip'],
    default: 'standard'
  },

  vipMultiplier: {
    type: Number,
    default: 0.2 // Phụ phí 20% cho thợ VIP
  }

}, { timestamps: true });

// Indexes for efficient filtering
barberSchema.index({ averageRating: -1, totalBookings: -1 });

module.exports = mongoose.model('Barber', barberSchema);
