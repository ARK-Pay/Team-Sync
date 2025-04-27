# MongoDB Atlas Setup Guide for Team Sync

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account using your Google account
2. Once logged in, create a new project named "Team-Sync"

## Step 2: Create a New Cluster

1. Click "Build a Database" 
2. Choose the FREE tier (M0)
3. Select a cloud provider (AWS, Google Cloud, or Azure) - any will work
4. Choose the region closest to your team members
5. Click "Create Cluster" (This may take a few minutes to provision)

## Step 3: Set Up Database Access

1. While your cluster is being created, go to the "Database Access" section in the sidebar
2. Click "Add New Database User"
3. Create a new user with a username and password
   - Username (e.g., "team-sync-admin") 
   - Password: Create a secure password
   - Database User Privileges: "Read and write to any database"
4. Click "Add User"

## Step 4: Set Up Network Access

1. Go to the "Network Access" section in the sidebar
2. Click "Add IP Address"
3. For development purposes, you can select "Allow Access from Anywhere" (0.0.0.0/0)
   - Note: For production, you should restrict this to specific IP addresses
4. Click "Confirm"

## Step 5: Get Your Connection String

1. Go back to "Database" in the sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string that looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database username and password
6. Replace `<database-name>` with "team-sync" (or your preferred database name)

## Step 6: Create .env File

Create a `.env` file in your backend directory with the following content:

```
# MongoDB Atlas Configuration
DB_CONNECTION_STRING=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team-sync?retryWrites=true&w=majority

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration
MAILER_PASS=your_email_password_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

Replace the placeholders with your actual values.

## Step 7: Add Team Members as Database Users (for Collaboration)

1. Go to "Database Access" in MongoDB Atlas
2. Click "Add New Database User"
3. Create a user for each team member with appropriate permissions
   - For co-developers: "Read and write to any database"
   - For read-only members: "Read any database"
4. Send each team member their username and password
5. Every team member should create their own .env file with the connection string

## Step 8: Test the Connection

Update your backend code to use the MongoDB Atlas connection and test it:

```javascript
// In your backend terminal
npm start
```

If successful, you should see "Successfully connected to the database."

## Additional Security Considerations

1. Never commit your .env file to version control
2. Rotate passwords periodically
3. Use environment variables in production environments
4. For production, restrict IP access to known addresses

## Backup and Restore

MongoDB Atlas provides automatic backups for paid tiers. For the free tier, you can manually export your data:

1. Use MongoDB Compass to connect to your Atlas cluster
2. Export collections as needed for backup
3. Import data as needed for restoration 