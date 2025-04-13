import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Download, Filter, RefreshCw, Home, ChevronDown, Loader2, BarChart2, TrendingUp, Users, DollarSign, Percent, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('last30Days');
  const [isLoading, setIsLoading] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const handleBackToMarketing = () => {
    navigate('/marketing');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard/user');
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

  // Trend data for charts
  const monthlyTrends = [
    { month: 'Jan', sent: 65000, opened: 28600, clicked: 12500, converted: 3200 },
    { month: 'Feb', sent: 72000, opened: 32400, clicked: 14800, converted: 3900 },
    { month: 'Mar', sent: 68000, opened: 31280, clicked: 13600, converted: 3500 },
    { month: 'Apr', sent: 75000, opened: 36000, clicked: 16500, converted: 4200 },
    { month: 'May', sent: 82000, opened: 41000, clicked: 19700, converted: 5100 },
    { month: 'Jun', sent: 89000, opened: 46280, clicked: 22250, converted: 5800 },
  ];

  // Tabs for analytics sections
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'channels', label: 'Channels' },
    { id: 'audience', label: 'Audience' },
    { id: 'trends', label: 'Trends' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={handleBackToMarketing}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Marketing Analytics</h1>
        </div>
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
        >
          <Home className="h-4 w-4 mr-2" />
          Main Dashboard
        </button>
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {/* Control Panel */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Date Range Selector */}
            <div className="relative w-full sm:w-64">
              <select
                className="w-full appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {/* Export Button */}
              <div className="relative">
                <button 
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                
                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('xlsx')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
              
              {/* Refresh Button */}
              <button 
                className={`flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:border-b-2'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Total Sent</div>
                      <div className="text-2xl font-bold text-gray-800">{totalSent.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BarChart2 className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <span className="text-green-600 font-medium">+5.2%</span>
                    <span className="ml-1">vs previous period</span>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Open Rate</div>
                      <div className="text-2xl font-bold text-gray-800">{openRate}%</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <span className="text-green-600 font-medium">+2.3%</span>
                    <span className="ml-1">vs previous period</span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${openRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Click Rate</div>
                      <div className="text-2xl font-bold text-gray-800">{clickRate}%</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Percent className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <span className="text-green-600 font-medium">+1.5%</span>
                    <span className="ml-1">vs previous period</span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full" 
                      style={{ width: `${clickRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Conversion Rate</div>
                      <div className="text-2xl font-bold text-gray-800">{conversionRate}%</div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <DollarSign className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <span className="text-red-600 font-medium">-0.8%</span>
                    <span className="ml-1">vs previous period</span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full" 
                      style={{ width: `${conversionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Campaign Performance */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Campaign Performance</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center" onClick={() => setActiveTab('campaigns')}>
                    View all
                    <ChevronDown className="h-4 w-4 ml-1 transform rotate-270" />
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
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
                        {isLoading ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-10 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                                <p className="text-gray-500">Loading campaign data...</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          campaignPerformance.map((campaign, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
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
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-900 mr-2">
                                    {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                                  </span>
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-green-500 h-1.5 rounded-full" 
                                      style={{ width: `${((campaign.opened / campaign.sent) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-900 mr-2">
                                    {((campaign.clicked / campaign.opened) * 100).toFixed(1)}%
                                  </span>
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-purple-500 h-1.5 rounded-full" 
                                      style={{ width: `${((campaign.clicked / campaign.opened) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Channel Performance */}
          {activeTab === 'overview' && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Channel Performance</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center" onClick={() => setActiveTab('channels')}>
                  View all
                  <ChevronDown className="h-4 w-4 ml-1 transform rotate-270" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {channelPerformance.map((channel, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-md font-semibold text-gray-800 mb-3">{channel.channel}</div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Reach:</span>
                          <span className="font-medium">{channel.reach.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${(channel.reach / 120000) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Engagement:</span>
                          <span className="font-medium">{channel.engagement.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${(channel.engagement / 45000) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Conversion:</span>
                          <span className="font-medium">{channel.conversion.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-purple-500 h-1.5 rounded-full" 
                            style={{ width: `${(channel.conversion / 5800) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Conv. Rate:</span>
                          <span className="font-medium text-green-600">
                            {((channel.conversion / channel.reach) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Audience Growth */}
          {activeTab === 'overview' && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Audience Growth</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center" onClick={() => setActiveTab('audience')}>
                  View all
                  <ChevronDown className="h-4 w-4 ml-1 transform rotate-270" />
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="h-64 flex items-end justify-between">
                  {audienceGrowth.map((month, index) => {
                    const height = (month.subscribers / 25100) * 100; // Scale to percentage of max
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg" 
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
