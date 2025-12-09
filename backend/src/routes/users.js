import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  userPhotoUpload,
  getUserDashboardStats,
} from '../controllers/userController.js';
import { getUserAffiliate, getUserReferrals } from '../controllers/userAffiliateController.js';
import { getUserEducation, getUserCourse, updateCourseProgress } from '../controllers/userEducationController.js';
import { getUserSubscriptions, getSubscriptionPlans, createSubscription, cancelSubscription } from '../controllers/userSubscriptionController.js';
import { getCopyTradingTraders, getUserCopyTradingRequests, createCopyTradingRequest, stopCopyTrading, getCopyTradingStats } from '../controllers/userCopyTradingController.js';
import { getUserSignals, getUserSignal, getUserSignalsStats } from '../controllers/userSignalsController.js';
import { protect, authorize } from '../middleware/auth.js';
import advancedResults from '../middleware/advancedResults.js';
import db from '../models/index.js';
const { User } = db;

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes below this line are restricted to admin only
// router.use(authorize('admin')); // Commenting this out to allow all authenticated users to access their own dashboard

router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

// User dashboard stats - accessible to all authenticated users
router.route('/dashboard/stats').get(getUserDashboardStats);

// User affiliate routes - accessible to all authenticated users
router.route('/affiliate').get(getUserAffiliate);
router.route('/affiliate/referrals').get(getUserReferrals);

// User education routes - accessible to all authenticated users
router.route('/education').get(getUserEducation);

// User subscription routes - accessible to all authenticated users
router.route('/subscriptions').get(getUserSubscriptions).post(createSubscription);
router.route('/subscriptions/:id').delete(cancelSubscription);
router.route('/subscription-plans').get(getSubscriptionPlans);

// User signals routes - accessible to all authenticated users (must come before generic /:id route)
router.route('/signals').get(getUserSignals);
router.route('/signals/stats').get(getUserSignalsStats);
router.route('/signals/:id').get(getUserSignal);

// User copy trading routes - accessible to all authenticated users
router.route('/copy-trading/traders').get(getCopyTradingTraders);
router.route('/copy-trading/requests').get(getUserCopyTradingRequests).post(createCopyTradingRequest);
router.route('/copy-trading/requests/:id').delete(stopCopyTrading);
router.route('/copy-trading/stats').get(getCopyTradingStats);

// Generic user routes with ID parameter (must come after specific routes)
router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// User photo upload
router.route('/:id/photo').put(userPhotoUpload);
router.route('/education/:id').get(getUserCourse);
router.route('/education/:id/progress').put(updateCourseProgress);

export default router;
