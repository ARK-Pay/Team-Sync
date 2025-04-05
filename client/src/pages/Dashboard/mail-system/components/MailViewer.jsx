import React, { useState, useEffect, useRef } from 'react';
import { Star, Trash2, Archive, Printer, MoreVertical, Reply, ReplyAll, Forward, Download, Inbox } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token') || 'dummy-token-for-testing';

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

  // Direct DOM manipulation for star button (fallback)
  const handleStarDirect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    handleStar();
  };

  const handleStar = async () => {
    try {
      // Update UI immediately (optimistic update)
      const updatedEmail = { ...email, isStarred: !email.isStarred };
      
      setLoading(true);
      setActionType('star');
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
      setLoading(false);
      setActionType(null);
    }
  };

  // Direct DOM manipulation for print button (fallback)
  const handlePrintDirect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Visual feedback
    const printButton = e.currentTarget;
    printButton.classList.add('bg-gray-200');
    setTimeout(() => {
      printButton.classList.remove('bg-gray-200');
    }, 200);
    
    handlePrint();
  };

  const handlePrint = () => {
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
            ${email.body || ''}
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
  const handleOptionsDirect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle options menu visually
    setShowOptions(!showOptions);
  };

  const handleMove = async (targetFolder) => {
    try {
      setLoading(true);
      setActionType('move');
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
      setLoading(false);
      setActionType(null);
      setShowOptions(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this email? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setActionType('delete');
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
      
      if (response.data.success) {
        if (onRefresh) {
          console.log('Refreshing after delete');
          onRefresh();
        }
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      alert('Failed to delete email. Please try again.');
    } finally {
      setLoading(false);
      setActionType(null);
      setShowOptions(false);
    }
  };

  const handleReply = () => {
    alert('Reply functionality would be implemented here');
  };

  const handleReplyAll = () => {
    alert('Reply All functionality would be implemented here');
  };

  const handleForward = () => {
    alert('Forward functionality would be implemented here');
  };

  const handleMarkAsRead = async () => {
    try {
      setLoading(true);
      setActionType('read');
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
      if (response.data.success) {
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error updating read status:', error);
      alert('Failed to update read status. Please try again.');
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow p-6">
      {/* Email Header */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold">{email.subject || '(No Subject)'}</h2>
          <div className="flex items-center space-x-2">
            {/* Star Button */}
            <button
              onClick={handleStarDirect}
              disabled={loading && actionType === 'star'}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                email.isStarred ? 'text-yellow-400' : 'text-gray-400'
              } ${loading && actionType === 'star' ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={email.isStarred ? 'Unstar' : 'Star'}
            >
              <Star className="h-5 w-5" />
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrintDirect}
              disabled={loading}
              className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Print"
            >
              <Printer className="h-5 w-5" />
            </button>

            {/* Options Menu */}
            <div className="relative" ref={optionsRef}>
              <button
                onClick={() => setShowOptions(!showOptions)}
                disabled={loading}
                className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {/* Dropdown Menu */}
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                  {email.folder === 'trash' ? (
                    <>
                      <button
                        onClick={() => handleMove('inbox')}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Inbox className="h-4 w-4 mr-2" />
                        Restore to Inbox
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Permanently
                      </button>
                    </>
                  ) : email.folder === 'archived' ? (
                    <>
                      <button
                        onClick={() => handleMove('inbox')}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Inbox className="h-4 w-4 mr-2" />
                        Unarchive to Inbox
                      </button>
                      <button
                        onClick={() => handleMove('trash')}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Move to Trash
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleMove('archived')}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </button>
                      <button
                        onClick={() => handleMove('trash')}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Move to Trash
                      </button>
                      <button
                        onClick={handleMarkAsRead}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span className="h-4 w-4 mr-2 flex items-center justify-center">
                          {email.isRead ? '📪' : '📬'}
                        </span>
                        Mark as {email.isRead ? 'unread' : 'read'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={handleReply}
            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded flex items-center text-sm"
          >
            <Reply className="h-4 w-4 mr-1" />
            Reply
          </button>
          <button
            onClick={handleReplyAll}
            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded flex items-center text-sm"
          >
            <ReplyAll className="h-4 w-4 mr-1" />
            Reply All
          </button>
          <button
            onClick={handleForward}
            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded flex items-center text-sm"
          >
            <Forward className="h-4 w-4 mr-1" />
            Forward
          </button>
        </div>
      </div>

      {/* Email Metadata */}
      <div className="mb-6 text-sm text-gray-600 border-b pb-4">
        <div className="flex items-start mb-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium flex-shrink-0 mr-3">
            {email.senderName?.charAt(0) || '?'}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{email.senderName} <span className="font-normal text-gray-500">({email.senderEmail})</span></div>
            <div className="text-xs text-gray-500">
              To: {email.recipientNames?.join(', ') || 'No recipients'}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(email.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-grow overflow-auto prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: email.body || '' }} />
      </div>

      {/* Attachments */}
      {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Attachments</h3>
          <div className="grid grid-cols-2 gap-4">
            {email.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-grow">
                  <p className="font-medium truncate">{attachment.name}</p>
                  <p className="text-sm text-gray-500">{attachment.size}</p>
                </div>
                <button className="p-2 text-gray-500 hover:text-blue-500">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MailViewer;
