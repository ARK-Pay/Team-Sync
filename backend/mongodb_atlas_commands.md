# MongoDB Atlas Terminal Commands Guide

This guide contains useful terminal commands for working with MongoDB Atlas and your Team Sync application.

## Prerequisites

1. Install MongoDB Database Tools: [https://www.mongodb.com/try/download/database-tools](https://www.mongodb.com/try/download/database-tools)
2. Have your MongoDB Atlas connection string ready

## Environment Setup

```bash
# Create .env file with your MongoDB Atlas connection string
echo "DB_CONNECTION_STRING=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync?retryWrites=true&w=majority" > .env
```

## Database Migration

### Export Local MongoDB Data

```bash
# Export all collections from local MongoDB
mongodump --uri="mongodb://localhost:27017/your_database_name" --out=./mongodb_backup

# Export a specific collection
mongodump --uri="mongodb://localhost:27017/your_database_name" --collection=mails --out=./mongodb_backup
```

### Import Data to MongoDB Atlas

```bash
# Import all collections to MongoDB Atlas
mongorestore --uri="mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync" ./mongodb_backup/your_database_name/

# Import a specific collection
mongorestore --uri="mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync" --collection=mails ./mongodb_backup/your_database_name/mails.bson
```

## Database Management

### Connect to MongoDB Atlas Shell

```bash
# Connect with mongosh (MongoDB Shell)
mongosh "mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync"
```

### Basic MongoDB Commands (after connecting)

```javascript
// Show all databases
show dbs

// Switch to your database
use team-sync

// Show all collections
show collections

// Count documents in a collection
db.mails.countDocuments()

// Find all documents in a collection (limit to 10)
db.mails.find().limit(10)

// Find documents by a specific field
db.mails.find({ folder: "inbox" }).limit(10)

// Update a document
db.mails.updateOne(
  { _id: ObjectId("your_document_id") },
  { $set: { isRead: true } }
)

// Delete a document
db.mails.deleteOne({ _id: ObjectId("your_document_id") })

// Drop a collection
db.mails.drop()
```

## Node.js Scripts

### Run MongoDB Atlas Setup Script

```bash
# Test MongoDB Atlas connection
node scripts/mongodb_atlas_setup.js
```

### Export and Import Data with Custom Scripts

```bash
# Export data from local MongoDB
node scripts/export_mongodb_data.js

# Import data to MongoDB Atlas
node scripts/import_mongodb_data.js
```

## Backup and Restore

```bash
# Create a backup of MongoDB Atlas data
mongodump --uri="mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync" --out=./atlas_backup

# Restore a backup to MongoDB Atlas
mongorestore --uri="mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync" ./atlas_backup/team-sync/
```

## Team Collaboration

### Share Connection String Template

```
DB_CONNECTION_STRING=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync?retryWrites=true&w=majority
```

Replace:
- `<username>` with the database username
- `<password>` with the database password
- `<cluster-name>` with your MongoDB Atlas cluster name

Each team member should create their own `.env` file with this connection string and their credentials.

## Troubleshooting

### Check Connection

```bash
# Ping MongoDB Atlas to verify connectivity
mongosh "mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync" --eval "db.runCommand({ ping: 1 })"
```

### Check Database Status

```bash
# Get server status
mongosh "mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync" --eval "db.serverStatus()"
```

### Reset Network Access

If you get connection errors, you may need to update the IP access list in the MongoDB Atlas dashboard:
1. Go to Network Access in your MongoDB Atlas dashboard
2. Add your current IP address
3. Or select "Allow Access from Anywhere" (for development only) 