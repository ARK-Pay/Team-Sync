import React, { useState } from 'react';
import { ArrowLeft, Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('last30Days');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBackToMarketing = () => {
    navigate('/marketing');
  };
  
  const refreshData = () => {
    setIsLoading(true);
    
    // Simulate data refresh with updated values
    setTimeout(() => {
      // Update campaign performance with slightly different numbers
      const updatedCampaignPerformance = campaignPerformance.map(campaign => ({
        ...campaign,
        sent: Math.floor(campaign.sent * (1 + (Math.random() * 0.05))),
        opened: Math.floor(campaign.opened * (1 + (Math.random() * 0.08))),
        clicked: Math.floor(campaign.clicked * (1 + (Math.random() * 0.1))),
        converted: Math.floor(campaign.converted * (1 + (Math.random() * 0.07)))
      }));
      
      setCampaignPerformance(updatedCampaignPerformance);
      setIsLoading(false);
      
      // Show success message
      alert('Analytics data refreshed successfully!');
    }, 1500);
  };
  
  const handleExport = (format) => {
    setIsLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      
      // Create a sample CSV/Excel content for demonstration
      const headers = ['Campaign', 'Sent', 'Opened', 'Clicked', 'Converted', 'Open Rate', 'Click Rate'];
      
      let csvContent = headers.join(',') + '\n';
      
      // Add data rows
      campaignPerformance.forEach(campaign => {
        const openRate = ((campaign.opened / campaign.sent) * 100).toFixed(1);
        const clickRate = ((campaign.clicked / campaign.opened) * 100).toFixed(1);
        
        const row = [
          campaign.name,
          campaign.sent,
          campaign.opened,
          campaign.clicked,
          campaign.converted,
          openRate + '%',
          clickRate + '%'
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `marketing_analytics_${new Date().toISOString().split('T')[0]}.${format}`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };
  
  // State for campaign performance data
  const [campaignPerformance, setCampaignPerformance] = useState([
    { name: 'Spring Product Launch', sent: 12500, opened: 5680, clicked: 2340, converted: 890 },
    { name: 'Social Media Promotion', sent: 8700, opened: 3200, clicked: 1450, converted: 520 },
    { name: 'Customer Feedback Survey', sent: 15000, opened: 9800, clicked: 6200, converted: 1800 },
    { name: 'Facebook Ad Campaign', sent: 45000, opened: 12300, clicked: 3200, converted: 980 },
    { name: 'Product Update Newsletter', sent: 28750, opened: 18200, clicked: 9340, converted: 2150 }
  ]);
  
  const channelPerformance = [
    { channel: 'Email', reach: 85000, engagement: 32000, conversion: 4500 },
    { channel: 'Social Media', reach: 120000, engagement: 45000, conversion: 3200 },
    { channel: 'Website', reach: 65000, engagement: 28000, conversion: 5800 },
    { channel: 'Mobile App', reach: 42000, engagement: 18000, conversion: 2900 }
  ];
  
  const audienceGrowth = [
    { month: 'Jan', subscribers: 12500 },
    { month: 'Feb', subscribers: 14200 },
    { month: 'Mar', subscribers: 16800 },
    { month: 'Apr', subscribers: 19500 },
    { month: 'May', subscribers: 22300 },
    { month: 'Jun', subscribers: 25100 }
  ];
  
  // Calculate total metrics
  const totalSent = campaignPerformance.reduce((acc, curr) => acc + curr.sent, 0);
  const totalOpened = campaignPerformance.reduce((acc, curr) => acc + curr.opened, 0);
  const totalClicked = campaignPerformance.reduce((acc, curr) => acc + curr.clicked, 0);
  const totalConverted = campaignPerformance.reduce((acc, curr) => acc + curr.converted, 0);
  
  const openRate = ((totalOpened / totalSent) * 100).toFixed(1);
  const clickRate = ((totalClicked / totalOpened) * 100).toFixed(1);
  const conversionRate = ((totalConverted / totalClicked) * 100).toFixed(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={handleBackToMarketing}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Marketing Analytics</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="relative">
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7Days">Last 7 Days</option>
                <option value="last30Days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <button 
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => document.getElementById('exportDropdown').classList.toggle('hidden')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <div id="exportDropdown" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden">
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('xlsx')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as PDF
                </button>
              </div>
            </div>
            <button 
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Sent</div>
            <div className="text-2xl font-bold text-gray-800">{totalSent.toLocaleString()}</div>
            <div className="mt-2 text-xs text-gray-500">Across all campaigns</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">Open Rate</div>
            <div className="text-2xl font-bold text-gray-800">{openRate}%</div>
            <div className="mt-2 text-xs text-green-600">+2.3% vs previous period</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">Click Rate</div>
            <div className="text-2xl font-bold text-gray-800">{clickRate}%</div>
            <div className="mt-2 text-xs text-green-600">+1.5% vs previous period</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">Conversion Rate</div>
            <div className="text-2xl font-bold text-gray-800">{conversionRate}%</div>
            <div className="mt-2 text-xs text-red-600">-0.8% vs previous period</div>
          </div>
        </div>
        
        {/* Campaign Performance */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Campaign Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Converted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaignPerformance.map((campaign, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.sent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.opened.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.clicked.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.converted.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((campaign.clicked / campaign.opened) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Channel Performance */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Channel Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {channelPerformance.map((channel, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-md font-semibold text-gray-800 mb-2">{channel.channel}</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Reach:</span>
                    <span className="text-sm font-medium">{channel.reach.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Engagement:</span>
                    <span className="text-sm font-medium">{channel.engagement.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Conversion:</span>
                    <span className="text-sm font-medium">{channel.conversion.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Conv. Rate:</span>
                    <span className="text-sm font-medium">
                      {((channel.conversion / channel.reach) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Audience Growth */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Audience Growth</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="h-64 flex items-end justify-between">
              {audienceGrowth.map((month, index) => {
                const height = (month.subscribers / 25100) * 100; // Scale to percentage of max
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-16 bg-blue-500 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="mt-2 text-xs font-medium">{month.month}</div>
                    <div className="text-xs text-gray-500">{(month.subscribers / 1000).toFixed(1)}k</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
