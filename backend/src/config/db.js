import { Sequelize } from 'sequelize';

// Database configuration with environment variables or defaults
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'hillscapitaltrade',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' 
    ? (msg) => console.log(`[Sequelize] ${msg}`) 
    : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 10000,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
    typeCast: true
  },
  timezone: process.env.TZ || '+00:00',
  query: {
    raw: true
  }
};

console.log('🔧 Database Configuration:');
console.log(`  - Host: ${dbConfig.host}`);
console.log(`  - Port: ${dbConfig.port}`);
console.log(`  - Database: ${dbConfig.database}`);
console.log(`  - User: ${dbConfig.username}`);
console.log(`  - Password: ${dbConfig.password ? '*** (set)' : '(warning: no password set)'}`);
console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);

// Enhanced database configuration with better error handling
const sequelizeConfig = {
  host: process.env.DB_HOST || '127.0.0.1', // Using IP instead of localhost
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hillscapitaltrade',
  dialect: 'mysql',
  logging: (msg) => console.log(`[DB] ${msg}`), // Enhanced logging
  // Dialect options
  dialectOptions: {
    connectTimeout: 60000, // 60 seconds connection timeout
    decimalNumbers: true, // Return numbers as numbers, not strings
    supportBigNumbers: true,
    bigNumberStrings: false,
    // Enable if you need SSL
    // ssl: process.env.DB_SSL === 'true' ? {
    //   rejectUnauthorized: false
    // } : false
  },
  // Custom type casting for boolean fields
  typeCast: function (field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return field.string() === '1'; // Convert TINYINT(1) to boolean
    }
    return next();
  },
  // Define model options
  define: {
    engine: 'MyISAM', // Force MyISAM engine
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    // Enable if you need paranoid deletion
    // paranoid: true
  },
  // Logging configuration
  logging: (sql, options) => {
    // Only log in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.DB_LOGGING === 'true') {
      console.log('\n📝 SQL Query:', sql);
      if (options && options.bind) {
        console.log('   Bind parameters:', options.bind);
      }
    }
  },
  // Connection pool configuration
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
    evict: 10000, // The maximum time, in milliseconds, that a connection can be idle before being released
    handleDisconnects: true // Handle connection close / lost
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true // Prevent Sequelize from pluralizing table names
  },
  dialectOptions: {
    connectTimeout: 10000, // 10 seconds
    dateStrings: true,
    typeCast: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    decimalNumbers: true
  },
  // Enable debug mode in development
  logQueryParameters: process.env.NODE_ENV === 'development',
  benchmark: process.env.NODE_ENV === 'development',
  // Retry logic
  retry: {
    max: 3, // Maximum retry 3 times
    timeout: 30000, // 30 seconds timeout
    match: [
      // Retry on these errors
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /TimeoutError/,
      /Connection lost/,
      /Deadlock/,
      /Unable to acquire connection/,
      /Too many connections/,
      /Server has gone away/,
      /not bound after/,
      /Resource busy/,
      /Connection terminated unexpectedly/,
      /Connection terminated due to lock timeout/,
      /Failed with error/,
      /Connection was killed/,
      /Connection was refused/,
      /Connection was closed/,
      /Connection was reset/,
      /Connection was aborted/,
      /Connection was refused/,
      /Connection was reset/,
      /Connection was aborted/
    ]
  }
};

const dbName = process.env.DB_NAME || 'hillscapitaltrade';
const username = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';

// Create Sequelize instance with connection pool
console.log('🔌 Creating Sequelize instance...');
const sequelize = new Sequelize(
  dbName,
  username,
  password,
  {
    ...sequelizeConfig,
    // Set the storage engine to MyISAM
    define: {
      ...sequelizeConfig.define,
      engine: 'MyISAM',
    },
  }
);

// Test the database connection
const testConnection = async () => {
  let sequelizeInstance;
  try {
    console.log('\n🔍 Testing database connection...');
    const startTime = Date.now();
    
    // Database configuration with defaults
    const dbConfig = {
      host: process.env.DB_HOST || '127.0.0.1', // Using 127.0.0.1 instead of localhost for better performance
      port: parseInt(process.env.DB_PORT || '3306', 10),
      database: process.env.DB_NAME || 'hillscapitaltrade',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[Sequelize] ${msg}`) : false,
    };
    
    // Create a new connection instance for testing with pool settings
    sequelizeInstance = new Sequelize({
      ...dbConfig,
      pool: {
        max: 1,
        min: 0,
        idle: 10000
      },
      retry: {
        max: 3
      },
      logging: false // Disable logging for test connection
    });
    
    console.log('  Connecting to MySQL server...');
    await sequelizeInstance.authenticate();
    
    const endTime = Date.now();
    console.log(`✅ Database connection established successfully in ${endTime - startTime}ms`);
    
    // Log database version
    console.log('  Fetching database version...');
    const [results] = await sequelizeInstance.query('SELECT VERSION() as version');
    console.log(`📊 Database version: ${results[0].version}`);
    
    // Check if database exists
    console.log('  Checking if database exists...');
    const [dbs] = await sequelizeInstance.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${process.env.DB_NAME || 'hillscapitaltrade'}'`
    );
    
    if (dbs.length === 0) {
      console.error(`❌ Database '${process.env.DB_NAME || 'hillscapitaltrade'}' does not exist`);
      throw new Error(`Database '${process.env.DB_NAME || 'hillscapitaltrade'}' does not exist`);
    }
    
    console.log(`✅ Database '${process.env.DB_NAME || 'hillscapitaltrade'}' exists`);
    
    return true;
  } catch (error) {
    console.error('\n❌ Unable to connect to the database:');
    console.error('Error:', error.message);
    
    if (error.original) {
      console.error('\nOriginal error details:');
      console.error('- Code:', error.original.code);
      console.error('- Errno:', error.original.errno);
      console.error('- SQL State:', error.original.sqlState);
      console.error('- Message:', error.original.message);
      
      if (error.original.sql) {
        console.error('\nSQL Query:');
        console.error(error.original.sql);
      }
    }
    
    throw error;
  } finally {
    // Close the test connection if it was created
    if (sequelizeInstance) {
      await sequelizeInstance.close();
    }
  }
};

export const connectDB = async () => {
  try {
    console.log('🔌 Connecting to database...');
    
    // Add timeout to prevent hanging
    const connectionPromise = sequelize.authenticate();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout after 10 seconds')), 10000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ Database connection established successfully');
    return sequelize;
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    console.error('\n⚠️  Server will continue running but database operations may fail.');
    
    // Return sequelize instance anyway to allow server to continue
    return sequelize;
  }
};

export { sequelize };
export default connectDB;
