import express from 'express';
import models from '../models/index.js';

const router = express.Router();

// @route   GET /investment-plans
// @desc    Get all active investment plans (public route)
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching investment plans...');
    
    const plans = await models.InvestmentPlan.findAll({
      where: {
        isActive: true
      },
      order: [['minAmount', 'ASC']],
      attributes: [
        'id',
        'name', 
        'description',
        'minAmount',
        'maxAmount',
        'roi',
        'duration',
        'features',
        'riskLevel'
      ]
    });

    // Parse features JSON strings into arrays
    const parsedPlans = plans.map(plan => {
      const planData = plan.toJSON();
      if (planData.features && typeof planData.features === 'string') {
        try {
          planData.features = JSON.parse(planData.features);
        } catch (error) {
          console.warn(`Failed to parse features for plan ${planData.id}:`, error);
          planData.features = [];
        }
      } else if (!planData.features) {
        planData.features = [];
      }
      return planData;
    });

    console.log(`✅ Found ${parsedPlans.length} active investment plans`);
    
    res.json({
      success: true,
      count: parsedPlans.length,
      data: parsedPlans
    });
  } catch (error) {
    console.error('❌ Error fetching investment plans:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

export default router;
