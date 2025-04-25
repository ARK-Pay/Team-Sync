# Team Sync Email System Documentation

## Overview

The Team Sync Email System provides a robust, secure, and scalable solution for sending emails from the application to Gmail accounts. The system includes features such as:

- OAuth 2.0 authentication with Gmail API
- Email templating with HTML support
- Email queuing with priority and retry mechanisms
- Comprehensive error handling and logging
- Security measures to prevent email spoofing and injection
- Monitoring and analytics for email performance

## Architecture

The email system consists of several components:

1. **EmailService**: Handles authentication and transporter creation
2. **MailUtility**: Provides email sending functionality with template support
3. **EmailQueue**: Manages email queuing, prioritization, and retries
4. **EmailLogger**: Logs email activities for monitoring and debugging
5. **EmailMonitoring**: Tracks email performance metrics and provides alerts
6. **Email Security Middleware**: Implements security measures for email operations

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```
# Basic Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_SERVICE=gmail

# OAuth2 for Gmail (Recommended for better security)
GMAIL_CLIENT_ID=your_client_id_from_google_cloud_console
GMAIL_CLIENT_SECRET=your_client_secret_from_google_cloud_console
GMAIL_REFRESH_TOKEN=your_refresh_token

# For SendGrid (Alternative to Gmail)
SENDGRID_API_KEY=your_sendgrid_api_key
```

### 2. OAuth 2.0 Setup for Gmail

To use OAuth 2.0 with Gmail:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Web application type)
5. Set up authorized redirect URIs (include `https://developers.google.com/oauthplayground`)
6. Use the OAuth 2.0 Playground to generate a refresh token:
   - Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Click the gear icon and check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
   - Select the Gmail API v1 scope: `https://mail.google.com/`
   - Click "Authorize APIs" and follow the prompts
   - Click "Exchange authorization code for tokens"
   - Copy the refresh token

### 3. Install Dependencies

```bash
npm install googleapis nodemailer
```

## Usage Examples

### Sending a Simple Email

```javascript
const { sendEmail } = require('../utilities/MailUtility');

// Send a simple email
await sendEmail({
  to: 'recipient@example.com',
  subject: 'Hello from Team Sync',
  text: 'This is a test email from Team Sync.',
  html: '<p>This is a <strong>test email</strong> from Team Sync.</p>'
});
```

### Sending a Templated Email

```javascript
const { sendEmail } = require('../utilities/MailUtility');

// Send a templated email
await sendEmail({
  to: 'recipient@example.com',
  subject: 'Welcome to Team Sync',
  template: 'welcome-email',
  templateData: {
    userName: 'John Doe',
    appName: 'Team Sync',
    year: new Date().getFullYear()
  }
});
```

### Using the Email Queue

```javascript
const emailQueue = require('../utilities/EmailQueue');

// Add an email to the queue with high priority
await emailQueue.addToQueue({
  to: 'recipient@example.com',
  subject: 'Important Notification',
  text: 'This is an important notification.',
  template: 'notification-email',
  templateData: {
    title: 'Important Notification',
    message: 'This is an important notification.',
    actionUrl: 'https://example.com/action',
    actionText: 'Take Action',
    appName: 'Team Sync',
    year: new Date().getFullYear()
  }
}, 'high');
```

## API Endpoints

The email system exposes the following API endpoints:

- `POST /api/email/send`: Send an email
- `POST /api/email/welcome`: Send a welcome email
- `POST /api/email/notification`: Send a notification email
- `GET /api/email/stats`: Get email statistics
- `GET /api/email/queue`: Get email queue status

## Security Considerations

The email system implements several security measures:

1. **OAuth 2.0 Authentication**: Uses modern, secure authentication instead of passwords
2. **Email Validation**: Validates email addresses to prevent injection attacks
3. **Content Sanitization**: Sanitizes email content to prevent XSS
4. **Rate Limiting**: Implements rate limiting to prevent abuse
5. **TLS Encryption**: Uses TLS for secure communication with email servers

## Monitoring and Troubleshooting

The email system includes monitoring and logging features:

1. **Email Logs**: Detailed logs of email activities
2. **Performance Metrics**: Tracks metrics such as delivery rate and open rate
3. **Alerts**: Alerts for high failure or bounce rates
4. **Queue Monitoring**: Monitors the email queue for issues

## Best Practices

1. **Use Templates**: Use email templates for consistent branding and formatting
2. **Implement Queuing**: Use the email queue for high-volume sending
3. **Monitor Performance**: Regularly check email statistics for issues
4. **Secure Credentials**: Keep OAuth credentials and API keys secure
5. **Test Thoroughly**: Test email sending in different scenarios and environments
