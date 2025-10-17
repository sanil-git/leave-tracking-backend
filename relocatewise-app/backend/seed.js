const mongoose = require('mongoose');
require('dotenv').config();
const { seedSuggestions } = require('./utils/seedData');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Seed suggestions
    await seedSuggestions();
    
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
