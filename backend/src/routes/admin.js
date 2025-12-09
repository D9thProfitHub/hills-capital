import express from 'express';
import {
  adminLogin,
  getOverview,
  getRecentActivities,
  getTopInvestors,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getSystemStats,
  getInvestmentPlans,
  getInvestmentPlan,
  createInvestmentPlan,
  updateInvestmentPlan,
  deleteInvestmentPlan,
  getInvestments,
  getBotRequests,
  updateBotRequestStatus,
  getCopyTradingRequests,
  updateCopyTradingRequestStatus,
  getTraders,
  getSignals,
  createSignal,
  updateSignal,
  deleteSignal,
  activateSignal,
  closeSignal,
  getEducationContent,
  createEducationContent,
  updateEducationContent,
  deleteEducationContent,
  toggleContentPublish,
  createMissingAffiliates,
  getAdminUsers,
  getAdminInvestments,
  getAdminSignals,
} from '../controllers/adminController.js';
import {
  getSubscriptions,
  getSubscriptionPlans,
  updateSubscriptionStatus,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

import advancedResults from '../middleware/advancedResults.js';
import db from '../models/index.js';
const { User, Investment, Signal } = db;

const publicRouter = express.Router();
const protectedRouter = express.Router();

// --- Public Route --- //
publicRouter.post('/login', adminLogin);

// --- Protected Routes --- //
protectedRouter.use(protect);
protectedRouter.use(authorize('admin'));

// Dashboard
protectedRouter.route('/overview').get(getOverview);
protectedRouter.route('/recent-activities').get(getRecentActivities);
protectedRouter.route('/top-investors').get(getTopInvestors);
protectedRouter.route('/stats').get(getSystemStats);
protectedRouter.route('/dashboard/users').get(getAdminUsers);
protectedRouter.route('/dashboard/investments').get(getAdminInvestments);
protectedRouter.route('/dashboard/signals').get(getAdminSignals);

// User Management
protectedRouter.route('/users').get(advancedResults(User), getUsers).post(createUser);
protectedRouter.route('/users/:id').get(getUser).put(updateUser).delete(deleteUser);
protectedRouter.route('/users/:id/role').put(updateUserRole);
protectedRouter.route('/users/:id/status').put(updateUserStatus);

// Investment Plans
protectedRouter.route('/investment-plans').get(getInvestmentPlans).post(createInvestmentPlan);
protectedRouter.route('/investment-plans/:id').get(getInvestmentPlan).put(updateInvestmentPlan).delete(deleteInvestmentPlan);
protectedRouter.route('/investments').get(advancedResults(Investment), getInvestments);

// Trading Bot Requests
protectedRouter.route('/bot-requests').get(getBotRequests);
protectedRouter.route('/bot-requests/:id/status').put(updateBotRequestStatus);

// Copy Trading Requests
protectedRouter.route('/copy-trading-requests').get(getCopyTradingRequests);
protectedRouter.route('/copy-trading-requests/:id/status').put(updateCopyTradingRequestStatus);
protectedRouter.route('/traders').get(getTraders);

// Signals Management
protectedRouter.route('/signals').get(advancedResults(Signal), getSignals).post(createSignal);
protectedRouter.route('/signals/:id').put(updateSignal).delete(deleteSignal);
protectedRouter.route('/signals/:id/activate').post(activateSignal);
protectedRouter.route('/signals/:id/close').post(closeSignal);

// Education Management
protectedRouter.route('/education').get(getEducationContent).post(createEducationContent);
protectedRouter.route('/education/:id').put(updateEducationContent).delete(deleteEducationContent);
protectedRouter.route('/education/:id/publish').put(toggleContentPublish);

// Education Content (alternative endpoint)
protectedRouter.route('/education-content').get(getEducationContent).post(createEducationContent);
protectedRouter.route('/education-content/:id').put(updateEducationContent).delete(deleteEducationContent);

// Import affiliate controller
import { getAffiliates, createAffiliate, updateAffiliate, deleteAffiliate, getAffiliateStats } from '../controllers/simpleAffiliateController.js';

// Import commission settings controller
import { getCommissionSettings, updateCommissionSettings } from '../controllers/commissionSettingsController.js';

// Affiliate Management (real database routes)
protectedRouter.route('/affiliates')
  .get(getAffiliates)
  .post(createAffiliate);

protectedRouter.route('/affiliates/:id')
  .put(updateAffiliate)
  .delete(deleteAffiliate);

protectedRouter.route('/affiliate-stats')
  .get(getAffiliateStats);
protectedRouter.route('/affiliate-settings')
  .get(getCommissionSettings)
  .put(updateCommissionSettings);
protectedRouter.route('/affiliate-payouts').get((req, res) => res.json({ success: true, data: [] }));

// Subscription Management
protectedRouter.route('/subscriptions')
  .get(getSubscriptions);

protectedRouter.route('/subscriptions/:id/status')
  .put(updateSubscriptionStatus);

protectedRouter.route('/subscription-plans')
  .get(getSubscriptionPlans)
  .post(createSubscriptionPlan);

protectedRouter.route('/subscription-plans/:id')
  .put(updateSubscriptionPlan)
  .delete(deleteSubscriptionPlan);

// Investment Plan Routes
protectedRouter
  .route('/investment-plans')
  .get(getInvestmentPlans)
  .post(createInvestmentPlan);

protectedRouter
  .route('/investment-plans/:id')
  .get(getInvestmentPlan)
  .put(updateInvestmentPlan)
  .delete(deleteInvestmentPlan);

// Affiliate Management Routes
protectedRouter.route('/create-missing-affiliates').post(createMissingAffiliates);

export { publicRouter as publicAdminRouter, protectedRouter as protectedAdminRouter };
