import db from '../models/index.js';

const { BotRequest, User } = db;

// @desc    Get user's bot requests
// @route   GET /api/bot-requests
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    console.log('🤖 Fetching bot requests for user:', req.user.id);
    
    const botRequests = await BotRequest.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${botRequests.length} bot requests`);
    
    res.json({
      success: true,
      count: botRequests.length,
      data: botRequests
    });
  } catch (error) {
    console.error('❌ Error fetching bot requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new bot request
// @route   POST /api/bot-requests
// @access  Private
export const createBotRequest = async (req, res) => {
  try {
    const { botType, capital, tradingPair, riskLevel, duration, strategy } = req.body;
    
    console.log('🤖 Creating bot request:', { botType, capital, tradingPair, riskLevel, duration, strategy, userId: req.user.id });

    // Validate required fields
    if (!botType || !capital || !tradingPair) {
      return res.status(400).json({
        success: false,
        message: 'Please provide botType, capital, and tradingPair'
      });
    }

    // Validate capital amount
    const capitalAmount = parseFloat(capital);
    if (isNaN(capitalAmount) || capitalAmount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Capital must be at least $100'
      });
    }



    // Create the bot request in database
    const newBotRequest = await BotRequest.create({
      userId: req.user.id,
      botType,
      capital: capitalAmount,
      tradingPair,
      riskLevel: riskLevel || 'medium',
      duration: duration || '30',
      strategy: strategy || 'scalping',
      status: 'pending'
    });

    // Fetch the created request with user data
    const botRequestWithUser = await BotRequest.findByPk(newBotRequest.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    console.log('✅ Bot request created successfully:', newBotRequest.id);

    res.status(201).json({
      success: true,
      message: 'Bot request created successfully',
      data: botRequestWithUser
    });
  } catch (error) {
    console.error('❌ Error creating bot request:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update bot request
// @route   PUT /api/bot-requests/:id
// @access  Private
export const updateBotRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { botType, capital, tradingPair, riskLevel, duration, strategy } = req.body;
    
    console.log('🤖 Updating bot request:', id, 'for user:', req.user.id);

    // Import models from the sequelize instance
    const db = (await import('../models/index.js')).default;
    const { BotRequest, User } = db;

    // Find the bot request
    const botRequest = await BotRequest.findOne({
      where: {
        id,
        userId: req.user.id // Ensure user can only update their own requests
      }
    });

    if (!botRequest) {
      return res.status(404).json({
        success: false,
        message: 'Bot request not found'
      });
    }

    // Update the bot request
    const updateData = {};
    if (botType) updateData.botType = botType;
    if (capital) {
      const capitalAmount = parseFloat(capital);
      if (isNaN(capitalAmount) || capitalAmount < 100) {
        return res.status(400).json({
          success: false,
          message: 'Capital must be at least $100'
        });
      }
      updateData.capital = capitalAmount;
    }
    if (tradingPair) updateData.tradingPair = tradingPair;
    if (riskLevel) updateData.riskLevel = riskLevel;
    if (duration) updateData.duration = duration;
    if (strategy) updateData.strategy = strategy;

    await botRequest.update(updateData);

    // Fetch updated request with user data
    const updatedBotRequest = await BotRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    console.log('✅ Bot request updated successfully:', id);

    res.json({
      success: true,
      message: 'Bot request updated successfully',
      data: updatedBotRequest
    });
  } catch (error) {
    console.error('❌ Error updating bot request:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete bot request
// @route   DELETE /api/bot-requests/:id
// @access  Private
export const deleteBotRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🤖 Deleting bot request:', id, 'for user:', req.user.id);

    const { BotRequest } = await import('../models/index.js');

    // Find the bot request
    const botRequest = await BotRequest.findOne({
      where: {
        id,
        userId: req.user.id // Ensure user can only delete their own requests
      }
    });

    if (!botRequest) {
      return res.status(404).json({
        success: false,
        message: 'Bot request not found'
      });
    }

    // Delete the bot request
    await botRequest.destroy();

    console.log('✅ Bot request deleted successfully:', id);

    res.json({
      success: true,
      message: 'Bot request deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting bot request:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
