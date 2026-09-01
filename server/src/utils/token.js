import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  const userPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    interests: user.interests,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };

  res.status(statusCode).cookie('newssphere_jwt', token, cookieOptions).json({
    success: true,
    message,
    token,
    user: userPayload,
  });
};

export const clearTokenResponse = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('newssphere_jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
