import { APIError } from '../utils/APIError.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new APIError(401, 'Authentication required for this action.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new APIError(
          403,
          `Access denied. Role '${req.user.role}' is not authorized to perform this operation.`
        )
      );
    }

    next();
  };
};

export const authorizeRoles = requireRole;
