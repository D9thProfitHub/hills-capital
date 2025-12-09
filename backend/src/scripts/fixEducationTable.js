import { sequelize } from '../config/db.js';

const fixEducationTable = async () => {
  try {
    console.log('Fixing education_content table structure...');
    
    // Add missing isPublished column
    console.log('Adding isPublished column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE
    `);
    
    // Add missing isLocked column
    console.log('Adding isLocked column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE
    `);
    
    // Add missing required_subscription_level column
    console.log('Adding requiredSubscriptionLevel column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS required_subscription_level ENUM('free', 'basic', 'premium', 'vip') NOT NULL DEFAULT 'free'
    `);
    
    // Add missing lessons column (JSON)
    console.log('Adding lessons column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS lessons LONGTEXT
    `);
    
    // Add missing content column
    console.log('Adding content column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS content TEXT
    `);
    
    // Add missing duration column
    console.log('Adding duration column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS duration INT
    `);
    
    // Add missing thumbnail column
    console.log('Adding thumbnail column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(255) DEFAULT 'https://picsum.photos/400/250'
    `);
    
    // Add missing video_url column
    console.log('Adding videoUrl column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS video_url VARCHAR(255)
    `);
    
    // Add missing prerequisites column
    console.log('Adding prerequisites column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS prerequisites LONGTEXT
    `);
    
    // Add missing scheduled_date column
    console.log('Adding scheduledDate column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS scheduled_date DATETIME
    `);
    
    // Add missing meeting_link column
    console.log('Adding meetingLink column...');
    await sequelize.query(`
      ALTER TABLE education_content 
      ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(255)
    `);
    
    console.log('✅ Table structure updated successfully!');
    
    // Verify the updated structure
    const [columns] = await sequelize.query('DESCRIBE education_content');
    console.log('\n📊 Updated table columns:');
    columns.forEach(column => {
      console.log(`- ${column.Field} (${column.Type})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing table structure:', error);
    throw error;
  }
};

fixEducationTable()
  .then(() => {
    console.log('✅ Table fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Table fix failed:', error);
    process.exit(1);
  });
