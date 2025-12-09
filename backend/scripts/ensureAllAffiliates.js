// Ensure all users have affiliate accounts - CommonJS version
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Database configuration
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: console.log
});

// Simple model definitions
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING
}, { tableName: 'users', timestamps: false });

const Affiliate = sequelize.define('Affiliate', {
  user_id: DataTypes.INTEGER,
  affiliate_code: DataTypes.STRING,
  tier: { type: DataTypes.STRING, defaultValue: 'bronze' },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  total_referrals: { type: DataTypes.INTEGER, defaultValue: 0 },
  active_referrals: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_commissions: { type: DataTypes.FLOAT, defaultValue: 0 },
  paid_commissions: { type: DataTypes.FLOAT, defaultValue: 0 },
  pending_commissions: { type: DataTypes.FLOAT, defaultValue: 0 }
}, { tableName: 'affiliates', timestamps: true });

// Generate affiliate code
function generateAffiliateCode(user) {
  const namePart = user.name 
    ? user.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() 
    : 'USR';
  const idPart = user.id 
    ? String(user.id).slice(-3).padStart(3, '0') 
    : String(Math.floor(Math.random() * 900) + 100);
  return `${namePart}${idPart}`;
}

// Main script logic
async function ensureAllAffiliates() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Find users without affiliates
    const [users] = await sequelize.query(
      `SELECT u.id, u.name, u.email 
       FROM users u
       LEFT JOIN affiliates a ON u.id = a.user_id
       WHERE a.id IS NULL`
    );

    if (users.length === 0) {
      console.log('✅ All users already have affiliate accounts');
      return;
    }

    console.log(`Found ${users.length} users without affiliate accounts`);

    // Create affiliate accounts
    for (const user of users) {
      try {
        await Affiliate.create({
          user_id: user.id,
          affiliate_code: generateAffiliateCode(user),
          // Other fields will use their default values
        });
        console.log(`Created affiliate account for ${user.email}`);
      } catch (error) {
        console.error(`Error creating affiliate for ${user.email}:`, error.message);
      }
    }

    console.log('✅ Completed processing all users');
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

// Execute the script
ensureAllAffiliates();
