import asyncHandler from '../middleware/async.js';
import db from '../models/index.js';

const { User, CopyTradingRequest } = db;

// @desc    Get available traders for copy trading
// @route   GET /api/users/copy-trading/traders
// @access  Private
export const getCopyTradingTraders = asyncHandler(async (req, res, next) => {
  try {
    // Get real traders from database (all users can be potential traders for demo)
    const dbTraders = await User.findAll({
      attributes: ['id', 'name', 'email'],
      limit: 10
    });
    
    // Transform database users into trader format with realistic trading data
    const traders = dbTraders.map((user, index) => ({
      id: user.id,
      name: user.name,
      username: user.email.split('@')[0],
      avatar: `https://picsum.photos/100/100?random=${user.id}`,
      rating: (4.5 + Math.random() * 0.5).toFixed(1),
      followers: Math.floor(Math.random() * 2000) + 500,
      profit: Math.floor(Math.random() * 50000) + 5000,
      winRate: Math.floor(Math.random() * 30) + 65,
      riskScore: ['Low', 'Medium', 'High'][index % 3],
      totalReturn: (Math.random() * 200 + 50).toFixed(1),
      monthlyReturn: (Math.random() * 20 + 5).toFixed(1),
      tradingStyle: ['Swing Trading', 'Day Trading', 'Scalping'][index % 3],
      experience: `${Math.floor(Math.random() * 8) + 2}+ years`,
      minCopyAmount: 500,
      maxCopyAmount: 50000,
      copyCost: (Math.random() * 2 + 1.5).toFixed(1),
      description: `Experienced trader specializing in ${['forex', 'crypto', 'stocks'][index % 3]} markets`,
      isFollowing: Math.random() > 0.7
    }));
    
    res.status(200).json({
      success: true,
      count: traders.length,
      data: traders
    });
  } catch (error) {
    console.error('Error fetching copy trading traders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching traders' 
    });
  }
});

