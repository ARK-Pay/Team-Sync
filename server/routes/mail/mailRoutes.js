const express = require('express');
const router = express.Router();
const mailController = require('../../controllers/mail/mailController');
const auth = require('../../middleware/auth');

// Apply authentication middleware to all mail routes
router.use(auth);

// Get all emails for a user based on folder
router.get('/', mailController.getEmails);

// Get a single email by ID
router.get('/:emailId', mailController.getEmailById);

// Send a new email
router.post('/send', mailController.sendEmail);

// Save email as draft
router.post('/draft', mailController.saveDraft);

// Move email to a different folder
router.put('/:emailId/move', mailController.moveEmail);

// Delete email (or move to trash)
router.delete('/:emailId', mailController.deleteEmail);

// Mark email as read/unread
router.put('/:emailId/read', mailController.toggleReadStatus);

module.exports = router;
