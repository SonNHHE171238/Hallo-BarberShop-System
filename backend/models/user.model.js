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
    passwordHash: { type: String, select: false }, // Cho phép null/undefined nếu đăng nhập bằng Google
    oauthProvider: {
      type: String,
      enum: ['google', 'facebook', null],
      default: null,
    },
    oauthId: { type: String, default: null },
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
  if (!this.isModified('passwordHash')) {
    return;
  }
  if (typeof this.passwordHash === 'string' && /^\$2[aby]\$/.test(this.passwordHash)) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
