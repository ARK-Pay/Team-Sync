/**
 * MongoDB Data Import Script
 * 
 * This script imports JSON files exported from a local MongoDB database into MongoDB Atlas.
 * It should be used after running the export_mongodb_data.js script.
 * 
 * Usage:
 * 1. Make sure your MongoDB Atlas connection string is set in your .env file
 * 2. Run this script with: node scripts/import_mongodb_data.js [export_folder_path]
 *    - If export_folder_path is not provided, it will use the most recent export in the exports folder
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Function to get the most recent export folder
function getMostRecentExportFolder() {
  const exportsDir = path.join(__dirname, '..', 'exports');
  
  if (!fs.existsSync(exportsDir)) {
    console.error('❌ Exports directory does not exist');
    process.exit(1);
  }
  
  const exportFolders = fs.readdirSync(exportsDir)
    .filter(folder => folder.startsWith('export-'))
    .map(folder => path.join(exportsDir, folder));
  
  if (exportFolders.length === 0) {
    console.error('❌ No export folders found');
    process.exit(1);
  }
  
  // Sort folders by creation time (most recent first)
  exportFolders.sort((a, b) => {
    return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
  });
  
  return exportFolders[0];
}

// Function to import data into MongoDB Atlas
async function importData(exportFolder) {
  // Check if we have a connection string
  if (!process.env.DB_CONNECTION_STRING) {
    console.error('❌ ERROR: DB_CONNECTION_STRING is not defined in .env file');
    console.log('Please add your MongoDB Atlas connection string to the .env file.');
    process.exit(1);
  }

  // Check if the connection string is for MongoDB Atlas
  if (!process.env.DB_CONNECTION_STRING.includes('mongodb+srv')) {
    console.warn('⚠️  WARNING: Your connection string does not appear to be for MongoDB Atlas');
    console.log('Make sure you are importing to the correct database');
    
    // Ask for confirmation before proceeding
    console.log('\nPress Ctrl+C to cancel or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log('✅ Connected to MongoDB Atlas successfully');

    const db = mongoose.connection.db;
    
    // Get all JSON files in the export folder
    const jsonFiles = fs.readdirSync(exportFolder)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(exportFolder, file));
    
    if (jsonFiles.length === 0) {
      console.error('❌ No JSON files found in the export folder');
      return;
    }
    
    console.log(`Found ${jsonFiles.length} JSON files to import`);
    
    // Import each JSON file
    for (const jsonFile of jsonFiles) {
      const fileName = path.basename(jsonFile);
      const collectionName = fileName.replace('.json', '');
      
      console.log(`🔄 Importing ${fileName} into collection: ${collectionName}`);
      
      // Read the JSON file
      const jsonContent = fs.readFileSync(jsonFile, 'utf8');
      const documents = JSON.parse(jsonContent);
      
      if (documents.length === 0) {
        console.log(`⏩ Skipping empty collection: ${collectionName}`);
        continue;
      }
      
      // Check if collection exists and drop it if it does
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length > 0) {
        console.log(`⚠️  Collection ${collectionName} already exists, dropping it...`);
        await db.collection(collectionName).drop();
      }
      
      // Insert documents into the collection
      const result = await db.collection(collectionName).insertMany(documents);
      console.log(`✅ Imported ${result.insertedCount} documents into ${collectionName}`);
    }
    
    console.log('\n✅ Import completed successfully!');
    console.log('Your data has been imported into MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Error during import:', error.message);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

// Main execution
async function main() {
  // Get export folder path from command line arguments or use the most recent one
  let exportFolder = process.argv[2];
  
  if (!exportFolder) {
    exportFolder = getMostRecentExportFolder();
    console.log(`Using most recent export folder: ${exportFolder}`);
  } else if (!fs.existsSync(exportFolder)) {
    console.error(`❌ Export folder does not exist: ${exportFolder}`);
    process.exit(1);
  }
  
  // Import data
  await importData(exportFolder);
}

// Run the import function
main()
  .catch(console.error)
  .finally(() => process.exit(0)); 