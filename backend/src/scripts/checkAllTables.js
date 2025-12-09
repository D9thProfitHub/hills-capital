import { sequelize } from '../config/db.js';

const checkAllTables = async () => {
  try {
    console.log('Checking all tables in database...');
    
    // Show all tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('\n📊 All tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });
    
    // Check for any table that might contain education data
    console.log('\n🔍 Checking for education-related data...');
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      if (tableName.toLowerCase().includes('education') || tableName.toLowerCase().includes('course')) {
        console.log(`\n📝 Checking table: ${tableName}`);
        try {
          const [data] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`   Records: ${data[0].count}`);
          
          if (data[0].count > 0) {
            const [sample] = await sequelize.query(`SELECT * FROM ${tableName} LIMIT 1`);
            if (sample.length > 0) {
              console.log(`   Sample columns:`, Object.keys(sample[0]));
            }
          }
        } catch (error) {
          console.log(`   Error checking ${tableName}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    throw error;
  }
};

checkAllTables()
  .then(() => {
    console.log('✅ Table check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Table check failed:', error);
    process.exit(1);
  });
