import { sequelize } from '../config/db.js';
import createAffiliateAccount from '../middleware/autoAffiliate.js';

(async () => {
  try {
    // Find all users without affiliate accounts
    const [users] = await sequelize.query(`
      SELECT u.* 
      FROM users u
      LEFT JOIN affiliates a ON u.id = a.user_id
      WHERE a.id IS NULL
    `);

    if (users.length === 0) {
      console.log('✅ All users already have affiliate accounts');
      return;
    }

    console.log(`Found ${users.length} users without affiliate accounts`);
    
    // Create affiliate accounts for each user
    for (const user of users) {
      try {
        await createAffiliateAccount(user);
        console.log(`Created affiliate account for user ${user.email}`);
      } catch (error) {
        console.error(`Error creating affiliate for user ${user.email}:`, error.message);
      }
    }

    console.log('✅ Completed creating missing affiliate accounts');
  } catch (error) {
    console.error('Error in createMissingAffiliates script:', error);
  } finally {
    process.exit();
  }
})();
