const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
require('dotenv').config();

/**
 * Creates and returns a configured nodemailer transporter
 * Uses OAuth2 authentication with Gmail if OAuth credentials are provided
 * Falls back to regular SMTP authentication if OAuth credentials are not available
 */
const createTransporter = async () => {
  // Check if OAuth credentials are available
  if (
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  ) {
    // Use OAuth2 authentication
    const oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    try {
      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            console.error("Failed to get access token", err);
            reject(err);
          }
          resolve(token);
        });
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL_USER,
          accessToken,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN
        },
        tls: {
          rejectUnauthorized: true
        }
      });

      return transporter;
    } catch (error) {
      console.error("OAuth2 authentication failed, falling back to SMTP:", error);
      // Fall back to SMTP if OAuth fails
    }
  }

  // Use regular SMTP authentication as fallback
  console.log("Using regular SMTP authentication");
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: true
    }
  });
};

module.exports = { createTransporter };
