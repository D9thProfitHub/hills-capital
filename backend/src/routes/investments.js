import express from 'express';
import {
  getInvestments,
  getInvestment,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getInvestmentStats,
} from '../controllers/sequelizeInvestmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for users to manage their investments
router
  .route('/')
  .get(getInvestments)
  .post(createInvestment);

router
  .route('/:id')
  .get(getInvestment)
  .put(updateInvestment)
  .delete(deleteInvestment);

// User investment statistics
router.route('/stats').get(getInvestmentStats);

// Admin routes for investment management
router.use(authorize('admin'));

// TODO: Add admin investment management routes

export default router;
