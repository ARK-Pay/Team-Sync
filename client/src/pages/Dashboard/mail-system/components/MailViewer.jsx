import React, { useState, useEffect, useRef } from 'react';
import { Star, Trash2, Archive, Printer, MoreVertical, Reply, ReplyAll, Forward, Download, Inbox, FileText } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

const MailViewer = ({ email, onRefresh }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null);
  const optionsRef = useRef(null);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!email) return null;

  // Handle star toggle
  const handleStar = async () => {
    try {
      setLoading(true);
      setActionType('star');
      console.log('Starring email:', email._id, 'Current starred status:', email.isStarred);
      
      const token = getAuthToken();
      
      const response = await axios.put(
        `${API_BASE_URL}/mail/${email._id}/star`,
        { isStarred: !email.isStarred },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Star response:', response.data);
      
      if (response.data.success) {
        console.log('Star toggled successfully');
        if (onRefresh) {
          console.log('Refreshing after star');
          onRefresh();
        }
      } else {
        console.error('Failed to toggle star:', response.data.message);
        alert('Failed to star email. Please try again.');
      }
    } catch (error) {
      console.error('Error starring email:', error);
      alert('Failed to star email. Please try again.');
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  // Handle print
  const handlePrint = () => {
    console.log('Printing email:', email.subject);
    
    const printContent = `
      <html>
        <head>
          <title>${email.subject || '(No Subject)'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.5;
            }
            .header {
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .subject {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .meta {
              color: #666;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .body {
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="subject">${email.subject || '(No Subject)'}</div>
            <div class="meta">From: ${email.senderName} &lt;${email.senderEmail}&gt;</div>
            <div class="meta">To: ${email.recipientNames?.join(', ') || 'Recipients'}</div>
            <div class="meta">Date: ${new Date(email.timestamp).toLocaleString()}</div>
          </div>
          <div class="body">${email.body}</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Handle move email to folder
  const handleMove = async (targetFolder) => {
    try {
      setLoading(true);
      setActionType('move');
      setShowOptions(false);
      
      console.log(`Moving email ${email._id} to ${targetFolder}`);
      
      const token = getAuthToken();
      
      const response = await axios.put(
        `${API_BASE_URL}/mail/${email._id}/move`,
        { targetFolder },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Move email response:', response.data);
      
      if (response.data.success) {
        console.log(`Email moved to ${targetFolder} successfully`);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error(`Failed to move email to ${targetFolder}:`, response.data.message);
        alert(`Failed to move email to ${targetFolder}. Please try again.`);
      }
    } catch (error) {
      console.error(`Error moving email to ${targetFolder}:`, error);
      alert(`Failed to move email to ${targetFolder}. Please try again.`);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  // Handle delete email
  const handleDelete = async () => {
    try {
      setLoading(true);
      setActionType('delete');
      setShowOptions(false);
      
      console.log('Deleting email:', email._id);
      
      const token = getAuthToken();
      
      const response = await axios.delete(
        `${API_BASE_URL}/mail/${email._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Delete email response:', response.data);
      
      if (response.data.success) {
        console.log('Email deleted successfully');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('Failed to delete email:', response.data.message);
        alert('Failed to delete email. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      alert('Failed to delete email. Please try again.');
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  // Handle reply
  const handleReply = () => {
    alert('Reply functionality is not implemented yet.');
  };

  // Handle reply all
  const handleReplyAll = () => {
    alert('Reply All functionality is not implemented yet.');
  };

  // Handle forward
  const handleForward = () => {
    alert('Forward functionality is not implemented yet.');
  };

  // Handle mark as read/unread
  const handleMarkAsRead = async () => {
    try {
      setLoading(true);
      setActionType('read');
      setShowOptions(false);
      
      console.log(`Marking email ${email._id} as ${email.isRead ? 'unread' : 'read'}`);
      
      const token = getAuthToken();
      
      const response = await axios.put(
        `${API_BASE_URL}/mail/${email._id}/read`,
        { isRead: !email.isRead },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Mark as read response:', response.data);
      
      if (response.data.success) {
        console.log(`Email marked as ${email.isRead ? 'unread' : 'read'} successfully`);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error(`Failed to mark email as ${email.isRead ? 'unread' : 'read'}:`, response.data.message);
        alert(`Failed to mark email as ${email.isRead ? 'unread' : 'read'}. Please try again.`);
      }
    } catch (error) {
      console.error(`Error marking email as ${email.isRead ? 'unread' : 'read'}:`, error);
      alert(`Failed to mark email as ${email.isRead ? 'unread' : 'read'}. Please try again.`);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Email Header */}
      <div className="px-6 py-4 border-b">
        {/* Subject */}
        <h2 className="text-xl font-semibold mb-3">{email.subject || '(No Subject)'}</h2>
        
        {/* Sender Info */}
        <div className="flex items-start mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3 flex-shrink-0">
            {email.senderName ? email.senderName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="font-medium">{email.senderName}</div>
              <div className="text-gray-500 sm:ml-2">&lt;{email.senderEmail}&gt;</div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(email.timestamp).toLocaleString()} 
              <span className="ml-2">
                to {Array.isArray(email.recipientNames) ? email.recipientNames.join(', ') : ''}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-1 border-t pt-3">
          {/* Star Button */}
          <button
            onClick={handleStar}
            disabled={loading && actionType === 'star'}
            className={`p-2 rounded-full ${
              email.isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-600'
            } ${loading && actionType === 'star' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Star className="h-5 w-5" />
          </button>
          
          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={loading}
            className={`p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Printer className="h-5 w-5" />
          </button>
          
          {/* Options Menu */}
          <div className="relative" ref={optionsRef}>
            <button
              onClick={() => setShowOptions(!showOptions)}
              disabled={loading}
              className={`p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            
            {/* Options Dropdown */}
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
                {email.folder !== 'archived' && (
                  <button
                    onClick={() => handleMove('archived')}
                    disabled={loading}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      loading && actionType === 'move' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </button>
                )}
                
                {email.folder === 'archived' && (
                  <button
                    onClick={() => handleMove('inbox')}
                    disabled={loading}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      loading && actionType === 'move' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Inbox className="h-4 w-4 mr-2" />
                    Move to Inbox
                  </button>
                )}
                
                {email.folder !== 'trash' && (
                  <button
                    onClick={() => handleMove('trash')}
                    disabled={loading}
                    className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${
                      loading && actionType === 'move' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Move to Trash
                  </button>
                )}
                
                {email.folder === 'trash' && (
                  <>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${
                        loading && actionType === 'delete' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Permanently
                    </button>
                    <button
                      onClick={() => handleMove('inbox')}
                      disabled={loading}
                      className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                        loading && actionType === 'move' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Inbox className="h-4 w-4 mr-2" />
                      Restore to Inbox
                    </button>
                  </>
                )}
                
                {email.folder !== 'drafts' && (
                  <button
                    onClick={handleMarkAsRead}
                    disabled={loading}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                      loading && actionType === 'read' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="h-4 w-4 mr-2 flex items-center justify-center">
                      {email.isRead ? '📪' : '📬'}
                    </span>
                    Mark as {email.isRead ? 'unread' : 'read'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Email Body */}
      <div className="p-6 flex-1 overflow-auto">
        <div className="whitespace-pre-wrap">{email.body}</div>
      </div>

      {/* Attachments, if any */}
      {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
        <div className="px-6 py-4 border-t">
          <h3 className="text-sm font-medium mb-2">Attachments ({email.attachments.length})</h3>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((attachment, index) => (
              <div 
                key={index}
                className="flex items-center p-2 border rounded bg-gray-50 text-sm max-w-[250px]"
              >
                <FileText size={16} className="mr-2 text-gray-500" />
                <div className="truncate flex-1">{attachment.name}</div>
                <div className="text-xs text-gray-500 ml-2">{attachment.size}</div>
                {attachment.path && (
                  <button 
                    onClick={() => handleDownload(attachment)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <Download size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MailViewer;
