import Trade from '../models/Trade.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import { notifyTradeUpdate, sendNotification } from '../utils/socketEvents.js';

// @desc    Get all trades
// @route   GET /api/v1/trades
// @route   GET /api/v1/users/:userId/trades
// @access  Private
export const getTrades = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    // Check if user exists
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(
        new ErrorResponse(`No user with the id of ${req.params.userId}`, 404)
      );
    }

    // Make sure user is viewing their own trades unless admin
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view these trades`,
          401
        )
      );
    }

    const trades = await Trade.find({ user: req.params.userId });
    return res.status(200).json({
      success: true,
      count: trades.length,
      data: trades,
    });
  } else {
    // If no user ID is provided, return all trades (admin only)
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view all trades`,
          401
        )
      );
    }
    
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single trade
// @route   GET /api/v1/trades/:id
// @access  Private
export const getTrade = asyncHandler(async (req, res, next) => {
  const trade = await Trade.findById(req.params.id).populate({
    path: 'user',
    select: 'name email',
  });

  if (!trade) {
    return next(
      new ErrorResponse(`No trade with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is trade owner or admin
  if (trade.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this trade`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: trade,
  });
});

// @desc    Create new trade
// @route   POST /api/v1/trades
// @access  Private
export const createTrade = asyncHandler(async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Check if user has enough balance for the trade
    if (req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      const tradeCost = req.body.amount * req.body.price;
      
      if (user.balance < tradeCost) {
        return next(
          new ErrorResponse(
            `Insufficient balance. Required: $${tradeCost}, Available: $${user.balance}`,
            400
          )
        );
      }
      
      // Deduct trade amount from user balance
      user.balance -= tradeCost;
      await user.save();
    }

    const trade = await Trade.create(req.body);

    // Send real-time notification
    try {
      notifyTradeUpdate(req.user.id, trade);
      sendNotification(
        req.user.id, 
        `New trade opened: ${trade.symbol} ${trade.type} (${trade.amount} @ ${trade.entryPrice})`,
        'info'
      );
    } catch (wsError) {
      console.error('WebSocket notification error:', wsError);
      // Don't fail the trade creation if WebSocket fails
    }

    res.status(201).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    console.error('Create trade error:', error);
    next(error);
  }
});

// @desc    Update trade
// @route   PUT /api/v1/trades/:id
// @access  Private
export const updateTrade = asyncHandler(async (req, res, next) => {
  try {
    let trade = await Trade.findById(req.params.id);

    if (!trade) {
      return next(
        new ErrorResponse(`No trade with the id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is trade owner or admin
    if (trade.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this trade`,
          401
        )
      );
    }

    // Prevent updating certain fields directly
    const { status, profitLoss, closePrice, closedAt, ...updateData } = req.body;
    
    // Only allow status update for non-admin users
    if (req.user.role !== 'admin') {
      // Non-admin can only update takeProfit and stopLoss for open trades
      if (trade.status !== 'open') {
        return next(
          new ErrorResponse('Only open trades can be updated', 400)
        );
      }
      
      updateData.takeProfit = req.body.takeProfit;
      updateData.stopLoss = req.body.stopLoss;
      
      // Validate takeProfit and stopLoss
      if (updateData.takeProfit !== undefined || updateData.stopLoss !== undefined) {
        if (updateData.takeProfit !== undefined && 
            ((trade.type === 'buy' && updateData.takeProfit <= trade.price) ||
             (trade.type === 'sell' && updateData.takeProfit >= trade.price))) {
          return next(
            new ErrorResponse(
              `Take profit must be ${trade.type === 'buy' ? 'greater' : 'less'} than entry price`,
              400
            )
          );
        }
        
        if (updateData.stopLoss !== undefined && 
            ((trade.type === 'buy' && updateData.stopLoss >= trade.price) ||
             (trade.type === 'sell' && updateData.stopLoss <= trade.price))) {
          return next(
            new ErrorResponse(
              `Stop loss must be ${trade.type === 'buy' ? 'less' : 'greater'} than entry price`,
              400
            )
          );
        }
      }
    } else {
      // Admin can update any field
      if (status) updateData.status = status;
      if (profitLoss !== undefined) updateData.profitLoss = profitLoss;
      if (closePrice !== undefined) updateData.closePrice = closePrice;
      if (closedAt) updateData.closedAt = closedAt;
      
      // If closing the trade, update user balance
      if (status === 'closed' && trade.status === 'open') {
        const user = await User.findById(trade.user);
        if (user) {
          user.balance += trade.amount * trade.price; // Return the initial amount
          if (updateData.profitLoss) {
            user.balance += updateData.profitLoss; // Add profit or subtract loss
          }
          await user.save();
        }
        
        updateData.closedAt = closedAt || new Date();
      }
    }

    const oldStatus = trade.status;
    trade = await Trade.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Send real-time notification if status changed
    if (trade.status !== oldStatus) {
      try {
        notifyTradeUpdate(req.user.id, trade);
        sendNotification(
          req.user.id,
          `Trade ${trade._id} status updated to: ${trade.status}`,
          'info'
        );
      } catch (wsError) {
        console.error('WebSocket notification error:', wsError);
      }
    }

    res.status(200).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    console.error('Update trade error:', error);
    next(error);
  }
});

