const { User } = require('../../db/index');
const Mail = require('../../models/mail/Mail');

// Helper function to generate TeamSync email
const generateTeamSyncEmail = (email) => {
  const username = email.split('@')[0].toLowerCase();
  return `${username}@teamsync.com`;
};

// Helper function to find user by TeamSync email
const findUserByTeamSyncEmail = async (email) => {
  return await User.findOne({ teamsync_email: email });
};

// Controller for mail operations
const mailController = {
  // Get all emails for a user based on folder
  getEmails: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { folder = 'inbox' } = req.query;
      
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
      
      console.log(`Fetching emails for folder: ${folder} with query:`, JSON.stringify(query));
      
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
      const { to, cc, bcc, subject, body, attachments } = req.body;

      // Get sender details
      const sender = await User.findOne({ id: senderId });
      if (!sender) {
        return res.status(404).json({ 
          success: false,
          message: 'Sender not found' 
        });
      }

      // Get sender's TeamSync email
      const senderEmail = generateTeamSyncEmail(sender.email);

      // Validate basic recipient format
      if (!to || !Array.isArray(to) || to.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'At least one recipient is required' 
        });
      }

      // Validate all recipients have @teamsync.com domain
      const invalidRecipients = to.filter(email => !email.endsWith('@teamsync.com'));
      if (invalidRecipients.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid email domain for: ${invalidRecipients.join(', ')}. All recipients must have @teamsync.com domain.`
        });
      }

      // Create sent mail with all recipients
      const sentMail = new Mail({
        senderId: sender.id,
        senderName: sender.name,
        senderEmail: senderEmail,
        recipients: to,
        recipientNames: to.map(email => email.split('@')[0]), // Use email username as name
        cc: cc || [],
        bcc: bcc || [],
        subject,
        body,
        hasAttachments: attachments && attachments.length > 0,
        folder: 'sent',
        attachments: attachments || [],
        timestamp: new Date()
      });

      await sentMail.save();

      // Create inbox copies for all recipients
      await Promise.all(to.map(async (recipientEmail) => {
        const recipientCopy = new Mail({
          senderId: sender.id,
          senderName: sender.name,
          senderEmail: senderEmail,
          recipients: [recipientEmail],
          recipientNames: [recipientEmail.split('@')[0]],
          cc: cc || [],
          bcc: bcc || [],
          subject,
          body,
          hasAttachments: attachments && attachments.length > 0,
          folder: 'inbox',
          attachments: attachments || [],
          timestamp: new Date()
        });
        await recipientCopy.save();
      }));

      return res.status(201).json({ 
        success: true,
        message: 'Email sent successfully',
        data: sentMail
      });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error sending email',
        error: error.message
      });
    }
  },
  
  // Save email as draft
  saveDraft: async (req, res) => {
    try {
      const { id: senderId } = req.user;
      const { to, cc, bcc, subject, body, attachments } = req.body;

      // Get sender details
      const sender = await User.findOne({ id: senderId });
      if (!sender) {
        return res.status(404).json({ 
          success: false,
          message: 'Sender not found' 
        });
      }

      // Get sender's TeamSync email
      const senderEmail = generateTeamSyncEmail(sender.email);

      // Create draft mail with any recipients, regardless of whether they exist
      const draftMail = new Mail({
        senderId: sender.id,
        senderName: sender.name,
        senderEmail: senderEmail,
        recipients: to ? to.map(email => email) : [],
        recipientNames: to ? to.map(email => email.split('@')[0]) : [], // Use email username as name
        cc: cc || [],
        bcc: bcc || [],
        subject: subject || '(No Subject)',
        body: body || '',
        hasAttachments: attachments && attachments.length > 0,
        folder: 'drafts',
        attachments: attachments || [],
        timestamp: new Date()
      });

      // Save draft without validating recipients
      await draftMail.save();
      return res.status(201).json({ 
        success: true,
        message: 'Draft saved successfully',
        data: draftMail
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error saving draft',
        error: error.message
      });
    }
  },
  
  // Get starred emails
  getStarredEmails: async (req, res) => {
    try {
      const { id: userId } = req.user;
      
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

      return res.status(200).json({
        success: true,
        data: emails
      });
    } catch (error) {
      console.error('Error fetching starred emails:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error fetching starred emails',
        error: error.message
      });
    }
  },

  // Toggle star status
  toggleStarStatus: async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { emailId } = req.params;

      console.log(`Toggling star status for email: ${emailId} by user: ${userId}`);

      const email = await Mail.findOne({
        _id: emailId,
        $or: [
          { recipients: userId },
          { senderId: userId }
        ]
      });

      if (!email) {
        console.log(`Email not found: ${emailId}`);
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }

      // Toggle star status
      email.isStarred = !email.isStarred;
      await email.save();
      
      console.log(`Star status toggled to: ${email.isStarred} for email: ${emailId}`);

      return res.status(200).json({
        success: true,
        message: `Email ${email.isStarred ? 'starred' : 'unstarred'} successfully`,
        data: email
      });
    } catch (error) {
      console.error('Error toggling star status:', error);
      return res.status(500).json({
        success: false,
        message: 'Error toggling star status',
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
      
      const validFolders = ['inbox', 'sent', 'drafts', 'trash', 'archived'];
      
      if (!validFolders.includes(targetFolder)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid target folder'
        });
      }

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
        // Otherwise, move it to trash
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
  }
};

module.exports = mailController;
