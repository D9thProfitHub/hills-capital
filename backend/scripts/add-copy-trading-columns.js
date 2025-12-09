import { sequelize } from '../src/config/db.js';
import { QueryTypes } from 'sequelize';

async function addColumns() {
  try {
    // Check if columns exist and add them if they don't
    const columnsToAdd = [
      { name: 'name', type: 'VARCHAR(255) NOT NULL DEFAULT "Trader"' },
      { name: 'broker', type: 'VARCHAR(255)' },
      { name: 'server', type: 'VARCHAR(255)' },
      { name: 'login', type: 'VARCHAR(255)' },
      { name: 'password', type: 'VARCHAR(255)' },
      { name: 'risk_level', type: 'VARCHAR(50)' },
      { name: 'max_drawdown', type: 'DECIMAL(10,2)' },
      { name: 'max_daily_loss', type: 'DECIMAL(10,2)' },
      { name: 'stop_copy_on_drawdown', type: 'BOOLEAN DEFAULT false' },
      { name: 'follow_new_positions', type: 'BOOLEAN DEFAULT true' },
      { name: 'status', type: 'VARCHAR(50) DEFAULT "pending"' },
      { name: 'notes', type: 'TEXT' },
      { name: 'assigned_trader', type: 'INTEGER NULL', foreignKey: 'users(id)' },
      { name: 'approved_by', type: 'INTEGER NULL', foreignKey: 'users(id)' }
    ];

    for (const column of columnsToAdd) {
      // Check if column exists
      const [results] = await sequelize.query(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'hillscapitaltrade' 
         AND TABLE_NAME = 'copy_trading_requests' 
         AND COLUMN_NAME = '${column.name}'`,
        { type: QueryTypes.SELECT }
      );

      if (!results) {
        // Add the column
        let alterQuery = `ALTER TABLE copy_trading_requests ADD COLUMN ${column.name} ${column.type}`;
        
        // Add foreign key constraint if specified
        if (column.foreignKey) {
          const [refTable, refColumn] = column.foreignKey.split('(');
          alterQuery += `, ADD CONSTRAINT fk_${column.name} FOREIGN KEY (${column.name}) REFERENCES ${refTable}(${refColumn})`;
        }
        
        await sequelize.query(alterQuery, { type: QueryTypes.RAW });
        console.log(`✅ Added column '${column.name}' to copy_trading_requests table`);
      } else {
        console.log(`ℹ️ Column '${column.name}' already exists in copy_trading_requests table`);
      }
    }
    
    console.log('✅ All columns have been added successfully');
  } catch (error) {
    console.error('❌ Error adding columns:', error);
  } finally {
    await sequelize.close();
  }
}

addColumns();
