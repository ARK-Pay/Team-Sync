# Team Sync Mail Feature Guide

This guide explains how to use the mail feature in the Team Sync application with MongoDB Atlas as the database.

## Overview

The Team Sync application includes an internal mail system that allows team members to communicate within the platform. The mail feature stores messages in MongoDB and uses a custom mail schema.

## Mail Feature Components

1. **MongoDB Schema (`models/mail/Mail.js`)**:
   - Stores mail messages with attachments, recipients, and metadata
   - Tracks mail status (read, starred, etc.)
   - Organizes mail into folders (inbox, sent, drafts, trash, archived)

2. **Mail Controller (`controllers/mail/mailController.js`)**:
   - Handles CRUD operations for emails
   - Manages sending, receiving, and organizing emails
   - Provides APIs for the frontend to interact with

3. **Mail Routes (`routes/mail/mailRoutes.js`)**:
   - Defines API endpoints for the mail feature
   - Routes mail-related requests to the appropriate controller functions

4. **External Email Integration (`utilities/MailUtility.js`)**:
   - Uses Nodemailer to send OTP verification emails to external email addresses
   - Configured with Gmail SMTP

## How Mail Works in Team Sync

The mail system in Team Sync is completely internal - messages are stored in the MongoDB database and do not go through external email servers for internal communication. 

Users have a TeamSync email address format: `username@teamsync.com`. This is used for internal messaging only.

## Setting Up Mail with MongoDB Atlas

When you migrate to MongoDB Atlas, the mail feature will work automatically with your new database. No special configuration is needed beyond setting up MongoDB Atlas itself.

## Mail Collection in MongoDB

After migration, you'll have a `mails` collection in your MongoDB Atlas database containing all mail messages.

## Mail Feature APIs

The mail feature provides the following API endpoints:

1. **Get emails by folder**: `GET /mail?folder=inbox`
2. **Get starred emails**: `GET /mail/starred`
3. **Get single email**: `GET /mail/:emailId`
4. **Send email**: `POST /mail/send`
5. **Save draft**: `POST /mail/draft`
6. **Move email to folder**: `PUT /mail/:emailId/move`
7. **Move draft to trash**: `POST /mail/move-draft-to-trash`
8. **Toggle star status**: `PUT /mail/:emailId/star`
9. **Toggle read status**: `PUT /mail/:emailId/read`
10. **Delete email**: `DELETE /mail/:emailId`

## Testing Mail with MongoDB Atlas

After setting up MongoDB Atlas, you can test the mail feature by:

1. Running the `mongodb_atlas_setup.js` script to verify your connection
2. Starting the backend server with `npm start`
3. Using the frontend to send a test email between users

## Troubleshooting

If you encounter issues with the mail feature after migrating to MongoDB Atlas:

1. **Check MongoDB Atlas Connection**:
   - Verify that your application can connect to MongoDB Atlas
   - Run the `mongodb_atlas_setup.js` script

2. **Check Mail Schema**:
   - Verify that the `mails` collection exists in your Atlas database
   - Make sure the schema matches the expected structure

3. **Check User TeamSync Emails**:
   - Ensure that users have valid TeamSync email addresses
   - The format should be `username@teamsync.com`

4. **External Emails**:
   - For external emails (OTP verification), check your `.env` file for the `MAILER_PASS` variable
   - Make sure your Gmail account has "Less secure app access" enabled or use an App Password

## Best Practices

1. **Regular Backups**:
   - MongoDB Atlas provides automated backups
   - For additional safety, use the export script periodically

2. **Email Cleanup**:
   - Implement a policy for email retention
   - Users should regularly clean their trash folder

3. **Large Attachments**:
   - Be mindful of database size when sending attachments
   - Consider implementing attachment size limits 