const nodemailer = require('nodemailer');
require("dotenv").config();
const fs = require('fs').promises;
const path = require('path');
const { createTransporter } = require('./EmailService');

// Function to send templated emails
const sendEmail = async (options) => {
  try {
    const {
      to,
      subject,
      text,
      html,
      attachments = [],
      template,
      templateData = {}
    } = options;

    let emailHtml = html;

    // If template is provided, use it
    if (template) {
      try {
        const templatePath = path.join(__dirname, '../templates', `${template}.html`);
        let templateContent = await fs.readFile(templatePath, 'utf8');
        
        // Replace template variables with actual data
        Object.keys(templateData).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          templateContent = templateContent.replace(regex, templateData[key]);
        });
        
        emailHtml = templateContent;
      } catch (error) {
        console.error('Error loading email template:', error);
        // Fallback to text if template fails
        emailHtml = `<p>${text || ''}</p>`;
      }
    }

    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"Team Sync" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: emailHtml || '',
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Function to send OTP email (maintaining backward compatibility)
const sendOtpEmail = async (recipientEmail, otp, message) => {
  try {
    return await sendEmail({
      to: recipientEmail,
      subject: 'Your OTP Code',
      text: `${message}: ${otp}`,
      template: 'otp-email',
      templateData: {
        message,
        otp,
        appName: 'Team Sync',
        year: new Date().getFullYear()
      }
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email.');
  }
};

// Function to send welcome email to new users
const sendWelcomeEmail = async (recipientEmail, userName) => {
  try {
    return await sendEmail({
      to: recipientEmail,
      subject: 'Welcome to Team Sync!',
      text: `Hello ${userName}, welcome to Team Sync! We're excited to have you on board.`,
      template: 'welcome-email',
      templateData: {
        userName,
        appName: 'Team Sync',
        year: new Date().getFullYear()
      }
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email.');
  }
};

// Function to send notification email
const sendNotificationEmail = async (recipientEmail, notification) => {
  try {
    return await sendEmail({
      to: recipientEmail,
      subject: notification.subject,
      text: notification.message,
      template: 'notification-email',
      templateData: {
        title: notification.subject,
        message: notification.message,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        appName: 'Team Sync',
        year: new Date().getFullYear()
      }
    });
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw new Error('Failed to send notification email.');
  }
};

module.exports = { 
  sendOtpEmail,
  sendEmail,
  sendWelcomeEmail,
  sendNotificationEmail
};
