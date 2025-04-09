const Mail = require('../../models/mail/Mail');
const User = require('../../models/User');

// Controller for mail operations
const mailController = {
  // Get all emails for a user based on folder
  getEmails: async (req, res) => {
    try {
      const { userId } = req.user; // From auth middleware
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
      }
      
      const emails = await Mail.find(query)
        .sort({ timestamp: -1 })
        .lean();
      
      return res.status(200).json({
        success: true,
        data: emails
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch emails',
        error: error.message
      });
    }
  },
  
  // Get a single email by ID
  getEmailById: async (req, res) => {
    try {
      const { userId } = req.user;
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
      const { userId, name, email: userEmail } = req.user;
      const { to, cc, bcc, subject, body, attachments } = req.body;
      
      // Find recipient users
      const recipientEmails = to.map(email => email.trim());
      const recipients = await User.find({ email: { $in: recipientEmails } });
      
      // Create new mail
      const newMail = new Mail({
        senderId: userId,
        senderName: name,
        senderEmail: userEmail,
        recipients: recipients.map(user => user._id),
        recipientNames: recipients.map(user => user.name),
        cc,
        bcc,
        subject,
        body,
        hasAttachments: attachments && attachments.length > 0,
        attachments,
        folder: 'sent',
        timestamp: new Date()
      });
      
      await newMail.save();
      
      return res.status(201).json({
        success: true,
        message: 'Email sent successfully',
        data: newMail
      });
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
      const { userId, name, email: userEmail } = req.user;
      const { to, cc, bcc, subject, body, attachments, draftId } = req.body;
      
      // Find recipient users if any
      let recipients = [];
      let recipientNames = [];
      
      if (to && to.length > 0) {
        const recipientEmails = to.map(email => email.trim());
        const recipientUsers = await User.find({ email: { $in: recipientEmails } });
        recipients = recipientUsers.map(user => user._id);
        recipientNames = recipientUsers.map(user => user.name);
      }
      
      // Update existing draft or create new one
      if (draftId) {
        const updatedDraft = await Mail.findOneAndUpdate(
          { _id: draftId, senderId: userId, folder: 'drafts' },
          {
            recipients,
            recipientNames,
            cc,
            bcc,
            subject,
            body,
            hasAttachments: attachments && attachments.length > 0,
            attachments,
            timestamp: new Date()
          },
          { new: true }
        );
        
        if (!updatedDraft) {
          return res.status(404).json({
            success: false,
            message: 'Draft not found'
          });
        }
        
        return res.status(200).json({
          success: true,
          message: 'Draft updated successfully',
          data: updatedDraft
        });
      } else {
        // Create new draft
        const newDraft = new Mail({
          senderId: userId,
          senderName: name,
          senderEmail: userEmail,
          recipients,
          recipientNames,
          cc,
          bcc,
          subject,
          body,
          hasAttachments: attachments && attachments.length > 0,
          attachments,
          folder: 'drafts',
          timestamp: new Date()
        });
        
        await newDraft.save();
        
        return res.status(201).json({
          success: true,
          message: 'Draft saved successfully',
          data: newDraft
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save draft',
        error: error.message
      });
    }
  },
  
  // Move email to a different folder
  moveEmail: async (req, res) => {
    try {
      const { userId } = req.user;
      const { emailId } = req.params;
      const { targetFolder } = req.body;
      
      const validFolders = ['inbox', 'trash', 'archived'];
      
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
        message: `Email moved to ${targetFolder}`,
        data: email
      });
    } catch (error) {
      console.error('Error moving email:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to move email',
        error: error.message
      });
    }
  },
  
  // Delete email permanently
  deleteEmail: async (req, res) => {
    try {
      const { userId } = req.user;
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
      const { userId } = req.user;
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
