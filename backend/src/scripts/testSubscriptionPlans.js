// Simple test to check subscription plans in database
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import the models
const db = require('../models');

async function testSubscriptionPlans() {
  try {
    console.log('🔧 Testing subscription plans...');
    
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check if SubscriptionPlan model exists
    if (!db.SubscriptionPlan) {
      console.log('❌ SubscriptionPlan model not found');
      return;
    }
    
    console.log('✅ SubscriptionPlan model found');
    
    // Fetch all subscription plans
    const plans = await db.SubscriptionPlan.findAll({
      attributes: ['id', 'name', 'description', 'price', 'billingCycle', 'features', 'isActive', 'maxSignals', 'hasBotAccess', 'hasCopyTrading', 'supportLevel'],
      order: [['id', 'ASC']]
    });
    
    console.log(`📊 Found ${plans.length} subscription plans:`);
    
    plans.forEach(plan => {
      console.log(`\n📋 Plan: ${plan.name}`);
      console.log(`   ID: ${plan.id}`);
      console.log(`   Price: $${plan.price}`);
      console.log(`   Billing: ${plan.billingCycle}`);
      console.log(`   Max Signals: ${plan.maxSignals}`);
      console.log(`   Bot Access: ${plan.hasBotAccess ? 'Yes' : 'No'}`);
      console.log(`   Copy Trading: ${plan.hasCopyTrading ? 'Yes' : 'No'}`);
      console.log(`   Support: ${plan.supportLevel}`);
      console.log(`   Active: ${plan.isActive ? 'Yes' : 'No'}`);
      
      // Parse features
      try {
        const features = JSON.parse(plan.features);
        console.log(`   Features: ${features.join(', ')}`);
      } catch (e) {
        console.log(`   Features: ${plan.features}`);
      }
    });
    
    if (plans.length === 0) {
      console.log('\n⚠️ No subscription plans found. Running seed script...');
      
      // Try to create plans directly
      const planData = [
        {
          name: 'Free',
          description: 'Basic trading signals for beginners',
          price: 0.00,
          billingCycle: 'monthly',
          features: JSON.stringify([
            'Up to 3 signals per week',
            'Basic signal information',
            'Email notifications',
            '24-hour delay on signals'
          ]),
          isActive: true,
          maxSignals: 3,
          hasBotAccess: false,
          hasCopyTrading: false,
          supportLevel: 'basic'
        },
        {
          name: 'Pro',
          description: 'Professional trading signals with detailed analysis',
          price: 49.99,
          billingCycle: 'monthly',
          features: JSON.stringify([
            'Up to 10 signals per week',
            'Detailed technical analysis',
            'Real-time notifications',
            'Telegram group access',
            'Priority support',
            'Risk management tips'
          ]),
          isActive: true,
          maxSignals: 10,
          hasBotAccess: true,
          hasCopyTrading: false,
          supportLevel: 'priority'
        },
        {
          name: 'VIP',
          description: 'Premium trading signals with unlimited access',
          price: 99.99,
          billingCycle: 'monthly',
          features: JSON.stringify([
            'Unlimited signals',
            'Detailed analysis with charts',
            'Real-time notifications',
            'VIP Telegram group access',
            '24/7 dedicated support',
            '1-on-1 consultation sessions',
            'Copy trading access',
            'Custom risk management'
          ]),
          isActive: true,
          maxSignals: 999,
          hasBotAccess: true,
          hasCopyTrading: true,
          supportLevel: 'vip'
        }
      ];
      
      for (const plan of planData) {
        try {
          const created = await db.SubscriptionPlan.create(plan);
          console.log(`✅ Created plan: ${created.name} (ID: ${created.id})`);
        } catch (error) {
          console.log(`❌ Failed to create plan ${plan.name}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\n🔒 Database connection closed');
  }
}

testSubscriptionPlans();