// @desc    Close trade
// @route   PUT /api/v1/trades/:id/close
// @access  Private
export const closeTrade = asyncHandler(async (req, res, next) => {
  const trade = await Trade.findById(req.params.id);

  if (!trade) {
    return next(
      new ErrorResponse(`No trade with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is trade owner or admin
  if (trade.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to close this trade`,
        401
      )
    );
  }

  if (trade.status !== 'open') {
    return next(new ErrorResponse('Only open trades can be closed', 400));
  }

  // Get current price (in a real app, this would come from a market data API)
  const currentPrice = req.body.closePrice || trade.price; // Default to entry price if not provided
  
  // Calculate profit/loss
  let profitLoss = 0;
  if (trade.type === 'buy') {
    profitLoss = (currentPrice - trade.price) * trade.amount * trade.leverage;
  } else {
    profitLoss = (trade.price - currentPrice) * trade.amount * trade.leverage;
  }

  // Update user balance
  const user = await User.findById(trade.user);
  if (user) {
    user.balance += trade.amount * trade.price; // Return the initial amount
    user.balance += profitLoss; // Add profit or subtract loss
    await user.save();
  }

  // Update trade
  trade.status = 'closed';
  trade.closePrice = currentPrice;
  trade.profitLoss = profitLoss;
  trade.closedAt = new Date();
  
  await trade.save();

  res.status(200).json({
    success: true,
    data: trade,
  });
});

// @desc    Cancel trade
// @route   PUT /api/v1/trades/:id/cancel
// @access  Private
export const cancelTrade = asyncHandler(async (req, res, next) => {
  const trade = await Trade.findById(req.params.id);

  if (!trade) {
    return next(
      new ErrorResponse(`No trade with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is trade owner or admin
  if (trade.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to cancel this trade`,
        401
      )
    );
  }

  if (trade.status !== 'open') {
    return next(new ErrorResponse('Only open trades can be cancelled', 400));
  }

  // Return funds to user
  const user = await User.findById(trade.user);
  if (user) {
    user.balance += trade.amount * trade.price; // Return the initial amount
    await user.save();
  }

  // Update trade
  trade.status = 'cancelled';
  trade.closedAt = new Date();
  
  await trade.save();

  res.status(200).json({
    success: true,
    data: trade,
  });
});

// @desc    Get trade statistics
// @route   GET /api/v1/trades/stats
// @access  Private
export const getTradeStats = asyncHandler(async (req, res, next) => {
  const stats = await Trade.aggregate([
    {
      $match: { user: req.user._id },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalProfit: {
          $sum: {
            $cond: [{ $gt: ['$profitLoss', 0] }, '$profitLoss', 0],
          },
        },
        totalLoss: {
          $sum: {
            $cond: [{ $lt: ['$profitLoss', 0] }, { $abs: '$profitLoss' }, 0],
          },
        },
        totalVolume: { $sum: { $multiply: ['$amount', '$price'] } },
        avgTradeSize: { $avg: { $multiply: ['$amount', '$price'] } },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
        totalProfit: { $round: ['$totalProfit', 2] },
        totalLoss: { $round: ['$totalLoss', 2] },
        totalVolume: { $round: ['$totalVolume', 2] },
        avgTradeSize: { $round: ['$avgTradeSize', 2] },
      },
    },
  ]);

  // Calculate win rate and other metrics
  const closedTrades = await Trade.find({
    user: req.user._id,
    status: 'closed',
  });

  const winningTrades = closedTrades.filter((trade) => trade.profitLoss > 0).length;
  const losingTrades = closedTrades.filter((trade) => trade.profitLoss < 0).length;
  const winRate = closedTrades.length > 0 
    ? (winningTrades / closedTrades.length) * 100 
    : 0;

  const totalProfit = closedTrades.reduce(
    (sum, trade) => sum + (trade.profitLoss > 0 ? trade.profitLoss : 0),
    0
  );
  const totalLoss = closedTrades.reduce(
    (sum, trade) => sum + (trade.profitLoss < 0 ? Math.abs(trade.profitLoss) : 0),
    0
  );
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit;

  res.status(200).json({
    success: true,
    data: {
      stats,
      performance: {
        totalTrades: closedTrades.length,
        winningTrades,
        losingTrades,
        winRate: parseFloat(winRate.toFixed(2)),
        profitFactor: parseFloat(profitFactor.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        totalLoss: parseFloat(totalLoss.toFixed(2)),
        netProfit: parseFloat((totalProfit - totalLoss).toFixed(2)),
      },
    },
  });
});

// @desc    Get trade history by asset
// @route   GET /api/v1/trades/history/:asset
// @access  Private
export const getTradeHistory = asyncHandler(async (req, res, next) => {
  const { asset } = req.params;
  
  const trades = await Trade.find({
    user: req.user._id,
    asset,
    status: 'closed', // Only include closed trades
  })
    .sort({ closedAt: -1 })
    .limit(50); // Limit to last 50 trades

  res.status(200).json({
    success: true,
    count: trades.length,
    data: trades,
  });
});
