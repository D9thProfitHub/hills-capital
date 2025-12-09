import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || '3306');
console.log('DB_NAME:', process.env.DB_NAME || 'hillscapitaltrade');
console.log('DB_USER:', process.env.DB_USER || 'root');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : '(empty)');

// Try to connect to MySQL
const testMySQL = async () => {
  try {
    console.log('\n🔍 Testing MySQL connection...');
    const sequelize = new Sequelize({
      database: process.env.DB_NAME || 'hillscapitaltrade',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        connectTimeout: 5000,
      },
      pool: {
        max: 1,
        min: 0,
        idle: 5000
      }
    });
    
    await sequelize.authenticate();
    console.log('✅ MySQL connection successful');
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ MySQL connection failed:', error.message);
    return false;
  }
};

// Try to connect to PostgreSQL
const testPostgreSQL = async () => {
  try {
    console.log('\n🔍 Testing PostgreSQL connection...');
    const sequelize = new Sequelize({
      database: 'postgres',
      username: 'postgres',
      password: '',
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        connectTimeout: 5000,
      },
      pool: {
        max: 1,
        min: 0,
        idle: 5000
      }
    });
    
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection successful');
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
};

// Test both databases
const testConnections = async () => {
  const mysqlWorks = await testMySQL();
  const postgresWorks = await testPostgreSQL();
  
  if (!mysqlWorks && !postgresWorks) {
    console.log('\n❌ Neither MySQL nor PostgreSQL connections work');
    console.log('Please ensure one of these databases is running and accessible');
  } else if (postgresWorks && !mysqlWorks) {
    console.log('\n💡 PostgreSQL is available but MySQL is not');
    console.log('Consider switching the application to use PostgreSQL');
  }
};

testConnections().catch(console.error);
