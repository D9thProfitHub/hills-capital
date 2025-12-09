// Final solution to ensure all users have affiliate accounts
const path = require('path');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

// Simple model definition
const Affiliate = sequelize.define('affiliate', {
  user_id: DataTypes.INTEGER,
  affiliate_code: DataTypes.STRING,
  tier: { type: DataTypes.STRING, defaultValue: 'bronze' },
  status: { type: DataTypes.STRING, defaultValue: 'active' }
}, {
  tableName: 'affiliates',
  timestamps: true
});

// Generate affiliate code
function generateCode(user) {
  const namePart = user.name 
    ? user.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase()
    : 'USR';
  const idPart = user.id.toString().padStart(3, '0');
  return `${namePart}${idPart}`;
}

// Main function
async function setupAffiliates() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Get users without affiliates
    const [users] = await sequelize.query(`
      SELECT u.id, u.name, u.email 
      FROM users u
      LEFT JOIN affiliates a ON u.id = a.user_id
      WHERE a.id IS NULL
    `);

    if (!users.length) {
      console.log('All users already have affiliate accounts');
      return;
    }

    console.log(`Creating affiliate accounts for ${users.length} users...`);

    // Create affiliate accounts
    for (const user of users) {
      try {
        await Affiliate.create({
          user_id: user.id,
          affiliate_code: generateCode(user)
        });
        console.log(`Created affiliate for ${user.email}`);
      } catch (err) {
        console.error(`Error for ${user.email}:`, err.message);
      }
    }

    console.log('Affiliate setup completed');
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
setupAffiliates();
