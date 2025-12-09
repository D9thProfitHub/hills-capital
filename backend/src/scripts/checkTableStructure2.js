import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const checkTable = async () => {
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
    
    // Check table structure
    const [structure] = await connection.execute('DESCRIBE subscription_plans');
    console.log('\n📊 Table structure:');
    structure.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Check existing data
    const [data] = await connection.execute('SELECT * FROM subscription_plans LIMIT 3');
    console.log(`\n📈 Existing records: ${data.length}`);
    if (data.length > 0) {
      console.log('📋 Sample data:');
      data.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name} - $${row.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
};

checkTable();
