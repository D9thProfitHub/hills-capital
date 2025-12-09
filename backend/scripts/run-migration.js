import { sequelize } from '../src/config/db.js';
import { QueryTypes } from 'sequelize';

async function runMigration() {
  try {
    // Check if the column already exists
    const [results] = await sequelize.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'hillscapitaltrade' 
       AND TABLE_NAME = 'copy_trading_requests' 
       AND COLUMN_NAME = 'name'`,
      { type: QueryTypes.SELECT }
    );

    if (!results) {
      // Add the name column if it doesn't exist
      await sequelize.query(
        `ALTER TABLE copy_trading_requests 
         ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Trader' AFTER user_id`,
        { type: QueryTypes.RAW }
      );
      console.log('Successfully added name column to copy_trading_requests table');
    } else {
      console.log('Name column already exists in copy_trading_requests table');
    }
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();
