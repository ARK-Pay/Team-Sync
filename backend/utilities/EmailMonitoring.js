const emailLogger = require('./EmailLogger');

/**
 * Email Monitoring System
 * Tracks email performance metrics and provides alerts for potential issues
 */
class EmailMonitoring {
  constructor() {
    this.stats = {
      sent: 0,
      failed: 0,
      bounced: 0,
      opened: 0,
      dailyCounts: {}
    };
    this.alertThresholds = {
      failureRate: 0.1, // 10% failure rate
      bounceRate: 0.05  // 5% bounce rate
    };
  }

  /**
   * Record a sent email
   */
  recordSent() {
    this.stats.sent++;
    this.updateDailyStats('sent');
  }

  /**
   * Record a failed email
   */
  recordFailed() {
    this.stats.failed++;
    this.updateDailyStats('failed');
    this.checkAlerts();
  }

  /**
   * Record a bounced email
   */
  recordBounced() {
    this.stats.bounced++;
    this.updateDailyStats('bounced');
    this.checkAlerts();
  }

  /**
   * Record an opened email
   */
  recordOpened() {
    this.stats.opened++;
    this.updateDailyStats('opened');
  }

  /**
   * Update daily statistics
   * @param {string} type - Statistic type
   */
  updateDailyStats(type) {
    const today = new Date().toISOString().split('T')[0];
    if (!this.stats.dailyCounts[today]) {
      this.stats.dailyCounts[today] = {
        sent: 0,
        failed: 0,
        bounced: 0,
        opened: 0
      };
    }
    this.stats.dailyCounts[today][type]++;
  }

  /**
   * Check for alert conditions
   */
  checkAlerts() {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = this.stats.dailyCounts[today] || { sent: 0, failed: 0, bounced: 0 };
    
    if (todayStats.sent > 0) {
      const failureRate = todayStats.failed / todayStats.sent;
      const bounceRate = todayStats.bounced / todayStats.sent;
      
      if (failureRate > this.alertThresholds.failureRate) {
        console.error(`ALERT: High email failure rate (${(failureRate * 100).toFixed(2)}%)`);
        // Could trigger notification to admin
      }
      
      if (bounceRate > this.alertThresholds.bounceRate) {
        console.error(`ALERT: High email bounce rate (${(bounceRate * 100).toFixed(2)}%)`);
        // Could trigger notification to admin
      }
    }
  }

  /**
   * Get email statistics
   * @param {number} days - Number of days to include
   * @returns {Object} Email statistics
   */
  async getStats(days = 7) {
    const stats = { ...this.stats };
    
    // Filter daily counts to only include the specified number of days
    const dates = Object.keys(stats.dailyCounts)
      .sort()
      .slice(-days);
    
    stats.dailyCounts = dates.reduce((acc, date) => {
      acc[date] = stats.dailyCounts[date];
      return acc;
    }, {});
    
    // Add recent logs
    stats.recentLogs = await emailLogger.getRecentLogs(10);
    
    return stats;
  }

  /**
   * Calculate delivery rate
   * @returns {number} Delivery rate percentage
   */
  getDeliveryRate() {
    if (this.stats.sent === 0) return 100;
    return ((this.stats.sent - this.stats.failed - this.stats.bounced) / this.stats.sent) * 100;
  }

  /**
   * Calculate open rate
   * @returns {number} Open rate percentage
   */
  getOpenRate() {
    if (this.stats.sent === 0) return 0;
    return (this.stats.opened / this.stats.sent) * 100;
  }
}

// Create a singleton instance
const emailMonitoring = new EmailMonitoring();
module.exports = emailMonitoring;
