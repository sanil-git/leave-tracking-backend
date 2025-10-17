/**
 * Setup Test Team Data
 * Run this once to create a test team with manager and members
 * Usage: node setup-test-team.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./User');
const Team = require('./Team');

async function setupTestTeam() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    // 1. Find or create a manager user (you!)
    let manager = await User.findOne({ email: 'sanil@example.com' });
    if (!manager) {
      console.log('ℹ️  Please enter YOUR email (the one you use to login):');
      console.log('   Or update this script with your actual email');
      
      // Try to find the first user and make them a manager
      manager = await User.findOne({});
      if (!manager) {
        console.log('❌ No users found. Please register a user first.');
        process.exit(1);
      }
    }

    // Update user to be a manager
    manager.role = 'manager';
    await manager.save();
    console.log(`✅ Set ${manager.email} as manager`);

    // 2. Check if team already exists
    let team = await Team.findOne({ managerId: manager._id });
    if (team) {
      console.log(`ℹ️  Team "${team.name}" already exists`);
    } else {
      // Create a new team
      team = new Team({
        name: 'Engineering Team',
        description: 'Backend & Frontend developers',
        managerId: manager._id,
        members: []
      });
      await team.save();
      console.log(`✅ Created team: ${team.name}`);
    }

    // 3. Create some test team members (if they don't exist)
    const testMembers = [
      { name: 'John Doe', email: 'john.doe@example.com', role: 'employee' },
      { name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'employee' },
      { name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'employee' },
      { name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'employee' }
    ];

    for (const memberData of testMembers) {
      let member = await User.findOne({ email: memberData.email });
      
      if (!member) {
        // Create new member with default password
        member = new User({
          name: memberData.name,
          email: memberData.email,
          password: 'password123', // Default password for test users
          role: memberData.role,
          teamId: team._id,
          managerId: manager._id
        });
        await member.save();
        console.log(`✅ Created user: ${member.name}`);
      } else {
        // Update existing member
        member.role = memberData.role;
        member.teamId = team._id;
        member.managerId = manager._id;
        await member.save();
        console.log(`✅ Updated user: ${member.name}`);
      }

      // Add to team if not already a member
      if (!team.members.includes(member._id)) {
        team.members.push(member._id);
      }
    }

    await team.save();
    console.log(`✅ Team now has ${team.members.length} members`);

    console.log('\n🎉 Setup complete!');
    console.log('\nTeam Info:');
    console.log(`  Name: ${team.name}`);
    console.log(`  Manager: ${manager.name} (${manager.email})`);
    console.log(`  Members: ${team.members.length}`);
    console.log('\n📝 Next steps:');
    console.log('  1. Start backend: npm start');
    console.log(`  2. Login with: ${manager.email}`);
    console.log('  3. Click "My Team" tab');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

setupTestTeam();

