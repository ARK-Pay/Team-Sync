/**
 * MongoDB Data Export Script
 * 
 * This script exports all collections from your local MongoDB database to JSON files,
 * which can then be imported into MongoDB Atlas.
 * 
 * Usage:
 * 1. Make sure your local MongoDB server is running
 * 2. Run this script with: node scripts/export_mongodb_data.js
 * 3. The data will be exported to the 'exports' folder
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Create exports directory if it doesn't exist
const exportsDir = path.join(__dirname, '..', 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
  console.log('Created exports directory');
}

// Get current timestamp for the export folder name
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const exportFolder = path.join(exportsDir, `export-${timestamp}`);
fs.mkdirSync(exportFolder, { recursive: true });

// Function to export data from MongoDB
async function exportData() {
  // Check if we have a connection string
  if (!process.env.DB_CONNECTION_STRING) {
    console.error('ERROR: DB_CONNECTION_STRING is not defined in .env file');
    console.log('Please add your MongoDB connection string to the .env file.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log('✅ Connected to MongoDB successfully');

    // Get all collection names
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('⚠️ No collections found in the database');
      return;
    }
    
    console.log(`Found ${collections.length} collections to export`);
    
    // Export each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`🔄 Exporting collection: ${collectionName}`);
      
      // Skip system collections
      if (collectionName.startsWith('system.') || collectionName === 'admin') {
        console.log(`⏩ Skipping system collection: ${collectionName}`);
        continue;
      }
      
      // Get all documents from the collection
      const documents = await db.collection(collectionName).find({}).toArray();
      
      // Save documents to a JSON file
      const filePath = path.join(exportFolder, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
      
      console.log(`✅ Exported ${documents.length} documents from ${collectionName} to ${filePath}`);
    }
    
    console.log('\n✅ Export completed successfully!');
    console.log(`📁 Exported data can be found in: ${exportFolder}`);
    console.log('\nTo import this data to MongoDB Atlas, you can use MongoDB Compass:');
    console.log('1. Connect to your MongoDB Atlas cluster in MongoDB Compass');
    console.log('2. For each collection, click on "Add Data" > "Import JSON/CSV file"');
    console.log('3. Select the corresponding JSON file and click "Import"');
    
  } catch (error) {
    console.error('❌ Error during export:', error.message);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the export function
exportData()
  .catch(console.error)
  .finally(() => process.exit()); 