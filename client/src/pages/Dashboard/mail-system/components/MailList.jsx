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
      console.log('Moving draft to trash:', email._id);
      
      const token = getAuthToken();
      
      // Use the special endpoint for moving drafts to trash
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
          console.log('Refreshing after moving draft to trash');
          onRefresh();
        }
      } else {
        console.error('Failed to move draft to trash:', response.data.message);
        alert('Failed to move draft to trash: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error moving draft to trash:', error);
      // Provide more detailed error message
      let errorMessage = 'Failed to move draft to trash. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = `Failed to move draft to trash: ${error.response.data.message}`;
      }
      alert(errorMessage);
      
      // If we get a 404, try the regular move endpoint as fallback
      if (error.response && error.response.status === 404) {
        console.log('Trying fallback method for moving draft to trash');
        try {
          const token = getAuthToken();
          const fallbackResponse = await axios({
            method: 'put',
            url: `${API_BASE_URL}/mail/${email._id}/move`,
            data: { targetFolder: 'trash' },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (fallbackResponse.data.success) {
            console.log('Draft moved to trash using fallback method');
            if (onRefresh) {
              onRefresh();
            }
          }
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
        }
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [email._id]: false }));
      setShowOptions(null); // Close options menu
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

  const renderEmails = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">Loading emails...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-4 text-red-600">
          <p>{error}</p>
        </div>
      );
    }
    
    if (!emails || emails.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p className="mb-2 text-lg">No emails in this folder</p>
          <p className="text-sm">
            {currentFolder === 'inbox' ? "Your inbox is empty. You'll see new messages here when they arrive." : 
             currentFolder === 'sent' ? "You haven't sent any emails yet." :
             currentFolder === 'drafts' ? "You don't have any saved drafts." :
             currentFolder === 'trash' ? "Your trash is empty." :
             currentFolder === 'archived' ? "You don't have any archived emails." :
             "No emails found in this folder."}
          </p>
        </div>
      );
    }
    
    return emails.map(email => {
      const isSelected = selectedEmail && selectedEmail._id === email._id;
      
      return (
        <div 
          key={email._id}
          onClick={() => onSelectEmail(email)}
          className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
            isSelected ? 'bg-blue-50' : email.isRead ? 'bg-white' : 'bg-gray-100'
          }`}
        >
          <div className="flex items-start">
            {/* Star button */}
            <button 
              onClick={(e) => handleStar(e, email)}
              className="mr-2 mt-1"
              disabled={actionLoading[email._id]}
            >
              <Star 
                size={18} 
                className={`${
                  email.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                } hover:text-yellow-500 transition-colors duration-150`} 
              />
            </button>
            
            {/* Email Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                {/* From/To line */}
                <div className={`font-medium truncate ${!email.isRead && 'font-semibold'}`}>
                  {currentFolder === 'sent' || currentFolder === 'drafts' 
                    ? `To: ${email.recipientNames?.join(', ') || 'No recipients'}`
                    : `From: ${email.senderName}`}
                </div>
                
                {/* Date */}
                <div className="text-xs text-gray-500 sm:ml-2 whitespace-nowrap">
                  {formatDate(email.timestamp)}
                </div>
              </div>
              
              {/* Show sender's TeamSync email */}
              <div className="text-xs text-gray-500 mb-1">
                {currentFolder === 'sent' || currentFolder === 'drafts'
                  ? '' // Don't show your own email in sent/drafts
                  : <>From: <span className="font-mono">{email.senderEmail}</span></>}
              </div>
              
              {/* Subject */}
              <div className={`truncate ${!email.isRead && 'font-semibold'}`}>
                {email.subject || '(No Subject)'}
              </div>
              
              {/* Preview */}
              <div className="text-sm text-gray-600 truncate mt-1">
                {email.body ? email.body.substring(0, 100) : ''}
              </div>
            </div>
            
            {/* Indicators and Actions */}
            <div className="ml-2 flex flex-col items-center">
              {/* Attachment indicator */}
              {email.hasAttachments && (
                <Paperclip size={16} className="text-gray-400 mb-2" />
              )}
            </div>
          </div>
        </div>
      );
    });
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
        {renderEmails()}
      </div>
    </div>
  );
};

export default MailList;
