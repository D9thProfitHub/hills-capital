import db from '../models/index.js';

const testConnection = async () => {
  try {
    console.log('🔧 Testing database connection...');
    
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check available models
    console.log('📋 Available models:', Object.keys(db));
    
    // Test SubscriptionPlan model specifically
    if (db.SubscriptionPlan) {
      console.log('✅ SubscriptionPlan model found');
      
      // Try to count existing subscription plans
      const count = await db.SubscriptionPlan.count();
      console.log(`📊 Current subscription plans count: ${count}`);
    } else {
      console.log('❌ SubscriptionPlan model not found');
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await db.sequelize.close();
    console.log('🔒 Database connection closed');
  }
};

testConnection();
