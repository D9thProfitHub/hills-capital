import db from '../models/index.js';
const { User, Investment, Signal, InvestmentPlan } = db;
// Optional models that might not exist
const TradingBotRequest = db.TradingBotRequest || null;
const CopyTradingRequest = db.CopyTradingRequest || null;
const Education = db.Education || null;
const EducationContent = db.EducationContent || null;
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createAffiliateAccount } from '../middleware/autoAffiliate.js';

// @desc    Get admin dashboard overview
// @route   GET /api/admin/overview
// @access  Private/Admin
export const getOverview = asyncHandler(async (req, res, next) => {
  try {
    // Get counts from database with fallbacks for missing models
    const totalUsers = await User.count().catch(() => 0);
    const activeInvestments = await Investment.count({ where: { status: 'active' } }).catch(() => 0);
    
    // Use fallback values for models that might not exist
    const pendingBotRequests = TradingBotRequest ? 
      await TradingBotRequest.count({ where: { status: 'pending' } }).catch(() => 0) : 0;
    const pendingCopyTrading = CopyTradingRequest ? 
      await CopyTradingRequest.count({ where: { status: 'pending' } }).catch(() => 0) : 0;
    
    // Count users who have active investments as subscribers
    const activeInvestmentsList = await Investment.findAll({ where: { status: 'active' } }).catch(() => []);
    const uniqueUserIds = [...new Set(activeInvestmentsList.map(inv => inv.userId))];
    const activeSubscribers = uniqueUserIds.length;
    
    // Calculate total revenue from investments
    const investments = await Investment.findAll({ where: { status: 'active' } }).catch(() => []);
    const totalRevenue = investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const totalActiveInvestmentValue = totalRevenue; // Same as totalRevenue for active investments
    
    res.status(200).json({
      success: true,
      totalUsers,
      activeInvestments,
      pendingBotRequests,
      pendingCopyTrading,
      activeSubscribers,
      totalRevenue,
      totalActiveInvestmentValue
    });
  } catch (error) {
    console.error('Error in getOverview:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      totalUsers: 0,
      activeInvestments: 0,
      pendingBotRequests: 0,
      pendingCopyTrading: 0,
      activeSubscribers: 0,
      totalRevenue: 0,
      totalActiveInvestmentValue: 0
    });
  }
});

// @desc    Get recent activities for admin dashboard
// @route   GET /api/admin/recent-activities
// @access  Private/Admin
export const getRecentActivities = asyncHandler(async (req, res, next) => {
  try {
    // Get recent investments
    const recentInvestments = await Investment.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']]
    }).catch(() => []);

    // Get user info for each investment
    const activities = [];
    for (const inv of recentInvestments) {
      try {
        const user = await User.findByPk(inv.userId).catch(() => null);
        activities.push({
          id: inv.id,
          user: user ? user.name : 'Unknown User',
          email: user ? user.email : '',
          action: 'Investment',
          amount: `$${parseFloat(inv.amount || 0).toLocaleString()}`,
          plan: `${inv.duration} days`,
          status: inv.status,
          time: new Date(inv.createdAt).toLocaleDateString()
        });
      } catch (err) {
        console.log('Error getting user for investment:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
});

// @desc    Get top investors for admin dashboard
// @route   GET /api/admin/top-investors
// @access  Private/Admin
export const getTopInvestors = asyncHandler(async (req, res, next) => {
  try {
    // Get users with their total investments
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'balance', 'total_deposits'],
      order: [['total_deposits', 'DESC']],
      limit: 5
    }).catch(() => []);

    // Transform to top investors format
    const topInvestors = users.map((user, index) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.name.charAt(0).toUpperCase(),
      totalInvested: parseFloat(user.total_deposits || 0),
      currentBalance: parseFloat(user.balance || 0),
      returns: user.total_deposits > 0 ? 
        Math.round(((parseFloat(user.balance || 0) - parseFloat(user.total_deposits || 0)) / parseFloat(user.total_deposits)) * 100) : 0,
      rank: index + 1
    }));

    res.status(200).json({
      success: true,
      count: topInvestors.length,
      data: topInvestors
    });
  } catch (error) {
    console.error('Error in getTopInvestors:', error);
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
});

// InvestmentPlan CRUD now uses DB model, not in-memory array.

// TradingBotRequest CRUD now uses DB model, not in-memory array.

