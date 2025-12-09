import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createCopyTradingRequest,
  getCopyTradingRequests,
  updateCopyTradingRequestStatus,
  getCopyTradingRequestById,
  getMyCopyTradingRequests
} from '../controllers/copyTradingController';
import { body, param, validationResult } from 'express-validator';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Protected routes - require authentication
router.use(protect);

// Create a new copy trading request
router.post('/requests',
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('accountType', 'Account type is required').isIn(['MT4', 'MT5']),
    body('broker', 'Broker name is required').trim().notEmpty(),
    body('server', 'Server is required').trim().notEmpty(),
    body('login', 'Account number is required').trim().isNumeric(),
    body('password', 'Password is required').trim().notEmpty(),
    body('riskLevel', 'Invalid risk level').optional().isIn(['low', 'medium', 'high']),
    body('maxDrawdown', 'Max drawdown must be between 10 and 30%')
      .optional()
      .isInt({ min: 10, max: 30 })
  ],
  validate,
  createCopyTradingRequest
);

// Get current user's copy trading requests
router.get('/my-requests', getMyCopyTradingRequests);

// Get specific copy trading request
router.get('/requests/:id',
  [
    param('id', 'Invalid request ID').isInt()
  ],
  validate,
  getCopyTradingRequestById
);

// Admin routes - get all copy trading requests
router.get('/admin/requests',
  admin,
  [
    query('status', 'Invalid status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'processing', 'completed'])
  ],
  validate,
  getCopyTradingRequests
);

// Admin routes - update request status
router.put('/admin/requests/:id/status',
  admin,
  [
    param('id', 'Invalid request ID').isInt(),
    body('status', 'Status is required')
      .isIn(['pending', 'approved', 'rejected', 'processing', 'completed']),
    body('notes', 'Notes must be a string').optional().isString()
  ],
  validate,
  updateCopyTradingRequestStatus
);

export default router;
