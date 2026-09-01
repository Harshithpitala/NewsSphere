import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

export const authenticateUser = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from Cookie or Authorization Header
  if (req.cookies && req.cookies.newssphere_jwt && req.cookies.newssphere_jwt !== 'none') {
    token = req.cookies.newssphere_jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new APIError(401, 'Authentication token missing. Please log in.'));
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3. Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new APIError(401, 'User belonging to this token no longer exists.'));
    }

    // 4. Check if user is suspended
    if (user.isSuspended) {
      return next(new APIError(403, 'Your account has been suspended. Please contact support.'));
    }

    // 5. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new APIError(401, 'Authentication token has expired. Please log in again.'));
    }
    return next(new APIError(401, 'Invalid authentication token.'));
  }
});

// Optional authentication middleware for public endpoints that enhance response if user is logged in
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.newssphere_jwt && req.cookies.newssphere_jwt !== 'none') {
    token = req.cookies.newssphere_jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isSuspended) {
        req.user = user;
      }
    } catch (e) {
      // Pass without req.user if token is invalid
    }
  }
  next();
});
