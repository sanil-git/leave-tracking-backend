require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Holiday = require('./Holiday');
const Team = require('./Team');

async function restoreData(backupFile) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for restore...');

    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`Restoring from backup: ${backupData.timestamp}`);

    // Clear existing data
    await Holiday.deleteMany({});
    await Team.deleteMany({});
    console.log('Cleared existing data');

    // Restore holidays
    if (backupData.holidays && backupData.holidays.length > 0) {
      await Holiday.insertMany(backupData.holidays);
      console.log(`Restored ${backupData.holidays.length} holidays`);
    }

    // Restore teams
    if (backupData.teams && backupData.teams.length > 0) {
      await Team.insertMany(backupData.teams);
      console.log(`Restored ${backupData.teams.length} teams`);
    }

    console.log('Restore completed successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Restore failed:', error);
  }
}

// Get backup file from command line argument
const backupFile = process.argv[2];
if (!backupFile) {
  console.log('Usage: node restore.js <backup-file.json>');
  console.log('Example: node restore.js backup-2025-07-26.json');
  process.exit(1);
}

restoreData(backupFile); 