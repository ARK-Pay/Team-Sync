import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, Filter, MoreHorizontal, Mail, Phone, Edit, Trash2, Shield, UserCheck, Clock, User } from 'lucide-react';

const UsersProject = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // User statistics
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    admins: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/admin/all-users-Users', {
        headers: {
          'authorization': token,
          'Content-Type': 'application/json'
        },
      });
      
      const userData = response.data;
      setUsers(userData);
      setFilteredUsers(userData);
      
      // Calculate user statistics
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const stats = {
        total: userData.length,
        active: userData.filter(user => user.status === 'active').length,
        newThisMonth: userData.filter(user => {
          const createdDate = new Date(user.createdAt);
          return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
        }).length,
        admins: userData.filter(user => user.role === 'admin').length
      };
      
      setUserStats(stats);
      setLoading(false);
    } catch (error) {
      setError(error.response ? error.response.data.message : error.message);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = users.filter((user) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        (user.phone && user.phone.includes(lowerCaseQuery)) ||
        (user.role && user.role.toLowerCase().includes(lowerCaseQuery))
      );
    });
    setFilteredUsers(filtered);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredUsers(sortedUsers);
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    filterUsers(role, selectedStatus);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    filterUsers(selectedRole, status);
  };

  const filterUsers = (role, status) => {
    let filtered = [...users];
    
    if (role !== 'all') {
      filtered = filtered.filter(user => user.role === role);
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(user => user.status === status);
    }
    
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        (user.phone && user.phone.includes(lowerCaseQuery)) ||
        (user.role && user.role.toLowerCase().includes(lowerCaseQuery))
      );
    }
    
    setFilteredUsers(filtered);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (userId) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-amber-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-red-500', 'bg-teal-500', 'bg-cyan-500'
    ];
    
    // Use the user ID to deterministically select a color
    const index = userId ? userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
    return colors[index];
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'developer':
        return 'bg-green-100 text-green-800';
      case 'designer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIndicatorStyle = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-400';
      case 'pending':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
            <p className="text-gray-500 mt-1">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'} • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              <span>Invite User</span>
            </button>
            
            <button 
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              onClick={fetchUsers}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* User Analytics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm font-medium text-blue-600 mb-1">Total Users</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-800">{userStats.total}</p>
              <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm font-medium text-green-600 mb-1">Active Users</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-800">{userStats.active}</p>
              <div className="p-2 bg-green-100 rounded-md text-green-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm font-medium text-amber-600 mb-1">New This Month</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-800">{userStats.newThisMonth}</p>
              <div className="p-2 bg-amber-100 rounded-md text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-sm font-medium text-red-600 mb-1">Admins</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-800">{userStats.admins}</p>
              <div className="p-2 bg-red-100 rounded-md text-red-600">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
            </form>
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedRole}
              onChange={(e) => handleRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
            </select>
            
            <select
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            
            <button 
              type="submit" 
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-sm"
              onClick={handleSearch}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-800">
            <p className="font-medium">Error loading users</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No users found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? "No users match your search criteria." 
                : "There are no users in the system yet."}
            </p>
            <button 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite your first user
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center gap-1 hover:text-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      User
                      {sortConfig.key === 'name' && (
                        <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center gap-1 hover:text-gray-700"
                      onClick={() => handleSort('email')}
                    >
                      Contact
                      {sortConfig.key === 'email' && (
                        <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center gap-1 hover:text-gray-700"
                      onClick={() => handleSort('role')}
                    >
                      Role
                      {sortConfig.key === 'role' && (
                        <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center gap-1 hover:text-gray-700"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortConfig.key === 'status' && (
                        <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center gap-1 hover:text-gray-700"
                      onClick={() => handleSort('createdAt')}
                    >
                      Joined
                      {sortConfig.key === 'createdAt' && (
                        <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getRandomColor(user._id)}`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{user.name}</div>
                          <div className="text-xs text-gray-500">ID: {user._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user.role)}`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusIndicatorStyle(user.status)}`}></div>
                        <span className="text-gray-700 capitalize">{user.status || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">{formatDate(user.createdAt)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative">
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <MoreHorizontal className="h-5 w-5 text-gray-500" />
                        </button>
                        {/* Dropdown menu would go here */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1 border rounded-md text-sm bg-blue-50 text-blue-600 border-blue-200">
                1
              </button>
              <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersProject;