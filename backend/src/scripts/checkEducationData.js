import { sequelize } from '../config/db.js';

const checkEducationData = async () => {
  try {
    console.log('Checking education content data...');
    
    // Check all education content
    const [allResults] = await sequelize.query('SELECT id, title, type, isPublished FROM education_content');
    console.log(`📊 Total education content items: ${allResults.length}`);
    
    if (allResults.length > 0) {
      console.log('\n📝 All content:');
      allResults.forEach(content => {
        console.log(`- ID: ${content.id}, Title: "${content.title}", Type: ${content.type}, Published: ${content.isPublished}`);
      });
      
      // Check published content
      const [publishedResults] = await sequelize.query('SELECT id, title, type FROM education_content WHERE isPublished = true');
      console.log(`\n✅ Published content items: ${publishedResults.length}`);
      
      if (publishedResults.length > 0) {
        publishedResults.forEach(content => {
          console.log(`- ID: ${content.id}, Title: "${content.title}", Type: ${content.type}`);
        });
      }
      
      // Update all content to be published
      console.log('\n🔄 Setting all content to published...');
      await sequelize.query('UPDATE education_content SET isPublished = true');
      console.log('✅ All content is now published');
      
    } else {
      console.log('❌ No education content found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking education data:', error);
    throw error;
  }
};

checkEducationData()
  .then(() => {
    console.log('✅ Data check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Data check failed:', error);
    process.exit(1);
  });
