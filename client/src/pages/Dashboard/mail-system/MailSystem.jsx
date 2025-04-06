import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MailList from './components/MailList';
import MailViewer from './components/MailViewer';
import ComposeModal from './components/ComposeModal';
import axios from 'axios';

// Set base URL for API requests
const API_BASE_URL = 'http://localhost:3001';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

const MailSystem = () => {
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [draftToEdit, setDraftToEdit] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userTeamSyncEmail, setUserTeamSyncEmail] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Setup axios config with auth token
  const getAxiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  });

  // Fetch user's TeamSync email
  const fetchUserTeamSyncEmail = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/profile`,
        getAxiosConfig()
      );
      
      console.log('User profile response:', response.data);
      
      if (response.data && response.data.success && response.data.user) {
        // Get TeamSync email directly from the response
        if (response.data.user.teamsync_email) {
          setUserTeamSyncEmail(response.data.user.teamsync_email);
          console.log('User TeamSync email from profile:', response.data.user.teamsync_email);
          return;
        }
      }
      
      // Fallback: Try to get email from localStorage and generate TeamSync email
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsedInfo = JSON.parse(userInfo);
          if (parsedInfo && parsedInfo.email) {
            const email = parsedInfo.email;
            const username = email.split('@')[0].toLowerCase();
            const teamSyncEmail = `${username}@teamsync.com`;
            setUserTeamSyncEmail(teamSyncEmail);
            console.log('Generated User TeamSync email from localStorage:', teamSyncEmail);
          }
        } catch (e) {
          console.error('Error parsing user info from localStorage:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Fetch emails from the API
  const fetchEmails = async (folder) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching emails for folder: ${folder}`);
      const response = await axios.get(
        `${API_BASE_URL}/mail?folder=${folder}`,
        getAxiosConfig()
      );
      console.log('Emails response:', response.data);
      
      if (response.data.success) {
        setEmails(response.data.data || []);
      } else {
        console.error('Failed to fetch emails:', response.data.message);
        setError(response.data.message || 'Failed to load emails');
        setEmails([]);
      }
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError(err.response?.data?.message || 'Failed to load emails. Please try again.');
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch starred emails
  const fetchStarredEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching starred emails');
      const response = await axios.get(
        `${API_BASE_URL}/mail?folder=starred`,
        getAxiosConfig()
      );
      console.log('Starred emails response:', response.data);
      
      if (response.data.success) {
        setEmails(response.data.data || []);
      } else {
        console.error('Failed to fetch starred emails:', response.data.message);
        setError(response.data.message || 'Failed to load starred emails');
        setEmails([]);
      }
    } catch (err) {
      console.error('Error fetching starred emails:', err);
      setError(err.response?.data?.message || 'Failed to load starred emails. Please try again.');
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh current emails
  const refreshEmails = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Effect to fetch user's TeamSync email on component mount
  useEffect(() => {
    fetchUserTeamSyncEmail();
  }, []);

  // Effect to fetch emails when folder changes or refresh is triggered
  useEffect(() => {
    if (currentFolder === 'starred') {
      fetchStarredEmails();
    } else {
      fetchEmails(currentFolder);
    }
    
    // Clear selected email when changing folders
    if (selectedEmail) {
      setSelectedEmail(null);
    }
  }, [currentFolder, refreshTrigger]);

  // Handle folder change
  const handleFolderChange = (folder) => {
    setCurrentFolder(folder);
    setSelectedEmail(null);
  };

  // Handle email selection
  const handleSelectEmail = async (email) => {
    try {
      console.log('Selecting email:', email._id);
      const response = await axios.get(
        `${API_BASE_URL}/mail/${email._id}`,
        getAxiosConfig()
      );
      console.log('Email details response:', response.data);
      
      if (response.data.success) {
        setSelectedEmail(response.data.data);
        
        // If the email was unread, refresh the email list to update unread count
        if (email.isRead === false && response.data.data.isRead === true) {
          refreshEmails();
        }
      } else {
        console.error('Failed to fetch email details:', response.data.message);
        setError('Failed to load email details. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching email details:', err);
      setError(err.response?.data?.message || 'Failed to load email details. Please try again.');
    }
  };

  // Handle compose button click
  const handleComposeClick = () => {
    setDraftToEdit(null);
    setShowComposeModal(true);
  };

  // Handle edit draft
  const handleEditDraft = (draft) => {
    setDraftToEdit(draft);
    setShowComposeModal(true);
  };

  // Expose edit draft function to window for MailViewer component
  useEffect(() => {
    window.editDraft = handleEditDraft;
    
    // Cleanup function
    return () => {
      delete window.editDraft;
    };
  }, []);

  // Handle close compose modal
  const handleCloseComposeModal = () => {
    setShowComposeModal(false);
    setDraftToEdit(null);
  };

  // Handle send email
  const handleSendEmail = async (emailData) => {
    try {
      console.log('Sending email with data:', emailData);
      
      // Validate email data
      if (!emailData.to || !Array.isArray(emailData.to) || emailData.to.length === 0) {
        console.error('Invalid email data: missing or empty recipients array');
        return { 
          success: false, 
          message: 'Please specify at least one recipient'
        };
      }
      
      // Make sure all recipients have the @teamsync.com domain
      const validRecipients = emailData.to.filter(email => email.endsWith('@teamsync.com'));
      if (validRecipients.length === 0) {
        console.error('No valid recipients with @teamsync.com domain');
        return { 
          success: false, 
          message: 'All recipients must have a valid @teamsync.com email address'
        };
      }
      
      // Create a clean copy of the email data to send
      const cleanEmailData = {
        to: validRecipients,
        cc: Array.isArray(emailData.cc) ? emailData.cc : [],
        bcc: Array.isArray(emailData.bcc) ? emailData.bcc : [],
        subject: emailData.subject || '(No Subject)',
        body: emailData.body || '',
        attachments: emailData.attachments || [],
        draftId: emailData.draftId
      };
      
      console.log('Sending clean email data:', cleanEmailData);
      
      const response = await axios.post(
        `${API_BASE_URL}/mail/send`,
        cleanEmailData,
        getAxiosConfig()
      );
      
      console.log('Send email response:', response.data);
      
      if (response.data.success) {
        // Refresh emails
        refreshEmails();
        
        // Show warning if there were invalid recipients
        if (response.data.invalidRecipients && response.data.invalidRecipients.length > 0) {
          return { 
            success: true, 
            message: `Email sent successfully, but the following recipients were invalid: ${response.data.invalidRecipients.join(', ')}` 
          };
        }
        
        return { success: true, message: 'Email sent successfully' };
      } else {
        console.error('Server returned error:', response.data);
        return { 
          success: false, 
          message: response.data.message || 'Failed to send email',
          invalidRecipients: response.data.invalidRecipients
        };
      }
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Error details:', error.response?.data);
      
      // Try to extract the most useful error message
      let errorMessage = 'Failed to send email';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        message: errorMessage,
        invalidRecipients: error.response?.data?.invalidRecipients
      };
    }
  };

  // Handle save draft
  const handleSaveDraft = async (draftData) => {
    try {
      console.log('Saving draft:', draftData);
      const response = await axios.post(
        `${API_BASE_URL}/mail/draft`,
        draftData,
        getAxiosConfig()
      );
      console.log('Save draft response:', response.data);
      
      if (response.data.success) {
        // Refresh emails if we're in the drafts folder
        if (currentFolder === 'drafts') {
          refreshEmails();
        }
        return { 
          success: true, 
          message: 'Draft saved successfully',
          draftId: response.data.data?._id
        };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Failed to save draft' 
        };
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to save draft' 
      };
    }
  };

  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        currentFolder={currentFolder}
        onFolderChange={handleFolderChange}
        onComposeClick={handleComposeClick}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Email List */}
        <div className="h-1/2 overflow-auto border-b">
          <MailList
            emails={emails}
            loading={loading}
            error={error}
            onSelectEmail={handleSelectEmail}
            selectedEmail={selectedEmail}
            currentFolder={currentFolder}
            onRefresh={refreshEmails}
            userTeamSyncEmail={userTeamSyncEmail}
          />
        </div>

        {/* Email Viewer */}
        <div className="flex-1 overflow-hidden">
          {selectedEmail ? (
            <MailViewer 
              email={selectedEmail}
              onRefresh={() => {
                refreshEmails();
                if (selectedEmail) {
                  handleSelectEmail(selectedEmail);
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select an email to view</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <ComposeModal
          onClose={handleCloseComposeModal}
          onSend={handleSendEmail}
          onSaveDraft={handleSaveDraft}
          draftData={draftToEdit}
          userTeamSyncEmail={userTeamSyncEmail}
        />
      )}
    </div>
  );
};

export default MailSystem;
