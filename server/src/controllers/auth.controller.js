import crypto from 'crypto';
import { User } from '../models/User.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendTokenResponse, clearTokenResponse } from '../utils/token.js';
import { ROLES } from '../constants/enums.js';
import { emailService } from '../services/email.service.js';
import { env } from '../config/env.js';

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new APIError(400, 'An account with this email address already exists.'));
  }

  // Force default role USER regardless of any privilege escalation attempt in body
  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: ROLES.USER,
  });

  sendTokenResponse(newUser, 201, res, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select password
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    return next(new APIError(401, 'Invalid email or password'));
  }

  if (user.isSuspended) {
    return next(new APIError(403, 'Your account has been suspended. Please contact support.'));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new APIError(401, 'Invalid email or password'));
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Logged in successfully');
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  clearTokenResponse(res);
});

// @desc    Get current authenticated user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// @desc    Change password
// @route   POST /api/v1/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new APIError(404, 'User not found'));
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new APIError(400, 'Current password is incorrect'));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

// @desc    Forgot password (Generate 6-digit OTP & reset token)
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  
  // Generic success message to prevent user enumeration
  const genericResponse = {
    success: true,
    message: 'If an account with that email exists, a 6-digit OTP has been sent.',
  };

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  // Generate 6-digit numeric OTP
  const rawOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash('sha256').update(rawOTP).digest('hex');

  // Generate 32-byte crypto token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetOTP = hashedOTP;
  user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  await user.save({ validateBeforeSave: false });

  const clientUrl = env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}`;

  // Dispatch 6-digit OTP Email via SMTP
  await emailService.sendOTPEmail({
    to: user.email,
    name: user.name,
    otp: rawOTP,
  });

  // Also dispatch link email
  await emailService.sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl,
    resetToken,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`\n[DEV MODE - OTP FOR ${user.email}]: ${rawOTP}\n`);
  }

  res.status(200).json(genericResponse);
});

// @desc    Verify 6-digit OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    passwordResetOTP: hashedOTP,
    passwordResetOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new APIError(400, 'Invalid or expired OTP verification code'));
  }

  // Clear OTP fields
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;

  // Re-generate fresh reset token for setting new password
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully.',
    token: resetToken,
  });
});

// @desc    Reset password using token
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  // Hash passed raw token to compare against stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new APIError(400, 'Password reset token is invalid or has expired'));
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successfully');
});

// @desc    Google OAuth payload exchange
// @route   POST /api/v1/auth/google
// @access  Public
export const googleAuth = asyncHandler(async (req, res, next) => {
  const { googleId, email, name, avatar } = req.body;

  if (!googleId || !email) {
    return next(new APIError(400, 'Google ID and Email are required'));
  }

  let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
    }
    if (avatar && !user.avatar) {
      user.avatar = avatar;
    }
    await user.save({ validateBeforeSave: false });
  } else {
    user = await User.create({
      name: name || 'Google User',
      email: email.toLowerCase(),
      googleId,
      avatar: avatar || '',
      role: ROLES.USER,
      isEmailVerified: true,
    });
  }

  sendTokenResponse(user, 200, res, 'Google authentication successful');
});
