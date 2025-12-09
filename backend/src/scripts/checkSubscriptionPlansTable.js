import db from '../models/index.js';

const checkTable = async () => {
  try {
    console.log('🔧 Checking subscription_plans table...');
    
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Check if table exists
    const [results] = await db.sequelize.query("SHOW TABLES LIKE 'subscription_plans'");
    console.log('📋 Table check result:', results);
    
    if (results.length > 0) {
      console.log('✅ subscription_plans table exists');
      
      // Check table structure
      const [structure] = await db.sequelize.query("DESCRIBE subscription_plans");
      console.log('📊 Table structure:', structure);
      
      // Check existing data
      const [data] = await db.sequelize.query("SELECT * FROM subscription_plans");
      console.log(`📈 Existing records: ${data.length}`);
      if (data.length > 0) {
        console.log('📋 Sample data:', data[0]);
      }
    } else {
      console.log('❌ subscription_plans table does not exist');
      
      // Try to create the table
      console.log('🔧 Attempting to sync SubscriptionPlan model...');
      await db.SubscriptionPlan.sync({ force: true });
      console.log('✅ SubscriptionPlan table created');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.sequelize.close();
  }
};

checkTable();
