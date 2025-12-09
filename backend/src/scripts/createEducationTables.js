import { sequelize } from '../config/db.js';

const createEducationTables = async () => {
  try {
    console.log('Creating education_content table...');
    
    // Create education_content table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS education_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        content JSON,
        type ENUM('course', 'webinar', 'article', 'quiz') NOT NULL DEFAULT 'course',
        level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
        duration INT DEFAULT 0,
        lessons JSON,
        thumbnail VARCHAR(500),
        video_url VARCHAR(500),
        is_locked BOOLEAN NOT NULL DEFAULT FALSE,
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        required_subscription_level ENUM('free', 'basic', 'premium', 'vip') DEFAULT 'free',
        learning_objectives JSON,
        prerequisites JSON,
        scheduled_date DATETIME,
        speaker VARCHAR(100),
        meeting_link VARCHAR(500),
        views INT NOT NULL DEFAULT 0,
        enrollments INT NOT NULL DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0.00,
        rating_count INT NOT NULL DEFAULT 0,
        tags JSON,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_level (level),
        INDEX idx_is_published (is_published),
        INDEX idx_created_by (created_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('Creating user_education_progress table...');
    
    // Create user_education_progress table
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
    
    console.log('Inserting sample education content...');
    
    // Insert sample education content
    await sequelize.query(`
      INSERT IGNORE INTO education_content (
        id, title, description, content, type, level, duration, lessons, thumbnail, 
        is_published, required_subscription_level, learning_objectives, prerequisites, 
        views, enrollments, rating, rating_count, tags
      ) VALUES
      (1, 'Introduction to Trading', 'Learn the fundamentals of financial trading and market analysis.', 
       '{"overview": "Complete beginner guide to trading", "modules": ["Market Basics", "Order Types", "Risk Management"]}',
       'course', 'beginner', 180, 
       '[{"id": 1, "title": "What is Trading?", "duration": 15, "videoUrl": "https://example.com/video1.mp4"}, {"id": 2, "title": "Market Types", "duration": 20, "videoUrl": "https://example.com/video2.mp4"}, {"id": 3, "title": "Basic Terminology", "duration": 25, "videoUrl": "https://example.com/video3.mp4"}]',
       'https://example.com/thumbnails/intro-trading.jpg', TRUE, 'free',
       '["Understand basic trading concepts", "Learn different market types", "Master trading terminology"]',
       '["Basic math skills", "Interest in financial markets"]',
       1250, 890, 4.5, 156, '["trading", "beginner", "finance", "markets"]'),
       
      (2, 'Technical Analysis Mastery', 'Advanced technical analysis techniques for professional traders.',
       '{"overview": "Comprehensive technical analysis course", "modules": ["Chart Patterns", "Indicators", "Trading Strategies"]}',
       'course', 'intermediate', 300,
       '[{"id": 1, "title": "Chart Patterns", "duration": 45, "videoUrl": "https://example.com/video4.mp4"}, {"id": 2, "title": "Technical Indicators", "duration": 60, "videoUrl": "https://example.com/video5.mp4"}, {"id": 3, "title": "Strategy Development", "duration": 50, "videoUrl": "https://example.com/video6.mp4"}]',
       'https://example.com/thumbnails/technical-analysis.jpg', TRUE, 'basic',
       '["Master chart pattern recognition", "Use technical indicators effectively", "Develop trading strategies"]',
       '["Basic trading knowledge", "Understanding of market movements"]',
       980, 654, 4.7, 89, '["technical analysis", "intermediate", "charts", "indicators"]'),
       
      (3, 'Cryptocurrency Trading', 'Navigate the exciting world of cryptocurrency markets.',
       '{"overview": "Complete guide to crypto trading", "modules": ["Blockchain Basics", "Crypto Markets", "DeFi Trading"]}',
       'course', 'intermediate', 240,
       '[{"id": 1, "title": "Blockchain Fundamentals", "duration": 30, "videoUrl": "https://example.com/video7.mp4"}, {"id": 2, "title": "Crypto Exchanges", "duration": 35, "videoUrl": "https://example.com/video8.mp4"}, {"id": 3, "title": "DeFi Protocols", "duration": 40, "videoUrl": "https://example.com/video9.mp4"}]',
       'https://example.com/thumbnails/crypto-trading.jpg', TRUE, 'basic',
       '["Understand blockchain technology", "Trade cryptocurrencies safely", "Navigate DeFi protocols"]',
       '["Basic trading knowledge", "Computer literacy"]',
       756, 423, 4.3, 67, '["cryptocurrency", "blockchain", "defi", "bitcoin"]'),
       
      (4, 'Options Trading Strategies', 'Master advanced options trading techniques and strategies.',
       '{"overview": "Advanced options trading course", "modules": ["Options Basics", "Strategy Implementation", "Risk Management"]}',
       'course', 'advanced', 360,
       '[{"id": 1, "title": "Options Fundamentals", "duration": 50, "videoUrl": "https://example.com/video10.mp4"}, {"id": 2, "title": "Complex Strategies", "duration": 70, "videoUrl": "https://example.com/video11.mp4"}, {"id": 3, "title": "Portfolio Hedging", "duration": 60, "videoUrl": "https://example.com/video12.mp4"}]',
       'https://example.com/thumbnails/options-trading.jpg', TRUE, 'premium',
       '["Master options pricing", "Implement complex strategies", "Hedge portfolio risk"]',
       '["Intermediate trading experience", "Understanding of derivatives"]',
       432, 198, 4.8, 34, '["options", "advanced", "derivatives", "hedging"]'),
       
      (5, 'Market Outlook 2025', 'Join our expert panel discussing market trends and opportunities for 2025.',
       '{"overview": "Live webinar on 2025 market outlook", "agenda": ["Global Economic Trends", "Sector Analysis", "Investment Opportunities"]}',
       'webinar', 'intermediate', 90, NULL,
       'https://example.com/thumbnails/market-outlook-2025.jpg', TRUE, 'basic',
       '["Understand 2025 market trends", "Identify investment opportunities", "Learn from expert analysis"]',
       '["Basic market knowledge", "Interest in market trends"]',
       1890, 1456, 4.6, 203, '["webinar", "market outlook", "2025", "trends"]'),
       
      (6, 'Risk Management Strategies', 'Essential risk management techniques for successful trading.',
       '{"overview": "Comprehensive risk management webinar", "agenda": ["Position Sizing", "Stop Loss Strategies", "Portfolio Diversification"]}',
       'webinar', 'beginner', 75, NULL,
       'https://example.com/thumbnails/risk-management.jpg', TRUE, 'free',
       '["Master position sizing", "Implement stop loss strategies", "Build diversified portfolios"]',
       '["Basic trading knowledge"]',
       2134, 1789, 4.4, 298, '["webinar", "risk management", "beginner", "safety"]');
    `);
    
    console.log('✅ Education tables created and sample data inserted successfully!');
    
    // Verify the data
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM education_content');
    console.log(`📊 Total education content items: ${results[0].count}`);
    
    const [sampleResults] = await sequelize.query('SELECT id, title, type, level FROM education_content LIMIT 3');
    console.log('📝 Sample content:');
    sampleResults.forEach(content => {
      console.log(`- ${content.title} (${content.type}, ${content.level})`);
    });
    
  } catch (error) {
    console.error('❌ Error creating education tables:', error);
    throw error;
  }
};

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createEducationTables()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export default createEducationTables;
