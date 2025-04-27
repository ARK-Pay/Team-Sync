import React, { useState } from 'react';
import { sendVideoCallInvites, parseEmailList } from '../utils/inviteService';
import './VideoCallJoin.css';

const InviteModal = ({ isOpen, onClose, meetingCode, userEmail }) => {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState(`I'm inviting you to join a TeamSync video call.`);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleSendInvites = async () => {
    setError('');
    setSuccess('');
    
    const emailList = parseEmailList(emails);
    
    if (emailList.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }
    
    setIsSending(true);
    
    try {
      await sendVideoCallInvites(emailList, message, meetingCode, userEmail);
      setSuccess(`Invitations sent to ${emailList.length} recipient(s)`);
      setEmails('');
    } catch (err) {
      setError('Failed to send invitations. Please try again.');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(meetingCode);
    setSuccess('Meeting code copied to clipboard');
    setTimeout(() => setSuccess(''), 3000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="invite-modal">
        <div className="modal-header">
          <h2>Invite to Meeting</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="meeting-code-container">
            <span>Meeting Code: <strong>{meetingCode}</strong></span>
            <button 
              className="copy-code-button" 
              onClick={handleCopyCode}
            >
              Copy Code
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="emails">Email Addresses (comma separated)</label>
            <textarea
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="user@example.com, another@example.com"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message (optional)</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
        
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button 
            className="send-button" 
            onClick={handleSendInvites} 
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send Invites'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal; 