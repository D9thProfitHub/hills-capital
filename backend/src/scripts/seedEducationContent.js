import { sequelize } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedEducationContent = async () => {
  try {
    console.log('🌱 Seeding education content...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sample education content
    const educationContent = [
      {
        title: 'Introduction to Trading',
        description: 'Learn the fundamentals of trading in financial markets. This comprehensive course covers basic concepts, terminology, and strategies for beginners.',
        type: 'course',
        is_published: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Technical Analysis Masterclass',
        description: 'Master the art of technical analysis with chart patterns, indicators, and trading signals. Perfect for intermediate traders looking to improve their skills.',
        type: 'course',
        is_published: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Risk Management Strategies',
        description: 'Learn how to protect your capital and manage risk effectively. Essential knowledge for all traders regardless of experience level.',
        type: 'course',
        is_published: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Market Outlook 2025',
        description: 'Join our expert analysts as they discuss market trends, opportunities, and predictions for the upcoming year.',
        type: 'webinar',
        is_published: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Cryptocurrency Trading Basics',
        description: 'Understand the world of cryptocurrency trading, from Bitcoin to altcoins. Learn about exchanges, wallets, and trading strategies.',
        type: 'course',
        is_published: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Options Trading Workshop',
        description: 'Live workshop covering options trading strategies, Greeks, and risk management. Interactive session with Q&A.',
        type: 'webinar',
        is_published: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert education content
    const insertQuery = `
      INSERT INTO education_content (title, description, type, is_published, created_at, updated_at)
      VALUES ?
    `;

    const values = educationContent.map(content => [
      content.title,
      content.description,
      content.type,
      content.is_published,
      content.created_at,
      content.updated_at
    ]);

    await sequelize.query(insertQuery, {
      replacements: [values]
    });

    console.log(`✅ Successfully seeded ${educationContent.length} education content items`);

    // Verify the data
    const [results] = await sequelize.query('SELECT * FROM education_content');
    console.log(`📊 Total education content in database: ${results.length}`);
    
    results.forEach(item => {
      console.log(`- ${item.title} (${item.type}) - Published: ${item.is_published ? 'Yes' : 'No'}`);
    });

  } catch (error) {
    console.error('❌ Error seeding education content:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding
seedEducationContent();
