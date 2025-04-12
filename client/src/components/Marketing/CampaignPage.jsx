import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, MoreHorizontal, Mail, MessageSquare, Instagram, Facebook, Twitter, Youtube, Trash2, Edit, Copy, BarChart2, AlertCircle, Check, Home } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBackToMarketing}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Campaign Management</h1>
        </div>
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Home className="h-4 w-4 mr-2" />
          Main Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
            <div className="ml-2">
              <select
                className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
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
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {campaign.icon}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.audience}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {campaign.status === 'Draft' || campaign.status === 'Scheduled' ? (
                        <span className="text-gray-500">Not started</span>
                      ) : (
                        <div className="flex items-center">
                          <BarChart2 className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{((campaign.opened / campaign.sent) * 100).toFixed(1)}% open rate</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(campaign.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2 relative">
                      <button 
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button 
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={() => handleDuplicateCampaign(campaign)}
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                      <button 
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                      <button 
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={() => toggleActionDropdown(campaign.id)}
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </button>
                      
                      {actionDropdownId === campaign.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                          <button
                            onClick={() => handleEditCampaign(campaign)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Edit Campaign
                          </button>
                          <button
                            onClick={() => handleDuplicateCampaign(campaign)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Duplicate Campaign
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-red-600"
                          >
                            Delete Campaign
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No campaigns found matching your criteria.</p>
          </div>
        )}
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

export default CampaignPage;
