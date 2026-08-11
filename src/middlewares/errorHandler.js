import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

/**
 * Global Express Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.status ? Number(error.status) : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(config.isDevelopment && { stack: error.stack }),
  };

  // Log error stack in development or server 500 errors
  if (config.isDevelopment || error.statusCode >= 500) {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, error.message);
  }

  return res.status(error.statusCode).json(response);
};
