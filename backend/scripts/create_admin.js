/**
 * Admin Account Creation Script
 * 
 * This script creates an admin account in the MongoDB database.
 * Run this once to set up the admin account with the email "admin3@mail.com"
 * 
 * Usage:
 * node scripts/create_admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Admin } = require('../db/index');

async function createAdmin() {
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

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin3@mail.com' });
    if (existingAdmin) {
      console.log('\x1b[33m%s\x1b[0m', '⚠️ Admin with email admin3@mail.com already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create new admin
    console.log('\x1b[36m%s\x1b[0m', '🔄 Creating admin account...');
    const password_hash = await bcrypt.hash('admin3@1234', 10);
    const admin = new Admin({
      name: 'admin3',
      email: 'admin3@mail.com',
      password_hash
    });

    await admin.save();
    console.log('\x1b[32m%s\x1b[0m', '✅ Admin account created successfully!');
    console.log('\x1b[36m%s\x1b[0m', 'Email: admin3@mail.com');
    console.log('\x1b[36m%s\x1b[0m', 'Password: admin3@1234');

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error creating admin account:');
    console.error(error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the function
createAdmin(); 