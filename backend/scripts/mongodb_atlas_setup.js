/**
 * MongoDB Atlas Connection Test Script
 * 
 * This script tests your MongoDB Atlas connection and provides information
 * about the connected database. It's useful for verifying your connection
 * string and understanding your database structure.
 * 
 * Usage:
 * 1. Create a .env file with your MongoDB Atlas connection string
 * 2. Run this script with: node scripts/mongodb_atlas_setup.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\x1b[33m%s\x1b[0m', 'No .env file found. Creating a template...');
  const envContent = `# MongoDB Atlas Configuration
DB_CONNECTION_STRING=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync?retryWrites=true&w=majority

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration
MAILER_PASS=your_email_password_here

# Server Configuration
PORT=3001
NODE_ENV=development`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\x1b[32m%s\x1b[0m', '.env template created successfully!');
    console.log('\x1b[33m%s\x1b[0m', 'Please edit the file with your MongoDB Atlas credentials before running this script again.');
    process.exit(0);
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Failed to create .env template:', err);
    process.exit(1);
  }
}

// Check if MongoDB connection string is defined
if (!process.env.DB_CONNECTION_STRING) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: DB_CONNECTION_STRING is not defined in .env file');
  console.log('\x1b[33m%s\x1b[0m', 'Please add your MongoDB Atlas connection string to the .env file.');
  process.exit(1);
}

// Function to test MongoDB Atlas connection
async function testConnection() {
  console.log('\x1b[36m%s\x1b[0m', '🔄 Testing MongoDB Atlas connection...');
  
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log('\x1b[32m%s\x1b[0m', '✅ Successfully connected to MongoDB Atlas!');
    
    // Get database information
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    
    console.log('\x1b[36m%s\x1b[0m', `\nDatabase Information:`);
    console.log('\x1b[36m%s\x1b[0m', `==========================================`);
    console.log('Database Name:  \x1b[33m%s\x1b[0m', dbName);
    console.log('Host:          \x1b[33m%s\x1b[0m', host);
    console.log('Collections:   \x1b[33m%s\x1b[0m', collections.length);
    
    if (collections.length > 0) {
      console.log('\n\x1b[36m%s\x1b[0m', 'Available Collections:');
      console.log('\x1b[36m%s\x1b[0m', `------------------------------------------`);
      
      for (const collection of collections) {
        console.log(`- \x1b[33m${collection.name}\x1b[0m`);
      }
    } else {
      console.log('\n\x1b[33m%s\x1b[0m', 'No collections found. This appears to be a new database.');
    }
    
    console.log('\n\x1b[32m%s\x1b[0m', '✅ Connection test completed successfully!\n');
    console.log('\x1b[36m%s\x1b[0m', 'Your TeamSync application is ready to use MongoDB Atlas.');
    console.log('\x1b[36m%s\x1b[0m', 'Start your server with: npm start\n');
    
    // Check if the necessary collections exist
    const requiredCollections = ['users', 'admins', 'projects', 'tasks', 'mails'];
    const missingCollections = requiredCollections.filter(
      coll => !collections.some(c => c.name === coll || c.name === coll.slice(0, -1))
    );
    
    if (missingCollections.length > 0) {
      console.log('\x1b[33m%s\x1b[0m', 'Warning: Some expected collections are not present:');
      missingCollections.forEach(coll => {
        console.log(`- \x1b[33m${coll}\x1b[0m`);
      });
      console.log('\x1b[33m%s\x1b[0m', 'These will be created automatically when you start the application.');
    }
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error connecting to MongoDB Atlas:');
    console.error('\x1b[31m%s\x1b[0m', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('failed to connect')) {
      console.log('\n\x1b[33m%s\x1b[0m', 'Possible issues:');
      console.log('1. Check your internet connection');
      console.log('2. Verify your MongoDB Atlas connection string');
      console.log('3. Ensure IP access is allowed in MongoDB Atlas Network Access');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n\x1b[33m%s\x1b[0m', 'Authentication failed. Please check:');
      console.log('1. Username and password in your connection string');
      console.log('2. Make sure the user has appropriate permissions');
    }
  } finally {
    // Close the connection
    await mongoose.disconnect();
  }
}

// Run the test
testConnection()
  .catch(console.error)
  .finally(() => process.exit()); 