// --- CopyTradingRequest CRUD using DB Model ---


// @desc    Get single copy trading request
// @route   GET /api/admin/copy-trading-requests/:id
// @access  Private/Admin
export const getCopyTradingRequest = asyncHandler(async (req, res, next) => {
  const request = await CopyTradingRequest.findById(req.params.id);
  if (!request) return next(new ErrorResponse('Copy trading request not found', 404));
  res.status(200).json({ success: true, data: request });
});

// @desc    Create new copy trading request
// @route   POST /api/admin/copy-trading-requests
// @access  Private/Admin
export const createCopyTradingRequest = asyncHandler(async (req, res, next) => {
  const request = await CopyTradingRequest.create(req.body);
  if (req.app && req.app.get('io')) {
    const requests = await CopyTradingRequest.find();
    req.app.get('io').emit('copyTradingRequestsUpdated', requests);
  }
  res.status(201).json({ success: true, data: request });
});

// @desc    Update copy trading request
// @route   PUT /api/admin/copy-trading-requests/:id
// @access  Private/Admin
export const updateCopyTradingRequest = asyncHandler(async (req, res, next) => {
  const request = await CopyTradingRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!request) return next(new ErrorResponse('Copy trading request not found', 404));
  if (req.app && req.app.get('io')) {
    const requests = await CopyTradingRequest.find();
    req.app.get('io').emit('copyTradingRequestsUpdated', requests);
  }
  res.status(200).json({ success: true, data: request });
});

// @desc    Delete copy trading request
// @route   DELETE /api/admin/copy-trading-requests/:id
// @access  Private/Admin
export const deleteCopyTradingRequest = asyncHandler(async (req, res, next) => {
  const request = await CopyTradingRequest.findById(req.params.id);
  if (!request) return next(new ErrorResponse('Copy trading request not found', 404));
  await request.deleteOne();
  if (req.app && req.app.get('io')) {
    const requests = await CopyTradingRequest.find();
    req.app.get('io').emit('copyTradingRequestsUpdated', requests);
  }
  res.status(200).json({ success: true, data: request });
});


// --- Signals CRUD using DB Model ---


// @desc    Get single signal
// @route   GET /api/admin/signals/:id
// @access  Private/Admin
export const getSignal = asyncHandler(async (req, res, next) => {
  const signal = await Signal.findById(req.params.id);
  if (!signal) return next(new ErrorResponse('Signal not found', 404));
  res.status(200).json({ success: true, data: signal });
});





// --- Education Modules CRUD using DB Model ---

// @desc    Get all education modules
// @route   GET /api/admin/education-modules
// @access  Private/Admin
export const getEducationModules = asyncHandler(async (req, res, next) => {
  const modules = await EducationContent.find();
  res.status(200).json({ success: true, data: modules });
});

// @desc    Get single education module
// @route   GET /api/admin/education-modules/:id
// @access  Private/Admin
export const getEducationModule = asyncHandler(async (req, res, next) => {
  const module = await EducationContent.findById(req.params.id);
  if (!module) return next(new ErrorResponse('Education module not found', 404));
  res.status(200).json({ success: true, data: module });
});

// @desc    Create new education module
// @route   POST /api/admin/education-modules
// @access  Private/Admin
export const createEducationModule = asyncHandler(async (req, res, next) => {
  const module = await EducationContent.create(req.body);
  if (req.app && req.app.get('io')) {
    const modules = await EducationContent.find();
    req.app.get('io').emit('educationModulesUpdated', modules);
  }
  res.status(201).json({ success: true, data: module });
});

// @desc    Update education module
// @route   PUT /api/admin/education-modules/:id
// @access  Private/Admin
export const updateEducationModule = asyncHandler(async (req, res, next) => {
  const module = await EducationContent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!module) return next(new ErrorResponse('Education module not found', 404));
  if (req.app && req.app.get('io')) {
    const modules = await EducationContent.find();
    req.app.get('io').emit('educationModulesUpdated', modules);
  }
  res.status(200).json({ success: true, data: module });
});

// @desc    Delete education module
// @route   DELETE /api/admin/education-modules/:id
// @access  Private/Admin
export const deleteEducationModule = asyncHandler(async (req, res, next) => {
  const module = await EducationContent.findById(req.params.id);
  if (!module) return next(new ErrorResponse('Education module not found', 404));
  await module.deleteOne();
  if (req.app && req.app.get('io')) {
    const modules = await EducationContent.find();
    req.app.get('io').emit('educationModulesUpdated', modules);
  }
  res.status(200).json({ success: true, data: module });
});


