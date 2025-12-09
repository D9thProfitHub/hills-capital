const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const main = async () => {
  try {
    // Initialize Sequelize
    const { Sequelize, DataTypes } = require('sequelize');
    const sequelize = new Sequelize({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: false
    });

    // Define simple models
    const User = sequelize.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      name: DataTypes.STRING,
      email: DataTypes.STRING
    }, { tableName: 'users', timestamps: false });

    const Affiliate = sequelize.define('Affiliate', {
      user_id: DataTypes.INTEGER,
      affiliate_code: DataTypes.STRING,
      tier: DataTypes.STRING,
      status: DataTypes.STRING
    }, { tableName: 'affiliates', timestamps: false });

    // Find users without affiliates
    const users = await sequelize.query(
      `SELECT u.id, u.name, u.email FROM users u 
       LEFT JOIN affiliates a ON u.id = a.user_id 
       WHERE a.id IS NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('✅ All users already have affiliate accounts');
      return;
    }

    console.log(`Found ${users.length} users without affiliate accounts`);

    // Create affiliate accounts
    for (const user of users) {
      try {
        const code = generateAffiliateCode(user);
        await Affiliate.create({
          user_id: user.id,
          affiliate_code: code,
          tier: 'bronze',
          status: 'active'
        });
        console.log(`Created affiliate ${code} for ${user.email}`);
      } catch (error) {
        console.error(`Error creating affiliate for ${user.email}:`, error.message);
      }
    }

    console.log('✅ Completed creating affiliate accounts');
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    process.exit();
  }
};

// Helper function
function generateAffiliateCode(user) {
  const namePart = user.name ? 
    user.name.substring(0, 3).toUpperCase() : 'USR';
  const idPart = user.id ? 
    String(user.id).slice(-3).padStart(3, '0') :
    String(Math.floor(Math.random() * 900) + 100);
  return `${namePart}${idPart}`;
}

// Run the script
main();
