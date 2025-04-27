const { User } = require('../../db/index');
const Mail = require('../../models/mail/Mail');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

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

// Helper function to find user by TeamSync email
const findUserByTeamSyncEmail = async (email) => {
  return await User.findOne({ teamsync_email: email });
};

// Helper function to handle TeamSync email recipients
const createUserIfNotExists = async (teamsyncEmail) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ teamsync_email: teamsyncEmail });
    if (existingUser) {
      return existingUser;
    }

    // Extract username from TeamSync email
    const username = teamsyncEmail.split('@')[0];
    
    // Find any users with a similar name in the system
    // This helps to avoid having to create placeholder accounts
    const existingUserByName = await User.findOne({ 
      name: { $regex: new RegExp(username, 'i') } 
    });
    
    if (existingUserByName) {
      // If there's a user with a similar name, assign the TeamSync email to them
      // if they don't already have one
      if (!existingUserByName.teamsync_email) {
        existingUserByName.teamsync_email = teamsyncEmail;
        await existingUserByName.save();
        console.log(`Assigned TeamSync email ${teamsyncEmail} to existing user ${existingUserByName.name}`);
      }
      return existingUserByName;
    }
    
    // We won't create placeholder users with @example.com emails anymore
    console.log(`No existing user found for TeamSync email: ${teamsyncEmail}`);
    return null;
  } catch (error) {
    console.error(`Error handling TeamSync email ${teamsyncEmail}:`, error);
    return null;
  }
};

