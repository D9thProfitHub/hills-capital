import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const checkAndCreateDatabase = async () => {
  let sequelize;
  try {
    console.log('🔍 Checking database setup...');
    
    // First connect to MySQL server without specifying a database
    sequelize = new Sequelize({
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        connectTimeout: 10000,
      }
    });
    
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL server');
    
    // Check if database exists
    const dbName = process.env.DB_NAME || 'hillscapitaltrade';
    console.log(`🔍 Checking if database '${dbName}' exists...`);
    
    const [databases] = await sequelize.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}'`
    );
    
    if (databases.length === 0) {
      console.log(`❌ Database '${dbName}' does not exist`);
      console.log(`🔧 Creating database '${dbName}'...`);
      
      await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`✅ Database '${dbName}' already exists`);
    }
    
    // Now connect to the specific database to test
    await sequelize.close();
    
    const dbSequelize = new Sequelize({
      database: dbName,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      dialect: 'mysql',
      logging: false
    });
    
    await dbSequelize.authenticate();
    console.log(`✅ Successfully connected to database '${dbName}'`);
    
    // Check tables
    const [tables] = await dbSequelize.query("SHOW TABLES");
    console.log(`📊 Found ${tables.length} tables in database`);
    
    if (tables.length > 0) {
      console.log('📋 Existing tables:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
    }
    
    await dbSequelize.close();
    console.log('🎉 Database check completed successfully');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
};

checkAndCreateDatabase();
