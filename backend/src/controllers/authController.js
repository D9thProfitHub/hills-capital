import db from '../models/index.js';
const { User } = db;
import { sequelize } from '../config/db.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { notifyBalanceUpdate, sendNotification } from '../utils/socketEvents.js';
import { createAffiliateAccount } from '../middleware/autoAffiliate.js';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  let user = null;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new ErrorResponse('User already exists', 400));
    }

    // Start transaction
    await sequelize.transaction(async (t) => {
      // Create user
      user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
      }, { transaction: t });

      // Generate verification token
      const verificationToken = user.generateEmailConfirmToken();
      await user.save({ validateBeforeSave: false, transaction: t });

      // Create verification URL
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;

      // Store the verification URL in the user object for later use
      user.verificationUrl = verificationUrl;
      
      // Create affiliate account (don't await to prevent blocking)
      createAffiliateAccount(user).catch(affiliateErr => {
        console.error('Error creating affiliate account:', affiliateErr);
        // Non-critical error, don't fail the registration
      });
    });

    // Send verification email after successful transaction
    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        html: `
          <h1>Verify Your Email</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${user.verificationUrl}" target="_blank">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `,
      });
      
      // If we get here, the email was sent successfully
      sendTokenResponse(user, 200, res);
    } catch (emailErr) {
      console.error('Error sending verification email:', emailErr);
      // Clear verification token since email failed
      user.verificationToken = undefined;
      user.verificationExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      // Still respond with success but indicate email wasn't sent
      return res.status(200).json({
        success: true,
        token: user.getSignedJwtToken(),
        message: 'Registration successful but verification email could not be sent. Please request a new verification email.'
      });
    }
  } catch (err) {
    console.error('Registration error:', {
      name: err.name,
      message: err.message,
      errors: err.errors,
      fields: err.fields,
      original: err.original,
      sql: err.sql,
      stack: err.stack
    });
    
    // Clean up any partially created user
    if (user && user.id) {
      try {
        await User.destroy({ where: { id: user.id }, force: true });
      } catch (cleanupErr) {
        console.error('Error cleaning up user after failed registration:', cleanupErr);
      }
    }
    
    // Handle unique constraint violation for email
    if (err.name === 'SequelizeUniqueConstraintError' && err.fields && err.fields.email) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use. Please use a different email or login.'
      });
    }
    
    // Handle validation errors
    if (err.name === 'SequelizeValidationError' && err.errors && err.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: err.errors[0].message || 'Validation error',
        field: err.errors[0].path
      });
    }
    
    // Handle other errors
    console.error('Unexpected registration error:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during registration. Please try again.'
    });
  }

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      html: `
        <h1>Verify Your Email</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for email:', email);

    // Validate email & password
    if (!email || !password) {
      console.log('Missing email or password');
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] } // Explicitly include password for Sequelize
    });

    if (!user) {
      console.log('No user found with email:', email);
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    
    console.log('User found, checking password...');

    // Check if account is locked
    if (user.isLocked) {
      const timeLeft = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return next(
        new ErrorResponse(
          `Account is locked. Try again in ${timeLeft} minutes`,
          401
        )
      );
    }

    // Check if password matches
    let isMatch = false;
    try {
      console.log('Comparing passwords...');
      isMatch = await user.matchPassword(password);
      console.log('Password match result:', isMatch);
    } catch (error) {
      console.error('Error in password comparison:', error);
      return next(new ErrorResponse('Error authenticating user', 500));
    }

    if (!isMatch) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      const attemptsLeft = 4 - user.login_attempts;
      return next(
        new ErrorResponse(
          `Invalid credentials. ${attemptsLeft} attempts left`,
          401
        )
      );
    }

    // Reset login attempts on successful login
    if (user.login_attempts > 0 || user.lock_until) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.last_login = new Date();
    user.last_ip = req.ip;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Logout / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
    country: req.body.country,
    postalCode: req.body.postalCode,
    dateOfBirth: req.body.dateOfBirth,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('No user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // Send email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      html: `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:verificationToken
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationToken)
    .digest('hex');

  const user = await User.findOne({
    verificationToken,
    verificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Update user
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    data: 'Email verified successfully',
  });
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
export const resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('No user found with this email', 404));
  }

  if (user.isVerified) {
    return next(new ErrorResponse('Email already verified', 400));
  }

  // Generate verification token
  const verificationToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      html: `
        <h1>Verify Your Email</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.status(200).json({ success: true, data: 'Verification email sent' });
  } catch (err) {
    console.error(err);
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
  };

  // Remove password from output
  user.password = undefined;
  
  // Set cookie
  res.cookie('token', token, cookieOptions);
  
  // Send response with token in body as well for clients that need it
  res.status(statusCode).json({
    success: true,
    token,
    data: user,
  });
};
