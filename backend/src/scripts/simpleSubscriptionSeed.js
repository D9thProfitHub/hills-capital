import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const insertSubscriptionPlans = async () => {
  let connection;
  
  try {
    console.log('🔧 Connecting to database...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hillscapitaltrade'
    });
    
    console.log('✅ Database connected');
    
    // Clear existing subscription plans
    await connection.execute('DELETE FROM subscription_plans');
    console.log('🗑️ Cleared existing subscription plans');
    
    // Insert subscription plans
    const plans = [
      {
        name: 'Free',
        description: 'Basic trading signals for beginners',
        price: 0.00,
        billing_cycle: 'monthly',
        features: JSON.stringify([
          'Up to 3 signals per week',
          'Basic signal information',
          'Email notifications',
          '24-hour delay on signals'
        ]),
        is_active: 1,
        max_signals: 3,
        has_bot_access: 0,
        has_copy_trading: 0,
        support_level: 'basic'
      },
      {
        name: 'Pro',
        description: 'Professional trading signals with detailed analysis',
        price: 49.99,
        billing_cycle: 'monthly',
        features: JSON.stringify([
          'Up to 10 signals per week',
          'Detailed technical analysis',
          'Real-time notifications',
          'Telegram group access',
          'Priority support',
          'Risk management tips'
        ]),
        is_active: 1,
        max_signals: 10,
        has_bot_access: 1,
        has_copy_trading: 0,
        support_level: 'priority'
      },
      {
        name: 'VIP',
        description: 'Premium trading signals with unlimited access',
        price: 99.99,
        billing_cycle: 'monthly',
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
        is_active: 1,
        max_signals: 999,
        has_bot_access: 1,
        has_copy_trading: 1,
        support_level: 'vip'
      }
    ];
    
    for (const plan of plans) {
      await connection.execute(`
        INSERT INTO subscription_plans 
        (name, description, price, billing_cycle, features, is_active, max_signals, has_bot_access, has_copy_trading, support_level, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        plan.name,
        plan.description,
        plan.price,
        plan.billing_cycle,
        plan.features,
        plan.is_active,
        plan.max_signals,
        plan.has_bot_access,
        plan.has_copy_trading,
        plan.support_level
      ]);
      
      console.log(`✅ Inserted ${plan.name} plan`);
    }
    
    // Verify the data
    const [rows] = await connection.execute('SELECT id, name, price, billing_cycle FROM subscription_plans');
    console.log('\n📊 Inserted subscription plans:');
    rows.forEach(row => {
      console.log(`- ${row.name}: $${row.price}/${row.billing_cycle} (ID: ${row.id})`);
    });
    
    console.log('\n🎉 Subscription plans seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
};

insertSubscriptionPlans();
