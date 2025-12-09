import express from 'express';
import tradingViewController from '../controllers/tradingviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to validate scanner ID
const validateScannerId = (req, res, next) => {
  const { scannerId } = req.params;
  const validScanners = Object.keys(tradingViewController.SCANNER_CREDENTIALS || {});
  
  if (!scannerId || !validScanners.includes(scannerId)) {
    return res.status(400).json({
      success: false,
      error: `Invalid scanner ID. Must be one of: ${validScanners.join(', ')}`,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// @route   GET /api/tradingview/session/:scannerId
// @desc    Get or create a TradingView session for the specified scanner
// @access  Private
router.get(
  '/session/:scannerId',
  protect,
  validateScannerId,
  tradingViewController.getTradingViewSession
);

// @route   GET /api/tradingview/token/:scannerId
// @desc    Generate a JWT token for the scanner iframe
// @access  Private
router.get(
  '/token/:scannerId',
  protect,
  validateScannerId,
  tradingViewController.generateScannerToken
);

// Error handling middleware for TradingView routes
router.use((err, req, res, next) => {
  console.error('TradingView route error:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  
  const statusCode = err.statusCode || 500;
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    })
  });
});

export default router;
