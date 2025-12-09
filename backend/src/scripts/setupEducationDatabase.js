import models from '../models/index.js';
import { seedEducationContent } from '../seeders/educationContentSeeder.js';

const { sequelize, EducationContent, UserEducationProgress } = models;

const setupEducationDatabase = async () => {
  try {
    console.log('Setting up education database...');
    
    // Sync the education content tables
    console.log('Creating EducationContent table...');
    await EducationContent.sync({ force: true });
    
    console.log('Creating UserEducationProgress table...');
    await UserEducationProgress.sync({ force: true });
    
    // Seed sample data
    console.log('Seeding education content...');
    await seedEducationContent();
    
    console.log('Education database setup completed successfully!');
    
    // Test the setup by fetching content
    const contentCount = await EducationContent.count();
    console.log(`Total education content items: ${contentCount}`);
    
    const sampleContent = await EducationContent.findAll({
      limit: 3,
      attributes: ['id', 'title', 'type', 'level']
    });
    
    console.log('Sample content:');
    sampleContent.forEach(content => {
      console.log(`- ${content.title} (${content.type}, ${content.level})`);
    });
    
  } catch (error) {
    console.error('Error setting up education database:', error);
    throw error;
  }
};

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupEducationDatabase()
    .then(() => {
      console.log('Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export default setupEducationDatabase;
