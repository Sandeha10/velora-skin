import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Protect routes: Enforce valid Access Token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check authorization header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new ApiError('You are not logged in. Please provide a valid token', 401));
  }

  // 2. Verify signature & expiration
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    return next(new ApiError('Access token is invalid or expired', 401));
  }

  // 3. Confirm user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new ApiError('The user belonging to this token no longer exists', 401));
  }

  // 4. Verify password was not changed after the token was signed
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new ApiError('User recently updated password. Please log in again', 401));
  }

  // Attach verified user to request object
  req.user = currentUser;
  next();
});

// Restrict to specified roles (RBAC)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission to perform this action', 403));
    }
    next();
  };
};