import React, { useState } from 'react';
import { Paperclip, Star, Inbox, Send, FileText, Trash, Archive, Printer, MoreVertical } from 'lucide-react';
import axios from 'axios';

// Set base URL for API requests
const API_BASE_URL = 'http://localhost:3001';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

const MailList = ({ emails, selectedEmail, onSelectEmail, loading, error, currentFolder, onRefresh, userTeamSyncEmail }) => {
  const [actionLoading, setActionLoading] = useState({});
  const [showOptions, setShowOptions] = useState(null);

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If today, show time
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // If yesterday, show 'Yesterday'
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // Otherwise show date
    else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Handle star toggle
  const handleStar = async (e, email) => {
    e.stopPropagation(); // Prevent email selection
    
    try {
      setActionLoading(prev => ({ ...prev, [email._id]: true }));
      console.log('Starring email:', email._id, 'Current starred status:', email.isStarred);
      
      const token = getAuthToken();
      
      const response = await axios({
        method: 'put',
        url: `${API_BASE_URL}/mail/${email._id}/star`,
        data: { isStarred: !email.isStarred },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
      setActionLoading(prev => ({ ...prev, [email._id]: false }));
    }
  };

  // Handle print email
  const handlePrint = (e, email) => {
    e.stopPropagation(); // Prevent email selection
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

  // Special handler for moving drafts to trash (workaround for the 404 issue)
  const handleMoveDraftToTrash = async (e, email) => {
    e.stopPropagation(); // Prevent email selection
    
    try {
      setActionLoading(prev => ({ ...prev, [email._id]: true }));
      setShowOptions(null);
      
      console.log('Moving draft to trash:', email._id);
      
      const token = getAuthToken();
      
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/mail/move-draft-to-trash`,
        data: { emailId: email._id },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Move draft to trash response:', response.data);
      
      if (response.data.success) {
        console.log('Draft moved to trash successfully');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('Failed to move draft to trash:', response.data.message);
        alert('Failed to move draft to trash. Please try again.');
      }
    } catch (error) {
      console.error('Error moving draft to trash:', error);
      alert('Failed to move draft to trash. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [email._id]: false }));
    }
  };

  // Handle move email to folder
  const handleMove = async (e, email, targetFolder) => {
    e.stopPropagation(); // Prevent email selection
    
    try {
      setActionLoading(prev => ({ ...prev, [email._id]: true }));
      setShowOptions(null);
      
      console.log(`Moving email ${email._id} to ${targetFolder}`);
      
      const token = getAuthToken();
      
      const response = await axios({
        method: 'put',
        url: `${API_BASE_URL}/mail/${email._id}/move`,
        data: { targetFolder },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
      setActionLoading(prev => ({ ...prev, [email._id]: false }));
    }
  };

  // Handle delete email
  const handleDelete = async (e, email) => {
    e.stopPropagation(); // Prevent email selection
    
    try {
      setActionLoading(prev => ({ ...prev, [email._id]: true }));
      setShowOptions(null);
      
      console.log('Deleting email:', email._id);
      
      const token = getAuthToken();
      
      const response = await axios({
        method: 'delete',
        url: `${API_BASE_URL}/mail/${email._id}`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
      setActionLoading(prev => ({ ...prev, [email._id]: false }));
    }
  };

  // Get folder icon
  const getFolderIcon = () => {
    switch (currentFolder) {
      case 'inbox': return <Inbox className="h-5 w-5 text-blue-500" />;
      case 'sent': return <Send className="h-5 w-5 text-green-500" />;
      case 'drafts': return <FileText className="h-5 w-5 text-amber-500" />;
      case 'trash': return <Trash className="h-5 w-5 text-red-500" />;
      case 'archived': return <Archive className="h-5 w-5 text-purple-500" />;
      case 'starred': return <Star className="h-5 w-5 text-yellow-500" />;
      default: return <Inbox className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
        <div className="flex items-center">
          {getFolderIcon()}
          <h2 className="ml-2 text-lg font-medium capitalize">{currentFolder}</h2>
          {emails.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">({emails.length})</span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`text-sm text-blue-600 hover:text-blue-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Refresh
        </button>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading emails...</div>
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && emails.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">No emails in this folder</div>
        </div>
      )}
      
      {/* Email list */}
      <div className="flex-1 overflow-auto">
        {!loading && !error && emails.map((email) => (
          <div
            key={email._id}
            onClick={() => onSelectEmail(email)}
            className={`border-b border-gray-200 px-4 py-3 cursor-pointer transition-colors ${
              selectedEmail && selectedEmail._id === email._id
                ? 'bg-blue-50'
                : 'hover:bg-gray-50'
            } ${!email.isRead && currentFolder === 'inbox' ? 'bg-blue-50 font-semibold' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                {/* Star button */}
                <button
                  onClick={(e) => handleStar(e, email)}
                  className={`mr-3 ${
                    email.isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  disabled={actionLoading[email._id]}
                >
                  <Star className="h-5 w-5" />
                </button>
                
                {/* Sender/Recipient info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="truncate font-medium">
                      {currentFolder === 'sent' || currentFolder === 'drafts'
                        ? `To: ${email.recipientNames?.join(', ') || 'No recipients'}`
                        : email.senderName || 'Unknown Sender'}
                    </div>
                    <div className="ml-2 flex-shrink-0 text-sm text-gray-500">
                      {formatDate(email.timestamp)}
                    </div>
                  </div>
                  
                  {/* Subject and preview */}
                  <div className="truncate text-sm text-gray-600">
                    {email.subject || '(No Subject)'}
                    {email.hasAttachments && (
                      <Paperclip className="inline-block ml-1 h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="truncate text-xs text-gray-500 mt-1">
                    {email.body.substring(0, 100)}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="ml-4 flex items-center">
                {/* Print button */}
                <button
                  onClick={(e) => handlePrint(e, email)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  disabled={actionLoading[email._id]}
                >
                  <Printer className="h-4 w-4" />
                </button>
                
                {/* Options button */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptions(showOptions === email._id ? null : email._id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded ml-1"
                    disabled={actionLoading[email._id]}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {/* Options dropdown */}
                  {showOptions === email._id && (
                    <div
                      className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {currentFolder === 'trash' ? (
                        <>
                          <button
                            onClick={(e) => handleDelete(e, email)}
                            disabled={actionLoading[email._id]}
                            className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors ${
                              actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Permanently
                          </button>
                          <button
                            onClick={(e) => handleMove(e, email, 'inbox')}
                            disabled={actionLoading[email._id]}
                            className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${
                              actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Inbox className="h-4 w-4 mr-2" />
                            Move to Inbox
                          </button>
                        </>
                      ) : currentFolder === 'archived' ? (
                        <>
                          <button
                            onClick={(e) => handleMove(e, email, 'inbox')}
                            disabled={actionLoading[email._id]}
                            className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${
                              actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Inbox className="h-4 w-4 mr-2" />
                            Unarchive to Inbox
                          </button>
                          <button
                            onClick={(e) => handleMove(e, email, 'trash')}
                            disabled={actionLoading[email._id]}
                            className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors ${
                              actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Move to Trash
                          </button>
                        </>
                      ) : currentFolder === 'drafts' ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (typeof window.editDraft === 'function') {
                                window.editDraft(email);
                              }
                              setShowOptions(null);
                            }}
                            disabled={actionLoading[email._id]}
                            className={`flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 transition-colors ${
                              actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Edit Draft
                          </button>
                          <button
                            onClick={(e) => handleMoveDraftToTrash(e, email)}
                            disabled={actionLoading[email._id]}
                            className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors ${
                              actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Move to Trash
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => handleMove(e, email, 'archived')}
                            disabled={actionLoading[email._id]}
                            className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${
                              actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </button>
                          <button
                            onClick={(e) => handleMove(e, email, 'trash')}
                            disabled={actionLoading[email._id]}
                            className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors ${
                              actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Move to Trash
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MailList;
