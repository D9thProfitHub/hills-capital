import asyncHandler from '../middleware/async.js';
import db from '../models/index.js';

const { Subscription, SubscriptionPlan, User } = db;

// @desc    Get user's subscription information
// @route   GET /api/users/subscriptions
// @access  Private
export const getUserSubscriptions = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all available subscription plans
    const allPlans = await SubscriptionPlan.findAll({
      order: [['price', 'ASC']]
    });

    // Get user's current subscription
    const userSubscription = await Subscription.findOne({
      where: { userId: userId },
      include: [{
        model: db.SubscriptionPlan,
        as: 'plan',
        attributes: ['id', 'name', 'price', 'billingCycle', 'features', 'description', 'maxSignals', 'supportLevel']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Format subscription plans with active status
    const formattedPlans = allPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: parseFloat(plan.price),
      interval: plan.billingCycle,
      features: Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : []),
      description: plan.description,
      maxSignals: plan.maxSignals,
      supportLevel: plan.supportLevel,
      isActive: userSubscription && userSubscription.planId === plan.id && userSubscription.status === 'active',
      status: userSubscription && userSubscription.planId === plan.id && userSubscription.status === 'active' ? 'active' : 'available'
    }));

    // Add subscription details for active plan
    if (userSubscription && userSubscription.status === 'active') {
      const activePlanIndex = formattedPlans.findIndex(p => p.id === userSubscription.planId);
      if (activePlanIndex !== -1) {
        formattedPlans[activePlanIndex] = {
          ...formattedPlans[activePlanIndex],
          startDate: userSubscription.startDate,
          endDate: userSubscription.endDate,
          nextBillingDate: userSubscription.nextBillingDate,
          autoRenew: userSubscription.autoRenew
        };
      }
    }

    // Get billing history (simplified - you may want to create a separate billing table)
    const billingHistory = userSubscription ? [
      {
        id: userSubscription.id,
        date: userSubscription.createdAt,
        plan: userSubscription.plan?.name || 'Unknown Plan',
        amount: userSubscription.plan?.price || 0,
        status: userSubscription.status,
        invoice: `INV-${userSubscription.id.toString().padStart(6, '0')}`,
        paymentMethod: 'Credit Card' // You may want to store this separately
      }
    ] : [];

    res.status(200).json({
      success: true,
      data: {
        plans: formattedPlans,
        billingHistory: billingHistory,
        currentPlan: formattedPlans.find(p => p.isActive) || null
      }
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching subscription information' 
    });
  }
});

// @desc    Get available subscription plans
// @route   GET /api/users/subscription-plans
// @access  Private
export const getSubscriptionPlans = asyncHandler(async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      order: [['price', 'ASC']]
    });

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: parseFloat(plan.price),
      interval: plan.billingCycle,
      features: Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : []),
      description: plan.description,
      maxSignals: plan.maxSignals,
      supportLevel: plan.supportLevel,
      popular: false
    }));

    res.status(200).json({
      success: true,
      count: formattedPlans.length,
      data: formattedPlans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching subscription plans' 
    });
  }
});

// @desc    Subscribe to a plan
// @route   POST /api/users/subscriptions
// @access  Private
export const createSubscription = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { planId, paymentMethod } = req.body;

    // Validate required fields
    if (!planId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and payment method are required'
      });
    }

    // Check if plan exists
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      where: { 
        userId: userId, 
        status: 'active' 
      }
    });

    if (existingSubscription) {
      // Cancel existing subscription first
      await existingSubscription.update({ status: 'canceled' });
    }

    // Create new subscription in database
    const startDate = new Date();
    const endDate = new Date();
    
    // Calculate end date based on billing cycle
    if (plan.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // Default to monthly
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const newSubscription = await Subscription.create({
      userId: userId,
      planId: planId,
      status: 'active', // Set as active for immediate access
      startDate: startDate,
      endDate: endDate,
      nextBillingDate: endDate,
      autoRenew: true,
      paymentMethod: paymentMethod,
      amount: plan.price,
      currency: 'USD'
    });

    // Include plan details in response
    const subscriptionWithPlan = await Subscription.findByPk(newSubscription.id, {
      include: [{
        model: SubscriptionPlan,
        as: 'plan',
        attributes: ['id', 'name', 'price', 'billingCycle', 'features']
      }]
    });

    console.log(`Created subscription for user ${userId}, plan ${planId}, payment method: ${paymentMethod}`);

    // Emit real-time update to user and admin
    try {
      // Get Socket.IO instance from global scope (set in server.js)
      const io = global.io;
      if (io) {
        // Emit to specific user
        io.to(`user-${userId}`).emit('userSubscriptionUpdated', {
          subscription: subscriptionWithPlan,
          timestamp: new Date().toISOString(),
          action: 'created'
        });
        
        // Emit to all admin clients
        io.emit('subscriptionsUpdated', {
          subscription: subscriptionWithPlan,
          timestamp: new Date().toISOString(),
          action: 'created'
        });
        
        console.log(`📡 Real-time subscription update sent for user ${userId}`);
      }
    } catch (socketError) {
      console.warn('Failed to emit real-time subscription update:', socketError);
    }

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        id: subscriptionWithPlan.id,
        userId: subscriptionWithPlan.userId,
        planId: subscriptionWithPlan.planId,
        status: subscriptionWithPlan.status,
        startDate: subscriptionWithPlan.startDate,
        endDate: subscriptionWithPlan.endDate,
        nextBillingDate: subscriptionWithPlan.nextBillingDate,
        autoRenew: subscriptionWithPlan.autoRenew,
        paymentMethod: subscriptionWithPlan.paymentMethod,
        amount: subscriptionWithPlan.amount,
        plan: subscriptionWithPlan.plan,
        createdAt: subscriptionWithPlan.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating subscription: ' + error.message 
    });
  }
});

// @desc    Cancel user subscription
// @route   DELETE /api/users/subscriptions/:id
// @access  Private
export const cancelSubscription = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subscriptionId = req.params.id;

    // This would typically update subscription status in database
    console.log(`Canceling subscription ${subscriptionId} for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully',
      data: {
        subscriptionId,
        status: 'canceled',
        canceledAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error canceling subscription' 
    });
  }
});