// --- Affiliate Management CRUD using DB Model ---
import Affiliate from '../models/Affiliate.js';

// @desc    Get all affiliates
// @route   GET /api/admin/affiliates
// @access  Private/Admin
export const getAffiliates = asyncHandler(async (req, res, next) => {
  const affiliates = await Affiliate.find();
  res.status(200).json({ success: true, data: affiliates });
});

// @desc    Get single affiliate
// @route   GET /api/admin/affiliates/:id
// @access  Private/Admin
export const getAffiliate = asyncHandler(async (req, res, next) => {
  const affiliate = await Affiliate.findById(req.params.id);
  if (!affiliate) return next(new ErrorResponse('Affiliate not found', 404));
  res.status(200).json({ success: true, data: affiliate });
});

// @desc    Create new affiliate
// @route   POST /api/admin/affiliates
// @access  Private/Admin
export const createAffiliate = asyncHandler(async (req, res, next) => {
  const affiliate = await Affiliate.create(req.body);
  if (req.app && req.app.get('io')) {
    const affiliates = await Affiliate.find();
    req.app.get('io').emit('affiliatesUpdated', affiliates);
  }
  res.status(201).json({ success: true, data: affiliate });
});

// @desc    Update affiliate
// @route   PUT /api/admin/affiliates/:id
// @access  Private/Admin
export const updateAffiliate = asyncHandler(async (req, res, next) => {
  const affiliate = await Affiliate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!affiliate) return next(new ErrorResponse('Affiliate not found', 404));
  if (req.app && req.app.get('io')) {
    const affiliates = await Affiliate.find();
    req.app.get('io').emit('affiliatesUpdated', affiliates);
  }
  res.status(200).json({ success: true, data: affiliate });
});

// @desc    Delete affiliate
// @route   DELETE /api/admin/affiliates/:id
// @access  Private/Admin
export const deleteAffiliate = asyncHandler(async (req, res, next) => {
  const affiliate = await Affiliate.findById(req.params.id);
  if (!affiliate) return next(new ErrorResponse('Affiliate not found', 404));
  await affiliate.deleteOne();
  if (req.app && req.app.get('io')) {
    const affiliates = await Affiliate.find();
    req.app.get('io').emit('affiliatesUpdated', affiliates);
  }
  res.status(200).json({ success: true, data: affiliate });
});

// @desc    Update affiliate status
// @route   PUT /api/admin/affiliates/:id/status
// @access  Private/Admin
export const updateAffiliateStatus = asyncHandler(async (req, res, next) => {
  const affiliate = await Affiliate.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
    new: true,
    runValidators: true,
  });
  if (!affiliate) return next(new ErrorResponse('Affiliate not found', 404));
  if (req.app && req.app.get('io')) {
    const affiliates = await Affiliate.find();
    req.app.get('io').emit('affiliatesUpdated', affiliates);
  }
  res.status(200).json({ success: true, data: affiliate });
});


// --- Subscription Management CRUD using DB Model ---
import Subscription from '../models/Subscription.js';

// @desc    Get all subscriptions
// @route   GET /api/admin/subscriptions
// @access  Private/Admin
export const getSubscriptions = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: subscriptions });
});

// @desc    Create new subscription
// @route   POST /api/admin/subscriptions
// @access  Private/Admin
export const createSubscription = asyncHandler(async (req, res, next) => {
  const newSubscription = {
    ...req.body,
    id: subscriptions.length ? subscriptions[subscriptions.length - 1].id + 1 : 1,
    status: req.body.status || 'pending',
    autoRenew: req.body.autoRenew ?? false,
    createdAt: new Date().toISOString()
  };
  subscriptions.push(newSubscription);
  if (req.app && req.app.get('io')) req.app.get('io').emit('subscriptionsUpdated', subscriptions);
  res.status(201).json({ success: true, data: newSubscription });
});

