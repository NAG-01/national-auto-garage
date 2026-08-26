import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is required.'));
    }

    const secret = process.env.JWT_SECRET || 'national_auto_garage_super_secret_jwt_key_2026_production_grade';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user || (user.isActive !== undefined && !user.isActive)) {
      return next(ApiError.unauthorized('User account is invalid or deactivated.'));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Session has expired or token is invalid. Please log in again.'));
    }
    next(err);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Your role (${req.user.role}) does not have permission to perform this action.`
        )
      );
    }

    next();
  };
};
