import React, { useState } from 'react';
import { Paperclip, Star, Inbox, Send, FileText, Trash, Archive, Printer, MoreVertical } from 'lucide-react';
import axios from 'axios';

// Set base URL for API requests
const API_BASE_URL = 'http://localhost:3001';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token') || 'dummy-token-for-testing';

const MailList = ({ emails, selectedEmail, onSelectEmail, loading, error, currentFolder, onRefresh }) => {
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

  // Direct DOM manipulation for star button (fallback)
  const handleStarDirect = (e, email) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent email selection
    
    // Toggle star visually immediately
    const starButton = e.currentTarget;
    const isCurrentlyStarred = starButton.classList.contains('text-yellow-400');
    
    if (isCurrentlyStarred) {
      starButton.classList.remove('text-yellow-400');
      starButton.classList.add('text-gray-400');
    } else {
      starButton.classList.remove('text-gray-400');
      starButton.classList.add('text-yellow-400');
    }
    
    // Then try API call
    handleStar(e, email);
  };

  const handleStar = async (e, email) => {
    e.stopPropagation(); // Prevent email selection
    
    try {
      // Update UI immediately (optimistic update)
      const updatedEmail = { ...email, isStarred: !email.isStarred };
      
      // Find and update the email in the list
      if (onSelectEmail && selectedEmail && selectedEmail._id === email._id) {
        onSelectEmail(updatedEmail);
      }
      
      setActionLoading(prev => ({ ...prev, [email._id]: true }));
      console.log('Starring email:', email._id, 'Current starred status:', email.isStarred);
      
      const token = getAuthToken();
      
      const response = await axios.put(
        `${API_BASE_URL}/mail/${email._id}/star`,
        {},
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
      setActionLoading(prev => ({ ...prev, [email._id]: false }));
    }
  };

  // Direct DOM manipulation for print button (fallback)
  const handlePrintDirect = (e, email) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent email selection
    
    // Visual feedback
    const printButton = e.currentTarget;
    printButton.classList.add('bg-gray-200');
    setTimeout(() => {
      printButton.classList.remove('bg-gray-200');
    }, 200);
    
    handlePrint(e, email);
  };

  const handlePrint = (e, email) => {
    e.stopPropagation(); // Prevent email selection
    console.log('Printing email:', email.subject);
    
    const printContent = `
      <html>
        <head>
          <title>${email.subject || '(No Subject)'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            .header { margin-bottom: 20px; }
            .metadata { color: #666; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .content { line-height: 1.6; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${email.subject || '(No Subject)'}</h1>
          </div>
          <div class="metadata">
            <p><strong>From:</strong> ${email.senderName} (${email.senderEmail})</p>
            <p><strong>To:</strong> ${email.recipientNames?.join(', ') || 'No recipients'}</p>
            <p><strong>Date:</strong> ${new Date(email.timestamp).toLocaleString()}</p>
          </div>
          <div class="content">
            ${email.body || email.preview || ''}
          </div>
        </body>
      </html>
    `;
    
    // Method 1: Using window.open
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Try to print after a short delay to ensure content is loaded
        setTimeout(() => {
          try {
            printWindow.print();
            setTimeout(() => printWindow.close(), 500);
          } catch (e) {
            console.error('Print error:', e);
            alert('Could not print. Please try again.');
          }
        }, 300);
      } else {
        // Fallback if popup is blocked
        alert('Please allow popups to print emails');
      }
    } catch (e) {
      console.error('Print window error:', e);
      
      // Method 2: Direct print using iframe
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        iframe.contentDocument.write(printContent);
        iframe.contentDocument.close();
        
        setTimeout(() => {
          try {
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 500);
          } catch (e2) {
            console.error('iframe print error:', e2);
            alert('Could not print. Please try again.');
          }
        }, 300);
      } catch (e2) {
        console.error('iframe error:', e2);
        alert('Could not print. Please try again.');
      }
    }
  };

  // Direct DOM manipulation for options button (fallback)
  const handleOptionsDirect = (e, emailId) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent email selection
    
    // Toggle options menu visually
    setShowOptions(showOptions === emailId ? null : emailId);
  };

  const handleMove = async (e, email, targetFolder) => {
    e.stopPropagation(); // Prevent email selection
    
    try {
      setActionLoading(prev => ({ ...prev, [email._id]: true }));
      console.log('Moving email to:', targetFolder);
      
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
      
      console.log('Move response:', response.data);
      
      if (response.data.success) {
        console.log('Refreshing after move');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('Failed to move email:', response.data.message);
        alert(`Failed to move email to ${targetFolder}. Please try again.`);
      }
    } catch (error) {
      console.error('Error moving email:', error);
      alert(`Failed to move email to ${targetFolder}. Please try again.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [email._id]: false }));
      setShowOptions(null);
    }
  };

  const handleDelete = async (e, email) => {
    e.stopPropagation(); // Prevent email selection
    
    if (!confirm('Are you sure you want to permanently delete this email? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(prev => ({ ...prev, [email._id]: true }));
      console.log('Permanently deleting email:', email._id);
      
      const token = getAuthToken();
      
      const response = await axios.delete(
        `${API_BASE_URL}/mail/${email._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Delete response:', response.data);
      
      if (response.data.success && onRefresh) {
        console.log('Refreshing after delete');
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      alert('Failed to delete email. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [email._id]: false }));
      setShowOptions(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <button className="mt-2 text-blue-500 hover:underline">Try again</button>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {currentFolder === 'inbox' && <Inbox className="h-8 w-8 text-gray-400" />}
          {currentFolder === 'sent' && <Send className="h-8 w-8 text-gray-400" />}
          {currentFolder === 'drafts' && <FileText className="h-8 w-8 text-gray-400" />}
          {currentFolder === 'trash' && <Trash className="h-8 w-8 text-gray-400" />}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No emails in {currentFolder}</h3>
        <p className="text-sm text-gray-500">
          {currentFolder === 'inbox' ? 'Your inbox is empty. Relax!' : `You don't have any emails in ${currentFolder}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {emails.map((email) => (
        <div
          key={email._id}
          className={`p-4 cursor-pointer transition-colors ${
            selectedEmail && selectedEmail._id === email._id ? 'bg-blue-50' : email.isRead ? 'bg-white' : 'bg-blue-50'
          } hover:bg-gray-50`}
        >
          <div className="flex items-start gap-3">
            {/* Sender Avatar */}
            <div 
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium flex-shrink-0"
              onClick={() => onSelectEmail(email)}
            >
              {email.senderName?.charAt(0) || '?'}
            </div>
            
            {/* Email Content */}
            <div className="flex-1 min-w-0" onClick={() => onSelectEmail(email)}>
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-sm font-medium truncate ${!email.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                  {currentFolder === 'sent' ? (email.recipientNames && email.recipientNames.length > 0 ? email.recipientNames.join(', ') : 'No recipients') : email.senderName}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatDate(email.timestamp)}
                </span>
              </div>
              
              <h4 className={`text-sm truncate mb-1 ${!email.isRead ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                {email.subject || '(No Subject)'}
              </h4>
              
              <div className="flex items-center">
                <p className="text-xs text-gray-500 truncate">
                  {email.preview}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 ml-2">
              {/* Star Button */}
              <button
                onClick={(e) => handleStarDirect(e, email)}
                disabled={actionLoading[email._id]}
                className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                  email.isStarred ? 'text-yellow-400' : 'text-gray-400'
                } ${actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={email.isStarred ? 'Unstar' : 'Star'}
              >
                <Star className="h-4 w-4" />
              </button>

              {/* Print Button */}
              <button
                onClick={(e) => handlePrintDirect(e, email)}
                disabled={actionLoading[email._id]}
                className={`p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors ${
                  actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Print"
              >
                <Printer className="h-4 w-4" />
              </button>

              {/* Options Menu */}
              <div className="relative">
                <button
                  onClick={(e) => handleOptionsDirect(e, email._id)}
                  disabled={actionLoading[email._id]}
                  className={`p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors ${
                    actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {showOptions === email._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1">
                    {currentFolder === 'trash' ? (
                      <>
                        <button
                          onClick={(e) => handleMove(e, email, 'inbox')}
                          disabled={actionLoading[email._id]}
                          className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${
                            actionLoading[email._id] ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Inbox className="h-4 w-4 mr-2" />
                          Restore to Inbox
                        </button>
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
  );
};

export default MailList;
