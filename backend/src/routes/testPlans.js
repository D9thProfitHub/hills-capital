import express from 'express';
import db from '../models/index.js';

const { SubscriptionPlan } = db;

const router = express.Router();

// Test endpoint to check subscription plans without authentication
router.get('/test-plans', async (req, res) => {
  try {
    console.log('🔧 Testing subscription plans endpoint...');
    
    const plans = await SubscriptionPlan.findAll({
      order: [['price', 'ASC']]
    });

    console.log(`📊 Found ${plans.length} subscription plans in database`);

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: parseFloat(plan.price),
      interval: plan.billingCycle,
      features: Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : []),
      description: plan.description,
      maxSignals: plan.maxSignals,
      supportLevel: plan.supportLevel,
      hasBotAccess: plan.hasBotAccess,
      hasCopyTrading: plan.hasCopyTrading,
      isActive: plan.isActive
    }));

    res.status(200).json({
      success: true,
      count: formattedPlans.length,
      data: formattedPlans,
      message: `Found ${formattedPlans.length} subscription plans`
    });
  } catch (error) {
    console.error('❌ Error fetching subscription plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching subscription plans',
      error: error.message
    });
  }
});

export default router;
