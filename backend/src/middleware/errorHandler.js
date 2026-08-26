import { ApiError } from '../utils/apiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose CastError / Invalid ObjectId
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid resource ID format for ${err.path}: ${err.value}`);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    error = ApiError.conflict(`Duplicate value '${val}' for unique field: ${field}`);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Database validation error', errorDetails);
  }

  // Fallback for unhandled exceptions
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  if (error.statusCode >= 500) {
    console.error('[Server Error]', err);
  }

  return res.status(error.statusCode).json(response);
};
