const { createHash } = require('crypto');

/**
 * Email Security Middleware
 * Provides security functions for email operations
 */

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} Whether the email is valid
 */
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Sanitize email content to prevent XSS
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
const sanitizeEmailContent = (content) => {
  if (!content) return '';
  
  // Basic sanitization - replace potentially dangerous characters
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Generate a signature for email verification
 * @param {string} email - Email address
 * @param {number} timestamp - Timestamp
 * @param {string} secret - Secret key
 * @returns {string} Generated signature
 */
const generateEmailSignature = (email, timestamp, secret) => {
  const data = `${email}|${timestamp}|${secret}`;
  return createHash('sha256').update(data).digest('hex');
};

/**
 * Verify email signature
 * @param {string} email - Email address
 * @param {number} timestamp - Timestamp
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} Whether the signature is valid
 */
const verifyEmailSignature = (email, timestamp, signature, secret) => {
  const expectedSignature = generateEmailSignature(email, timestamp, secret);
  return signature === expectedSignature;
};

/**
 * Rate limiting middleware for email sending
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const emailRateLimiter = (req, res, next) => {
  // Implementation would typically use a rate limiting library or Redis
  // This is a placeholder for demonstration
  next();
};

/**
 * Middleware to validate email request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateEmailRequest = (req, res, next) => {
  const { to, subject, text, html } = req.body;
  
  // Validate recipient email
  if (!to || !validateEmail(to)) {
    return res.status(400).json({ error: 'Invalid recipient email address' });
  }
  
  // Ensure there's content to send
  if (!subject || (!text && !html)) {
    return res.status(400).json({ error: 'Email must have a subject and either text or HTML content' });
  }
  
  // Sanitize content if it's text
  if (text) {
    req.body.text = sanitizeEmailContent(text);
  }
  
  next();
};

module.exports = {
  validateEmail,
  sanitizeEmailContent,
  generateEmailSignature,
  verifyEmailSignature,
  emailRateLimiter,
  validateEmailRequest
};
