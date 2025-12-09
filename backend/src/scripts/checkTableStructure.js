import { sequelize } from '../config/db.js';

const checkTableStructure = async () => {
  try {
    console.log('Checking education_content table structure...');
    
    // Check table structure
    const [columns] = await sequelize.query('DESCRIBE education_content');
    console.log('\n📊 Table columns:');
    columns.forEach(column => {
      console.log(`- ${column.Field} (${column.Type}) - ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} - Default: ${column.Default}`);
    });
    
    // Check sample data
    console.log('\n📝 Sample data:');
    const [sampleData] = await sequelize.query('SELECT * FROM education_content LIMIT 2');
    if (sampleData.length > 0) {
      console.log('First record keys:', Object.keys(sampleData[0]));
      sampleData.forEach((record, index) => {
        console.log(`Record ${index + 1}:`, {
          id: record.id,
          title: record.title,
          type: record.type,
          // Check for different possible column names for published status
          isPublished: record.isPublished,
          is_published: record.is_published,
          published: record.published,
          status: record.status
        });
      });
    } else {
      console.log('No data found');
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
    throw error;
  }
};

checkTableStructure()
  .then(() => {
    console.log('✅ Structure check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Structure check failed:', error);
    process.exit(1);
  });
