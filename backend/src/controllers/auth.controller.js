import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { EmailService } from '../services/email.service.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getCookieOptions,
} from '../services/token.service.js';

// Helper: Issues Access & Refresh tokens and writes cookies
const issueTokensAndRespond = async (user, statusCode, res, message) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Store hashed refresh token in DB for validation and single-revocation
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  // 15 Minutes for Access Token Cookie
  res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
  // 7 Days for Refresh Token Cookie
  res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  res.status(statusCode).json({
    status: 'success',
    message,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken, // Returned in JSON payload for mobile/SPA header authorization
    },
  });
};

// @desc    Register new customer
// @route   POST /api/v1/auth/register
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError('Name, email, and password are required', 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError('An account with this email already exists', 409));
  }

  const newUser = await User.create({
    name,
    email,
    password,
  });

  // Verification token generation
  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // Non-blocking fire-and-forget email dispatch
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verificationUrl = `${clientUrl}/verify-email/${verificationToken}`;

  new EmailService(newUser, verificationUrl).sendWelcome().catch((err) => {
    console.error('[Email Dispatch Error]:', err.message);
  });

  await issueTokensAndRespond(newUser, 201, res, 'Account created successfully');
});

// @desc    User Login
// @route   POST /api/v1/auth/login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError('Please provide email and password', 400));
  }

  // Find user and explicitly project the hashed password & token hash
  const user = await User.findOne({ email }).select('+password +refreshTokenHash');

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new ApiError('Invalid email or password credentials', 401));
  }

  await issueTokensAndRespond(user, 200, res, 'Logged in successfully');
});

// @desc    Rotate Access Token using Refresh Token
// @route   POST /api/v1/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return next(new ApiError('No refresh token provided', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new ApiError('Invalid or expired refresh token', 403));
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user) {
    return next(new ApiError('User belonging to this token no longer exists', 401));
  }

  // Cross-reference hash to verify token hasn't been revoked
  const incomingHash = hashToken(incomingRefreshToken);
  if (user.refreshTokenHash !== incomingHash) {
    // Token reuse detected -> Revoke all sessions for security
    user.refreshTokenHash = undefined;
    await user.save({ validateBeforeSave: false });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return next(new ApiError('Compromised session token detected. Please log in again', 403));
  }

  // Token rotation: Issue new token pair
  await issueTokensAndRespond(user, 200, res, 'Token refreshed successfully');
});

// @desc    Logout User & Revoke Session
// @route   POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (incomingRefreshToken) {
    const hashed = hashToken(incomingRefreshToken);
    await User.findOneAndUpdate({ refreshTokenHash: hashed }, { $unset: { refreshTokenHash: 1 } });
  }

  res.clearCookie('accessToken', getCookieOptions(0));
  res.clearCookie('refreshToken', getCookieOptions(0));

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

// @desc    Verify customer email address via token
// @route   GET /api/v1/auth/verify-email/:token
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError('Verification token is invalid or has expired', 400));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Your Velora Skin account has been verified successfully.',
  });
});

// @desc    Initiate forgot password workflow
// @route   POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError('Please provide your email address', 400));
  }

  const user = await User.findOne({ email });

  // Anti-timing & user enumeration protection: Always respond with 200 success
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If that email is in our directory, a recovery token has been dispatched.',
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  try {
    await new EmailService(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'If that email is in our directory, a recovery token has been dispatched.',
    });
  } catch (err) {
    console.error('MAILTRAP SEND ERROR:', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ApiError('There was an error sending the reset email. Please try again later.', 500));
  }
});

// @desc    Reset password using valid token
// @route   PATCH /api/v1/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  if (!password || password.length < 8) {
    return next(new ApiError('Please provide a new password of at least 8 characters', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError('Reset token is invalid or has expired', 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful. You may now log in with your new credentials.',
  });
});