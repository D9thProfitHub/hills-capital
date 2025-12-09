import jwt from 'jsonwebtoken';
import db from '../models/index.js';
const { User } = db;
import ErrorResponse from '../utils/errorResponse.js';

// Verify JWT token and return decoded payload
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } 
  // Set token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token using the verifyToken function
    const decoded = verifyToken(token);

    // Get user from the token using Sequelize's findByPk
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('No user found with this ID', 404));
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
