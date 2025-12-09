import Investment from '../models/Investment.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import { calculateProfit } from '../utils/investmentUtils.js';

// @desc    Get all investments
// @route   GET /api/v1/investments
// @route   GET /api/v1/users/:userId/investments
// @access  Private
export const getInvestments = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    // Check if user exists
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(
        new ErrorResponse(`No user with the id of ${req.params.userId}`, 404)
      );
    }

    // Make sure user is viewing their own investments unless admin
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view these investments`,
          401
        )
      );
    }

    const investments = await Investment.find({ user: req.params.userId });
    return res.status(200).json({
      success: true,
      count: investments.length,
      data: investments,
    });
  } else {
    // If no user ID is provided, return all investments (admin only)
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view all investments`,
          401
        )
      );
    }
    
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single investment
// @route   GET /api/v1/investments/:id
// @access  Private
export const getInvestment = asyncHandler(async (req, res, next) => {
  const investment = await Investment.findById(req.params.id).populate({
    path: 'user',
    select: 'name email',
  });

  if (!investment) {
    return next(
      new ErrorResponse(`No investment with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is investment owner or admin
  if (
    investment.user._id.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this investment`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: investment,
  });
});

// @desc    Create new investment
// @route   POST /api/v1/investments
// @access  Private
export const createInvestment = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for existing active investment for the same plan
  const existingInvestment = await Investment.findOne({
    user: req.user.id,
    plan: req.body.plan,
    status: { $in: ['active', 'pending'] },
  });

  if (existingInvestment) {
    return next(
      new ErrorResponse(
        `You already have an active or pending ${req.body.plan} investment`,
        400
      )
    );
  }

  // Check user balance if this is not an admin
  if (req.user.role !== 'admin') {
    const user = await User.findById(req.user.id);
    if (user.balance < req.body.amount) {
      return next(
        new ErrorResponse(
          `Insufficient balance. Your current balance is $${user.balance}`,
          400
        )
      );
    }
  }

  const investment = await Investment.create(req.body);

  // Deduct amount from user balance if not admin
  if (req.user.role !== 'admin') {
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { balance: -req.body.amount } },
      { new: true, runValidators: true }
    );
  }

  res.status(201).json({
    success: true,
    data: investment,
  });
});

// @desc    Update investment
// @route   PUT /api/v1/investments/:id
// @access  Private/Admin
export const updateInvestment = asyncHandler(async (req, res, next) => {
  let investment = await Investment.findById(req.params.id);

  if (!investment) {
    return next(
      new ErrorResponse(`No investment with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is investment owner or admin
  if (
    investment.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this investment`,
        401
      )
    );
  }

  // Only allow status update for non-admin users
  if (req.user.role !== 'admin' && Object.keys(req.body).length === 1 && req.body.status) {
    // Only allow cancelling pending investments for non-admin users
    if (req.body.status === 'cancelled' && investment.status === 'pending') {
      // Refund the amount if the investment was pending
      if (investment.status === 'pending') {
        await User.findByIdAndUpdate(
          investment.user,
          { $inc: { balance: investment.amount } },
          { new: true, runValidators: true }
        );
      }
    } else {
      return next(
        new ErrorResponse(
          'You can only cancel pending investments',
          401
        )
      );
    }
  }

  // If status is being updated to active, set next payout date
  if (req.body.status === 'active' && investment.status !== 'active') {
    req.body.startDate = Date.now();
    investment = await Investment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    // Set next payout date after saving
    investment.setNextPayoutDate();
    await investment.save();
  } else {
    investment = await Investment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    success: true,
    data: investment,
  });
});

// @desc    Delete investment
// @route   DELETE /api/v1/investments/:id
// @access  Private/Admin
export const deleteInvestment = asyncHandler(async (req, res, next) => {
  const investment = await Investment.findById(req.params.id);

  if (!investment) {
    return next(
      new ErrorResponse(`No investment with the id of ${req.params.id}`, 404)
    );
  }

  // Only allow admin to delete investment
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this investment`,
        401
      )
    );
  }

  // Refund if investment is pending
  if (investment.status === 'pending') {
    await User.findByIdAndUpdate(
      investment.user,
      { $inc: { balance: investment.amount } },
      { new: true, runValidators: true }
    );
  }

  await investment.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get investment statistics
// @route   GET /api/v1/investments/stats
// @access  Private
export const getInvestmentStats = asyncHandler(async (req, res, next) => {
  const stats = await Investment.aggregate([
    {
      $match: { user: req.user._id },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' },
      },
    },
  ]);

  // Calculate total profit from active investments
  const activeInvestments = await Investment.find({
    user: req.user._id,
    status: 'active',
  });

  const now = new Date();
  const totalProfit = activeInvestments.reduce((acc, curr) => {
    return acc + calculateProfit(curr, curr.startDate, now);
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      stats,
      totalProfit,
      activeInvestments: activeInvestments.length,
    },
  });
});

// @desc    Process investment payouts (cron job)
// @route   GET /api/v1/investments/process-payouts
// @access  Private/Admin
export const processPayouts = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to access this route', 403)
    );
  }

  const now = new Date();
  const payouts = [];
  const errors = [];

  // Find investments that are due for payout
  const investments = await Investment.find({
    status: 'active',
    nextPayoutDate: { $lte: now },
  }).populate('user', 'balance');

  for (const investment of investments) {
    try {
      // Calculate profit since last payout (or start date)
      const lastPayoutDate = investment.lastPayoutDate || investment.startDate;
      const profit = calculateProfit(investment, lastPayoutDate, now);

      if (profit > 0) {
        // Update user balance
        await User.findByIdAndUpdate(
          investment.user._id,
          { $inc: { balance: profit } },
          { new: true, runValidators: true }
        );

        // Update investment
        investment.totalProfit += profit;
        investment.totalPayouts += 1;
        investment.lastPayoutDate = now;
        investment.setNextPayoutDate();
        
        // If investment has ended, update status
        if (now >= investment.endDate) {
          investment.status = 'completed';
        }

        await investment.save();

        payouts.push({
          investmentId: investment._id,
          userId: investment.user._id,
          amount: profit,
          payoutDate: now,
        });
      }
    } catch (err) {
      console.error(`Error processing payout for investment ${investment._id}:`, err);
      errors.push({
        investmentId: investment._id,
        error: err.message,
      });
    }
  }

  res.status(200).json({
    success: true,
    count: payouts.length,
    data: {
      payouts,
      errors,
    },
  });
});
