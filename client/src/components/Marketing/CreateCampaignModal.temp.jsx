import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Mail, MessageSquare, Instagram } from 'lucide-react';

const CreateCampaignModal = ({ isOpen, onClose, onSave, campaign, isEditing }) => {
  const [campaignData, setCampaignData] = useState({
    name: '',
    type: 'Email',
    status: 'Draft',
    audience: '',
    description: '',
    scheduledDate: '',
    scheduledTime: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // Update form data when editing an existing campaign
  useEffect(() => {
    if (campaign && isEditing) {
      setCampaignData({
        ...campaign,
        scheduledDate: campaign.scheduledDate || '',
        scheduledTime: campaign.scheduledTime || ''
      });
    } else if (!campaign) {
      // Reset form when creating a new campaign
      setCampaignData({
        name: '',
        type: 'Email',
        status: 'Draft',
        audience: '',
        description: '',
        scheduledDate: '',
        scheduledTime: ''
      });
    }
  }, [campaign, isEditing]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaignData({
      ...campaignData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!campaignData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }
    
    if (!campaignData.audience.trim()) {
      newErrors.audience = 'Target audience is required';
    }
    
    if (campaignData.status === 'Scheduled') {
      if (!campaignData.scheduledDate) {
        newErrors.scheduledDate = 'Date is required for scheduled campaigns';
      }
      if (!campaignData.scheduledTime) {
        newErrors.scheduledTime = 'Time is required for scheduled campaigns';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create a new campaign object
      const newCampaign = {
        id: campaign?.id || Date.now(), // Use existing ID when editing, or timestamp for new
        name: campaignData.name,
        status: campaignData.status,
        type: campaignData.type,
        audience: campaignData.audience,
        description: campaignData.description,
        sent: campaign?.sent || 0,
        opened: campaign?.opened || 0,
        clicked: campaign?.clicked || 0,
        lastUpdated: new Date().toISOString(),
        icon: getIconForType(campaignData.type)
      };
      
      // If scheduled, add scheduled date/time
      if (campaignData.status === 'Scheduled') {
        newCampaign.scheduledDate = campaignData.scheduledDate;
        newCampaign.scheduledTime = campaignData.scheduledTime;
      }
      
      onSave(newCampaign);
      onClose();
    }
  };
  
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{isEditing ? 'Edit Campaign' : 'Create New Campaign'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={campaignData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter campaign name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            {/* Campaign Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Type
              </label>
              <select
                id="type"
                name="type"
                value={campaignData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Email">Email Campaign</option>
                <option value="Social">Social Media Campaign</option>
                <option value="SMS">SMS Campaign</option>
                <option value="Push">Push Notification</option>
              </select>
            </div>
            
            {/* Campaign Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Status
              </label>
              <select
                id="status"
                name="status"
                value={campaignData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Active">Active</option>
              </select>
            </div>
            
            {/* Conditional fields for Scheduled status */}
            {campaignData.status === 'Scheduled' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date*
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={campaignData.scheduledDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.scheduledDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  {errors.scheduledDate && <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>}
                </div>
                
                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time*
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      id="scheduledTime"
                      name="scheduledTime"
                      value={campaignData.scheduledTime}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.scheduledTime ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  {errors.scheduledTime && <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>}
                </div>
              </div>
            )}
            
            {/* Target Audience */}
            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience*
              </label>
              <div className="relative">
                <select
                  id="audience"
                  name="audience"
                  value={campaignData.audience}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.audience ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select an audience</option>
                  <option value="All Subscribers">All Subscribers</option>
                  <option value="New Customers">New Customers</option>
                  <option value="Existing Customers">Existing Customers</option>
                  <option value="Targeted Segment">Targeted Segment</option>
                  <option value="Cart Abandoners">Cart Abandoners</option>
                </select>
                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {errors.audience && <p className="mt-1 text-sm text-red-600">{errors.audience}</p>}
            </div>
            
            {/* Campaign Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Description
              </label>
              <textarea
                id="description"
                name="description"
                value={campaignData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter campaign description"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