// @desc    Update subscription
// @route   PUT /api/admin/subscriptions/:id
// @access  Private/Admin
export const updateSubscription = asyncHandler(async (req, res, next) => {
  const subscriptionId = parseInt(req.params.id);
  const idx = subscriptions.findIndex(s => s.id === subscriptionId);
  if (idx === -1) return next(new ErrorResponse('Subscription not found', 404));
  subscriptions[idx] = { ...subscriptions[idx], ...req.body };
  if (req.app && req.app.get('io')) req.app.get('io').emit('subscriptionsUpdated', subscriptions);
  res.status(200).json({ success: true, data: subscriptions[idx] });
});

// @desc    Delete subscription
// @route   DELETE /api/admin/subscriptions/:id
// @access  Private/Admin
export const deleteSubscription = asyncHandler(async (req, res, next) => {
  const subscriptionId = parseInt(req.params.id);
  const idx = subscriptions.findIndex(s => s.id === subscriptionId);
  if (idx === -1) return next(new ErrorResponse('Subscription not found', 404));
  const deleted = subscriptions.splice(idx, 1);
  if (req.app && req.app.get('io')) req.app.get('io').emit('subscriptionsUpdated', subscriptions);
  res.status(200).json({ success: true, data: deleted[0] });
});

// @desc    Update subscription status
// @route   PUT /api/admin/subscriptions/:id/status
// @access  Private/Admin
export const updateSubscriptionStatus = asyncHandler(async (req, res, next) => {
  const subscriptionId = parseInt(req.params.id);
  const idx = subscriptions.findIndex(s => s.id === subscriptionId);
  if (idx === -1) return next(new ErrorResponse('Subscription not found', 404));
  subscriptions[idx].status = req.body.status;
  if (req.app && req.app.get('io')) req.app.get('io').emit('subscriptionsUpdated', subscriptions);
  res.status(200).json({ success: true, data: subscriptions[idx] });
});

// @desc    Renew subscription
// @route   PUT /api/admin/subscriptions/:id/renew
// @access  Private/Admin
export const renewSubscription = asyncHandler(async (req, res, next) => {
  const subscriptionId = parseInt(req.params.id);
  const idx = subscriptions.findIndex(s => s.id === subscriptionId);
  if (idx === -1) return next(new ErrorResponse('Subscription not found', 404));
  // Simple mock: extend endDate by 1 month
  const currentEnd = new Date(subscriptions[idx].endDate);
  currentEnd.setMonth(currentEnd.getMonth() + 1);
  subscriptions[idx].endDate = currentEnd.toISOString().substring(0, 10);
  subscriptions[idx].status = 'active';
  if (req.app && req.app.get('io')) req.app.get('io').emit('subscriptionsUpdated', subscriptions);
  res.status(200).json({ success: true, data: subscriptions[idx] });
});

// @desc    Cancel auto-renew
// @route   PUT /api/admin/subscriptions/:id/cancel-autorenew
// @access  Private/Admin
export const cancelAutoRenew = asyncHandler(async (req, res, next) => {
  const subscriptionId = parseInt(req.params.id);
  const idx = subscriptions.findIndex(s => s.id === subscriptionId);
  if (idx === -1) return next(new ErrorResponse('Subscription not found', 404));
  subscriptions[idx].autoRenew = false;
  if (req.app && req.app.get('io')) req.app.get('io').emit('subscriptionsUpdated', subscriptions);
  res.status(200).json({ success: true, data: subscriptions[idx] });
});





// --- CRUD CONTROLLERS FOR TRADING BOT REQUESTS (DB) ---

// @desc    Get all trading bot requests
// @route   GET /api/admin/bot-requests
// @access  Private/Admin

// @desc    Create new trading bot request
// @route   POST /api/admin/bot-requests
// @access  Private/Admin
export const createBotRequest = asyncHandler(async (req, res, next) => {
  const request = await TradingBotRequest.create(req.body);
  if (req.app && req.app.get('io')) {
    const requests = await TradingBotRequest.find();
    req.app.get('io').emit('botRequestsUpdated', requests);
  }
  res.status(201).json({ success: true, data: request });
});


// @desc    Delete trading bot request
// @route   DELETE /api/admin/bot-requests/:id
// @access  Private/Admin
export const deleteBotRequest = asyncHandler(async (req, res, next) => {
  const request = await TradingBotRequest.findById(req.params.id);
  if (!request) return next(new ErrorResponse('Bot request not found', 404));
  await request.deleteOne();
  if (req.app && req.app.get('io')) {
    const requests = await TradingBotRequest.find();
    req.app.get('io').emit('botRequestsUpdated', requests);
  }
  res.status(200).json({ success: true, data: request });
});







// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = asyncHandler(async (req, res, next) => {
  console.log('--- Admin Login Attempt ---');
  const { email, password } = req.body;
  console.log(`Email: ${email}`);

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  console.log('1. Searching for admin user in database...');
  const user = await User.findOne({ 
    where: { email },
    attributes: { include: ['password'] }
  });

  if (!user) {
    console.log('Error: Admin user not found.');
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  console.log('Found user:', user.email);

  // Check if user is an admin
  console.log('2. Verifying user role...');
  if (user.role !== 'admin') {
    return next(new ErrorResponse('Access denied. Admin privileges required.', 403));
  }

  // Check if password matches
  console.log('3. Verifying password...');
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    console.log('Error: Password does not match.');
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  console.log('Password verified.');

  // Create token
  console.log('4. Creating JWT token...');
  console.log(`JWT_SECRET is set: ${!!process.env.JWT_SECRET}`);
  console.log(`JWT_EXPIRE is set: ${process.env.JWT_EXPIRE}`);
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
  console.log('Token created successfully.');

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
});

// @desc    Update user role (admin)
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  // Validate role
  const validRoles = ['user', 'admin', 'moderator'];
  if (!validRoles.includes(role)) {
    return next(new ErrorResponse(`Invalid role: ${role}`, 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user status (admin)
// @route   PUT /api/v1/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  // Validate status
  const validStatuses = ['active', 'suspended', 'banned'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse(`Invalid status: ${status}`, 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Get system stats (admin)
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getSystemStats = asyncHandler(async (req, res, next) => {
  // Get user stats
  const userStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        role: '$_id',
        count: 1,
      },
    },
  ]);

  // Get status stats
  const statusStats = await User.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
  ]);

  // Get registration stats (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const registrationStats = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      userStats,
      statusStats,
      registrationStats,
    },
  });
});

// ==================== INVESTMENT PLANS ====================





// @desc    Get active investments
// @route   GET /api/v1/admin/investments
// @access  Private/Admin
export const getInvestments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// ==================== TRADING BOT REQUESTS ====================

// @desc    Get all trading bot requests
// @route   GET /api/v1/admin/bot-requests
// @access  Private/Admin
export const getBotRequests = asyncHandler(async (req, res, next) => {
  try {
    const { status } = req.query;
    let whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    const requests = TradingBotRequest ? 
      await TradingBotRequest.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      }).catch(() => []) : [];
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error in getBotRequests:', error);
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
});

