import React, { useState, useRef, useEffect } from 'react';
import { X, Paperclip, Minimize2, Maximize2 } from 'lucide-react';

const ComposeModal = ({ onClose, onSend, onSaveDraft, draftData = null, userTeamSyncEmail = '' }) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Debug log for userTeamSyncEmail prop
  useEffect(() => {
    console.log('ComposeModal received userTeamSyncEmail prop:', userTeamSyncEmail);
  }, []);

  // Initialize form with draft data if provided
  useEffect(() => {
    if (draftData) {
      setDraftId(draftData._id);
      
      // Handle recipients - convert IDs to emails if needed
      if (draftData.recipients && draftData.recipients.length > 0) {
        if (draftData.recipientEmails && draftData.recipientEmails.length > 0) {
          // Use recipient emails directly if available
          setTo(draftData.recipientEmails.join(', '));
        } else if (draftData.recipientNames && draftData.recipientNames.length === draftData.recipients.length) {
          // Use recipient names to construct emails
          const recipientEmails = draftData.recipientNames.map(name => {
            const username = name.toLowerCase().replace(/\s+/g, '');
            return `${username}@teamsync.com`;
          });
          setTo(recipientEmails.join(', '));
        } else {
          // Just use empty to field as fallback
          setTo('');
        }
      }
      
      setCc(draftData.cc ? draftData.cc.join(', ') : '');
      setBcc(draftData.bcc ? draftData.bcc.join(', ') : '');
      setSubject(draftData.subject || '');
      setBody(draftData.body || '');
      setAttachments(draftData.attachments || []);
      
      // Show CC/BCC fields if they have content
      if ((draftData.cc && draftData.cc.length > 0) || 
          (draftData.bcc && draftData.bcc.length > 0)) {
        setShowCcBcc(true);
      }
    }
  }, [draftData]);

  // Generate a unique TeamSync email
  const generateDynamicEmail = () => {
    // Try to get user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedInfo = JSON.parse(userInfo);
        if (parsedInfo && parsedInfo.email) {
          const email = parsedInfo.email;
          const username = email.split('@')[0].toLowerCase();
          
          // Add a random suffix
          const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          const tempEmail = `${username}${randomSuffix}@teamsync.com`;
          
          console.log('Generated new random TeamSync email:', tempEmail);
          setFromEmail(tempEmail);
          localStorage.setItem('teamSyncEmail', tempEmail);
          return;
        }
      } catch (e) {
        console.error('Error generating email in ComposeModal:', e);
      }
    }
    
    // Generate a completely random email if no user info
    const randomUsername = 'user' + Math.floor(Math.random() * 100000).toString();
    const fallbackEmail = `${randomUsername}@teamsync.com`;
    console.log('Generated fallback random email:', fallbackEmail);
    setFromEmail(fallbackEmail);
    localStorage.setItem('teamSyncEmail', fallbackEmail);
  };

  // Set the user's TeamSync email when it becomes available
  useEffect(() => {
    if (userTeamSyncEmail && userTeamSyncEmail.trim() !== '') {
      console.log('Setting from email in ComposeModal:', userTeamSyncEmail);
      setFromEmail(userTeamSyncEmail);
    } else {
      console.log('TeamSync email not provided by parent, generating a new one...');
      generateDynamicEmail();
    }
  }, [userTeamSyncEmail]);

  // Add click outside handler to close error/success messages
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (error || successMessage) {
        setError('');
        setSuccessMessage('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [error, successMessage]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: formatFileSize(file.size),
      file
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove attachment
  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Validate TeamSync email format
  const validateTeamSyncEmail = (email) => {
    return email.trim().endsWith('@teamsync.com');
  };

  // Create email data object
  const createEmailData = () => {
    console.log('Creating email data with:', { to, cc, bcc, subject, body, attachments, draftId });
    
    // Parse recipients
    const recipients = to 
      ? to.split(',')
          .map(email => email.trim())
          .filter(email => email) // Remove empty entries
      : [];
    
    console.log('Parsed recipients:', recipients);
    
    if (recipients.length === 0) {
      throw new Error('Please specify at least one recipient');
    }
    
    // Ensure all emails have @teamsync.com domain
    const validatedRecipients = recipients.map(email => {
      if (!email.includes('@')) {
        // If no @ symbol, assume it's a username and add @teamsync.com
        return `${email.toLowerCase()}@teamsync.com`;
      } else if (!email.endsWith('@teamsync.com')) {
        // If it has @ but wrong domain, replace with teamsync.com
        const username = email.split('@')[0].toLowerCase();
        return `${username}@teamsync.com`;
      }
      return email.toLowerCase();
    });
    
    console.log('Validated recipients:', validatedRecipients);
    
    // Parse CC recipients
    const ccRecipients = cc 
      ? cc.split(',')
          .map(email => email.trim())
          .filter(email => email)
          .map(email => {
            if (!email.includes('@')) {
              return `${email.toLowerCase()}@teamsync.com`;
            } else if (!email.endsWith('@teamsync.com')) {
              const username = email.split('@')[0].toLowerCase();
              return `${username}@teamsync.com`;
            }
            return email.toLowerCase();
          })
      : [];
      
    // Parse BCC recipients
    const bccRecipients = bcc 
      ? bcc.split(',')
          .map(email => email.trim())
          .filter(email => email)
          .map(email => {
            if (!email.includes('@')) {
              return `${email.toLowerCase()}@teamsync.com`;
            } else if (!email.endsWith('@teamsync.com')) {
              const username = email.split('@')[0].toLowerCase();
              return `${username}@teamsync.com`;
            }
            return email.toLowerCase();
          })
      : [];
    
    // Create email data
    const emailData = {
      to: validatedRecipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      subject: subject.trim(),
      body: body.trim(),
      attachments: attachments,
      draftId: draftId
    };
    
    console.log('Final email data:', emailData);
    
    return emailData;
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      // Create email data
      const emailData = {
        to: to.split(',').map(email => email.trim()).filter(email => email),
        cc: cc.split(',').map(email => email.trim()).filter(email => email),
        bcc: bcc.split(',').map(email => email.trim()).filter(email => email),
        subject: subject.trim(),
        body: body.trim(),
        attachments: attachments,
        draftId: draftId
      };
      
      const result = await onSaveDraft(emailData);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Draft saved successfully');
        // Update draft ID if this is a new draft
        if (result.draftId && !draftId) {
          setDraftId(result.draftId);
        }
      } else {
        setError(result.message || 'Failed to save draft');
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err.message || 'An error occurred while saving the draft');
    } finally {
      setSaving(false);
    }
  };

  // Handle send
  const handleSend = async () => {
    try {
      setSending(true);
      setError('');
      setSuccessMessage('');
      
      // Validate recipients
      if (!to.trim()) {
        setError('Please specify at least one recipient');
        setSending(false);
        return;
      }
      
      // Create email data
      const emailData = createEmailData();
      
      // Validate at least one recipient has @teamsync.com domain
      const hasValidRecipient = emailData.to.some(email => validateTeamSyncEmail(email));
      if (!hasValidRecipient) {
        setError('At least one recipient must have a valid @teamsync.com email address');
        setSending(false);
        return;
      }
      
      console.log('Sending email with data:', emailData);
      const result = await onSend(emailData);
      console.log('Send email result:', result);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Email sent successfully');
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Failed to send email');
        
        // If there are invalid recipients, show them
        if (result.invalidRecipients && result.invalidRecipients.length > 0) {
          setError(`Invalid recipients: ${result.invalidRecipients.join(', ')}`);
        }
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.message || 'An error occurred while sending the email');
    } finally {
      setSending(false);
    }
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div 
      ref={modalRef}
      className={`fixed ${isMinimized ? 'bottom-0 right-0 w-60 h-14' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-3/4'} 
        bg-white rounded-t-lg shadow-xl transition-all duration-300 z-50 flex flex-col`}
      style={{ maxWidth: isMinimized ? '240px' : '800px', maxHeight: isMinimized ? '48px' : '700px' }}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
        <h2 className="text-lg font-medium">
          {isMinimized ? 
            (subject ? subject.substring(0, 15) + (subject.length > 15 ? '...' : '') : 'New Message') :
            'New Message'}
        </h2>
        <div className="flex items-center space-x-2">
          <button onClick={toggleMinimize} className="text-white hover:text-gray-200">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* From field to display user's TeamSync email */}
          <div className="px-4 py-2 border-b">
            <div className="flex items-center">
              <span className="w-16 text-gray-600 font-medium">From:</span>
              {fromEmail ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-gray-800 font-mono">{fromEmail}</span>
                  <button 
                    onClick={generateDynamicEmail}
                    className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    title="Generate a new email address"
                  >
                    Generate New ID
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-gray-500 italic">Loading your email address...</span>
                  <button 
                    onClick={generateDynamicEmail}
                    className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                  >
                    Generate
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Email form */}
          <div className="px-4 py-2 border-b">
            <div className="flex items-center">
              <span className="w-16 text-gray-600 font-medium">To:</span>
              <input 
                type="text" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 outline-none"
                placeholder="example@teamsync.com"
              />
            </div>
          </div>
          
          {/* Show/hide CC/BCC */}
          {!showCcBcc && (
            <div className="px-4 py-1 border-b">
              <button 
                onClick={() => setShowCcBcc(true)}
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                CC/BCC
              </button>
            </div>
          )}
          
          {/* CC/BCC fields */}
          {showCcBcc && (
            <>
              <div className="px-4 py-2 border-b">
                <div className="flex items-center">
                  <span className="w-16 text-gray-600 font-medium">Cc:</span>
                  <input 
                    type="text" 
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 outline-none"
                    placeholder="example@teamsync.com"
                  />
                </div>
              </div>
              <div className="px-4 py-2 border-b">
                <div className="flex items-center">
                  <span className="w-16 text-gray-600 font-medium">Bcc:</span>
                  <input 
                    type="text" 
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="flex-1 outline-none"
                    placeholder="example@teamsync.com"
                  />
                </div>
              </div>
            </>
          )}

          {/* Subject */}
          <div className="px-4 py-2 border-b border-gray-200">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border-0 focus:ring-0 text-sm"
              placeholder="Subject"
            />
          </div>

          {/* Email Body */}
          <div className="flex-1 p-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-64 border-0 focus:ring-0 text-sm resize-none"
              placeholder="Write your message here..."
            ></textarea>
          </div>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <h4 className="text-xs font-medium text-gray-500 mb-2">ATTACHMENTS</h4>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div 
                    key={index}
                    className="flex items-center bg-white p-2 rounded border border-gray-200 text-sm"
                  >
                    <span className="truncate max-w-xs">{attachment.name}</span>
                    <span className="text-gray-400 mx-2">({attachment.size})</span>
                    <button 
                      onClick={() => removeAttachment(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleSend}
                disabled={sending}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
              <button 
                onClick={handleSaveDraft}
                disabled={saving}
                className={`px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-medium ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Attach files"
              >
                <Paperclip size={18} />
              </button>
            </div>
            <div>
              <button 
                onClick={onClose}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              >
                Discard
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ComposeModal;
