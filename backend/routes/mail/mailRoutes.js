const express = require('express');
const router = express.Router();
const mailController = require('../../controllers/mail/mailController');
const { validateUserToken } = require('../../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(validateUserToken);

// Get emails by folder
router.get('/', mailController.getEmails);

// Get starred emails
router.get('/starred', mailController.getStarredEmails);

// Get single email
router.get('/:emailId', mailController.getEmailById);

// Send email
router.post('/send', mailController.sendEmail);

// Save draft
router.post('/draft', mailController.saveDraft);

// Move email to folder
router.put('/:emailId/move', mailController.moveEmail);

// Toggle star status
router.put('/:emailId/star', mailController.toggleStarStatus);

// Toggle read status
router.put('/:emailId/read', mailController.toggleReadStatus);

// Delete email
router.delete('/:emailId', mailController.deleteEmail);

module.exports = router;
