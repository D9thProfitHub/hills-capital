import express from 'express';
import {
  getTrades,
  getTrade,
  createTrade,
  updateTrade,
  closeTrade,
  cancelTrade,
  getTradeStats,
  getTradeHistory,
} from '../controllers/tradeController.js';
import { protect, authorize } from '../middleware/auth.js';
import advancedResults from '../middleware/advancedResults.js';
import Trade from '../models/Trade.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for users to manage their trades
router
  .route('/')
  .get(
    advancedResults(Trade, {
      path: 'user',
      select: 'name email',
    }),
    getTrades
  )
  .post(createTrade);

router
  .route('/:id')
  .get(getTrade)
  .put(updateTrade);

// Close a trade
router.put('/:id/close', closeTrade);

// Cancel a trade
router.put('/:id/cancel', cancelTrade);

// Trade statistics
router.get('/stats', getTradeStats);

// Trade history by asset
router.get('/history/:asset', getTradeHistory);

// Admin routes for trade management
router.use(authorize('admin'));

// Get all trades (admin only)
router.get('/admin/all', advancedResults(Trade), getTrades);

// Get trades by user (admin only)
router.get('/admin/user/:userId', getTrades);

export default router;
