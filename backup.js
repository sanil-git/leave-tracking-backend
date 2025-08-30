require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Holiday = require('./Holiday');
const Team = require('./Team');

async function backupData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for backup...');

    // Get all data
    const holidays = await Holiday.find({});
    const teams = await Team.find({});

    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      holidays: holidays,
      teams: teams
    };

    // Save to file
    const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    console.log(`Backup saved to ${filename}`);
    console.log(`Holidays: ${holidays.length}`);
    console.log(`Teams: ${teams.length}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Backup failed:', error);
  }
}

backupData(); 