import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Home, Megaphone } from 'lucide-react';

const MarketingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading the marketing application
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToCampaigns = () => {
    navigate('/marketing/campaigns');
  };

  const handleNavigateToAnalytics = () => {
    navigate('/marketing/analytics');
  };

  const handleNavigateToAudience = () => {
    navigate('/marketing/audience');
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard/user');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Marketing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Marketing Dashboard</h1>
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Main Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-600 mb-6">
          Access the complete marketing suite with advanced campaign management, analytics, and audience segmentation tools.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2">Campaigns</h3>
            <p className="text-sm text-gray-600 mb-4">Create, manage and track marketing campaigns across multiple channels.</p>
            <button 
              onClick={handleNavigateToCampaigns}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Open Campaigns
            </button>
          </div>
          
          <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">View detailed performance metrics and insights for your marketing efforts.</p>
            <button 
              onClick={handleNavigateToAnalytics}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
            >
              View Analytics
            </button>
          </div>
          
          <div className="bg-green-50 p-5 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2">Audience</h3>
            <p className="text-sm text-gray-600 mb-4">Manage audience segments and personalize your marketing strategies.</p>
            <button 
              onClick={handleNavigateToAudience}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              Manage Audience
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
