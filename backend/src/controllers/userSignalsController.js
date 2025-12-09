import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import db from '../models/index.js';

const { Signal, User } = db;

// @desc    Get all signals for user
// @route   GET /api/users/signals
// @access  Private
export const getUserSignals = asyncHandler(async (req, res, next) => {
  try {
    const { status, type, limit = 50 } = req.query;
    let where = {};
    
    // Filter by status if provided
    if (status && status !== 'all') {
      where.status = status;
    }
    
    // Filter by type if provided
    if (type && type !== 'all') {
      where.type = type;
    }
    
    const signals = await Signal.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      attributes: [
        'id', 'title', 'description', 'pair', 'type', 'entryPrice', 
        'takeProfit', 'stopLoss', 'status', 'result', 'pips', 
        'riskRewardRatio', 'createdAt', 'updatedAt'
      ]
    });

    res.status(200).json({
      success: true,
      count: signals.length,
      data: signals
    });
  } catch (error) {
    console.error('Error fetching user signals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching signals',
      error: error.message
    });
  }
});

// @desc    Get single signal details
// @route   GET /api/users/signals/:id
// @access  Private
export const getUserSignal = asyncHandler(async (req, res, next) => {
  try {
    const signalId = parseInt(req.params.id);
    
    const signal = await Signal.findByPk(signalId, {
      attributes: [
        'id', 'title', 'description', 'pair', 'type', 'entryPrice', 
        'takeProfit', 'stopLoss', 'status', 'result', 'pips', 
        'riskRewardRatio', 'createdAt', 'updatedAt'
      ]
    });
    
    if (!signal) {
      return next(new ErrorResponse('Signal not found', 404));
    }

    res.status(200).json({
      success: true,
      data: signal
    });
  } catch (error) {
    console.error('Error fetching signal details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching signal details',
      error: error.message
    });
  }
});

// @desc    Get signals statistics for user
// @route   GET /api/users/signals/stats
// @access  Private
export const getUserSignalsStats = asyncHandler(async (req, res, next) => {
  try {
    const signals = await Signal.findAll({
      attributes: ['status', 'result', 'pips', 'type', 'createdAt']
    });

    const stats = {
      totalSignals: signals.length,
      activeSignals: signals.filter(s => s.status === 'active').length,
      closedSignals: signals.filter(s => s.status === 'closed').length,
      winningSignals: signals.filter(s => s.result === 'win').length,
      losingSignals: signals.filter(s => s.result === 'loss').length,
      pendingSignals: signals.filter(s => s.status === 'pending').length,
      totalPips: signals.reduce((sum, s) => sum + (parseFloat(s.pips) || 0), 0),
      winRate: signals.length > 0 ? 
        ((signals.filter(s => s.result === 'win').length / signals.filter(s => s.status === 'closed').length) * 100).toFixed(2) : 0,
      buySignals: signals.filter(s => s.type === 'buy').length,
      sellSignals: signals.filter(s => s.type === 'sell').length,
      recentSignals: signals.slice(0, 5).map(signal => ({
        id: signal.id,
        pair: signal.pair,
        type: signal.type,
        status: signal.status,
        pips: signal.pips,
        createdAt: signal.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching signals stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching signals statistics',
      error: error.message
    });
  }
});