// @desc    Update bot request status
// @route   PUT /api/v1/admin/bot-requests/:id/status
// @access  Private/Admin
export const updateBotRequestStatus = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  
  const updateData = { status };
  
  if (status === 'approved') {
    updateData.approvedBy = req.user.id;
    updateData.approvedAt = new Date();
  } else if (status === 'rejected' && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  } else if (status === 'active') {
    updateData.activatedAt = new Date();
  }
  
  const request = await TradingBotRequest.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!request) {
    return next(new ErrorResponse(`Bot request not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: request
  });
});

// ==================== COPY TRADING REQUESTS ====================

// @desc    Get all copy trading requests
// @route   GET /api/v1/admin/copy-trading-requests
// @access  Private/Admin
export const getCopyTradingRequests = asyncHandler(async (req, res, next) => {
  try {
    const { status } = req.query;
    let whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    const requests = CopyTradingRequest ? 
      await CopyTradingRequest.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      }).catch(() => []) : [];
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error in getCopyTradingRequests:', error);
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
});

// @desc    Update copy trading request status
// @route   PUT /api/v1/admin/copy-trading-requests/:id/status
// @access  Private/Admin
export const updateCopyTradingRequestStatus = asyncHandler(async (req, res, next) => {
  try {
    const { status, assignedTrader, rejectionReason } = req.body;
    
    const updateData = { status };
    
    if (status === 'approved') {
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
      if (assignedTrader) {
        updateData.assignedTrader = assignedTrader;
      }
    } else if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    } else if (status === 'active') {
      updateData.activatedAt = new Date();
    }
    
    if (!CopyTradingRequest) {
      return res.status(200).json({
        success: true,
        data: { id: req.params.id, ...updateData }
      });
    }
    
    const [updatedRowsCount] = await CopyTradingRequest.update(updateData, {
      where: { id: req.params.id }
    });
    
    if (updatedRowsCount === 0) {
      return next(new ErrorResponse(`Copy trading request not found with id of ${req.params.id}`, 404));
    }
    
    const request = await CopyTradingRequest.findByPk(req.params.id);
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error updating copy trading request status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get available traders
// @route   GET /api/v1/admin/traders
// @access  Private/Admin
export const getTraders = asyncHandler(async (req, res, next) => {
  // Mock traders for now - replace with actual trader model
  const traders = [
    { id: '1', name: 'Alex Johnson', winRate: 85.2, totalTrades: 1250 },
    { id: '2', name: 'Sarah Chen', winRate: 78.9, totalTrades: 980 },
    { id: '3', name: 'Mike Rodriguez', winRate: 82.1, totalTrades: 1100 },
    { id: '4', name: 'Emma Wilson', winRate: 79.5, totalTrades: 850 }
  ];
  
  res.status(200).json({
    success: true,
    data: traders
  });
});

// @desc    Get all signals
// @route   GET /api/v1/admin/signals
// @access  Private/Admin
export const getSignals = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  let where = {};
  
  if (status && status !== 'all') {
    where.status = status;
  }
  
  const signals = await Signal.findAll({
    where,
    order: [['createdAt', 'DESC']]
  });
  
  res.status(200).json({
    success: true,
    count: signals.length,
    data: signals
  });
});

// @desc    Create signal
// @route   POST /api/v1/admin/signals
// @access  Private/Admin
export const createSignal = asyncHandler(async (req, res, next) => {
  console.log('Creating signal with data:', req.body);
  console.log('User from request:', req.user);
  
  // Set createdBy if user is available, otherwise use a default value
  if (req.user && req.user.id) {
    req.body.createdBy = req.user.id;
  } else {
    // For testing purposes, use admin user ID (1) if no user is found
    req.body.createdBy = 1;
    console.log('Warning: No user found in request, using default createdBy = 1');
  }
  
  try {
    const signal = await Signal.create(req.body);
    console.log('Signal created successfully:', signal.toJSON());
    
    res.status(201).json({
      success: true,
      data: signal
    });
  } catch (error) {
    console.error('Error creating signal:', error);
    return next(error);
  }
});

// @desc    Update signal
// @route   PUT /api/v1/admin/signals/:id
// @access  Private/Admin
export const updateSignal = asyncHandler(async (req, res, next) => {
  try {
    // First find the signal
    const signal = await Signal.findByPk(req.params.id);
    
    if (!signal) {
      return next(new ErrorResponse(`Signal not found with id of ${req.params.id}`, 404));
    }
    
    // Update the signal
    await signal.update(req.body);
    
    res.status(200).json({
      success: true,
      data: signal
    });
  } catch (error) {
    console.error('Error updating signal:', error);
    return next(new ErrorResponse('Error updating signal', 500));
  }
});

// @desc    Delete signal
// @route   DELETE /api/v1/admin/signals/:id
// @access  Private/Admin
export const deleteSignal = asyncHandler(async (req, res, next) => {
  const deletedRowsCount = await Signal.destroy({
    where: { id: req.params.id }
  });
  
  if (deletedRowsCount === 0) {
    return next(new ErrorResponse(`Signal not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Activate signal
// @route   PUT /api/v1/admin/signals/:id/activate
// @access  Private/Admin
export const activateSignal = asyncHandler(async (req, res, next) => {
  const [updatedRowsCount, [signal]] = await Signal.update(
    { status: 'active', activatedAt: new Date() },
    {
      where: { id: req.params.id },
      returning: true
    }
  );
  
  if (updatedRowsCount === 0) {
    return next(new ErrorResponse(`Signal not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: signal
  });
});

// @desc    Close signal
// @route   PUT /api/v1/admin/signals/:id/close
// @access  Private/Admin
export const closeSignal = asyncHandler(async (req, res, next) => {
  try {
    const { result, actualExitPrice } = req.body;
    
    // First find the signal
    const signal = await Signal.findByPk(req.params.id);
    
    if (!signal) {
      return next(new ErrorResponse(`Signal not found with id of ${req.params.id}`, 404));
    }
    
    // Update the signal
    await signal.update({
      status: 'closed', 
      result, 
      actualExitPrice,
      closedAt: new Date() 
    });
    
    res.status(200).json({
      success: true,
      data: signal
    });
  } catch (error) {
    console.error('Error closing signal:', error);
    return next(new ErrorResponse('Error closing signal', 500));
  }
});



// Education content now uses real database queries - no more mock data

// @desc    Get all education content
// @route   GET /api/v1/admin/education
// @access  Private/Admin
export const getEducationContent = asyncHandler(async (req, res, next) => {
  try {
    if (!EducationContent) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const educationContent = await EducationContent.findAll({
      attributes: [
        'id', 'title', 'description', 'type', 'isPublished', 'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Found education content:', educationContent.length, 'items');

    res.status(200).json({
      success: true,
      count: educationContent.length,
      data: educationContent
    });
  } catch (error) {
    console.error('Error in getEducationContent:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching education content',
      error: error.message
    });
  }
});

// @desc    Create education content
// @route   POST /api/v1/admin/education
// @access  Private/Admin
export const createEducationContent = asyncHandler(async (req, res, next) => {
  try {
    if (!EducationContent) {
      return res.status(500).json({
        success: false,
        message: 'EducationContent model not available'
      });
    }

    console.log('Creating education content with data:', req.body);
    
    const content = await EducationContent.create({
      ...req.body,
      createdBy: req.user?.id || 1
    });
    
    console.log('Content created in database:', content.toJSON());
    
    res.status(201).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error creating education content:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating education content',
      error: error.message
    });
  }
});

// @desc    Update education content
// @route   PUT /api/v1/admin/education/:id
// @access  Private/Admin
export const updateEducationContent = asyncHandler(async (req, res, next) => {
  try {
    if (!EducationContent) {
      return res.status(500).json({
        success: false,
        message: 'EducationContent model not available'
      });
    }

    const contentId = parseInt(req.params.id);
    console.log('Updating education content ID:', contentId, 'with data:', req.body);
    
    const content = await EducationContent.findByPk(contentId);
    
    if (!content) {
      return next(new ErrorResponse('Content not found', 404));
    }
    
    await content.update(req.body);
    
    console.log('Content updated in database:', content.toJSON());
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error updating education content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating education content',
      error: error.message
    });
  }
});

// @desc    Delete education content
// @route   DELETE /api/v1/admin/education/:id
// @access  Private/Admin
export const deleteEducationContent = asyncHandler(async (req, res, next) => {
  try {
    if (!EducationContent) {
      return res.status(500).json({
        success: false,
        message: 'EducationContent model not available'
      });
    }

    const contentId = parseInt(req.params.id);
    console.log('Deleting education content ID:', contentId);
    
    const content = await EducationContent.findByPk(contentId);
    
    if (!content) {
      return next(new ErrorResponse('Content not found', 404));
    }
    
    await content.destroy();
    
    console.log('Content deleted from database:', contentId);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting education content:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting education content',
      error: error.message
    });
  }
});

// @desc    Toggle education content publish status
// @route   PUT /api/v1/admin/education/:id/publish
// @access  Private/Admin
export const toggleContentPublish = asyncHandler(async (req, res, next) => {
  try {
    if (!EducationContent) {
      return res.status(500).json({
        success: false,
        message: 'EducationContent model not available'
      });
    }

    const contentId = parseInt(req.params.id);
    console.log('Toggling publish status for education content ID:', contentId);
    
    const content = await EducationContent.findByPk(contentId);
    
    if (!content) {
      return next(new ErrorResponse('Content not found', 404));
    }
    
    // Toggle publish status
    await content.update({
      isPublished: !content.isPublished
    });
    
    console.log('Content publish status toggled:', content.toJSON());
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error toggling content publish status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling content publish status',
      error: error.message
    });
  }
});

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'balance', 'status', 'role', 'createdAt', 'last_login', 'is_email_confirmed'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return next(new ErrorResponse('Error fetching users', 500));
  }
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return next(new ErrorResponse('Error fetching user', 500));
  }
});

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, phone, role, status, password } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return next(new ErrorResponse('Name and email are required', 400));
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new ErrorResponse('User with this email already exists', 400));
    }

    const user = await User.create({
      name,
      email,
      phone,
      role: role || 'user',
      status: status || 'active',
      password: password || 'defaultPassword123' // Provide default password if none given
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return next(new ErrorResponse('Error creating user', 500));
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return next(new ErrorResponse('Error deleting user', 500));
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, phone, role, status } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Update user fields conditionally
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return next(new ErrorResponse('Error updating user', 500));
  }
});

// ==================== ADMIN DASHBOARD DATA ====================

// @desc    Get admin users data
// @route   GET /api/admin/dashboard/users
// @access  Private/Admin
export const getAdminUsers = asyncHandler(async (req, res, next) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'balance', 'status', 'role', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    users: users
  });
});

// @desc    Get admin investments data
// @route   GET /api/admin/investments
// @access  Private/Admin
export const getAdminInvestments = asyncHandler(async (req, res, next) => {
  const investments = await Investment.findAll({
    attributes: ['id', 'userId', 'amount', 'plan', 'status', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    investments: investments
  });
});

// @desc    Get admin signals data
// @route   GET /api/admin/signals
// @access  Private/Admin
export const getAdminSignals = asyncHandler(async (req, res, next) => {
  const signals = await Signal.findAll({
    attributes: ['id', 'pair', 'type', 'entryPrice', 'takeProfit', 'stopLoss', 'status', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    signals: signals
  });
});

// ==================== INVESTMENT PLAN MANAGEMENT ====================

// @desc    Get all investment plans
// @route   GET /api/admin/investment-plans
// @access  Private/Admin
export const getInvestmentPlans = asyncHandler(async (req, res, next) => {
  try {
    const plans = await InvestmentPlan.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching investment plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investment plans'
    });
  }
});

// @desc    Get single investment plan
// @route   GET /api/admin/investment-plans/:id
// @access  Private/Admin
export const getInvestmentPlan = asyncHandler(async (req, res, next) => {
  try {
    const plan = await InvestmentPlan.findByPk(req.params.id);

    if (!plan) {
      return next(new ErrorResponse('Investment plan not found', 404));
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching investment plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investment plan'
    });
  }
});

// @desc    Create investment plan
// @route   POST /api/admin/investment-plans
// @access  Private/Admin
export const createInvestmentPlan = asyncHandler(async (req, res, next) => {
  try {
    const plan = await InvestmentPlan.create(req.body);

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error creating investment plan:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating investment plan',
      error: error.message
    });
  }
});

// @desc    Update investment plan
// @route   PUT /api/admin/investment-plans/:id
// @access  Private/Admin
export const updateInvestmentPlan = asyncHandler(async (req, res, next) => {
  try {
    const plan = await InvestmentPlan.findByPk(req.params.id);

    if (!plan) {
      return next(new ErrorResponse('Investment plan not found', 404));
    }

    await plan.update(req.body);

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error updating investment plan:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating investment plan',
      error: error.message
    });
  }
});

// @desc    Delete investment plan
// @route   DELETE /api/admin/investment-plans/:id
// @access  Private/Admin
export const deleteInvestmentPlan = asyncHandler(async (req, res, next) => {
  try {
    const plan = await InvestmentPlan.findByPk(req.params.id);

    if (!plan) {
      return next(new ErrorResponse('Investment plan not found', 404));
    }

    await plan.destroy();

    res.status(200).json({
      success: true,
      message: 'Investment plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investment plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting investment plan'
    });
  }
});

// @desc    Create missing affiliate accounts for all users
// @route   POST /api/admin/create-missing-affiliates
// @access  Private/Admin
export const createMissingAffiliates = asyncHandler(async (req, res, next) => {
  try {
    const { Affiliate } = db;
    
    // Get all users
    const users = await User.findAll();
    
    let created = 0;
    let skipped = 0;
    
    for (const user of users) {
      // Check if user already has an affiliate account
      const existingAffiliate = await Affiliate.findOne({ where: { user_id: user.id } });
      
      if (!existingAffiliate) {
        await createAffiliateAccount(user);
        created++;
        console.log(`✅ Created affiliate account for ${user.email}`);
      } else {
        skipped++;
        console.log(`⏭️ Skipped ${user.email} - already has affiliate account`);
      }
    }
    
    res.json({
      success: true,
      message: `Affiliate account creation complete`,
      data: {
        totalUsers: users.length,
        created,
        skipped
      }
    });
    
  } catch (error) {
    console.error('Error creating missing affiliate accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating missing affiliate accounts',
      error: error.message
    });
  }
});
