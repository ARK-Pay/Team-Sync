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
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Setup axios config with auth token
  const getAxiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  });

  // Fetch emails from the API
  const fetchEmails = async (folder) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/mail?folder=${folder}`,
        getAxiosConfig()
      );
      setEmails(response.data.data || []);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to load emails. Please try again.');
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
        `${API_BASE_URL}/mail/starred`,
        getAxiosConfig()
      );
      console.log('Starred emails response:', response.data);
      setEmails(response.data.data || []);
    } catch (err) {
      console.error('Error fetching starred emails:', err);
      setError('Failed to load starred emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch emails when folder changes
  useEffect(() => {
    if (currentFolder === 'starred') {
      fetchStarredEmails();
    } else {
      fetchEmails(currentFolder);
    }
  }, [currentFolder]);

  // Handle folder change
  const handleFolderChange = (folder) => {
    setCurrentFolder(folder);
    setSelectedEmail(null);
  };

  // Handle email selection
  const handleSelectEmail = async (email) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/mail/${email._id}`,
        getAxiosConfig()
      );
      setSelectedEmail(response.data.data);
    } catch (err) {
      console.error('Error fetching email details:', err);
      setError('Failed to load email details. Please try again.');
    }
  };

  // Handle compose button click
  const handleComposeClick = () => {
    setShowComposeModal(true);
  };

  // Handle close compose modal
  const handleCloseComposeModal = () => {
    setShowComposeModal(false);
  };

  // Handle send email
  const handleSendEmail = async (emailData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mail/send`,
        emailData,
        getAxiosConfig()
      );
      if (response.data.success) {
        if (currentFolder === 'sent') {
          fetchEmails('sent');
        }
        return { success: true, message: 'Email sent successfully' };
      } else {
        return { success: false, message: response.data.message || 'Failed to send email' };
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to send email' };
    }
  };

  // Handle save draft
  const handleSaveDraft = async (draftData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mail/draft`,
        draftData,
        getAxiosConfig()
      );
      if (response.data.success) {
        if (currentFolder === 'drafts') {
          fetchEmails('drafts');
        }
        return { success: true, message: 'Draft saved successfully' };
      } else {
        return { success: false, message: response.data.message || 'Failed to save draft' };
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to save draft' };
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
            onRefresh={() => fetchEmails(currentFolder)}
          />
        </div>

        {/* Email Viewer */}
        <div className="flex-1 overflow-hidden">
          {selectedEmail ? (
            <MailViewer 
              email={selectedEmail}
              onRefresh={() => {
                fetchEmails(currentFolder);
                handleSelectEmail(selectedEmail);
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
        />
      )}
    </div>
  );
};

export default MailSystem;
