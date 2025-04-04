import React, { useState, useEffect } from 'react';
import { X, Loader, Search } from 'lucide-react';
import axios from 'axios';

const AddAssigneesModal = ({ isOpen, onClose, taskId, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetch users when the modal is opened or taskId changes
  useEffect(() => {
    if (isOpen) {
      console.log('AddAssigneesModal opened with taskId:', taskId);
      fetchUsers();
    }
  }, [isOpen, taskId]);

  // Fetch all users and already assigned users for the task
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const pid = localStorage.getItem('project_id');
      
      console.log('Fetching users for task assignment. Task ID:', taskId);
      console.log('Project ID from localStorage:', pid);
      
      // Try to fetch all users if project-specific endpoint fails
      try {
        // First attempt: Try to get project users
        console.log(`Attempting to fetch project users: http://localhost:3001/project/get-all-users/${pid}`);
        
        const allUsersResponse = await axios.get(`http://localhost:3001/project/get-all-users/${pid}`, {
          headers: { authorization: token }
        });
        
        console.log('Project users response:', allUsersResponse.data);
        
        if (allUsersResponse.data && allUsersResponse.data.length > 0) {
          processUsers(allUsersResponse.data);
        } else {
          // If no project users, fall back to getting all users
          fetchAllUsers();
        }
      } catch (error) {
        console.error('Error fetching project users:', error);
        // Fall back to getting all users
        fetchAllUsers();
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback function to fetch all users in the system
  const fetchAllUsers = async () => {
    try {
      console.log('Falling back to fetching all users');
      const token = localStorage.getItem('token');
      
      const allUsersResponse = await axios.get('http://localhost:3001/admin/all-users', {
        headers: { authorization: token }
      });
      
      console.log('All users response:', allUsersResponse.data);
      processUsers(allUsersResponse.data);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };
  
  // Process users and handle already assigned users
  const processUsers = async (allUsers) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch users already assigned to the task
      console.log(`Fetching assigned users: http://localhost:3001/task/${taskId}/assigned-users`);
      
      const assignedUsersResponse = await axios.get(`http://localhost:3001/task/${taskId}/assigned-users`, {
        headers: { authorization: token }
      });
      
      console.log('Assigned users response:', assignedUsersResponse.data);

      // Create a set of assigned user IDs for efficient lookup
      const assignedUserIds = new Set(assignedUsersResponse.data.map(user => user.id));

      // Mark users as disabled if they're already assigned
      const processedUsers = allUsers.map(user => ({
        ...user,
        isDisabled: assignedUserIds.has(user.id)
      }));

      console.log('Processed users:', processedUsers);
      setUsers(processedUsers);
      setFilteredUsers(processedUsers);
    } catch (error) {
      console.error('Error processing users:', error);
      // Still set the users even if getting assigned users fails
      const processedUsers = allUsers.map(user => ({
        ...user,
        isDisabled: false
      }));
      setUsers(processedUsers);
      setFilteredUsers(processedUsers);
    }
  };

  // Filter users based on the search query
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Handle submit action to add selected users to the task
  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      return; // Don't do anything if no users are selected
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Adding assignees to task:', taskId);
      console.log('Selected users:', selectedUsers);
      
      // Ensure we have valid user IDs
      const validUserIds = selectedUsers
        .filter(user => user.id || user._id)
        .map(user => user.id || user._id);
      
      if (validUserIds.length === 0) {
        console.error('No valid user IDs found in selected users');
        alert('Error: Selected users do not have valid IDs');
        return;
      }
      
      console.log('Valid assignee IDs:', validUserIds);
      
      // Try different task ID formats to find the one that works
      // MongoDB typically uses _id field
      const possibleTaskIds = [
        taskId,                                  // Original ID
        taskId.toString(),                       // String version
        taskId.replace(/"/g, ''),                // Remove quotes
        taskId.replace(/ObjectId\((.*?)\)/, '$1') // Extract from ObjectId wrapper
      ];
      
      console.log('Trying these task IDs:', possibleTaskIds);
      
      let success = false;
      let lastError = null;
      
      // Try each possible task ID format
      for (const tid of possibleTaskIds) {
        if (success) break;
        
        try {
          console.log(`Trying with task ID: ${tid}`);
          const response = await axios.post(
            `http://localhost:3001/task/${tid}/add-assignee`,
            {
              assignee_ids: validUserIds
            },
            {
              headers: { authorization: token }
            }
          );
          
          console.log('Add assignee response:', response.data);
          success = true;
          
          // Show success message
          alert('Assignees added successfully!');
          
          // Call the success callback if provided
          if (typeof onSuccess === 'function') {
            onSuccess();
          }
          
          // Close the modal and reset state
          onClose();
          setSelectedUsers([]);
          return;
        } catch (error) {
          console.error(`Failed with task ID ${tid}:`, error);
          lastError = error;
        }
      }
      
      // If we get here, none of the task IDs worked
      // Try creating a custom endpoint that doesn't rely on the task ID in the URL
      try {
        console.log('Trying custom endpoint approach...');
        const response = await axios.post(
          `http://localhost:3001/task/assign`,
          {
            task_id: taskId,
            assignee_ids: validUserIds
          },
          {
            headers: { authorization: token }
          }
        );
        
        console.log('Custom endpoint response:', response.data);
        
        // Show success message
        alert('Assignees added successfully!');
        
        // Call the success callback if provided
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        
        // Close the modal and reset state
        onClose();
        setSelectedUsers([]);
        return;
      } catch (customError) {
        console.error('Custom endpoint also failed:', customError);
        lastError = lastError || customError;
      }
      
      // If we reach here, all attempts failed
      throw lastError || new Error('All task ID formats failed');
    } catch (error) {
      console.error('Error adding assignees:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to add assignees';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `: ${error.response.status} - ${error.response.data.message || error.response.statusText}`;
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        console.log('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += ': No response received from server';
        console.log('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove user from selected users list
  const removeUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userToRemove.id));
  };

  // Do not render modal if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-[600px] max-w-[95%] max-h-[95vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Assignees</h2>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Users List */}
        <div className="flex-grow overflow-y-auto mb-4 border rounded-md max-h-[200px]">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className={`flex justify-between items-center p-3 border-b last:border-b-0 transition-colors ${
                  user.isDisabled ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`font-medium ${user.isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>
                    {user.name}
                  </span>
                  <span className={`text-sm ${user.isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.email}
                  </span>
                </div>
                {user.isDisabled ? (
                  <span className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-md">
                    Already Added
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (!selectedUsers.some(selected => selected.id === user.id)) {
                        setSelectedUsers([...selectedUsers, user]);
                      }
                    }}
                    disabled={selectedUsers.some(selected => selected.id === user.id)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      selectedUsers.some(selected => selected.id === user.id)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {selectedUsers.some(selected => selected.id === user.id) ? 'Selected' : 'Add'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No users found matching your search.
            </div>
          )}
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Selected Users ({selectedUsers.length})
            </h4>
            <div className="border rounded-md max-h-[150px] overflow-y-auto">
              {selectedUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">{user.name}</span>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                  <button
                    onClick={() => removeUser(user)}
                    className="text-red-600 hover:text-red-700 text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            selectedUsers.length > 0
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={isLoading || selectedUsers.length === 0}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader className="h-5 w-5 animate-spin mr-2" />
              <span>Adding Users...</span>
            </div>
          ) : (
            `Add ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </div>
  );
};

export default AddAssigneesModal;
