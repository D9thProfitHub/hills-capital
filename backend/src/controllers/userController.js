import db from '../models/index.js';
const { User, Investment, Trade, Signal, Subscription, SubscriptionPlan } = db;
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import path from 'path';
import { notifyBalanceUpdate, sendNotification } from '../utils/socketEvents.js';

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

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

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  try {
    const oldUser = await User.findByPk(req.params.id);
    
    if (!oldUser) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if balance is being updated
    const balanceChanged = req.body.balance !== undefined && 
                         req.body.balance !== oldUser.balance;
    
    const [updatedRowsCount] = await User.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });
    
    const user = await User.findByPk(req.params.id);

    // Send real-time notifications if balance changed
    if (balanceChanged) {
      try {
        const balanceDiff = user.balance - oldUser.balance;
        const notificationMessage = balanceDiff > 0
          ? `Your account has been credited with $${balanceDiff.toFixed(2)}. New balance: $${user.balance.toFixed(2)}`
          : `Your account has been debited with $${Math.abs(balanceDiff).toFixed(2)}. New balance: $${user.balance.toFixed(2)}`;
        
        notifyBalanceUpdate(user.id, user.balance);
        sendNotification(user.id, notificationMessage, 'info');
      } catch (wsError) {
        console.error('WebSocket notification error:', wsError);
      }
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent deleting own account
  if (user.id.toString() === req.user.id) {
    return next(
      new ErrorResponse(`You cannot delete your own account`, 400)
    );
  }

  await user.destroy();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload photo for user
// @route   PUT /api/v1/users/:id/photo
// @access  Private
export const userPhotoUpload = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is user or admin
  if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this user`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  const maxSize = process.env.MAX_FILE_UPLOAD || 1000000;
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${maxSize / 1000}KB`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${user._id}${path.parse(file.name).ext}`;

  file.mv(
    `${process.env.FILE_UPLOAD_PATH || 'public/uploads'}/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }

      await User.findByIdAndUpdate(req.params.id, { photo: file.name });

      res.status(200).json({
        success: true,
        data: file.name,
      });
    }
  );
});

// @desc    Get user dashboard stats
// @route   GET /api/v1/users/dashboard/stats
// @access  Private
export const getUserDashboardStats = asyncHandler(async (req, res, next) => {
  try {
    console.log('Fetching dashboard stats for user:', req.user.id);
    
    // Get user data using Sequelize
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'balance', 
        'total_deposits', 
        'total_withdrawals', 
        'total_trades', 
        'total_profit', 
        'status', 
        'last_login', 
        'created_at'
      ]
    });

    if (!user) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's investments
    const investments = await Investment.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'amount', 'status', 'totalEarned', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Get recent signals
    const signals = await Signal.findAll({
      attributes: ['id', 'pair', 'type', 'entryPrice', 'stopLoss', 'takeProfit', 'status', 'pips', 'result', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Get user's current subscription
    const currentSubscription = await Subscription.findOne({
      where: { 
        user_id: req.user.id,
        status: ['active', 'pending'] // Include both active and pending subscriptions
      },
      include: [{
        model: SubscriptionPlan,
        as: 'plan',
        attributes: ['id', 'name', 'price', 'billingCycle', 'features', 'description']
      }],
      order: [['created_at', 'DESC']] // Get the most recent subscription
    });

    // Calculate stats
    const totalInvestments = investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const investmentProfit = investments.reduce((sum, inv) => sum + parseFloat(inv.totalEarned || 0), 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    const completedTrades = signals.filter(signal => signal.status === 'closed').length;
    const profitableTrades = signals.filter(signal => signal.status === 'closed' && signal.result === 'win').length;
    const winRate = completedTrades > 0 ? ((profitableTrades / completedTrades) * 100).toFixed(1) + '%' : '0%';
    const totalProfit = parseFloat(user.total_profit || 0) + investmentProfit;
    const roi = totalInvestments > 0 ? ((totalProfit / totalInvestments) * 100).toFixed(1) + '%' : '0%';

    // Create recent activities from investments and signals
    const activities = [];
    
    // Add investment activities
    investments.slice(0, 5).forEach(investment => {
      activities.push({
        id: `inv_${investment.id}`,
        type: 'investment',
        title: `Investment of $${parseFloat(investment.amount).toFixed(2)}`,
        description: `Status: ${investment.status}`,
        amount: parseFloat(investment.amount),
        profit: parseFloat(investment.totalEarned || 0),
        timestamp: investment.createdAt,
        status: investment.status
      });
    });

    // Add signal activities
    signals.slice(0, 5).forEach(signal => {
      activities.push({
        id: `sig_${signal.id}`,
        type: 'signal',
        title: `${signal.type.toUpperCase()} ${signal.pair}`,
        description: `Entry: $${parseFloat(signal.entryPrice).toFixed(2)}`,
        amount: parseFloat(signal.entryPrice),
        profit: parseFloat(signal.pips || 0),
        timestamp: signal.createdAt,
        status: signal.status
      });
    });

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Create watchlist from recent signals
    const watchlist = signals.slice(0, 8).map(signal => ({
      id: signal.id,
      symbol: signal.pair,
      price: parseFloat(signal.entryPrice),
      change: parseFloat(signal.pips || 0),
      changePercent: signal.entryPrice > 0 && signal.takeProfit ? 
        ((parseFloat(signal.takeProfit) - parseFloat(signal.entryPrice)) / parseFloat(signal.entryPrice) * 100).toFixed(2) + '%' 
        : '0%',
      status: signal.status
    }));

    // Format the response to match frontend expectations
    const stats = {
      balance: parseFloat(user.balance) || 0,
      profit: totalProfit,
      activeBots: 0, // This would need to be implemented based on your bot system
      totalInvestments: totalInvestments,
      affiliateEarnings: 0, // This would need to be implemented based on your affiliate system
      totalTrades: parseInt(user.total_trades) || completedTrades,
      winRate: winRate,
      roi: roi
    };

    // Determine subscription status and current plan
    const subscriptionStatus = currentSubscription ? currentSubscription.status : 'inactive';
    const currentPlan = currentSubscription ? {
      id: currentSubscription.plan?.id,
      name: currentSubscription.plan?.name || 'Free',
      price: currentSubscription.plan?.price || 0,
      interval: currentSubscription.plan?.billingCycle || 'monthly',
      features: currentSubscription.plan?.features || [],
      status: currentSubscription.status,
      startDate: currentSubscription.start_date,
      endDate: currentSubscription.end_date
    } : {
      name: 'Free',
      price: 0,
      interval: 'monthly',
      features: [],
      status: 'active'
    };

    console.log('Returning dashboard stats:', { 
      stats, 
      activities: activities.length, 
      watchlist: watchlist.length,
      subscriptionStatus,
      currentPlan: currentPlan.name
    });
    
    res.status(200).json({
      success: true,
      stats,
      activities,
      watchlist,
      subscriptionStatus,
      currentPlan,
      welcomeMessage: `Welcome back, ${user.name || 'User'}!`
    });
  } catch (error) {
    console.error('Error in getUserDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats',
      error: error.message
    });
  }
});
