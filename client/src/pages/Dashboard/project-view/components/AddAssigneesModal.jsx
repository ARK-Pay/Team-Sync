import React, { useState, useEffect } from 'react';
import { X, Loader, Search, RefreshCw, CheckCircle, UserPlus, User, Mail, Phone } from 'lucide-react';
import axios from 'axios';

const AddAssigneesModal = ({ isOpen, onClose, taskId, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Use this exact list of all team members to ensure they're always visible
  const teamMembers = [
    {
      id: '680d1dce149c0329d6d7e7',
      name: 'Aaryan',
      email: 'aaryankumar57834@gmail.com',
      phone: '+1234567890',
      role: 'admin',
      status: 'active',
      isDisabled: false
    },
    {
      id: '680dde083470c2da818eea6',
      name: 'Kshitij',
      email: 'diodexhackathon@gmail.com',
      phone: '+1987654321',
      role: 'developer',
      status: 'active',
      isDisabled: false
    },
    {
      id: '680de43e4705c2da816ef66',
      name: 'Kshitij',
      email: 'kshitij@example.com',
      phone: null,
      role: 'manager',
      status: 'active',
      isDisabled: false
    },
    {
      id: '680df3944b3aa3a348f66a',
      name: 'Rahul',
      email: 'createsrahul@gmail.com',
      phone: '+1122334455',
      role: 'designer',
      status: 'active',
      isDisabled: false
    }
  ];

  // Set users when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Always start with the team members we know exist
      setUsers(teamMembers);
      setFilteredUsers(teamMembers);
      fetchUsers();
    }
  }, [isOpen]);

  // Fetch users when the modal is opened or taskId changes
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const pid = localStorage.getItem('project_id');
      
      console.log('Fetching users for task assignment. Task ID:', taskId);
      console.log('Project ID from localStorage:', pid);
      
      // PRIORITY 1: Try the project users endpoint first
      if (pid) {
        try {
          console.log(`Attempting to fetch project users: http://localhost:3001/project/get-all-users/${pid}`);
          const projectUsersResponse = await axios.get(`http://localhost:3001/project/get-all-users/${pid}`, {
            headers: { authorization: token }
          });
          
          if (projectUsersResponse.data && Array.isArray(projectUsersResponse.data) && projectUsersResponse.data.length > 0) {
            console.log('Project users response:', projectUsersResponse.data);
            const formattedUsers = projectUsersResponse.data.map(user => ({
              id: user.id || user._id,
              name: user.name || (user.email ? user.email.split('@')[0] : 'Unknown User'),
              email: user.email || '',
              phone: user.phone || null,
              role: user.role || 'user',
              status: user.status || 'active',
              isDisabled: false
            }));
            processUsers(formattedUsers);
            return;
          }
        } catch (projectError) {
          console.error('Error fetching project users:', projectError);
        }
      }
      
      // If we get here, the API call failed or returned no users
      // Just use our hardcoded team members as fallback
      console.log('Using hardcoded team members as fallback');
      processUsers(teamMembers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      // Even if everything fails, use the hardcoded team members
      processUsers(teamMembers);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process users and handle already assigned users
  const processUsers = async (allUsers) => {
    try {
      const token = localStorage.getItem('token');
      
      // Try to fetch users already assigned to the task
      try {
        console.log(`Fetching assigned users: http://localhost:3001/task/${taskId}/assigned-users`);
        
        const assignedUsersResponse = await axios.get(`http://localhost:3001/task/${taskId}/assigned-users`, {
          headers: { authorization: token }
        });
        
        console.log('Assigned users response:', assignedUsersResponse.data);

        // Create a set of assigned user IDs for efficient lookup
        const assignedUserIds = new Set();
        if (assignedUsersResponse.data && Array.isArray(assignedUsersResponse.data)) {
          assignedUsersResponse.data.forEach(user => {
            if (user.id) assignedUserIds.add(user.id);
            if (user._id) assignedUserIds.add(user._id);
            if (user.email) assignedUserIds.add(user.email);
          });
        }

        // Mark users as disabled if they're already assigned
        const processedUsers = allUsers.map(user => ({
          ...user,
          isDisabled: assignedUserIds.has(user.id) || assignedUserIds.has(user._id) || assignedUserIds.has(user.email)
        }));

        console.log('Processed users:', processedUsers);
        setUsers(processedUsers);
        setFilteredUsers(processedUsers);
      } catch (error) {
        console.error('Error processing assigned users:', error);
        // Still set the users even if getting assigned users fails
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      }
    } catch (error) {
      console.error('Error in processUsers:', error);
      // Still set the users even if everything fails
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.phone && user.phone.toLowerCase().includes(query)) ||
      (user.role && user.role.toLowerCase().includes(query))
    );
    setFilteredUsers(filtered);
  };

  // Add selected users to the task
  const handleSubmit = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Adding assignees to task:', taskId);
      console.log('Selected users:', selectedUsers);
      
      // Get IDs and emails for maximum compatibility
      const userIds = selectedUsers.map(user => user.id || user._id);
      const userEmails = selectedUsers.map(user => user.email);
      
      // Try both formats to increase chances of success
      console.log('Adding assignees with IDs:', userIds);
      console.log('Adding assignees with emails:', userEmails);
      
      // Use the most reliable endpoint with both formats
      const response = await axios.post(
        `http://localhost:3001/task/assign`,
        {
          task_id: taskId,
          assignee_ids: [...userIds, ...userEmails] // Send both formats
        },
        { headers: { authorization: token } }
      );
      
      console.log('Assignment response:', response.data);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding assignees:', error);
      alert('Failed to add assignees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Get color based on user ID for consistent coloring
  const getRandomColor = (userId) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-red-500', 'bg-teal-500', 'bg-orange-500'
    ];
    
    if (!userId) return colors[0];
    
    // Create a consistent hash from the userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use the hash to select a color
    return colors[Math.abs(hash) % colors.length];
  };

  // Get role badge styling
  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'manager':
        return 'bg-purple-100 text-purple-700';
      case 'developer':
        return 'bg-blue-100 text-blue-700';
      case 'designer':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status indicator style
  const getStatusIndicatorStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-400';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-[700px] max-w-[95%] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold">Add Assignees</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 relative">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <div className="p-2 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search team members by name, email, role..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full py-2 px-2 focus:outline-none"
            />
            <button 
              onClick={fetchUsers}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Refresh user list"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-2 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Team Members</h3>
          <span className="text-xs text-gray-500">{filteredUsers.filter(u => !u.isDisabled).length} available</span>
        </div>

        <div className="flex-grow overflow-y-auto mb-4 border rounded-md">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-6 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p>Loading team members...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">User</th>
                  <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Contact</th>
                  <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Role</th>
                  <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id || user._id || user.email} 
                      className={`${user.isDisabled ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${getRandomColor(user.id)} flex items-center justify-center text-white font-medium`}>
                          {getInitials(user.name)}
                        </div>
                        <div className="ml-3">
                          <div className={`font-medium ${user.isDisabled ? 'text-gray-500' : 'text-gray-800'}`}>
                            {user.name || (user.email ? user.email.split('@')[0] : 'Unknown User')}
                          </div>
                          <div className="text-xs text-gray-500">ID: {user.id || user._id || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <Mail className="h-3 w-3" />
                          <span>{user.email || 'N/A'}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user.role)}`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusIndicatorStyle(user.status)}`}></div>
                        <span className="text-xs text-gray-700 capitalize">{user.status || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {user.isDisabled ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Assigned
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (!selectedUsers.some(selected => 
                              selected.id === user.id || selected._id === user._id || selected.email === user.email)) {
                              setSelectedUsers([...selectedUsers, user]);
                            }
                          }}
                          disabled={selectedUsers.some(selected => 
                            selected.id === user.id || selected._id === user._id || selected.email === user.email)}
                          className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                            selectedUsers.some(selected => 
                              selected.id === user.id || selected._id === user._id || selected.email === user.email)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {selectedUsers.some(selected => 
                            selected.id === user.id || selected._id === user._id || selected.email === user.email) 
                            ? <CheckCircle className="w-3 h-3 mr-1" /> 
                            : <UserPlus className="w-3 h-3 mr-1" />}
                          {selectedUsers.some(selected => 
                            selected.id === user.id || selected._id === user._id || selected.email === user.email) 
                            ? 'Selected' 
                            : 'Assign'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {filteredUsers.length === 0 && users.length === 0 ? (
                <div>
                  <User className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p>No team members available.</p>
                  <button 
                    onClick={fetchUsers} 
                    className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 inline-flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Members
                  </button>
                </div>
              ) : (
                <p>No users found matching your search.</p>
              )}
            </div>
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Selected Members</h3>
              <span className="text-xs text-blue-600 font-medium">{selectedUsers.length} selected</span>
            </div>
            <div className="border rounded-md p-2 flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div key={user.id || user._id || user.email} 
                     className="flex items-center bg-blue-50 text-blue-700 rounded-full pl-1 pr-2 py-1">
                  <div className={`w-6 h-6 rounded-full ${getRandomColor(user.id)} flex items-center justify-center text-white text-xs font-medium mr-1`}>
                    {getInitials(user.name)}
                  </div>
                  <span className="text-xs mr-1">
                    {user.name || (user.email ? user.email.split('@')[0] : 'Unknown')}
                  </span>
                  <button
                    onClick={() => setSelectedUsers(selectedUsers.filter(u => 
                      (u.id !== user.id) && (u._id !== user._id) && (u.email !== user.email)))}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4 flex justify-end items-center space-x-2 mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md text-white transition-colors ${
              selectedUsers.length > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={isLoading || selectedUsers.length === 0}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Assigning...
              </span>
            ) : (
              `Assign ${selectedUsers.length} ${selectedUsers.length === 1 ? 'Member' : 'Members'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAssigneesModal;
