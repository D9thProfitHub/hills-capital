import express from 'express';
import { 
  getSupportedCurrencies,
  getMinimumAmounts,
  getMinimumAmount,
  getEstimate,
  createDepositPayment,
  createInvestmentPayment,
  createSubscriptionPayment,
  getPaymentStatus,
  getUserPayments,
  handleWebhook
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// Public routes
router.get('/currencies', getSupportedCurrencies);
router.get('/min-amounts', getMinimumAmounts);
router.get('/min-amount/:currency', 
  param('currency').isAlpha().isLength({ min: 2, max: 10 }),
  handleValidationErrors,
  getMinimumAmount
);

// Webhook route (public but verified internally)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect); // All routes below require authentication

// Price estimation
router.post('/estimate',
  body('amount').isNumeric().isFloat({ min: 0.01 }),
  body('currency_from').isAlpha().isLength({ min: 2, max: 10 }),
  body('currency_to').optional().isAlpha().isLength({ min: 2, max: 10 }),
  handleValidationErrors,
  getEstimate
);

// Create deposit payment
router.post('/deposit',
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('pay_currency').isAlpha().isLength({ min: 2, max: 10 }).withMessage('Valid payment currency required'),
  body('description').optional().isString().isLength({ max: 255 }),
  handleValidationErrors,
  createDepositPayment
);

// Create investment payment
router.post('/investment',
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('planId').isInt({ min: 1 }).withMessage('Valid plan ID required'),
  body('pay_currency').isAlpha().isLength({ min: 2, max: 10 }).withMessage('Valid payment currency required'),
  handleValidationErrors,
  createInvestmentPayment
);

// Create subscription payment
router.post('/subscription',
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('planId').isInt({ min: 1 }).withMessage('Valid plan ID required'),
  body('pay_currency').isAlpha().isLength({ min: 2, max: 10 }).withMessage('Valid payment currency required'),
  handleValidationErrors,
  createSubscriptionPayment
);

// Get payment status
router.get('/:paymentId/status',
  param('paymentId').isInt({ min: 1 }),
  handleValidationErrors,
  getPaymentStatus
);

// Get user payments
router.get('/',
  query('type').optional().isIn(['deposit', 'investment', 'subscription']),
  query('status').optional().isIn(['waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  getUserPayments
);

export default router;
