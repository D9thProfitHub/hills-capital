const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSubscriptionPlans() {
  let connection;
  
  try {
    console.log('🔧 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hillscapitaltrade'
    });
    
    console.log('✅ Database connected');
    
    // Check if subscription plans exist
    const [plans] = await connection.execute('SELECT * FROM subscription_plans ORDER BY id');
    
    console.log(`📊 Found ${plans.length} subscription plans:`);
    
    plans.forEach(plan => {
      console.log(`\n📋 Plan ID: ${plan.id}`);
      console.log(`   Name: ${plan.name}`);
      console.log(`   Price: $${plan.price}`);
      console.log(`   Billing Cycle: ${plan.billing_cycle}`);
      console.log(`   Max Signals: ${plan.max_signals}`);
      console.log(`   Bot Access: ${plan.has_bot_access ? 'Yes' : 'No'}`);
      console.log(`   Copy Trading: ${plan.has_copy_trading ? 'Yes' : 'No'}`);
      console.log(`   Support Level: ${plan.support_level}`);
      console.log(`   Active: ${plan.is_active ? 'Yes' : 'No'}`);
      
      // Parse features if it's JSON
      try {
        const features = JSON.parse(plan.features);
        console.log(`   Features: ${features.join(', ')}`);
      } catch (e) {
        console.log(`   Features: ${plan.features}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 Database connection closed');
    }
  }
}

checkSubscriptionPlans();