// @desc    Get user's copy trading requests/positions
// @route   GET /api/users/copy-trading/requests
// @access  Private
export const getUserCopyTradingRequests = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get real copy trading requests from database
    const requests = await CopyTradingRequest.findAll({
      where: { user_id: userId },
      attributes: [
        'id', 
        'user_id', 
        'account_type', 
        'broker', 
        'server', 
        'login',
        'risk_level',
        'max_drawdown',
        'status',
        'capital',
        'notes',
        'max_daily_loss',
        'stop_copy_on_drawdown',
        'follow_new_positions',
        'createdAt',
        'updatedAt',
        'assigned_trader',
        'approved_by'
      ],
      include: [
        {
          model: User,
          as: 'trader',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform database requests into frontend format
    const copyTradingRequests = requests.map(request => {
      const trader = request.trader;
      const daysSinceStart = request.createdAt ? 
        Math.floor((new Date() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
      
      // Calculate simulated profit based on time and risk level
      const baseReturn = request.riskLevel === 'Aggressive' ? 0.15 : 
                        request.riskLevel === 'Moderate' ? 0.08 : 0.05;
      const dailyReturn = baseReturn / 30; // Monthly return divided by 30 days
      const simulatedProfit = parseFloat(request.capital) * dailyReturn * daysSinceStart * (Math.random() * 0.5 + 0.75);
      const currentValue = parseFloat(request.capital) + simulatedProfit;
      
      return {
        id: request.id,
        traderId: request.assigned_trader,
        traderName: trader ? trader.name : (request.preferred_trader || 'Unassigned'),
        traderAvatar: trader ? `https://picsum.photos/100/100?random=${trader.id}` : 'https://picsum.photos/100/100?random=999',
        copyAmount: parseFloat(request.capital),
        capital: parseFloat(request.capital),
        currentValue: currentValue,
        profit: simulatedProfit,
        profitPercentage: ((simulatedProfit / parseFloat(request.capital)) * 100),
        status: request.status,
        startDate: request.createdAt,
        duration: `${daysSinceStart} days`,
        riskLevel: request.risk_level,
        copyCost: request.copyRatio || 50,
        accountType: request.accountType
      };
    });
    
    res.status(200).json({
      success: true,
      count: copyTradingRequests.length,
      data: copyTradingRequests
    });
  } catch (error) {
    console.error('Error fetching copy trading requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching copy trading requests' 
    });
  }
});

// @desc    Create new copy trading request
// @route   POST /api/users/copy-trading/requests
// @access  Private
export const createCopyTradingRequest = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      name = 'Trader',
      accountType = 'MT4',
      broker,
      server,
      login,
      password,
      capital = 500,
      riskLevel = 'medium',
      maxDrawdown = 20,
      maxDailyLoss = 5,
      stopCopyOnDrawdown = true,
      followNewPositions = true,
      notes = ''
    } = req.body;

    // Validate required fields
    const requiredFields = ['name', 'broker', 'server', 'login', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (capital < 500) {
      return res.status(400).json({
        success: false,
        message: 'Capital must be at least $500'
      });
    }

    // Validate and normalize account type
    let normalizedAccountType = 'MT4';
    if (accountType) {
      const upperAccountType = accountType.toUpperCase();
      if (['MT4', 'MT5'].includes(upperAccountType)) {
        normalizedAccountType = upperAccountType;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid account type. Must be either MT4 or MT5'
        });
      }
    }

    // Map risk level from frontend to database values
    const riskLevelMap = {
      'low': 'Conservative',
      'medium': 'Moderate',
      'high': 'Aggressive'
    };
    
    // Safely handle undefined/null riskLevel and convert to string before toLowerCase
    const riskLevelStr = (riskLevel || 'medium').toString().toLowerCase();
    const normalizedRiskLevel = riskLevelMap[riskLevelStr] || 'Moderate';

    // Create new copy trading request in database using snake_case field names
    const requestData = {
      user_id: userId,
      name: name.trim(),
      // Use the normalized account type
      account_type: normalizedAccountType,
      broker: broker.trim(),
      server: server.trim(),
      login: login.toString().trim(),
      password,
      capital: parseFloat(capital),
      risk_level: normalizedRiskLevel,
      max_drawdown: parseFloat(maxDrawdown),
      max_daily_loss: parseFloat(maxDailyLoss),
      stop_copy_on_drawdown: Boolean(stopCopyOnDrawdown),
      follow_new_positions: Boolean(followNewPositions),
      status: 'pending',
      notes: notes || '',
      assigned_trader: null,
      approved_by: null
    };

    // Only include optional fields if they exist in the model
    if (CopyTradingRequest.rawAttributes.max_daily_loss) {
      requestData.max_daily_loss = parseFloat(maxDailyLoss);
    }
    if (CopyTradingRequest.rawAttributes.stop_copy_on_drawdown) {
      requestData.stop_copy_on_drawdown = Boolean(stopCopyOnDrawdown);
    }
    if (CopyTradingRequest.rawAttributes.follow_new_positions) {
      requestData.follow_new_positions = Boolean(followNewPositions);
    }

    const newRequest = await CopyTradingRequest.create(requestData);

    console.log(`Created copy trading request ${newRequest.id} for user ${userId}`);

    // Get user details for the response
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email']
    });

    // Prepare success response with more details
    const successResponse = {
      success: true,
      message: 'Copy trading request created successfully! 🎉',
      notification: {
        type: 'success',
        title: 'Request Submitted',
        message: 'Your copy trading request has been received and is pending approval.',
        autoDismiss: 5000 // 5 seconds
      },
      data: {
        id: newRequest.id,
        requestNumber: `CT-${String(newRequest.id).padStart(5, '0')}`, // Format: CT-00001
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        accountDetails: {
          broker: newRequest.broker,
          server: newRequest.server,
          login: newRequest.login,
          accountType: newRequest.account_type // Using snake_case from model
        },
        tradingSettings: {
          capital: newRequest.capital,
          riskLevel: newRequest.risk_level,
          maxDrawdown: newRequest.max_drawdown,
          maxDailyLoss: newRequest.max_daily_loss,
          stopCopyOnDrawdown: newRequest.stop_copy_on_drawdown,
          followNewPositions: newRequest.follow_new_positions
        },
        status: {
          current: newRequest.status,
          updatedAt: newRequest.updatedAt,
          nextSteps: 'Our team will review your request and get back to you shortly.'
        },
        timestamps: {
          createdAt: newRequest.createdAt,
          updatedAt: newRequest.updatedAt
        }
      }
    };

    console.log(`✅ Successfully created copy trading request #${successResponse.data.requestNumber} for ${user.email}`);
    
    res.status(201).json(successResponse);
  } catch (error) {
    console.error('Error creating copy trading request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating copy trading request' 
    });
  }
});

// @desc    Stop copy trading
// @route   DELETE /api/users/copy-trading/requests/:id
// @access  Private
export const stopCopyTrading = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;

    // Get models from sequelize instance
    const { CopyTradingRequest } = sequelize.models;

    // Find and update the copy trading request
    const request = await CopyTradingRequest.findOne({
      where: {
        id: requestId,
        user_id: userId
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Copy trading request not found'
      });
    }

    // Update status to stopped
    await request.update({
      status: 'stopped',
      updatedAt: new Date()
    });

    console.log(`Stopped copy trading request ${requestId} for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Copy trading stopped successfully',
      data: {
        requestId,
        status: 'stopped',
        stoppedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error stopping copy trading:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error stopping copy trading' 
    });
  }
});

// @desc    Get copy trading statistics
// @route   GET /api/users/copy-trading/stats
// @access  Private
export const getCopyTradingStats = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const stats = {
      totalInvested: 3500,
      currentValue: 3732.70,
      totalProfit: 232.70,
      totalProfitPercentage: 6.65,
      activeCopies: 2,
      totalCopies: 5,
      bestPerformer: {
        traderName: 'Sarah Chen',
        profit: 187.50,
        profitPercentage: 7.5
      },
      monthlyStats: {
        profit: 232.70,
        profitPercentage: 6.65,
        trades: 47,
        winRate: 76.6
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching copy trading stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching copy trading statistics' 
    });
  }
});
