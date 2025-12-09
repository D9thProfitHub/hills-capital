import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCopyTradingTraders,
  getUserCopyTradingRequests,
  createCopyTradingRequest
} from '../controllers/userCopyTradingController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/users/copy-trading/traders
// @desc    Get available traders for copy trading
// @access  Private
router.get('/traders', getCopyTradingTraders);

// @route   GET /api/users/copy-trading/requests
// @desc    Get user's copy trading requests/positions
// @access  Private
router.get('/requests', getUserCopyTradingRequests);

// @route   POST /api/users/copy-trading/requests
// @desc    Create new copy trading request
// @access  Private
router.post('/requests', createCopyTradingRequest);

export default router;
