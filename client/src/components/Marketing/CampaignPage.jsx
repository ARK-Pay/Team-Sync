import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, MoreHorizontal, Mail, MessageSquare, Instagram, Facebook, Twitter, Youtube, Trash2, Edit, Copy, BarChart2, AlertCircle, Check, Home, Loader2, ChevronDown, Download, RefreshCw, Calendar, Clock, Users, PieChart, TrendingUp, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateCampaignModal from './CreateCampaignModal';

const CampaignPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [initialCampaigns, setInitialCampaigns] = useState([
    {
      id: 1,
      name: 'Spring Product Launch',
      status: 'Active',
      type: 'Email',
      audience: 'New Customers',
      sent: 12500,
      opened: 5680,
      clicked: 2340,
      lastUpdated: '2025-04-10T14:30:00',
      icon: <Mail className="h-4 w-4" />
    },
    {
      id: 2,
      name: 'Social Media Promotion',
      status: 'Scheduled',
      type: 'Social',
      audience: 'All Subscribers',
      sent: 0,
      opened: 0,
      clicked: 0,
      lastUpdated: '2025-04-11T09:15:00',
      icon: <Instagram className="h-4 w-4" />
    },
    {
      id: 3,
      name: 'Customer Feedback Survey',
      status: 'Draft',
      type: 'Email',
      audience: 'Existing Customers',
      sent: 0,
      opened: 0,
      clicked: 0,
      lastUpdated: '2025-04-09T16:45:00',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: 4,
      name: 'Facebook Ad Campaign',
      status: 'Active',
      type: 'Social',
      audience: 'Targeted Segment',
      sent: 45000,
      opened: 12300,
      clicked: 3200,
      lastUpdated: '2025-04-08T11:20:00',
      icon: <Facebook className="h-4 w-4" />
    },
    {
      id: 5,
      name: 'Product Update Newsletter',
      status: 'Completed',
      type: 'Email',
      audience: 'All Subscribers',
      sent: 28750,
      opened: 18200,
      clicked: 9340,
      lastUpdated: '2025-04-05T13:10:00',
      icon: <Mail className="h-4 w-4" />
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [notification, setNotification] = useState(null);
  const [actionDropdownId, setActionDropdownId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // Load campaigns from localStorage on component mount
  useEffect(() => {
    const savedCampaigns = localStorage.getItem('marketingCampaigns');
    if (savedCampaigns) {
      // Parse saved campaigns and recreate the icon components
      const parsedCampaigns = JSON.parse(savedCampaigns);
      const campaignsWithIcons = parsedCampaigns.map(campaign => ({
        ...campaign,
        icon: getIconForType(campaign.type) // Recreate the icon component
      }));
      setCampaigns(campaignsWithIcons);
    } else {
      // If no saved campaigns, use initial data
      setCampaigns(initialCampaigns);
    }
  }, []);

  // Save campaigns to localStorage whenever they change
  useEffect(() => {
    if (campaigns.length > 0) {
      // Create a copy of campaigns without the icon JSX elements
      const serializableCampaigns = campaigns.map(({ icon, ...rest }) => rest);
      localStorage.setItem('marketingCampaigns', JSON.stringify(serializableCampaigns));
    }
  }, [campaigns]);
  
  // Function to get icon component based on campaign type
  const getIconForType = (type) => {
    switch(type) {
      case 'Email':
        return <Mail className="h-4 w-4" />;
      case 'Social':
        return <Instagram className="h-4 w-4" />;
      case 'SMS':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };
  
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  const handleBackToMarketing = () => {
    navigate('/marketing');
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard/user');
  };
  
  const handleOpenCreateModal = () => {
    setCurrentCampaign(null);
    setIsCreateModalOpen(true);
    setIsEditModalOpen(false);
  };
  
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };
  
  const handleSaveCampaign = (newCampaign) => {
    if (isEditModalOpen) {
      // Update existing campaign
      const updatedCampaigns = campaigns.map(campaign => 
        campaign.id === currentCampaign.id ? newCampaign : campaign
      );
      setCampaigns(updatedCampaigns);
      showNotification('success', 'Campaign updated successfully!');
    } else {
      // Add new campaign
      setCampaigns([newCampaign, ...campaigns]);
      showNotification('success', 'Campaign created successfully!');
    }
  };
  
  const handleEditCampaign = (campaign) => {
    setCurrentCampaign(campaign);
    setIsEditModalOpen(true);
    setIsCreateModalOpen(true);
    setActionDropdownId(null);
  };
  
  const handleDuplicateCampaign = (campaign) => {
    const duplicatedCampaign = {
      ...campaign,
      id: Date.now(),
      name: `${campaign.name} (Copy)`,
      lastUpdated: new Date().toISOString()
    };
    setCampaigns([duplicatedCampaign, ...campaigns]);
    showNotification('success', 'Campaign duplicated successfully!');
    setActionDropdownId(null);
  };
  
  const handleDeleteCampaign = (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      const updatedCampaigns = campaigns.filter(campaign => campaign.id !== id);
      setCampaigns(updatedCampaigns);
      showNotification('success', 'Campaign deleted successfully!');
    }
    setActionDropdownId(null);
  };
  
  const toggleActionDropdown = (id) => {
    setActionDropdownId(actionDropdownId === id ? null : id);
  };

  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      showNotification('success', 'Campaign data refreshed successfully!');
    }, 1500);
  };

  const handleExport = (format) => {
    // Simulate export process
    showNotification('success', `Campaigns exported as ${format.toUpperCase()} successfully!`);
    setShowExportDropdown(false);
  };
  
  const showNotification = (type, message) => {
    setNotification({ type, message });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-500';
      case 'Scheduled': return 'bg-blue-500';
      case 'Draft': return 'bg-gray-500';
      case 'Completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

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
              <h1 className="text-2xl font-bold text-gray-800">Campaign Management</h1>
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
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Campaigns</p>
              <p className="text-xl font-bold text-gray-800">{campaigns.length}</p>
              <p className="text-xs text-gray-500">Last updated today</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Campaigns</p>
              <p className="text-xl font-bold text-gray-800">{campaigns.filter(c => c.status === 'Active').length}</p>
              <p className="text-xs text-green-600 flex items-center">
                <ChevronDown className="h-3 w-3 transform rotate-180 mr-1" />
                12.5% this month
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Audience</p>
              <p className="text-xl font-bold text-gray-800">25,080</p>
              <p className="text-xs text-gray-500">Across all campaigns</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
            <div className="rounded-full bg-amber-100 p-3 mr-4">
              <PieChart className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg. Open Rate</p>
              <p className="text-xl font-bold text-gray-800">24.8%</p>
              <p className="text-xs text-green-600 flex items-center">
                <ChevronDown className="h-3 w-3 transform rotate-180 mr-1" />
                3.2% this month
              </p>
            </div>
          </div>
        </div>
        
        {/* Campaign Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Marketing Campaigns</h2>
              
              <div className="flex space-x-2 mt-3 md:mt-0">
                <div className="relative">
                  <button 
                    className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </button>
                  
                  {showExportDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1">
                      <button
                        onClick={() => handleExport('csv')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport('xlsx')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Export as Excel
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Export as PDF
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  onClick={refreshData}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button 
                  onClick={handleOpenCreateModal}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              
              <div className="relative w-full sm:w-auto">
                <select
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none w-full sm:w-auto"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isRefreshing ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                        <p className="text-gray-500">Refreshing campaign data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                        <Mail className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="text-gray-500 mb-2">No campaigns found matching your criteria.</p>
                      <button 
                        onClick={handleOpenCreateModal}
                        className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Campaign
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: campaign.type === 'Email' ? '#EBF5FF' : campaign.type === 'Social' ? '#F0F9FF' : '#F3F4F6' }}>
                            {campaign.icon}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {campaign.status === 'Scheduled' ? 'Scheduled for 15 Apr, 2025' : 'Created on 10 Apr, 2025'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${getStatusBadgeColor(campaign.status)}`}></div>
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            {campaign.type === 'Email' && <Mail className="h-3 w-3 mr-1" />}
                            {campaign.type === 'Social' && <Instagram className="h-3 w-3 mr-1" />}
                            {campaign.type === 'SMS' && <MessageSquare className="h-3 w-3 mr-1" />}
                            {campaign.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-500">{campaign.audience}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.status === 'Draft' || campaign.status === 'Scheduled' ? (
                          <span className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            Not started yet
                          </span>
                        ) : (
                          <div>
                            <div className="flex items-center mb-1 text-sm">
                              <span className="text-gray-700 font-medium">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</span>
                              <span className="text-gray-500 ml-1 text-xs">open rate</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span>{campaign.sent.toLocaleString()} sent</span>
                              <span>•</span>
                              <span>{campaign.opened.toLocaleString()} opened</span>
                              <span>•</span>
                              <span>{campaign.clicked.toLocaleString()} clicked</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(((campaign.opened / campaign.sent) * 100), 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(campaign.lastUpdated)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1 relative">
                          <button 
                            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" 
                            onClick={() => handleEditCampaign(campaign)}
                            title="Edit Campaign"
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </button>
                          <button 
                            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            onClick={() => handleDuplicateCampaign(campaign)}
                            title="Duplicate Campaign"
                          >
                            <Copy className="h-4 w-4 text-gray-500" />
                          </button>
                          <button 
                            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            title="Delete Campaign"
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </button>
                          <div className="relative">
                            <button 
                              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                              onClick={() => toggleActionDropdown(campaign.id)}
                              title="More Options"
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </button>
                            
                            {actionDropdownId === campaign.id && (
                              <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                <button
                                  onClick={() => handleEditCampaign(campaign)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Edit className="h-4 w-4 inline mr-2" />
                                  Edit Campaign
                                </button>
                                <button
                                  onClick={() => handleDuplicateCampaign(campaign)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Copy className="h-4 w-4 inline mr-2" />
                                  Duplicate Campaign
                                </button>
                                <button
                                  onClick={() => handleDeleteCampaign(campaign.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 inline mr-2" />
                                  Delete Campaign
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {filteredCampaigns.length > 0 && !isRefreshing && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{filteredCampaigns.length}</span> of <span className="font-medium">{campaigns.length}</span> campaigns
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors" disabled>Previous</button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors" disabled>Next</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Upcoming Campaigns */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Campaigns</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.filter(c => c.status === 'Scheduled').length > 0 ? (
              campaigns.filter(c => c.status === 'Scheduled').slice(0, 3).map(campaign => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: campaign.type === 'Email' ? '#EBF5FF' : campaign.type === 'Social' ? '#F0F9FF' : '#F3F4F6' }}>
                      {campaign.icon}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{campaign.name}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled for 15 Apr, 2025
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      <Users className="h-3 w-3 mr-1" />
                      {campaign.audience}
                    </span>
                    <button 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => handleEditCampaign(campaign)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500 mb-2">No scheduled campaigns found.</p>
                <button 
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Schedule a Campaign
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create/Edit Campaign Modal */}
      <CreateCampaignModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseCreateModal} 
        onSave={handleSaveCampaign}
        campaign={currentCampaign}
        isEditing={isEditModalOpen}
      />
      
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

export default CampaignPage;
