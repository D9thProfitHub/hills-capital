import { sequelize } from '../config/db.js';

const createProgressTable = async () => {
  try {
    console.log('Creating user_education_progress table...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_education_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        education_content_id INT NOT NULL,
        progress DECIMAL(5,2) DEFAULT 0.00,
        completed_lessons JSON,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at DATETIME,
        time_spent INT DEFAULT 0,
        last_accessed_at DATETIME,
        rating DECIMAL(3,2),
        review TEXT,
        is_saved BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_content (user_id, education_content_id),
        INDEX idx_user_id (user_id),
        INDEX idx_education_content_id (education_content_id),
        INDEX idx_is_completed (is_completed),
        INDEX idx_is_saved (is_saved)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('✅ user_education_progress table created successfully!');
    
    // Verify the table exists
    const [results] = await sequelize.query("SHOW TABLES LIKE 'user_education_progress'");
    if (results.length > 0) {
      console.log('✅ Table verified: user_education_progress exists');
    } else {
      console.log('❌ Table verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error creating user_education_progress table:', error);
    throw error;
  }
};

createProgressTable()
  .then(() => {
    console.log('✅ Progress table setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
