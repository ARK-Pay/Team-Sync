import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Download, Filter, RefreshCw, Home, ChevronDown, Loader2, BarChart2, TrendingUp, Users, DollarSign, Percent, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import CampaignFilterDropdown from './CampaignFilterDropdown';
import ChannelDetailsModal from './ChannelDetailsModal';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('last30Days');
  const [isLoading, setIsLoading] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState({ name: '', minSent: '', maxSent: '' });
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [selectedChannel, setSelectedChannel] = useState(null);

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

  // Filtered campaign data
  const filteredCampaignPerformance = campaignPerformance.filter(c => {
    let match = true;
    if (filters.name && c.name !== filters.name) match = false;
    if (filters.minSent && c.sent < parseInt(filters.minSent)) match = false;
    if (filters.maxSent && c.sent > parseInt(filters.maxSent)) match = false;
    return match;
  });

  // Handler for outside click (close dropdown)
  useEffect(() => {
    if (!showFilterDropdown) return;
    setPendingFilters(filters); // Reset pending filters to current filters when dropdown opens
    const handler = e => {
      if (!e.target.closest('.campaign-filter-dropdown-btn') && !e.target.closest('.campaign-filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilterDropdown]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterDropdown(false);
  };

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
                          filteredCampaignPerformance.map((campaign, index) => (
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {channelPerformance.map((channel, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedChannel(channel)}
                  >
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
              {selectedChannel && (
                <ChannelDetailsModal channel={selectedChannel} onClose={() => setSelectedChannel(null)} />
              )}
            </div>
          )}
          
          {/* Audience Growth */}
          {activeTab === 'overview' && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Audience Growth</h2>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="h-64">
                  <Line
                    data={{
                      labels: audienceGrowth.map(item => item.month),
                      datasets: [
                        {
                          label: 'Subscribers',
                          data: audienceGrowth.map(item => item.subscribers),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: 'rgb(59, 130, 246)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 5,
                          pointHoverRadius: 7,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          align: 'end',
                          labels: {
                            boxWidth: 10,
                            usePointStyle: true,
                            pointStyle: 'circle',
                          },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          padding: 10,
                          callbacks: {
                            label: function(context) {
                              return `Subscribers: ${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                          ticks: {
                            callback: function(value) {
                              return (value / 1000) + 'k';
                            }
                          }
                        },
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                    }}
                  />
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <div>
                    <span className="font-medium text-gray-700">Total Subscribers:</span> {audienceGrowth[audienceGrowth.length - 1].subscribers.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-green-600">+{(((audienceGrowth[audienceGrowth.length - 1].subscribers - audienceGrowth[0].subscribers) / audienceGrowth[0].subscribers) * 100).toFixed(1)}%</span> growth since {audienceGrowth[0].month}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Campaigns Tab Content */}
          {activeTab === 'campaigns' && (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Campaign Performance</h2>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
                          filteredCampaignPerformance.map((campaign, index) => (
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
            </div>
          )}
          
          {/* Audience Tab Content */}
          {activeTab === 'audience' && (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Audience Analytics</h2>
                </div>
                
                {/* Audience Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Total Subscribers</div>
                    <div className="text-2xl font-bold text-gray-800">{audienceGrowth[audienceGrowth.length - 1].subscribers.toLocaleString()}</div>
                    <div className="mt-2 text-xs text-green-600">+{(((audienceGrowth[audienceGrowth.length - 1].subscribers - audienceGrowth[0].subscribers) / audienceGrowth[0].subscribers) * 100).toFixed(1)}% growth</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Active Subscribers</div>
                    <div className="text-2xl font-bold text-gray-800">{Math.floor(audienceGrowth[audienceGrowth.length - 1].subscribers * 0.82).toLocaleString()}</div>
                    <div className="mt-2 text-xs text-green-600">82% of total subscribers</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Avg. Engagement Rate</div>
                    <div className="text-2xl font-bold text-gray-800">24.8%</div>
                    <div className="mt-2 text-xs text-green-600">+3.2% vs industry average</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Churn Rate</div>
                    <div className="text-2xl font-bold text-gray-800">2.1%</div>
                    <div className="mt-2 text-xs text-green-600">-0.5% vs last month</div>
                  </div>
                </div>
                
                {/* Audience Growth Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Subscriber Growth</h3>
                    <select 
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      defaultValue="last6Months"
                    >
                      <option value="last3Months">Last 3 Months</option>
                      <option value="last6Months">Last 6 Months</option>
                      <option value="lastYear">Last Year</option>
                    </select>
                  </div>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: audienceGrowth.map(item => item.month),
                        datasets: [
                          {
                            label: 'Subscribers',
                            data: audienceGrowth.map(item => item.subscribers),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: 'rgb(59, 130, 246)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            align: 'end',
                            labels: {
                              boxWidth: 10,
                              usePointStyle: true,
                              pointStyle: 'circle',
                            },
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            padding: 10,
                            callbacks: {
                              label: function(context) {
                                return `Subscribers: ${context.parsed.y.toLocaleString()}`;
                              }
                            }
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)',
                            },
                            ticks: {
                              callback: function(value) {
                                return (value / 1000) + 'k';
                              }
                            }
                          },
                        },
                        interaction: {
                          intersect: false,
                          mode: 'index',
                        },
                      }}
                    />
                  </div>
                </div>
                
                {/* Audience Demographics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-medium text-gray-800 mb-4">Audience by Age</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">18-24</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">25-34</span>
                          <span className="font-medium">32%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">35-44</span>
                          <span className="font-medium">28%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">45-54</span>
                          <span className="font-medium">18%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">55+</span>
                          <span className="font-medium">7%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '7%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-medium text-gray-800 mb-4">Audience by Location</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">United States</span>
                          <span className="font-medium">42%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Europe</span>
                          <span className="font-medium">28%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Asia</span>
                          <span className="font-medium">18%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Australia</span>
                          <span className="font-medium">7%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '7%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Other</span>
                          <span className="font-medium">5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Channels Tab Content */}
          {activeTab === 'channels' && (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Channel Performance</h2>
                </div>
                
                {/* Channel Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {channelPerformance.map((channel, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedChannel(channel)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-md font-semibold text-gray-800">{channel.channel}</div>
                        <div className="p-1.5 rounded-full bg-blue-50">
                          {channel.channel === 'Email' && <BarChart2 className="h-5 w-5 text-blue-500" />}
                          {channel.channel === 'Social Media' && <TrendingUp className="h-5 w-5 text-purple-500" />}
                          {channel.channel === 'Website' && <BarChart2 className="h-5 w-5 text-green-500" />}
                          {channel.channel === 'Mobile App' && <BarChart2 className="h-5 w-5 text-orange-500" />}
                        </div>
                      </div>
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
                {selectedChannel && (
                  <ChannelDetailsModal channel={selectedChannel} onClose={() => setSelectedChannel(null)} />
                )}
                
                {/* Channel Comparison Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Channel Comparison</h3>
                    <select 
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      defaultValue="last3Months"
                    >
                      <option value="lastMonth">Last Month</option>
                      <option value="last3Months">Last 3 Months</option>
                      <option value="last6Months">Last 6 Months</option>
                      <option value="lastYear">Last Year</option>
                    </select>
                  </div>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [
                          {
                            label: 'Email',
                            data: [4500, 5200, 4800, 5600, 6200, 7100],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: false,
                            borderWidth: 3,
                            pointRadius: 4,
                          },
                          {
                            label: 'Social Media',
                            data: [3200, 3800, 4500, 5100, 5800, 6400],
                            borderColor: 'rgb(168, 85, 247)',
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            tension: 0.4,
                            fill: false,
                            borderWidth: 3,
                            pointRadius: 4,
                          },
                          {
                            label: 'Website',
                            data: [5800, 5200, 4900, 5400, 6100, 6800],
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4,
                            fill: false,
                            borderWidth: 3,
                            pointRadius: 4,
                          },
                          {
                            label: 'Mobile App',
                            data: [2900, 3400, 3800, 4200, 4600, 5200],
                            borderColor: 'rgb(249, 115, 22)',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            tension: 0.4,
                            fill: false,
                            borderWidth: 3,
                            pointRadius: 4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            align: 'end',
                            labels: {
                              boxWidth: 10,
                              usePointStyle: true,
                              pointStyle: 'circle',
                            },
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            padding: 10,
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                              }
                            }
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)',
                            },
                            ticks: {
                              callback: function(value) {
                                return (value / 1000) + 'k';
                              }
                            }
                          },
                        },
                        interaction: {
                          intersect: false,
                          mode: 'index',
                        },
                      }}
                    />
                  </div>
                </div>
                
                {/* Channel ROI Analysis */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-medium text-gray-800 mb-4">Channel ROI Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Conversion</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {channelPerformance.map((channel, index) => {
                          // Generate some dummy ROI data
                          const investment = Math.floor(channel.reach * (0.5 + Math.random() * 0.5));
                          const revenue = Math.floor(channel.conversion * (80 + Math.random() * 40));
                          const roi = ((revenue - investment) / investment) * 100;
                          const costPerConversion = investment / channel.conversion;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    {channel.channel.charAt(0)}
                                  </div>
                                  <div className="ml-3 font-medium text-gray-900">{channel.channel}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${investment.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${revenue.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {roi.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${costPerConversion.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${roi >= 200 ? 'bg-green-100 text-green-800' : roi >= 100 ? 'bg-blue-100 text-blue-800' : roi >= 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  {roi >= 200 ? 'Excellent' : roi >= 100 ? 'Good' : roi >= 0 ? 'Average' : 'Poor'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Trends Tab Content */}
          {activeTab === 'trends' && (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Marketing Trends</h2>
                </div>
                
                {/* Trend Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Engagement Growth</div>
                    <div className="text-2xl font-bold text-gray-800">+18.3%</div>
                    <div className="mt-2 text-xs text-green-600">+4.2% vs last period</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Conversion Growth</div>
                    <div className="text-2xl font-bold text-gray-800">+12.7%</div>
                    <div className="mt-2 text-xs text-green-600">+2.8% vs last period</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Audience Growth</div>
                    <div className="text-2xl font-bold text-gray-800">+21.5%</div>
                    <div className="mt-2 text-xs text-green-600">+5.3% vs last period</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">ROI Growth</div>
                    <div className="text-2xl font-bold text-gray-800">+15.2%</div>
                    <div className="mt-2 text-xs text-green-600">+3.1% vs last period</div>
                  </div>
                </div>
                
                {/* Overall Performance Trend */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Overall Performance Trend</h3>
                    <select 
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      defaultValue="last6Months"
                    >
                      <option value="last3Months">Last 3 Months</option>
                      <option value="last6Months">Last 6 Months</option>
                      <option value="lastYear">Last Year</option>
                    </select>
                  </div>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: monthlyTrends.map(item => item.month),
                        datasets: [
                          {
                            label: 'Sent',
                            data: monthlyTrends.map(item => item.sent),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: false,
                            pointBackgroundColor: 'rgb(59, 130, 246)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            yAxisID: 'y',
                          },
                          {
                            label: 'Opened',
                            data: monthlyTrends.map(item => item.opened),
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4,
                            fill: false,
                            pointBackgroundColor: 'rgb(34, 197, 94)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            yAxisID: 'y',
                          },
                          {
                            label: 'Clicked',
                            data: monthlyTrends.map(item => item.clicked),
                            borderColor: 'rgb(168, 85, 247)',
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            tension: 0.4,
                            fill: false,
                            pointBackgroundColor: 'rgb(168, 85, 247)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            yAxisID: 'y',
                          },
                          {
                            label: 'Converted',
                            data: monthlyTrends.map(item => item.converted),
                            borderColor: 'rgb(249, 115, 22)',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            tension: 0.4,
                            fill: false,
                            pointBackgroundColor: 'rgb(249, 115, 22)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            yAxisID: 'y',
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            align: 'end',
                            labels: {
                              boxWidth: 10,
                              usePointStyle: true,
                              pointStyle: 'circle',
                            },
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            padding: 10,
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                              }
                            }
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)',
                            },
                            ticks: {
                              callback: function(value) {
                                return (value / 1000) + 'k';
                              }
                            }
                          },
                        },
                        interaction: {
                          intersect: false,
                          mode: 'index',
                        },
                      }}
                    />
                  </div>
                </div>
                
                {/* Trend Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Growth Rate Comparison */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-medium text-gray-800 mb-4">Growth Rate Comparison</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Subscriber Growth</span>
                          <span className="font-medium text-green-600">+21.5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '21.5%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Engagement Growth</span>
                          <span className="font-medium text-green-600">+18.3%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '18.3%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Conversion Growth</span>
                          <span className="font-medium text-green-600">+12.7%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '12.7%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">ROI Growth</span>
                          <span className="font-medium text-green-600">+15.2%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15.2%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Revenue Growth</span>
                          <span className="font-medium text-green-600">+19.8%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '19.8%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Trend Insights */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-medium text-gray-800 mb-4">Trend Insights</h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1 rounded-full bg-blue-100">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800">Subscriber Growth Accelerating</h4>
                            <p className="text-xs text-blue-600 mt-1">Subscriber acquisition rate increased by 5.3% compared to previous period.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1 rounded-full bg-green-100">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-green-800">Email Engagement Improving</h4>
                            <p className="text-xs text-green-600 mt-1">Open rates and click-through rates showing consistent improvement over the last 3 months.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1 rounded-full bg-yellow-100">
                            <TrendingUp className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-yellow-800">Mobile Conversion Opportunity</h4>
                            <p className="text-xs text-yellow-600 mt-1">Mobile app conversions growing but still below industry average. Opportunity for optimization.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1 rounded-full bg-purple-100">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-purple-800">Social Media ROI Increasing</h4>
                            <p className="text-xs text-purple-600 mt-1">Social media campaigns showing improved ROI with 15.2% increase in conversion rates.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
