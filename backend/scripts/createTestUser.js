const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('../db/index');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log("Connecting to database...");
    console.log("Connection string:", process.env.DB_CONNECTION_STRING ? "Defined" : "Undefined");
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

// Create test user
const createTestUser = async () => {
  try {
    console.log("Checking if test user already exists...");
    // Check if user already exists
    const existingUser = await User.findOne({ teamsync_email: 'kshitij@teamsync.com' });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      return;
    }
    
    console.log("Creating new test user...");
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash('password123', saltRounds);
    
    // Create new user
    const newUser = new User({
      name: 'Kshitij',
      email: 'kshitij@example.com',
      teamsync_email: 'kshitij@teamsync.com',
      password_hash,
      state: 'verified' // Set to verified so you can use it immediately
    });
    
    await newUser.save();
    console.log('Test user created successfully:', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      teamsync_email: newUser.teamsync_email
    });
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run the script
(async () => {
  try {
    console.log("Starting script...");
    await connectDB();
    await createTestUser();
    console.log("Script completed successfully");
  } catch (error) {
    console.error("Script failed with error:", error);
  }
})();
