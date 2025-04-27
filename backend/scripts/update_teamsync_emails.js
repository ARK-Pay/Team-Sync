/**
 * TeamSync Email Update Script
 * 
 * This script updates all users with name-based TeamSync emails if they don't have one.
 * 
 * Usage:
 * node scripts/update_teamsync_emails.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../db/index');

// Helper function to generate TeamSync email based on name and email
const generateTeamSyncEmail = (name, email) => {
  // First try to use the name (removing spaces and special characters)
  let username = name ? name.toLowerCase().replace(/[^a-z0-9]/gi, '') : null;
  
  // If name doesn't produce a valid username, fallback to email
  if (!username || username.length < 3) {
    username = email.split('@')[0].toLowerCase();
  }
  
  return `${username}@teamsync.com`;
};

async function updateTeamSyncEmails() {
  try {
    // Connect to MongoDB
    if (!process.env.DB_CONNECTION_STRING) {
      console.error('\x1b[31m%s\x1b[0m', 'ERROR: DB_CONNECTION_STRING is not defined in .env file');
      console.log('\x1b[33m%s\x1b[0m', 'Please add your MongoDB Atlas connection string to the .env file.');
      process.exit(1);
    }

    console.log('\x1b[36m%s\x1b[0m', '🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log('\x1b[32m%s\x1b[0m', '✅ Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users in the database.`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Update users' TeamSync emails
    for (const user of users) {
      if (!user.teamsync_email) {
        // Generate TeamSync email based on name
        const teamsyncEmail = generateTeamSyncEmail(user.name, user.email);
        
        // Check if this TeamSync email is already in use
        const existing = await User.findOne({ teamsync_email: teamsyncEmail, id: { $ne: user.id } });
        
        if (existing) {
          console.log(`\x1b[33m%s\x1b[0m`, `⚠️ Skipping ${user.name} (${user.email}) - TeamSync email ${teamsyncEmail} already in use by ${existing.name}`);
          skippedCount++;
          continue;
        }
        
        // Update user's TeamSync email
        user.teamsync_email = teamsyncEmail;
        await user.save();
        console.log(`\x1b[32m%s\x1b[0m`, `✅ Updated ${user.name} (${user.email}) with TeamSync email: ${teamsyncEmail}`);
        updatedCount++;
      } else {
        console.log(`\x1b[36m%s\x1b[0m`, `ℹ️ User ${user.name} already has TeamSync email: ${user.teamsync_email}`);
        skippedCount++;
      }
    }

    console.log('\n\x1b[36m%s\x1b[0m', '📊 Summary:');
    console.log('\x1b[36m%s\x1b[0m', `Total users: ${users.length}`);
    console.log('\x1b[32m%s\x1b[0m', `Updated users: ${updatedCount}`);
    console.log('\x1b[33m%s\x1b[0m', `Skipped users: ${skippedCount}`);

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error updating TeamSync emails:');
    console.error(error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the function
updateTeamSyncEmails(); 