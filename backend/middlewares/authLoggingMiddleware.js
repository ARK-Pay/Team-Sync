const fs = require('fs');
const path = require('path');

/**
 * Middleware for logging authentication events
 * This helps track potential security issues
 */
const authLogger = (req, res, next) => {
  // Original end function
  const originalEnd = res.end;
  
  // Override end function to log authentication attempts
  res.end = function(chunk, encoding) {
    // Call the original end function
    originalEnd.call(this, chunk, encoding);
    
    // Get request information
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = res.statusCode;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Only log authentication-related endpoints
    if (url.includes('/signin') || url.includes('/signup') || 
        url.includes('/refresh-token') || url.includes('/logout') ||
        url.includes('/reset') || url.includes('/verify')) {
      
      // Create log entry
      const logEntry = {
        timestamp,
        ip,
        method,
        url,
        statusCode,
        userAgent,
        // Include email if available but mask it for privacy
        email: req.body.email ? maskEmail(req.body.email) : 'N/A'
      };
      
      // Determine if this was a successful or failed attempt
      const success = statusCode >= 200 && statusCode < 300;
      const logType = success ? 'success' : 'failed';
      
      // Log to console
      console.log(`AUTH ${logType.toUpperCase()}: ${method} ${url} - ${statusCode} - ${ip} - ${timestamp}`);
      
      // Ensure logs directory exists
      const logsDir = path.join(__dirname, '..', 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      // Write to log file
      const logFile = path.join(logsDir, `auth_${logType}.log`);
      fs.appendFile(
        logFile,
        JSON.stringify(logEntry) + '\n',
        (err) => {
          if (err) {
            console.error('Error writing to auth log:', err);
          }
        }
      );
    }
  };
  
  next();
};

/**
 * Helper function to mask email for privacy in logs
 * e.g., j***@example.com
 */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return 'invalid-email';
  
  const parts = email.split('@');
  const name = parts[0];
  const domain = parts[1];
  
  // Keep first character, mask the rest
  const maskedName = name.charAt(0) + '***';
  
  return `${maskedName}@${domain}`;
};

module.exports = authLogger;
