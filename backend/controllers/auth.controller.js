const authService = require('../services/auth.service');
const { setAuthCookies, clearAuthCookies } = require('../utils/authCookies');
const { sendSuccess } = require('../utils/response.helper');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name?.trim() || !email?.trim() || !password || phone === undefined || phone === null) {
      const error = new Error('Name, email, phone, and password are required');
      error.statusCode = 400;
      throw error;
    }

    if (String(password).length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.statusCode = 400;
      throw error;
    }

    const result = await authService.registerUser({ name, email, password, phone });

    if (!result.isNew) {
      return sendSuccess(res, 200, 'Please verify your email with the new OTP code.');
    }

    return sendSuccess(res, 201, 'Registration successful. Please check your email for the OTP code.');
  } catch (error) {
    if (error.code === 11000) {
      error.message = 'An account with this email already exists';
      error.statusCode = 400;
    }
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || otp === undefined || otp === null || otp === '') {
      const error = new Error('Email and OTP are required');
      error.statusCode = 400;
      throw error;
    }

    const verifiedUser = await authService.verifyUserOtp(email, otp);

    if (process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET) {
      const accessToken = authService.signAccessToken(verifiedUser._id.toString(), verifiedUser.role);
      const refreshToken = authService.signRefreshToken(verifiedUser._id.toString());
      setAuthCookies(res, accessToken, refreshToken);
    }

    return sendSuccess(res, 200, 'Email verification successful.', {
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
    next(error);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    await authService.resendUserOtp(email);
    return sendSuccess(res, 200, 'OTP resent successfully');
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      const error = new Error('Server auth configuration missing');
      error.statusCode = 500;
      throw error;
    }

    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await authService.loginUser(email, password);

    const accessToken = authService.signAccessToken(user._id.toString(), user.role);
    const refreshToken = authService.signRefreshToken(user._id.toString());
    setAuthCookies(res, accessToken, refreshToken);

    return sendSuccess(res, 200, 'Login successful');
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    clearAuthCookies(res);
    return sendSuccess(res, 200, 'Logged out');
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      const error = new Error('Refresh token required');
      error.statusCode = 401;
      throw error;
    }

    let user;
    try {
      user = await authService.verifyRefreshToken(token);
    } catch (e) {
      clearAuthCookies(res);
      throw e;
    }

    const accessToken = authService.signAccessToken(user._id.toString(), user.role);
    const refreshToken = authService.signRefreshToken(user._id.toString());
    setAuthCookies(res, accessToken, refreshToken);

    return sendSuccess(res, 200, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    await authService.processForgotPassword(email);

    // Always return 200 with the same message to prevent email enumeration
    return sendSuccess(res, 200, 'If an account exists with this email, a password reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { userId, token, newPassword } = req.body;

    if (!userId || !token || !newPassword) {
      const error = new Error('User id, token, and new password are required');
      error.statusCode = 400;
      throw error;
    }

    if (String(newPassword).length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.statusCode = 400;
      throw error;
    }

    await authService.processResetPassword(userId, token, newPassword);

    return sendSuccess(res, 200, 'Password reset successful. You can now log in.');
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.userId);

    return sendSuccess(res, 200, 'User data retrieved', {
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
    next(error);
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { accessToken: token } = req.body;
    if (!token) {
      const error = new Error('Google access token is required');
      error.statusCode = 400;
      throw error;
    }

    const user = await authService.loginWithGoogle(token);
    const accessToken = authService.signAccessToken(user._id, user.role);
    const refreshToken = authService.signRefreshToken(user._id);

    const { setAuthCookies } = require('../utils/authCookies');
    setAuthCookies(res, accessToken, refreshToken);

    const { sendSuccess } = require('../utils/response.helper');
    return sendSuccess(res, 200, 'Login with Google successful', {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};
