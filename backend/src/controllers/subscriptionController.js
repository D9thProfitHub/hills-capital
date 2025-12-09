import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create database connection
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hillscapitaltrade',
  dialect: 'mysql',
  logging: false
});

// Get all subscriptions (Admin)
export const getSubscriptions = async (req, res) => {
  try {
    const [subscriptions] = await sequelize.query(`
      SELECT 
        s.*,
        u.name as user_name,
        u.email as user_email,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.billing_cycle
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ORDER BY s.created_at DESC
    `);

    // Transform data for frontend
    const transformedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      user: `${sub.user_name} (${sub.user_email})`,
      userName: sub.user_name || 'Unknown User',
      userEmail: sub.user_email || 'No Email',
      plan: sub.plan_name,
      planName: sub.plan_name || 'Unknown Plan',
      planPrice: Number(sub.plan_price) || 0,
      billingCycle: sub.billing_cycle || 'monthly',
      price: `$${Number(sub.plan_price) || 0}`,
      status: sub.status,
      startDate: sub.start_date,
      endDate: sub.end_date,
      nextBillingDate: sub.next_billing_date,
      autoRenew: Boolean(sub.auto_renew),
      totalPaid: Number(sub.amount) || 0
    }));

    res.json({
      success: true,
      subscriptions: transformedSubscriptions
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
};

// Get all subscription plans (Admin)
export const getSubscriptionPlans = async (req, res) => {
  try {
    const [plans] = await sequelize.query(`
      SELECT 
        sp.*,
        COUNT(s.id) as total_subscribers,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscribers
      FROM subscription_plans sp
      LEFT JOIN subscriptions s ON sp.id = s.plan_id
      GROUP BY sp.id
      ORDER BY sp.price ASC
    `);

    // Transform data with subscriber counts
    const transformedPlans = plans.map(plan => {
      const activeSubscribers = plan.active_subscribers || 0;
      const totalSubscribers = plan.total_subscribers || 0;

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: Number(plan.price) || 0,
        billingCycle: plan.billing_cycle,
        features: plan.features ? JSON.parse(plan.features) : [],
        isActive: Boolean(plan.is_active),
        subscribers: activeSubscribers,
        totalSubscribers: totalSubscribers,
        maxSignals: Number(plan.max_signals) || 0,
        hasBotAccess: Boolean(plan.has_bot_access),
        hasCopyTrading: Boolean(plan.has_copy_trading),
        supportLevel: plan.support_level
      };
    });

    res.json({
      success: true,
      plans: transformedPlans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
};

// Update subscription status (Admin)
export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if subscription exists
    const [subscription] = await sequelize.query(
      'SELECT id FROM subscriptions WHERE id = ?',
      { replacements: [id] }
    );
    
    if (!subscription.length) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Update subscription status
    await sequelize.query(
      'UPDATE subscriptions SET status = ?, updated_at = NOW() WHERE id = ?',
      { replacements: [status, id] }
    );

    res.json({
      success: true,
      message: 'Subscription status updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription status',
      error: error.message
    });
  }
};

// Create new subscription plan (Admin)
export const createSubscriptionPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      billingCycle,
      features,
      maxSignals,
      hasBotAccess,
      hasCopyTrading,
      supportLevel
    } = req.body;

    // Insert new subscription plan
    const [result] = await sequelize.query(`
      INSERT INTO subscription_plans (
        name, description, price, billing_cycle, features, 
        max_signals, has_bot_access, has_copy_trading, support_level,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `, {
      replacements: [
        name,
        description,
        price,
        billingCycle,
        JSON.stringify(features || []),
        maxSignals,
        hasBotAccess || false,
        hasCopyTrading || false,
        supportLevel || 'basic'
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      planId: result.insertId
    });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription plan',
      error: error.message
    });
  }
};

// Update subscription plan (Admin)
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if plan exists
    const [plan] = await sequelize.query(
      'SELECT id FROM subscription_plans WHERE id = ?',
      { replacements: [id] }
    );
    
    if (!plan.length) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const replacements = [];
    
    Object.keys(updateData).forEach(key => {
      if (key === 'features') {
        updateFields.push('features = ?');
        replacements.push(JSON.stringify(updateData[key]));
      } else {
        // Convert camelCase to snake_case
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        replacements.push(updateData[key]);
      }
    });
    
    if (updateFields.length > 0) {
      replacements.push(id);
      await sequelize.query(
        `UPDATE subscription_plans SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        { replacements }
      );
    }

    res.json({
      success: true,
      message: 'Subscription plan updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription plan',
      error: error.message
    });
  }
};

// Delete subscription plan (Admin)
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if plan exists
    const [plan] = await sequelize.query(
      'SELECT id FROM subscription_plans WHERE id = ?',
      { replacements: [id] }
    );
    
    if (!plan.length) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Check if plan has active subscriptions
    const [activeSubscriptions] = await sequelize.query(
      'SELECT COUNT(*) as count FROM subscriptions WHERE plan_id = ? AND status = "active"',
      { replacements: [id] }
    );

    if (activeSubscriptions[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete plan with active subscriptions'
      });
    }

    // Delete the plan
    await sequelize.query(
      'DELETE FROM subscription_plans WHERE id = ?',
      { replacements: [id] }
    );

    res.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscription plan',
      error: error.message
    });
  }
};

// Get user's subscription (User)
export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const [subscriptions] = await sequelize.query(`
      SELECT 
        s.*,
        sp.name as plan_name,
        sp.description as plan_description,
        sp.price as plan_price,
        sp.billing_cycle as plan_billing_cycle
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
      LIMIT 1
    `, { replacements: [userId] });

    if (!subscriptions.length) {
      return res.json({
        success: true,
        subscription: null,
        message: 'No active subscription found'
      });
    }

    const subscription = subscriptions[0];
    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: {
          name: subscription.plan_name,
          description: subscription.plan_description,
          price: subscription.plan_price,
          billingCycle: subscription.plan_billing_cycle
        },
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        nextBillingDate: subscription.next_billing_date,
        autoRenew: subscription.auto_renew,
        amount: subscription.amount
      }
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
};
