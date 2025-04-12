import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, MoreHorizontal, Users, UserPlus, UserCheck, Download, Upload, Trash2, Edit, Copy, AlertCircle, Check, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateSegmentModal from './CreateSegmentModal';

const AudiencePage = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [initialSegments, setInitialSegments] = useState([
    {
      id: 1,
      name: 'New Customers',
      description: 'Customers who made their first purchase in the last 30 days',
      count: 3450,
      createdAt: '2025-03-15T10:30:00',
      lastUpdated: '2025-04-10T14:30:00'
    },
    {
      id: 2,
      name: 'Loyal Customers',
      description: 'Customers who made more than 5 purchases in the last 6 months',
      count: 2180,
      createdAt: '2025-02-20T09:15:00',
      lastUpdated: '2025-04-09T11:45:00'
    },
    {
      id: 3,
      name: 'Cart Abandoners',
      description: 'Users who added items to cart but did not complete purchase',
      count: 5670,
      createdAt: '2025-03-05T16:45:00',
      lastUpdated: '2025-04-11T08:20:00'
    },
    {
      id: 4,
      name: 'High-Value Customers',
      description: 'Customers with average order value above $200',
      count: 1240,
      createdAt: '2025-01-12T11:20:00',
      lastUpdated: '2025-04-08T15:10:00'
    },
    {
      id: 5,
      name: 'Newsletter Subscribers',
      description: 'Users who subscribed to the newsletter but haven\'t made a purchase',
      count: 12540,
      createdAt: '2025-02-28T13:10:00',
      lastUpdated: '2025-04-10T09:30:00'
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);
  
  // Load segments from localStorage on component mount
  useEffect(() => {
    const savedSegments = localStorage.getItem('marketingSegments');
    if (savedSegments) {
      try {
        // Parse saved segments
        const parsedSegments = JSON.parse(savedSegments);
        // Make sure we don't have any React components that can't be serialized
        setSegments(parsedSegments);
      } catch (error) {
        console.error('Error parsing saved segments:', error);
        // If there's an error parsing, use initial data
        setSegments(initialSegments);
      }
    } else {
      // If no saved segments, use initial data
      setSegments(initialSegments);
    }
  }, [initialSegments]);

  // Save segments to localStorage whenever they change
  useEffect(() => {
    if (segments.length > 0) {
      try {
        // Create a serializable copy of segments
        // Remove any potential circular references or React components
        const serializableSegments = segments.map(segment => {
          // Create a clean copy without any potential React components
          const { conditions, ...rest } = segment;
          
          // Make sure conditions are also serializable
          const cleanConditions = conditions?.map(condition => {
            // Remove any potential React component properties
            const { component, ...conditionRest } = condition;
            return conditionRest;
          }) || [];
          
          return {
            ...rest,
            conditions: cleanConditions
          };
        });
        
        localStorage.setItem('marketingSegments', JSON.stringify(serializableSegments));
      } catch (error) {
        console.error('Error saving segments to localStorage:', error);
      }
    }
  }, [segments]);
  
  const handleBackToMarketing = () => {
    navigate('/marketing');
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard/user');
  };
  
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };
  
  const handleSaveSegment = (newSegment) => {
    setSegments([newSegment, ...segments]);
    showNotification('success', 'Segment created successfully!');
  };
  
  const handleExport = () => {
    setIsLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      
      // Create a sample CSV content for demonstration
      const headers = ['Segment ID', 'Name', 'Description', 'Audience Size', 'Created Date', 'Last Updated'];
      
      let csvContent = headers.join(',') + '\n';
      
      // Add data rows
      segments.forEach(segment => {
        const row = [
          segment.id,
          segment.name,
          `"${segment.description.replace(/"/g, '""')}"`, // Handle quotes in description
          segment.count,
          new Date(segment.createdAt).toISOString().split('T')[0],
          new Date(segment.lastUpdated).toISOString().split('T')[0]
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `audience_segments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('success', 'Segments exported successfully!');
    }, 1000);
  };
  
  const handleImportClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    
    // Simulate file processing
    setTimeout(() => {
      // Create some mock imported segments
      const newSegments = [
        {
          id: Date.now(),
          name: 'Imported - High Engagement Users',
          description: 'Users with high engagement scores from imported data',
          count: 3280,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        {
          id: Date.now() + 1,
          name: 'Imported - Recent Purchasers',
          description: 'Customers who made a purchase in the last 7 days from imported data',
          count: 1450,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      ];
      
      setSegments([...newSegments, ...segments]);
      setIsLoading(false);
      showNotification('success', `Successfully imported ${newSegments.length} segments from ${file.name}`);
      
      // Reset the file input
      e.target.value = null;
    }, 1500);
  };
  
  const showNotification = (type, message) => {
    setNotification({ type, message });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  const filteredSegments = segments
    .filter(segment => 
      segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'count') {
        comparison = a.count - b.count;
      } else if (sortBy === 'lastUpdated') {
        comparison = new Date(a.lastUpdated) - new Date(b.lastUpdated);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Demographics data
  const demographics = {
    age: [
      { group: '18-24', percentage: 15 },
      { group: '25-34', percentage: 32 },
      { group: '35-44', percentage: 28 },
      { group: '45-54', percentage: 18 },
      { group: '55+', percentage: 7 }
    ],
    gender: [
      { group: 'Male', percentage: 45 },
      { group: 'Female', percentage: 52 },
      { group: 'Other', percentage: 3 }
    ],
    location: [
      { group: 'United States', percentage: 42 },
      { group: 'Europe', percentage: 28 },
      { group: 'Asia', percentage: 18 },
      { group: 'Other', percentage: 12 }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBackToMarketing}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Audience Management</h1>
        </div>
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Home className="h-4 w-4 mr-2" />
          Main Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search segments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".csv,.xlsx"
                className="hidden"
              />
              <button 
                className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={handleImportClick}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <button 
                className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={handleExport}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button 
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleOpenCreateModal}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Segment Name
                      {sortBy === 'name' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('count')}
                  >
                    <div className="flex items-center">
                      Audience Size
                      {sortBy === 'count' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('lastUpdated')}
                  >
                    <div className="flex items-center">
                      Last Updated
                      {sortBy === 'lastUpdated' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSegments.map((segment) => (
                  <tr key={segment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{segment.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">{segment.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {segment.count.toLocaleString()} contacts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(segment.lastUpdated)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <Edit className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <Copy className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSegments.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No segments found matching your criteria.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Audience Overview</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Total Audience</h3>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">25,080</span>
              <span className="ml-2 text-sm text-green-600">+12.3% this month</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Age Distribution</h3>
            {demographics.age.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">{item.group}</span>
                  <span className="text-xs font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Gender</h3>
            {demographics.gender.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">{item.group}</span>
                  <span className="text-xs font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
            {demographics.location.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">{item.group}</span>
                  <span className="text-xs font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Create Segment Modal */}
      <CreateSegmentModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseCreateModal} 
        onSave={handleSaveSegment} 
      />
      
      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudiencePage;
