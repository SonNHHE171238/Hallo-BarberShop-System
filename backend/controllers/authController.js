const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { setAuthCookies, clearAuthCookies } = require('../utils/authCookies');
const { generateOtp, getOtpTtlMs } = require('../utils/otp');
const { notifyRegistrationOtp } = require('../services/registration-notify.service');
const { sendPasswordResetEmail } = require('../services/email.service');

const forgotPasswordMessage =
  'If an account exists with this email, a password reset link has been sent.';

const getResetTokenTtlMs = () => {
  const minutes = parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '60', 10);
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 60) * 60 * 1000;
};

async function setUserOtp(user, plainOtp) {
  const hash = await bcrypt.hash(plainOtp, 10);
  user.otpHash = hash;
  user.otpExpires = new Date(Date.now() + getOtpTtlMs());
  await user.save();
  return notifyRegistrationOtp(user.email, plainOtp);
}

const otpEmailFailedMessage =
  'Could not send OTP email. Check EMAIL_USER/EMAIL_PASS in server config, or use Resend OTP.';

const accessExpires = () => process.env.JWT_ACCESS_EXPIRES || '15m';
const refreshExpires = () => process.env.JWT_REFRESH_EXPIRES || '7d';

const signAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: accessExpires(),
  });
};

const signRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: refreshExpires(),
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name?.trim() || !email?.trim() || !password || phone === undefined || phone === null) {
      return res
        .status(400)
        .json({ message: 'Name, email, phone, and password are required' });
    }

    const emailNorm = email.toLowerCase().trim();
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailNorm)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const phoneStr = String(phone).trim();
    if (!/^[0-9]{10}$/.test(phoneStr)) {
      return res.status(400).json({ message: 'Phone must be 10 digits' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let user = await User.findOne({ email: emailNorm });
    if (user?.isVerified) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const plainOtp = generateOtp();

    if (user) {
      user.name = name.trim();
      user.phone = phoneStr;
      user.password = password;
      user.role = 'customer';
      user.status = 'active';
      user.isVerified = false;
      const notify = await setUserOtp(user, plainOtp);
      if (!notify.sent) {
        return res.status(502).json({ message: otpEmailFailedMessage });
      }
      return res.status(200).json({
        message: 'Please verify your email with the new OTP code.',
      });
    }

    user = new User({
      name: name.trim(),
      email: emailNorm,
      phone: phoneStr,
      password,
      role: 'customer',
      status: 'active',
      isVerified: false,
    });
    const notify = await setUserOtp(user, plainOtp);
    if (!notify.sent) {
      return res.status(502).json({ message: otpEmailFailedMessage });
    }

    return res.status(201).json({
      message: 'Registration successful. Please check your email for the OTP code.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || otp === undefined || otp === null || otp === '') {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const emailNorm = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNorm }).select('+otpHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    if (!user.otpHash || !user.otpExpires) {
      return res.status(400).json({
        message: 'No pending verification. Please register again.',
      });
    }
    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        message: 'OTP has expired. Please request a new code.',
      });
    }

    const match = await bcrypt.compare(String(otp).trim(), user.otpHash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { isVerified: true }, $unset: { otpHash: 1, otpExpires: 1 } }
    );

    const verifiedUser = await User.findById(user._id);
    if (process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET) {
      const accessToken = signAccessToken(verifiedUser._id.toString(), verifiedUser.role);
      const refreshToken = signRefreshToken(verifiedUser._id.toString());
      setAuthCookies(res, accessToken, refreshToken);
    }

    return res.status(200).json({
      message: 'Email verification successful.',
      user: {
        id: verifiedUser._id.toString(),
        name: verifiedUser.name,
        email: verifiedUser.email,
        phone: verifiedUser.phone,
        role: verifiedUser.role,
        avatarUrl: verifiedUser.avatarUrl || '',
        status: verifiedUser.status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailNorm = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNorm });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const plainOtp = generateOtp();
    await setUserOtp(user, plainOtp);

    return res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return res.status(500).json({ message: 'Server auth configuration missing' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password'
    );

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
      });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = signAccessToken(user._id.toString(), user.role);
    const refreshToken = signRefreshToken(user._id.toString());
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    clearAuthCookies(res);
    return res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    if (decoded.type !== 'refresh' || !decoded.userId) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active' || !user.isVerified) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = signAccessToken(user._id.toString(), user.role);
    const refreshToken = signRefreshToken(user._id.toString());
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ message: 'Token refreshed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailNorm = email.toLowerCase().trim();
    const user = await User.findOne({
      email: emailNorm,
      isVerified: true,
      status: 'active',
    });

    if (!user) {
      return res.status(200).json({ message: forgotPasswordMessage });
    }

    const plainToken = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = await bcrypt.hash(plainToken, 10);
    user.resetTokenExpires = new Date(Date.now() + getResetTokenTtlMs());
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetLink = `${clientUrl}/reset-password?id=${user._id}&token=${plainToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);
      console.log(`[Reset] Link sent to ${user.email}`);
    } catch (err) {
      console.error(`[Reset] Failed to send email to ${user.email}:`, err.message);
      return res.status(502).json({
        message: 'Could not send password reset email. Please try again later.',
      });
    }

    return res.status(200).json({ message: forgotPasswordMessage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;

    if (!userId || !token || !newPassword) {
      return res.status(400).json({
        message: 'User id, token, and new password are required',
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId).select('+resetTokenHash +resetTokenExpires');
    if (!user || user.status !== 'active') {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    if (!user.resetTokenHash || !user.resetTokenExpires) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    if (new Date() > user.resetTokenExpires) {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    const match = await bcrypt.compare(String(token), user.resetTokenHash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = newPassword;
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl || '',
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
