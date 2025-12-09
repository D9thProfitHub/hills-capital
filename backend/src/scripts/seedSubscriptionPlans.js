import db from '../models/index.js';

const { SubscriptionPlan } = db;

const subscriptionPlansData = [
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
    supportLevel: 'priority',
    popular: true
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

const seedSubscriptionPlans = async () => {
  try {
    console.log('🔧 Starting subscription plans seeding...');
    
    // Authenticate database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Check if SubscriptionPlan model is available
    console.log('🔍 Checking SubscriptionPlan model:', !!SubscriptionPlan);
    console.log('🔍 Available models:', Object.keys(db));

    // Clear existing subscription plans
    await SubscriptionPlan.destroy({ where: {} });
    console.log('Cleared existing subscription plans');

    // Create new subscription plans
    const createdPlans = await SubscriptionPlan.bulkCreate(subscriptionPlansData);
    console.log(`Created ${createdPlans.length} subscription plans:`);
    
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price}/${plan.billingCycle}`);
    });

    console.log('Subscription plans seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
  } finally {
    // Close database connection
    await db.sequelize.close();
  }
};

// Run the seeding function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSubscriptionPlans();
}

export default seedSubscriptionPlans;
