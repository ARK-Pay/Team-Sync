const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Schema for mail attachments
const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, required: true },
  path: { type: String },
  contentType: { type: String }
});

// Schema for mail messages
const mailSchema = new mongoose.Schema({
  // Use MongoDB's default _id field for Mail documents
  senderId: { 
    type: String,
    required: true,
    ref: 'User'
  },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  recipients: [{ 
    type: String,
    ref: 'User'
  }],
  recipientNames: [{ type: String }],
  cc: [{ type: String }],
  bcc: [{ type: String }],
  subject: { type: String, default: '(No Subject)' },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  labels: [{ type: String }],
  hasAttachments: { type: Boolean, default: false },
  attachments: [attachmentSchema],
  folder: { 
    type: String, 
    enum: ['inbox', 'sent', 'drafts', 'trash', 'archived'], 
    default: 'inbox' 
  },
  previousFolder: {
    type: String,
    enum: ['inbox', 'sent', 'drafts', 'archived'],
    default: 'inbox'
  },
  timestamp: { type: Date, default: Date.now }
});

// Create indexes for better query performance
mailSchema.index({ senderId: 1, folder: 1 });
mailSchema.index({ recipients: 1, folder: 1 });
mailSchema.index({ timestamp: -1 });

const Mail = mongoose.model('Mail', mailSchema);

module.exports = Mail;
