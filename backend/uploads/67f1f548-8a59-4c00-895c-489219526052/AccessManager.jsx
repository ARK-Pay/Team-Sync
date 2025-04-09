import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faUserEdit, faUserCog, faUserCheck, faUserTimes, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';

const AccessManager = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Fetch users and projects on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        // Fetch users
        const usersResponse = await axios.get('http://localhost:3001/admin/users', {
          headers: { 'authorization': token }
        }).catch(() => ({ data: [] }));

        // Fetch projects
        const projectsResponse = await axios.get('http://localhost:3001/project/all-projects', {
          headers: { 'authorization': token }
        }).catch(() => ({ data: [] }));

        setUsers(usersResponse.data || []);
        setProjects(projectsResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load access management data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch permissions for a specific user and project
  const fetchPermissions = async (userId, projectId) => {
    try {
      const token = localStorage.getItem('token');
      // This endpoint might need to be implemented in your backend
      const response = await axios.get(`http://localhost:3001/access/permissions`, {
        params: { userId, projectId },
        headers: { 'authorization': token }
      }).catch(() => ({ data: [] }));

      setPermissions(response.data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to load permissions');
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (selectedProject) {
      fetchPermissions(user.id, selectedProject.id);
    }
  };

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    if (selectedUser) {
      fetchPermissions(selectedUser.id, project.id);
    }
  };

  // Update user permission
  const updatePermission = async (userId, projectId, permission) => {
    try {
      const token = localStorage.getItem('token');
      // This endpoint might need to be implemented in your backend
      await axios.post('http://localhost:3001/access/update-permission', {
        userId,
        projectId,
        permission
      }, {
        headers: { 'authorization': token }
      });

      toast.success('Permission updated successfully');
      fetchPermissions(userId, projectId);
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Access Manager</h1>
        <p className="text-gray-600 mb-4">
          Manage user permissions and access control for your projects. Assign roles and control who can view, edit, or administer each project.
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users Panel */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FontAwesomeIcon icon={faUserCog} className="mr-2 text-blue-500" />
                Users
              </h2>
              
              <div className="mb-4">
                <div className="flex items-center bg-white rounded-md border border-gray-300 overflow-hidden">
                  <FontAwesomeIcon icon={faSearch} className="ml-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full p-2 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                  <select
                    className="bg-white border border-gray-300 rounded-md p-1 text-sm w-full"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Users</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <li 
                        key={user.id}
                        className={`p-3 hover:bg-gray-100 cursor-pointer rounded-md ${selectedUser?.id === user.id ? 'bg-blue-50 border border-blue-200' : ''}`}
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <div className="ml-auto">
                            <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                              {user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-gray-500">No users found</div>
                )}
              </div>
            </div>
            
            {/* Projects Panel */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FontAwesomeIcon icon={faUserShield} className="mr-2 text-blue-500" />
                Projects
              </h2>
              
              <div className="mb-4">
                <div className="flex items-center bg-white rounded-md border border-gray-300 overflow-hidden">
                  <FontAwesomeIcon icon={faSearch} className="ml-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full p-2 outline-none"
                  />
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {projects.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {projects.map(project => (
                      <li 
                        key={project.id}
                        className={`p-3 hover:bg-gray-100 cursor-pointer rounded-md ${selectedProject?.id === project.id ? 'bg-blue-50 border border-blue-200' : ''}`}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              {project.name ? project.name.charAt(0).toUpperCase() : 'P'}
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{project.name}</p>
                            <p className="text-xs text-gray-500">
                              {project.description?.length > 30 
                                ? `${project.description.substring(0, 30)}...` 
                                : project.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-gray-500">No projects found</div>
                )}
              </div>
            </div>
            
            {/* Permissions Panel */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FontAwesomeIcon icon={faUserEdit} className="mr-2 text-blue-500" />
                Permissions
              </h2>
              
              {selectedUser && selectedProject ? (
                <div>
                  <div className="bg-blue-50 p-3 rounded-md mb-4 border border-blue-100">
                    <p className="text-sm font-medium">Managing access for:</p>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <p className="text-xs text-gray-600">User:</p>
                        <p className="font-medium">{selectedUser.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Project:</p>
                        <p className="font-medium">{selectedProject.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">View Access</p>
                          <p className="text-xs text-gray-500">Can view project details and tasks</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={permissions.includes('view')}
                            onChange={() => updatePermission(selectedUser.id, selectedProject.id, 'view')}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Edit Access</p>
                          <p className="text-xs text-gray-500">Can create and modify tasks</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={permissions.includes('edit')}
                            onChange={() => updatePermission(selectedUser.id, selectedProject.id, 'edit')}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Admin Access</p>
                          <p className="text-xs text-gray-500">Full control over project settings</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={permissions.includes('admin')}
                            onChange={() => updatePermission(selectedUser.id, selectedProject.id, 'admin')}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FontAwesomeIcon icon={faUserCheck} className="text-gray-300 text-5xl mb-4" />
                  <p className="text-gray-500">Select a user and project to manage permissions</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessManager;
