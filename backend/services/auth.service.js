const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { generateOtp, getOtpTtlMs } = require('../utils/otp');
const { notifyRegistrationOtp } = require('../services/registration-notify.service');
const { sendPasswordResetEmail } = require('../services/email.service');
const { OAuth2Client } = require('google-auth-library');

const getResetTokenTtlMs = () => {
  const minutes = parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '10', 10);
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 10) * 60 * 1000;
};

const accessExpires = () => {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
};
const refreshExpires = () => process.env.JWT_REFRESH_EXPIRES || '7d';

exports.signAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: accessExpires(),
  });
};

exports.signRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: refreshExpires(),
  });
};

const setUserOtp = async (user, plainOtp) => {
  const hash = await bcrypt.hash(plainOtp, 10);
  user.otpHash = hash;
  user.otpExpires = new Date(Date.now() + getOtpTtlMs());
  await user.save();
  return notifyRegistrationOtp(user.email, plainOtp);
};

exports.registerUser = async ({ name, email, password, phone }) => {
  const emailNorm = email.toLowerCase().trim();
  const phoneStr = String(phone).trim();

  let user = await User.findOne({ email: emailNorm });
  if (user?.isVerified) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  const plainOtp = generateOtp();

  if (user) {
    user.name = name.trim();
    user.phone = phoneStr;
    user.passwordHash = password;
    user.role = 'customer';
    user.status = 'active';
    user.isVerified = false;
    const notify = await setUserOtp(user, plainOtp);
    if (!notify.sent) {
      const error = new Error('Could not send OTP email');
      error.statusCode = 502;
      throw error;
    }
    return { isNew: false };
  }

  user = new User({
    name: name.trim(),
    email: emailNorm,
    phone: phoneStr,
    passwordHash: password,
    role: 'customer',
    status: 'active',
    isVerified: false,
  });
  const notify = await setUserOtp(user, plainOtp);
  if (!notify.sent) {
    const error = new Error('Could not send OTP email');
    error.statusCode = 502;
    throw error;
  }

  return { isNew: true };
};

exports.verifyUserOtp = async (email, otp) => {
  const emailNorm = email.toLowerCase().trim();
  const user = await User.findOne({ email: emailNorm }).select('+otpHash');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  if (user.isVerified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }
  if (!user.otpHash || !user.otpExpires) {
    const error = new Error('No pending verification. Please register again.');
    error.statusCode = 400;
    throw error;
  }
  if (new Date() > user.otpExpires) {
    const error = new Error('OTP has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  const match = await bcrypt.compare(String(otp).trim(), user.otpHash);
  if (!match) {
    const error = new Error('Invalid OTP code');
    error.statusCode = 400;
    throw error;
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { isVerified: true }, $unset: { otpHash: 1, otpExpires: 1 } }
  );

  const verifiedUser = await User.findById(user._id);
  return verifiedUser;
};

exports.resendUserOtp = async (email) => {
  const emailNorm = email.toLowerCase().trim();
  const user = await User.findOne({ email: emailNorm });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  if (user.isVerified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }

  const plainOtp = generateOtp();
  await setUserOtp(user, plainOtp);
  return true;
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

  if (!user || user.status !== 'active') {
    const error = new Error('Email hoặc mật khẩu không chính xác.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error('Vui lòng xác thực email của bạn trước khi đăng nhập.');
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const match = await user.comparePassword(password);
  if (!match) {
    const error = new Error('Email hoặc mật khẩu không chính xác.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  return user;
};

exports.verifyRefreshToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  if (decoded.type !== 'refresh' || !decoded.userId) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.status !== 'active' || !user.isVerified) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  return user;
};

exports.processForgotPassword = async (email) => {
  const emailNorm = email.toLowerCase().trim();
  const user = await User.findOne({
    email: emailNorm,
    isVerified: true,
    status: 'active',
  });

  if (!user) return false;

  const plainToken = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash = await bcrypt.hash(plainToken, 10);
  user.resetTokenExpires = new Date(Date.now() + getResetTokenTtlMs());
  await user.save();

  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetLink = `${clientUrl}/reset-password?id=${user._id}&token=${plainToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetLink, user.name);
  } catch (err) {
    const error = new Error('Could not send password reset email. Please try again later.');
    error.statusCode = 502;
    throw error;
  }

  return true;
};

exports.processResetPassword = async (userId, token, newPassword) => {
  const user = await User.findById(userId).select('+resetTokenHash +resetTokenExpires');
  if (!user || user.status !== 'active') {
    const error = new Error('Invalid or expired reset link');
    error.statusCode = 400;
    throw error;
  }

  if (!user.resetTokenHash || !user.resetTokenExpires) {
    const error = new Error('Invalid or expired reset link');
    error.statusCode = 400;
    throw error;
  }

  if (new Date() > user.resetTokenExpires) {
    const error = new Error('Reset link has expired. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  const match = await bcrypt.compare(String(token), user.resetTokenHash);
  if (!match) {
    const error = new Error('Invalid or expired reset link');
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = newPassword;
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
};

exports.getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.status !== 'active') {
    const error = new Error('Account is not active');
    error.statusCode = 403;
    throw error;
  }

  return user;
};

exports.loginWithGoogle = async (accessToken) => {
  if (!accessToken) {
    const error = new Error('Google access token is required');
    error.statusCode = 400;
    throw error;
  }

  let payload;
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }
    
    payload = await response.json();
  } catch (err) {
    const error = new Error('Invalid Google token');
    error.statusCode = 401;
    throw error;
  }

  const { email, name, picture, sub } = payload;
  if (!email) {
    const error = new Error('No email found in Google profile');
    error.statusCode = 400;
    throw error;
  }

  const emailNorm = email.toLowerCase().trim();
  let user = await User.findOne({ email: emailNorm });

  if (!user) {
    user = new User({
      name: name,
      email: emailNorm,
      isVerified: true,
      oauthProvider: 'google',
      oauthId: sub,
      avatarUrl: picture || '',
      role: 'customer',
      status: 'active',
    });
    await user.save();
  } else {
    if (user.status !== 'active') {
      const error = new Error('Account is not active');
      error.statusCode = 403;
      throw error;
    }

    let needsSave = false;
    if (!user.oauthProvider) {
      user.oauthProvider = 'google';
      user.oauthId = sub;
      user.isVerified = true;
      needsSave = true;
    }
    if (!user.avatarUrl && picture) {
      user.avatarUrl = picture;
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }
  }

  return user;
};

exports.changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || user.status !== 'active') {
    const error = new Error('Không tìm thấy người dùng hoặc tài khoản đã bị khóa');
    error.statusCode = 404;
    throw error;
  }

  // If the user registered via Google, they might not have a passwordHash yet.
  if (!user.passwordHash) {
    const error = new Error('Tài khoản này được đăng nhập qua Google và chưa có mật khẩu. Sử dụng Quên mật khẩu để tạo mới.');
    error.statusCode = 400;
    throw error;
  }

  const match = await bcrypt.compare(String(currentPassword), user.passwordHash);
  if (!match) {
    const error = new Error('Mật khẩu hiện tại không chính xác');
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = String(newPassword);
  await user.save();
};

exports.updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user || user.status !== 'active') {
    const error = new Error('Không tìm thấy người dùng hoặc tài khoản đã bị khóa');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.phone !== undefined) {
    user.phone = String(updateData.phone).trim();
  }
  
  if (updateData.avatarUrl !== undefined) {
    user.avatarUrl = String(updateData.avatarUrl).trim();
  }

  await user.save();
  return user;
};
