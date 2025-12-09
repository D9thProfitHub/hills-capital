import models from '../models/index.js';

// @desc    Get all investments for the authenticated user
// @route   GET /api/investments
// @access  Private
export const getInvestments = async (req, res) => {
  try {
    console.log('📊 Fetching investments for user:', req.user.id);
    
    const investments = await models.Investment.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        {
          model: models.InvestmentPlan,
          as: 'plan',
          attributes: ['id', 'name', 'description', 'roi', 'duration', 'riskLevel']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${investments.length} investments`);
    
    res.json({
      success: true,
      count: investments.length,
      data: investments
    });
  } catch (error) {
    console.error('❌ Error fetching investments:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single investment
// @route   GET /api/investments/:id
// @access  Private
export const getInvestment = async (req, res) => {
  try {
    const investment = await models.Investment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user can only access their own investments
      },
      include: [
        {
          model: models.InvestmentPlan,
          as: 'plan',
          attributes: ['id', 'name', 'description', 'roi', 'duration', 'riskLevel']
        }
      ]
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('❌ Error fetching investment:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new investment
// @route   POST /api/investments
// @access  Private
export const createInvestment = async (req, res) => {
  try {
    const { amount, planId, paymentMethod } = req.body;
    
    console.log('💰 Creating investment:', { amount, planId, paymentMethod, userId: req.user.id });

    // Validate required fields
    if (!amount || !planId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, planId, and paymentMethod'
      });
    }

    // Get the investment plan to validate and get plan details
    const plan = await models.InvestmentPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    // Validate amount is within plan limits
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Investment amount must be between $${plan.minAmount} and $${plan.maxAmount}`
      });
    }

    // Check for existing active investment for the same plan
    const existingInvestment = await models.Investment.findOne({
      where: {
        userId: req.user.id,
        planId: planId,
        status: ['active', 'pending']
      }
    });

    if (existingInvestment) {
      return res.status(400).json({
        success: false,
        message: `You already have an active or pending investment in the ${plan.name} plan`
      });
    }

    // Calculate investment details
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

    // Create the investment
    const investment = await models.Investment.create({
      userId: req.user.id,
      planId: planId,
      amount: parseFloat(amount),
      duration: plan.duration,
      roi: plan.roi,
      status: 'pending', // Start as pending, can be activated later
      startDate: startDate,
      endDate: endDate,
      totalEarned: 0.0
    });

    // Fetch the created investment with plan details
    const createdInvestment = await models.Investment.findByPk(investment.id, {
      include: [
        {
          model: models.InvestmentPlan,
          as: 'plan',
          attributes: ['id', 'name', 'description', 'roi', 'duration', 'riskLevel']
        }
      ]
    });

    console.log('✅ Investment created successfully:', investment.id);

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: createdInvestment
    });
  } catch (error) {
    console.error('❌ Error creating investment:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update investment
// @route   PUT /api/investments/:id
// @access  Private
export const updateInvestment = async (req, res) => {
  try {
    const investment = await models.Investment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user can only update their own investments
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['status'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    await investment.update(updates);

    res.json({
      success: true,
      message: 'Investment updated successfully',
      data: investment
    });
  } catch (error) {
    console.error('❌ Error updating investment:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete investment
// @route   DELETE /api/investments/:id
// @access  Private
export const deleteInvestment = async (req, res) => {
  try {
    const investment = await models.Investment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user can only delete their own investments
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Only allow deletion if investment is pending
    if (investment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending investments can be deleted'
      });
    }

    await investment.destroy();

    res.json({
      success: true,
      message: 'Investment deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting investment:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get investment statistics for user
// @route   GET /api/investments/stats
// @access  Private
export const getInvestmentStats = async (req, res) => {
  try {
    const investments = await models.Investment.findAll({
      where: {
        userId: req.user.id
      }
    });

    const stats = {
      totalInvestments: investments.length,
      activeInvestments: investments.filter(inv => inv.status === 'active').length,
      completedInvestments: investments.filter(inv => inv.status === 'completed').length,
      totalInvested: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
      totalEarned: investments.reduce((sum, inv) => sum + parseFloat(inv.totalEarned), 0),
      pendingInvestments: investments.filter(inv => inv.status === 'pending').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching investment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
