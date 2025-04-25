const express = require('express');
const router = express.Router();
const { sendEmail, sendOtpEmail, sendWelcomeEmail, sendNotificationEmail } = require('../utilities/MailUtility');
const emailQueue = require('../utilities/EmailQueue');
const emailMonitoring = require('../utilities/EmailMonitoring');
const { validateEmailRequest, emailRateLimiter } = require('../middlewares/emailSecurityMiddleware');
const { tokenValidation } = require('../middlewares/authMiddleware');

/**
 * @route POST /api/email/send
 * @desc Send an email
 * @access Private
 */
router.post('/send', tokenValidation, validateEmailRequest, emailRateLimiter, async (req, res) => {
  try {
    const { to, subject, text, html, template, templateData, attachments, priority } = req.body;
    
    // Queue the email
    const queueResult = await emailQueue.addToQueue({
      to,
      subject,
      text,
      html,
      template,
      templateData,
      attachments
    }, priority);
    
    res.status(200).json({
      success: true,
      message: 'Email queued successfully',
      queueInfo: queueResult
    });
  } catch (error) {
    console.error('Error queuing email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue email',
      error: error.message
    });
  }
});

/**
 * @route POST /api/email/welcome
 * @desc Send a welcome email
 * @access Private
 */
router.post('/welcome', tokenValidation, async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    await sendWelcomeEmail(email, name || 'User');
    
    res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully'
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send welcome email',
      error: error.message
    });
  }
});

/**
 * @route POST /api/email/notification
 * @desc Send a notification email
 * @access Private
 */
router.post('/notification', tokenValidation, async (req, res) => {
  try {
    const { email, notification } = req.body;
    
    if (!email || !notification) {
      return res.status(400).json({
        success: false,
        message: 'Email and notification details are required'
      });
    }
    
    await sendNotificationEmail(email, notification);
    
    res.status(200).json({
      success: true,
      message: 'Notification email sent successfully'
    });
  } catch (error) {
    console.error('Error sending notification email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification email',
      error: error.message
    });
  }
});

/**
 * @route GET /api/email/stats
 * @desc Get email statistics
 * @access Private (Admin only)
 */
router.get('/stats', tokenValidation, async (req, res) => {
  try {
    const { days } = req.query;
    const stats = await emailMonitoring.getStats(parseInt(days) || 7);
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error retrieving email stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve email statistics',
      error: error.message
    });
  }
});

/**
 * @route GET /api/email/queue
 * @desc Get email queue status
 * @access Private (Admin only)
 */
router.get('/queue', tokenValidation, async (req, res) => {
  try {
    const queueStatus = emailQueue.getQueueStatus();
    
    res.status(200).json({
      success: true,
      queueStatus
    });
  } catch (error) {
    console.error('Error retrieving queue status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve queue status',
      error: error.message
    });
  }
});

module.exports = router;
