const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    phone: { type: String, default: '' },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String, default: '' },
    role: {
      type: String,
      enum: ['customer', 'barber', 'staff', 'admin'],
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['active', 'banned', 'suspended'],
      default: 'active',
    },
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpires: { type: Date },
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }
  if (typeof this.password === 'string' && /^\$2[aby]\$/.test(this.password)) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
