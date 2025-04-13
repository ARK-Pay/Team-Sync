import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, MoreHorizontal, Users, UserPlus, UserCheck, Download, Upload, Trash2, Edit, Copy, AlertCircle, Check, Home, ChevronDown, BarChart3, PieChart, UserRound, MapPin, RefreshCw, X } from 'lucide-react';
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
  
  // New state for filter functionality
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    audienceSize: {
      min: 0,
      max: 50000,
      enabled: false
    },
    creationDate: {
      from: null,
      to: null,
      enabled: false
    },
    activeFilters: []
  });
  const filterMenuRef = useRef(null);
  
  // New state for edit functionality
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({ title: '', message: '', onConfirm: null });
  
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
  
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate data refresh with a delay
    setTimeout(() => {
      // Reset to initial segments
      setSegments([...initialSegments]);
      setIsLoading(false);
      showNotification('success', 'Audience data refreshed successfully!');
    }, 1000);
  };
  
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };
  
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: {
        ...prev[filterType],
        ...value
      }
    }));
  };
  
  const applyFilters = () => {
    // Create a list of active filters for display
    const activeFilters = [];
    
    if (filters.audienceSize.enabled) {
      activeFilters.push({
        id: 'audienceSize',
        label: `Audience size: ${filters.audienceSize.min.toLocaleString()} - ${filters.audienceSize.max.toLocaleString()}`
      });
    }
    
    if (filters.creationDate.enabled && filters.creationDate.from && filters.creationDate.to) {
      const fromDate = new Date(filters.creationDate.from).toLocaleDateString();
      const toDate = new Date(filters.creationDate.to).toLocaleDateString();
      activeFilters.push({
        id: 'creationDate',
        label: `Created: ${fromDate} - ${toDate}`
      });
    }
    
    setFilters(prev => ({
      ...prev,
      activeFilters
    }));
    
    setIsFilterMenuOpen(false);
    showNotification('success', 'Filters applied successfully!');
  };
  
  const removeFilter = (filterId) => {
    // Remove the specific filter
    if (filterId === 'audienceSize') {
      setFilters(prev => ({
        ...prev,
        audienceSize: {
          ...prev.audienceSize,
          enabled: false
        },
        activeFilters: prev.activeFilters.filter(f => f.id !== filterId)
      }));
    } else if (filterId === 'creationDate') {
      setFilters(prev => ({
        ...prev,
        creationDate: {
          ...prev.creationDate,
          enabled: false
        },
        activeFilters: prev.activeFilters.filter(f => f.id !== filterId)
      }));
    }
  };
  
  const clearAllFilters = () => {
    setFilters({
      audienceSize: {
        min: 0,
        max: 50000,
        enabled: false
      },
      creationDate: {
        from: null,
        to: null,
        enabled: false
      },
      activeFilters: []
    });
  };
  
  const handleEditSegment = (segment) => {
    setCurrentSegment(segment);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentSegment(null);
  };
  
  const handleUpdateSegment = (updatedSegment) => {
    // Update the segment in the segments array
    const updatedSegments = segments.map(segment => 
      segment.id === updatedSegment.id ? updatedSegment : segment
    );
    
    setSegments(updatedSegments);
    setIsEditModalOpen(false);
    setCurrentSegment(null);
    showNotification('success', 'Segment updated successfully!');
  };
  
  const handleDuplicateSegment = (segment) => {
    // Create a duplicate with a new ID and slightly modified name
    const duplicatedSegment = {
      ...segment,
      id: Date.now(),
      name: `${segment.name} (Copy)`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    setSegments([duplicatedSegment, ...segments]);
    showNotification('success', 'Segment duplicated successfully!');
  };
  
  const handleDeleteClick = (segment) => {
    setSegmentToDelete(segment);
    openConfirmModal(
      'Delete Segment',
      `Are you sure you want to delete "${segment.name}"? This action cannot be undone.`,
      () => confirmDeleteSegment(segment.id)
    );
  };
  
  const confirmDeleteSegment = (segmentId) => {
    // Remove the segment from the segments array
    const updatedSegments = segments.filter(segment => segment.id !== segmentId);
    setSegments(updatedSegments);
    closeConfirmModal();
    showNotification('success', 'Segment deleted successfully!');
  };
  
  const openConfirmModal = (title, message, onConfirm) => {
    setConfirmModalConfig({ title, message, onConfirm });
    setIsConfirmModalOpen(true);
  };
  
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSegmentToDelete(null);
  };
  
  const filteredSegments = segments
    .filter(segment => 
      // Text search filter
      (segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      // Audience size filter
      (!filters.audienceSize.enabled || 
        (segment.count >= filters.audienceSize.min && 
         segment.count <= filters.audienceSize.max)) &&
      // Creation date filter
      (!filters.creationDate.enabled || 
        (!filters.creationDate.from || !filters.creationDate.to) ||
        (new Date(segment.createdAt) >= new Date(filters.creationDate.from) && 
         new Date(segment.createdAt) <= new Date(filters.creationDate.to)))
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

  // Close filter menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToMarketing}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Back to Marketing"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Audience Management</h1>
            </div>
            <button 
              onClick={handleBackToDashboard}
              className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Main Dashboard
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <UserRound className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Audience</p>
              <p className="text-xl font-bold text-gray-800">25,080</p>
              <p className="text-xs text-green-600 flex items-center">
                <ChevronDown className="h-3 w-3 transform rotate-180 mr-1" />
                12.3% this month
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">New Subscribers</p>
              <p className="text-xl font-bold text-gray-800">1,245</p>
              <p className="text-xs text-green-600 flex items-center">
                <ChevronDown className="h-3 w-3 transform rotate-180 mr-1" />
                8.5% this month
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Engagement Rate</p>
              <p className="text-xl font-bold text-gray-800">24.8%</p>
              <p className="text-xs text-red-600 flex items-center">
                <ChevronDown className="h-3 w-3 mr-1" />
                2.1% this month
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
            <div className="rounded-full bg-amber-100 p-3 mr-4">
              <PieChart className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Segments</p>
              <p className="text-xl font-bold text-gray-800">{segments.length}</p>
              <p className="text-xs text-gray-500">Last updated today</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Segments Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Audience Segments</h2>
                
                <div className="flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportFile}
                    accept=".csv,.xlsx"
                    className="hidden"
                  />
                  <button 
                    className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    onClick={handleImportClick}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </button>
                  <button 
                    className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    onClick={handleExport}
                    disabled={isLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button 
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    onClick={handleOpenCreateModal}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Segment
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search segments..."
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative" ref={filterMenuRef}>
                    <button 
                      className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm w-full sm:w-auto justify-center sm:justify-start"
                      onClick={toggleFilterMenu}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                      <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isFilterMenuOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    
                    {isFilterMenuOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-medium text-gray-700">Filter Segments</h3>
                            <button 
                              className="text-gray-400 hover:text-gray-600"
                              onClick={toggleFilterMenu}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium text-gray-700">Audience Size</label>
                              <div className="flex items-center">
                                <input 
                                  type="checkbox" 
                                  className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                  checked={filters.audienceSize.enabled}
                                  onChange={(e) => handleFilterChange('audienceSize', { enabled: e.target.checked })}
                                />
                                <span className="text-xs text-gray-500">Enable</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="number" 
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Min"
                                value={filters.audienceSize.min}
                                onChange={(e) => handleFilterChange('audienceSize', { min: parseInt(e.target.value) || 0 })}
                                disabled={!filters.audienceSize.enabled}
                              />
                              <span className="text-gray-500">to</span>
                              <input 
                                type="number" 
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Max"
                                value={filters.audienceSize.max}
                                onChange={(e) => handleFilterChange('audienceSize', { max: parseInt(e.target.value) || 0 })}
                                disabled={!filters.audienceSize.enabled}
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium text-gray-700">Creation Date</label>
                              <div className="flex items-center">
                                <input 
                                  type="checkbox" 
                                  className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                  checked={filters.creationDate.enabled}
                                  onChange={(e) => handleFilterChange('creationDate', { enabled: e.target.checked })}
                                />
                                <span className="text-xs text-gray-500">Enable</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="date" 
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.creationDate.from || ''}
                                onChange={(e) => handleFilterChange('creationDate', { from: e.target.value })}
                                disabled={!filters.creationDate.enabled}
                              />
                              <span className="text-gray-500">to</span>
                              <input 
                                type="date" 
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filters.creationDate.to || ''}
                                onChange={(e) => handleFilterChange('creationDate', { to: e.target.value })}
                                disabled={!filters.creationDate.enabled}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between pt-3 border-t border-gray-200">
                            <button 
                              className="px-3 py-2 text-xs text-gray-700 hover:text-gray-900"
                              onClick={clearAllFilters}
                            >
                              Clear all
                            </button>
                            <button 
                              className="px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              onClick={applyFilters}
                            >
                              Apply Filters
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm w-full sm:w-auto justify-center sm:justify-start"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Active filters display */}
              {filters.activeFilters.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  {filters.activeFilters.map((filter) => (
                    <div 
                      key={filter.id} 
                      className="flex items-center bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md"
                    >
                      <span>{filter.label}</span>
                      <button 
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        onClick={() => removeFilter(filter.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button 
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                    onClick={clearAllFilters}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                    <tr key={segment.id} className="hover:bg-gray-50 transition-colors">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{segment.count.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">contacts</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(segment.lastUpdated)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button 
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors" 
                            title="Edit"
                            onClick={() => handleEditSegment(segment)}
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </button>
                          <button 
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors" 
                            title="Duplicate"
                            onClick={() => handleDuplicateSegment(segment)}
                          >
                            <Copy className="h-4 w-4 text-gray-500" />
                          </button>
                          <button 
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors" 
                            title="Delete"
                            onClick={() => handleDeleteClick(segment)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </button>
                          <button className="p-1 rounded-full hover:bg-gray-100 transition-colors" title="More options">
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
                <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                  <Users className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-500 mb-2">No segments found matching your criteria.</p>
                <button 
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Segment
                </button>
              </div>
            )}
            
            {filteredSegments.length > 0 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredSegments.length}</span> of <span className="font-medium">{segments.length}</span> segments
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors" disabled>Previous</button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors" disabled>Next</button>
                </div>
              </div>
            )}
          </div>
          
          {/* Audience Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Audience Overview</h2>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Total Audience</h3>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">25,080</span>
                <span className="ml-2 text-sm text-green-600 flex items-center">
                  <ChevronDown className="h-3 w-3 transform rotate-180 mr-1" />
                  12.3% this month
                </span>
              </div>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Age Distribution</h3>
                <div className="p-1 rounded-md bg-blue-50 text-blue-600 text-xs font-medium">Demographics</div>
              </div>
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
            
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Gender</h3>
                <div className="p-1 rounded-md bg-purple-50 text-purple-600 text-xs font-medium">Demographics</div>
              </div>
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
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Location</h3>
                <div className="p-1 rounded-md bg-green-50 text-green-600 text-xs font-medium">Geography</div>
              </div>
              {demographics.location.map((item, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{item.group}</span>
                    </div>
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
      </div>
      
      {/* Create Segment Modal */}
      <CreateSegmentModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseCreateModal} 
        onSave={handleSaveSegment} 
      />
      
      {/* Edit Segment Modal */}
      {currentSegment && (
        <CreateSegmentModal 
          isOpen={isEditModalOpen} 
          onClose={handleCloseEditModal} 
          onSave={handleUpdateSegment}
          segment={currentSegment}
          isEditing={true}
        />
      )}
      
      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{confirmModalConfig.title}</h3>
            <p className="text-gray-500 mb-6">{confirmModalConfig.message}</p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={closeConfirmModal}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={confirmModalConfig.onConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudiencePage;
