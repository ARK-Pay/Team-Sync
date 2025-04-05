import React, { useState, useRef } from 'react';
import { X, Paperclip, Minimize2, Maximize2 } from 'lucide-react';

const ComposeModal = ({ onClose, onSend, onSaveDraft }) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const fileInputRef = useRef(null);

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

  // Create email data object
  const createEmailData = () => {
    // Parse recipients
    const recipients = to ? to.split(',').map(email => email.trim()) : [];
    
    // Create email data
    return {
      to: recipients,
      cc: cc ? cc.split(',').map(email => email.trim()) : [],
      bcc: bcc ? bcc.split(',').map(email => email.trim()) : [],
      subject,
      body,
      attachments: attachments || []
    };
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    // No validation needed for drafts
    try {
      const result = await onSaveDraft(createEmailData());
      if (result && result.success) {
        alert('Draft saved successfully');
        onClose(); // Close the modal after successful save
      } else {
        alert(result?.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  // Handle send
  const handleSend = async () => {
    // Basic validation
    if (!to.trim()) {
      alert('Please specify at least one recipient');
      return;
    }

    try {
      const result = await onSend(createEmailData());
      if (result && result.success) {
        alert('Email sent successfully');
        onClose(); // Close the modal after successful send
      } else {
        alert(result?.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-0 right-6 w-2/3 max-w-3xl bg-white rounded-t-lg shadow-xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-100 rounded-t-lg">
        <h3 className="font-medium text-gray-800">
          {subject ? subject : 'New Message'}
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleMinimize}
            className="p-1 rounded hover:bg-gray-200"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body (hidden when minimized) */}
      {!isMinimized && (
        <>
          {/* Recipients */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center mb-2">
              <label className="w-12 text-sm text-gray-600">To:</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 border-0 focus:ring-0 text-sm"
                placeholder="Recipients"
              />
              <button 
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {showCcBcc ? 'Hide' : 'Cc/Bcc'}
              </button>
            </div>

            {showCcBcc && (
              <>
                <div className="flex items-center mb-2">
                  <label className="w-12 text-sm text-gray-600">Cc:</label>
                  <input
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 border-0 focus:ring-0 text-sm"
                    placeholder="Carbon copy"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-12 text-sm text-gray-600">Bcc:</label>
                  <input
                    type="text"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="flex-1 border-0 focus:ring-0 text-sm"
                    placeholder="Blind carbon copy"
                  />
                </div>
              </>
            )}
          </div>

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
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Send
              </button>
              <button 
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Save Draft
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
