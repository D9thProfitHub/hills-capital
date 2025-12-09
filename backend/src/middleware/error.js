import ErrorResponse from '../utils/errorResponse.js';

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error({
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...(err.errors && { errors: err.errors }),
    ...(err.fields && { fields: err.fields })
  });

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || 
      err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? 
      err.errors.map(e => e.message) : 
      ['Validation error'];
    error = new ErrorResponse(messages[0], 400);
  }
  // Handle Sequelize database errors
  else if (err.name === 'SequelizeDatabaseError') {
    error = new ErrorResponse('Database error occurred', 500);
  }
  // Handle invalid IDs
  else if (err.name === 'CastError' || err.name === 'SequelizeForeignKeyConstraintError') {
    const message = `Resource not found with id of ${err.value || 'unknown'}`;
    error = new ErrorResponse(message, 404);
  }
  // Handle duplicate key errors
  else if (err.code === '23505' || err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }
  // JWT expired
  else if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

// Async handler to wrap async/await and catch errors
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
