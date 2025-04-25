const { sendEmail } = require('./MailUtility');

/**
 * Email Queue Manager
 * Handles email queuing, prioritization, and retries
 */
class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.retryDelay = 60000; // 1 minute
    this.maxRetries = 3;
  }

  /**
   * Add an email to the queue
   * @param {Object} emailOptions - Email options for sendEmail
   * @param {string} priority - Priority level ('high' or 'normal')
   * @returns {Object} Queue status
   */
  async addToQueue(emailOptions, priority = 'normal') {
    const emailTask = {
      options: emailOptions,
      priority: priority === 'high' ? 1 : 0,
      retries: 0,
      addedAt: new Date()
    };

    this.queue.push(emailTask);
    this.queue.sort((a, b) => b.priority - a.priority);

    if (!this.processing) {
      this.processQueue();
    }
    
    return { queued: true, position: this.queue.length };
  }

  /**
   * Process the email queue
   */
  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const task = this.queue.shift();

    try {
      await sendEmail(task.options);
      // Process next email after a short delay to avoid rate limits
      setTimeout(() => this.processQueue(), 200);
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      
      if (task.retries < this.maxRetries) {
        task.retries++;
        // Add back to queue with exponential backoff
        setTimeout(() => {
          this.queue.push(task);
          this.queue.sort((a, b) => b.priority - a.priority);
          if (!this.processing) {
            this.processQueue();
          }
        }, this.retryDelay * Math.pow(2, task.retries - 1));
      } else {
        console.error(`Email to ${task.options.to} failed after ${this.maxRetries} attempts`);
        // Could log to a persistent store or notify admin
      }
      
      // Continue processing queue
      setTimeout(() => this.processQueue(), 200);
    }
  }

  /**
   * Get current queue status
   * @returns {Object} Queue status information
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      highPriorityCount: this.queue.filter(task => task.priority === 1).length,
      normalPriorityCount: this.queue.filter(task => task.priority === 0).length,
      retryingCount: this.queue.filter(task => task.retries > 0).length
    };
  }
}

// Create a singleton instance
const emailQueue = new EmailQueue();
module.exports = emailQueue;
