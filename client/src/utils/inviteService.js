import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Send video call invitations to multiple email addresses
 * @param {Array} emails - Array of email addresses to invite
 * @param {string} message - Custom message for the invitation
 * @param {string} meetingCode - The meeting code for the call
 * @param {string} userEmail - The email of the user sending the invitation
 * @returns {Promise} Promise that resolves when invites are sent
 */
export const sendVideoCallInvites = async (emails, message, meetingCode, userEmail) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/invites/send`, {
      emails,
      message,
      meetingCode,
      from: userEmail
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending invites:', error);
    throw error;
  }
};

/**
 * Parse a string of comma-separated emails into an array
 * @param {string} emailString - Comma-separated email addresses
 * @returns {Array} Array of trimmed valid email addresses
 */
export const parseEmailList = (emailString) => {
  if (!emailString) return [];
  
  return emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0 && validateEmail(email));
};

/**
 * Validate an email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} Whether the email is valid
 */
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}; 