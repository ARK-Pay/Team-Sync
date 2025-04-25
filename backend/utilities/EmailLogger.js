const fs = require('fs').promises;
const path = require('path');

/**
 * Email Logger
 * Handles logging of email activities for monitoring and debugging
 */
class EmailLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  /**
   * Ensure the log directory exists
   */
  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }

  /**
   * Log email activity
   * @param {string} type - Activity type (success, error, etc.)
   * @param {Object} data - Activity data
   */
  async logEmailActivity(type, data) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        type,
        ...data
      };

      const logFile = path.join(this.logDir, `email-${new Date().toISOString().split('T')[0]}.log`);
      await fs.appendFile(
        logFile,
        JSON.stringify(logEntry) + '\n',
        'utf8'
      );
    } catch (error) {
      console.error('Error logging email activity:', error);
    }
  }

  /**
   * Log successful email sending
   * @param {Object} emailData - Email data
   */
  async logSuccess(emailData) {
    await this.logEmailActivity('success', {
      to: emailData.to,
      subject: emailData.subject,
      messageId: emailData.messageId
    });
  }

  /**
   * Log email sending error
   * @param {Object} emailData - Email data
   * @param {Error} error - Error object
   */
  async logError(emailData, error) {
    await this.logEmailActivity('error', {
      to: emailData.to,
      subject: emailData.subject,
      error: error.message,
      stack: error.stack
    });
  }

  /**
   * Get recent logs
   * @param {number} count - Number of logs to retrieve
   * @returns {Array} Recent logs
   */
  async getRecentLogs(count = 50) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `email-${today}.log`);
      
      try {
        const content = await fs.readFile(logFile, 'utf8');
        return content
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line))
          .slice(-count);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return [];
        }
        throw error;
      }
    } catch (error) {
      console.error('Error retrieving logs:', error);
      return [];
    }
  }
}

// Create a singleton instance
const emailLogger = new EmailLogger();
module.exports = emailLogger;
