import React, { useState } from 'react';
import { X, Users, Filter, Check } from 'lucide-react';

const CreateSegmentModal = ({ isOpen, onClose, onSave }) => {
  const [segmentData, setSegmentData] = useState({
    name: '',
    description: '',
    conditions: [
      { field: 'purchase_count', operator: 'greater_than', value: '' }
    ]
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSegmentData({
      ...segmentData,
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
  
  const handleConditionChange = (index, field, value) => {
    const updatedConditions = [...segmentData.conditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value
    };
    
    setSegmentData({
      ...segmentData,
      conditions: updatedConditions
    });
  };
  
  const addCondition = () => {
    setSegmentData({
      ...segmentData,
      conditions: [
        ...segmentData.conditions,
        { field: 'purchase_count', operator: 'greater_than', value: '' }
      ]
    });
  };
  
  const removeCondition = (index) => {
    const updatedConditions = [...segmentData.conditions];
    updatedConditions.splice(index, 1);
    
    setSegmentData({
      ...segmentData,
      conditions: updatedConditions
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!segmentData.name.trim()) {
      newErrors.name = 'Segment name is required';
    }
    
    if (!segmentData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Validate conditions
    const invalidConditions = segmentData.conditions.filter(condition => !condition.value);
    if (invalidConditions.length > 0) {
      newErrors.conditions = 'All condition values must be filled';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Calculate estimated audience size based on conditions
      // This is just a mock calculation for demonstration
      let estimatedSize = Math.floor(Math.random() * 10000) + 1000;
      
      // Create a new segment object
      const newSegment = {
        id: Date.now(), // Use timestamp as temporary ID
        name: segmentData.name,
        description: segmentData.description,
        count: estimatedSize,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      onSave(newSegment);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create Audience Segment</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Segment Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Segment Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={segmentData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter segment name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            {/* Segment Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={segmentData.description}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Describe this audience segment"
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            
            {/* Segment Conditions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Segment Conditions
                </label>
                <button
                  type="button"
                  onClick={addCondition}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Condition
                </button>
              </div>
              
              {segmentData.conditions.map((condition, index) => (
                <div key={index} className="flex items-center space-x-2 mb-3">
                  <select
                    value={condition.field}
                    onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="purchase_count">Purchase Count</option>
                    <option value="last_purchase">Last Purchase</option>
                    <option value="total_spent">Total Spent</option>
                    <option value="email_engagement">Email Engagement</option>
                    <option value="location">Location</option>
                    <option value="signup_date">Signup Date</option>
                  </select>
                  
                  <select
                    value={condition.operator}
                    onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="greater_than">Greater than</option>
                    <option value="less_than">Less than</option>
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="not_equals">Not equals</option>
                    <option value="before">Before</option>
                    <option value="after">After</option>
                  </select>
                  
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    className={`flex-1 px-3 py-2 border ${errors.conditions && !condition.value ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Value"
                  />
                  
                  {segmentData.conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {errors.conditions && (
                <p className="mt-1 text-sm text-red-600">{errors.conditions}</p>
              )}
            </div>
            
            {/* Preview Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Audience Preview</h3>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Estimated audience size: </span>
                <span className="ml-1 text-sm font-medium">
                  {segmentData.conditions.some(c => !c.value) 
                    ? 'Complete all conditions to see estimate' 
                    : `${Math.floor(Math.random() * 10000) + 1000} contacts`}
                </span>
              </div>
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
              Create Segment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSegmentModal;