// Controller for mail operations
const mailController = {
  // Get all emails for a user based on folder
  getEmails: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { folder = 'inbox' } = req.query;
      
      console.log(`Getting emails for user: ${userId} in folder: ${folder}`);
      
      let query = {};
      
      // Different query based on folder
      if (folder === 'inbox') {
        query = { recipients: userId, folder: 'inbox' };
      } else if (folder === 'sent') {
        query = { senderId: userId, folder: 'sent' };
      } else if (folder === 'drafts') {
        query = { senderId: userId, folder: 'drafts' };
      } else if (folder === 'trash') {
        query = { 
          $or: [
            { recipients: userId, folder: 'trash' },
            { senderId: userId, folder: 'trash' }
          ]
        };
      } else if (folder === 'archived') {
        query = { 
          $or: [
            { recipients: userId, folder: 'archived' },
            { senderId: userId, folder: 'archived' }
          ]
        };
      } else if (folder === 'starred') {
        query = {
          $and: [
            {
              $or: [
                { recipients: userId },
                { senderId: userId }
              ]
            },
            { isStarred: true }
          ]
        };
      }
      
      console.log(`Query for folder ${folder}:`, JSON.stringify(query));
      
      const emails = await Mail.find(query)
        .sort({ timestamp: -1 })
        .lean();
      
      console.log(`Found ${emails.length} emails for folder: ${folder}`);
      
      return res.status(200).json({
        success: true,
        data: emails
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching emails',
        error: error.message
      });
    }
  },
  
  // Get a single email by ID
  getEmailById: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { emailId } = req.params;
      
      console.log(`Getting email with ID: ${emailId} for user: ${userId}`);
      
      const email = await Mail.findOne({
        _id: emailId,
        $or: [
          { recipients: userId },
          { senderId: userId }
        ]
      }).lean();
      
      if (!email) {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }
      
      // Mark as read if it's not already and the user is a recipient
      if (!email.isRead && email.recipients.includes(userId)) {
        await Mail.findByIdAndUpdate(emailId, { isRead: true });
      }
      
      return res.status(200).json({
        success: true,
        data: email
      });
    } catch (error) {
      console.error('Error fetching email:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch email',
        error: error.message
      });
    }
  },
  
  // Send a new email
  sendEmail: async (req, res) => {
    try {
      const { id: senderId } = req.user;
      const { to, cc, bcc, subject, body, attachments, draftId } = req.body;

      console.log(`Sending email from user: ${senderId} to:`, to);
      console.log('Request body:', req.body);

      // Validate required fields
      if (!to || !Array.isArray(to) || to.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'At least one recipient is required' 
        });
      }

      // Get sender details - using findOne with id field instead of findById
      const sender = await User.findOne({ id: senderId });
      if (!sender) {
        console.error(`Sender not found with id: ${senderId}`);
        return res.status(404).json({ 
          success: false,
          message: 'Sender not found' 
        });
      }

      console.log('Sender found:', { 
        id: sender.id, 
        name: sender.name, 
        email: sender.email,
        teamsync_email: sender.teamsync_email
      });

      // Get sender's TeamSync email
      const senderEmail = sender.teamsync_email || generateTeamSyncEmail(sender.name, sender.email);
      
      // Update sender's TeamSync email if it doesn't exist
      if (!sender.teamsync_email) {
        sender.teamsync_email = senderEmail;
        await sender.save();
        console.log(`Updated sender's TeamSync email: ${senderEmail}`);
      }

      // Process recipients
      const recipientIds = [];
      const recipientNames = [];
      const invalidRecipients = [];
      const nonExistentUsers = [];
      
      for (const recipientEmail of to) {
        // Validate email format
        if (!recipientEmail.endsWith('@teamsync.com')) {
          invalidRecipients.push(recipientEmail);
          console.log(`Invalid recipient email format: ${recipientEmail}`);
          continue;
        }
        
        try {
          // Find recipient by TeamSync email or create if not exists
          let recipient = await findUserByTeamSyncEmail(recipientEmail);
          
          // If recipient doesn't exist
          if (!recipient) {
            console.log(`Recipient not found for email: ${recipientEmail}`);
            // Extract the username to provide better feedback
            const username = recipientEmail.split('@')[0];
            nonExistentUsers.push({
              email: recipientEmail,
              username: username
            });
            continue;
          }
          
          console.log(`Recipient found: ${recipient.name} (${recipient.id})`);
          recipientIds.push(recipient.id); // Use the UUID id field, not _id
          recipientNames.push(recipient.name || 'TeamSync User');
        } catch (err) {
          console.error(`Error finding recipient for email ${recipientEmail}:`, err);
          invalidRecipients.push(recipientEmail);
        }
      }
      
      if (recipientIds.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: nonExistentUsers.length > 0 
            ? 'Recipients must be registered in the system before you can email them' 
            : 'No valid recipients found',
          invalidRecipients: invalidRecipients,
          nonExistentUsers: nonExistentUsers
        });
      }

      // If there were some invalid recipients but at least one valid recipient
      const hasInvalidRecipients = invalidRecipients.length > 0 || nonExistentUsers.length > 0;

      try {
        // Create the email
        const email = new Mail({
          senderId: sender.id, // Use the UUID id field, not _id
          senderName: sender.name || sender.username,
          senderEmail: senderEmail,
          recipients: recipientIds,
          recipientNames: recipientNames,
          cc: cc || [],
          bcc: bcc || [],
          subject: subject || '(No Subject)',
          body: body || '',
          hasAttachments: attachments && attachments.length > 0,
          attachments: attachments || [],
          folder: 'sent',
          timestamp: new Date()
        });

        await email.save();
        console.log(`Email saved with ID: ${email._id}`);

        // Create copies for each recipient's inbox
        for (let i = 0; i < recipientIds.length; i++) {
          const inboxCopy = new Mail({
            senderId: sender.id, // Use the UUID id field, not _id
            senderName: sender.name || sender.username,
            senderEmail: senderEmail,
            recipients: [recipientIds[i]],
            recipientNames: [recipientNames[i]],
            cc: cc || [],
            bcc: bcc || [],
            subject: subject || '(No Subject)',
            body: body || '',
            hasAttachments: attachments && attachments.length > 0,
            attachments: attachments || [],
            folder: 'inbox',
            isRead: false,
            timestamp: new Date()
          });
          
          await inboxCopy.save();
          console.log(`Inbox copy created for recipient: ${recipientIds[i]}`);
        }

        // Delete the draft if this was sent from a draft
        if (draftId) {
          try {
            await Mail.findByIdAndDelete(draftId);
            console.log(`Draft deleted: ${draftId}`);
          } catch (err) {
            console.error(`Error deleting draft ${draftId}:`, err);
            // Continue even if draft deletion fails
          }
        }

        let responseMessage = 'Email sent successfully';
        if (hasInvalidRecipients) {
          if (nonExistentUsers.length > 0) {
            responseMessage = `Email sent successfully to valid recipients. Some recipients are not registered users yet.`;
          } else {
            responseMessage = `Email sent successfully to valid recipients, but some recipients were invalid.`;
          }
        }

        return res.status(201).json({
          success: true,
          message: responseMessage,
          data: email,
          invalidRecipients: invalidRecipients.length > 0 ? invalidRecipients : undefined,
          nonExistentUsers: nonExistentUsers.length > 0 ? nonExistentUsers : undefined
        });
      } catch (err) {
        console.error('Error creating or saving email:', err);
        return res.status(500).json({
          success: false,
          message: 'Error creating or saving email',
          error: err.message
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: error.message
      });
    }
  },
  
  // Save email as draft
  saveDraft: async (req, res) => {
    try {
      const { id: senderId } = req.user;
      const { to, cc, bcc, subject, body, attachments, draftId } = req.body;
      
      console.log(`Saving draft for user: ${senderId}`);
      
      // Get sender details
      const sender = await User.findOne({ id: senderId });
      if (!sender) {
        return res.status(404).json({ 
          success: false,
          message: 'Sender not found' 
        });
      }
      
      // Get sender's TeamSync email
      const senderEmail = sender.teamsync_email || generateTeamSyncEmail(sender.name, sender.email);
      
      // Process recipients if provided
      let recipientIds = [];
      let recipientNames = [];
      
      if (to && Array.isArray(to) && to.length > 0) {
        for (const recipientEmail of to) {
          // Find recipient by TeamSync email
          const recipient = await findUserByTeamSyncEmail(recipientEmail);
          
          if (recipient) {
            recipientIds.push(recipient.id);
            recipientNames.push(recipient.name || recipient.username || 'Unknown User');
          }
        }
      }
      
      // Create or update the draft
      let draft;
      
      if (draftId) {
        // Update existing draft
        draft = await Mail.findOne({
          _id: draftId,
          senderId: senderId,
          folder: 'drafts'
        });
        
        if (!draft) {
          return res.status(404).json({
            success: false,
            message: 'Draft not found'
          });
        }
        
        // Update draft fields
        draft.recipients = recipientIds;
        draft.recipientNames = recipientNames;
        draft.cc = cc || [];
        draft.bcc = bcc || [];
        draft.subject = subject || '(No Subject)';
        draft.body = body || '';
        draft.hasAttachments = attachments && attachments.length > 0;
        draft.attachments = attachments || [];
        draft.timestamp = new Date();
        
        await draft.save();
        console.log(`Draft updated with ID: ${draft._id}`);
      } else {
        // Create new draft
        draft = new Mail({
          senderId: sender.id,
          senderName: sender.name || sender.username,
          senderEmail: senderEmail,
          recipients: recipientIds,
          recipientNames: recipientNames,
          cc: cc || [],
          bcc: bcc || [],
          subject: subject || '(No Subject)',
          body: body || '',
          hasAttachments: attachments && attachments.length > 0,
          attachments: attachments || [],
          folder: 'drafts',
          timestamp: new Date()
        });
        
        await draft.save();
        console.log(`New draft created with ID: ${draft._id}`);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Draft saved successfully',
        data: draft
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save draft',
        error: error.message
      });
    }
  },
  
  // Get starred emails
  getStarredEmails: async (req, res) => {
    try {
      const { id: userId } = req.user;
      
      console.log(`Getting starred emails for user: ${userId}`);
      
      const emails = await Mail.find({
        $and: [
          {
            $or: [
              { recipients: userId },
              { senderId: userId }
            ]
          },
          { isStarred: true }
        ]
      })
      .sort({ timestamp: -1 })
      .lean();
      
      console.log(`Found ${emails.length} starred emails`);
      
      return res.status(200).json({
        success: true,
        data: emails
      });
    } catch (error) {
      console.error('Error fetching starred emails:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch starred emails',
        error: error.message
      });
    }
  },
  
  // Toggle star status
  toggleStarStatus: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { emailId } = req.params;
      const { isStarred } = req.body;
      
      console.log(`Toggling star status for email: ${emailId}, user: ${userId}`);
      
      const email = await Mail.findOne({
        _id: emailId,
        $or: [
          { recipients: userId },
          { senderId: userId }
        ]
      });
      
      if (!email) {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }
      
      // Toggle star status or set to provided value
      email.isStarred = isStarred !== undefined ? isStarred : !email.isStarred;
      await email.save();
      
      return res.status(200).json({
        success: true,
        message: `Email ${email.isStarred ? 'starred' : 'unstarred'} successfully`,
        data: email
      });
    } catch (error) {
      console.error('Error toggling star status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to toggle star status',
        error: error.message
      });
    }
  },
  
  // Move email to a different folder
  moveEmail: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { emailId } = req.params;
      const { targetFolder } = req.body;
      
      console.log(`Moving email ${emailId} to ${targetFolder} for user ${userId}`);
      
      const email = await Mail.findOne({
        _id: emailId,
        $or: [
          { recipients: userId },
          { senderId: userId }
        ]
      });
      
      if (!email) {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }
      
      // Save the previous folder when moving to trash or archived
      if (targetFolder === 'trash' || targetFolder === 'archived') {
        // Don't overwrite previousFolder if already in trash or archived
        if (email.folder !== 'trash' && email.folder !== 'archived') {
          email.previousFolder = email.folder;
        }
      } 
      // When moving from trash or archived to inbox, check if we should restore to previous folder
      else if (targetFolder === 'inbox' && (email.folder === 'trash' || email.folder === 'archived')) {
        // If we have a valid previous folder, use that instead of inbox
        if (email.previousFolder && email.previousFolder !== 'trash' && email.previousFolder !== 'archived') {
          console.log(`Restoring email from ${email.folder} to previous folder: ${email.previousFolder}`);
          email.folder = email.previousFolder;
          
          await email.save();
          
          return res.status(200).json({
            success: true,
            message: `Email restored to ${email.previousFolder} successfully`,
            data: email
          });
        }
      }
      
      // Set the new folder
      email.folder = targetFolder;
      
      await email.save();
      
      return res.status(200).json({
        success: true,
        message: `Email moved to ${targetFolder} successfully`,
        data: email
      });
    } catch (error) {
      console.error('Error moving email:', error);
      return res.status(500).json({
        success: false,
        message: 'Error moving email',
        error: error.message
      });
    }
  },
  
  // Delete email permanently
  deleteEmail: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { emailId } = req.params;
      
      console.log(`Deleting email: ${emailId} for user: ${userId}`);
      
      const email = await Mail.findOne({
        _id: emailId,
        $or: [
          { recipients: userId },
          { senderId: userId }
        ]
      });
      
      if (!email) {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }
      
      // If the email is already in trash, delete it permanently
      if (email.folder === 'trash') {
        await Mail.findByIdAndDelete(emailId);
        
        return res.status(200).json({
          success: true,
          message: 'Email deleted permanently'
        });
      } else {
        // Otherwise, move it to trash and save the previous folder
        email.previousFolder = email.folder;
        email.folder = 'trash';
        await email.save();
        
        return res.status(200).json({
          success: true,
          message: 'Email moved to trash',
          data: email
        });
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete email',
        error: error.message
      });
    }
  },
  
  // Mark email as read/unread
  toggleReadStatus: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { emailId } = req.params;
      const { isRead } = req.body;
      
      console.log(`Toggling read status for email: ${emailId}, user: ${userId}, isRead: ${isRead}`);
      
      const email = await Mail.findOne({
        _id: emailId,
        $or: [
          { recipients: userId },
          { senderId: userId }
        ]
      });
      
      if (!email) {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }
      
      email.isRead = isRead;
      await email.save();
      
      return res.status(200).json({
        success: true,
        message: `Email marked as ${isRead ? 'read' : 'unread'}`,
        data: email
      });
    } catch (error) {
      console.error('Error updating read status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update read status',
        error: error.message
      });
    }
  },
  
  // Special handler for moving drafts to trash (to fix the 404 issue)
  moveDraftToTrash: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { emailId } = req.body;
      
      console.log(`Moving draft to trash: ${emailId} by user: ${userId}`);
      
      // Find the draft email
      const email = await Mail.findOne({
        _id: emailId,
        senderId: userId,
        folder: 'drafts'
      });

      if (!email) {
        console.log(`Draft email not found: ${emailId}`);
        return res.status(404).json({
          success: false,
          message: 'Draft email not found'
        });
      }

      // Save the previous folder before moving to trash
      email.previousFolder = 'drafts';
      
      // Move the email to trash
      email.folder = 'trash';
      await email.save();

      console.log(`Draft moved to trash successfully: ${emailId}`);

      return res.status(200).json({
        success: true,
        message: 'Draft moved to trash successfully',
        data: email
      });
    } catch (error) {
      console.error('Error moving draft to trash:', error);
      return res.status(500).json({
        success: false,
        message: 'Error moving draft to trash',
        error: error.message
      });
    }
  },
};

module.exports = mailController;
