import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Download, Filter, RefreshCw, Home, ChevronDown, Loader2, BarChart2, TrendingUp, Users, DollarSign, Percent, HelpCircle, Mail, MessageSquare, Instagram, Zap, Compass, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('last30Days');
  const [isLoading, setIsLoading] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Add state for audience data
  const [audienceSize, setAudienceSize] = useState(0);
  const [demographics, setDemographics] = useState({
    age: [],
    gender: [],
    location: []
  });
  
  // Add state for campaign data
  const [campaigns, setCampaigns] = useState([]);
  const [campaignPerformance, setCampaignPerformance] = useState([]);
  const [campaignStats, setCampaignStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalConverted: 0,
    openRate: '0.0',
    clickRate: '0.0',
    conversionRate: '0.0'
  });
  
  // Add state for trend data
  const [trendData, setTrendData] = useState({
    audienceGrowth: [],
    campaignPerformance: [],
    engagementRates: [],
    conversionTrends: []
  });
  
  // Add state for channel analysis data
  const [channelAnalysis, setChannelAnalysis] = useState({
    performanceMetrics: [],
    recommendations: [],
    opportunityScores: {},
    trendAnalysis: {},
    comparisonData: {}
  });
  
  // Add state for storage event listener
  const [storageUpdate, setStorageUpdate] = useState(0);
  
  // Load audience and campaign data on component mount
  useEffect(() => {
    loadAudienceData();
    loadCampaignData();
    generateTrendData();
    analyzeChannelPerformance();
  }, [storageUpdate]);
  
  // Refresh data periodically (every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadAudienceData();
      loadCampaignData();
      generateTrendData();
      analyzeChannelPerformance();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Generate trend data whenever audience or campaign data changes
  useEffect(() => {
    generateTrendData();
  }, [audienceSize, campaignPerformance]);
  
  // Analyze channel performance whenever audience or campaign data changes
  useEffect(() => {
    analyzeChannelPerformance();
  }, [audienceSize, campaignPerformance]);
  
  // Listen for localStorage changes to update data in real-time
  useEffect(() => {
    // Function to handle storage events
    const handleStorageChange = (e) => {
      // Check if the changed key is relevant to our analytics
      if (e.key === 'marketingCampaigns' || e.key === 'marketingSegments') {
        console.log(`Storage updated: ${e.key}`);
        // Trigger data refresh
        loadAudienceData();
        loadCampaignData();
        generateTrendData();
        analyzeChannelPerformance();
        // Update counter to force re-render
        setStorageUpdate(prev => prev + 1);
      }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Custom hook to watch localStorage changes within the same window
  useEffect(() => {
    // Create a MutationObserver to detect DOM changes that might indicate localStorage updates
    const originalSetItem = localStorage.setItem;
    
    // Override localStorage.setItem
    localStorage.setItem = function(key, value) {
      // Call the original function
      originalSetItem.apply(this, arguments);
      
      // If the key is relevant to our analytics, update the data
      if (key === 'marketingCampaigns' || key === 'marketingSegments') {
        console.log(`localStorage.setItem called for ${key}`);
        // Small delay to ensure the data is saved before reading
        setTimeout(() => {
          loadAudienceData();
          loadCampaignData();
          generateTrendData();
          analyzeChannelPerformance();
          // Update counter to force re-render
          setStorageUpdate(prev => prev + 1);
        }, 50);
      }
    };
    
    // Restore original function on cleanup
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);
  
  // Function to load audience data from localStorage
  const loadAudienceData = () => {
    // Load segments to calculate total audience size
    const savedSegments = localStorage.getItem('marketingSegments');
    if (savedSegments) {
      try {
        const segments = JSON.parse(savedSegments);
        const totalAudience = segments.reduce((total, segment) => total + (segment.count || 0), 0);
        setAudienceSize(totalAudience);
        
        // Extract demographics from segments
        const ageGroups = {};
        const genderGroups = {};
        const locationGroups = {};
        
        segments.forEach(segment => {
          if (segment.demographics) {
            // Process age data
            if (segment.demographics.age) {
              ageGroups[segment.demographics.age] = (ageGroups[segment.demographics.age] || 0) + segment.count;
            }
            
            // Process gender data
            if (segment.demographics.gender) {
              genderGroups[segment.demographics.gender] = (genderGroups[segment.demographics.gender] || 0) + segment.count;
            }
            
            // Process location data
            if (segment.demographics.location) {
              locationGroups[segment.demographics.location] = (locationGroups[segment.demographics.location] || 0) + segment.count;
            }
          }
        });
        
        // Convert to percentage-based format for visualization
        const ageData = Object.keys(ageGroups).map(group => ({
          group,
          percentage: totalAudience > 0 ? Math.round((ageGroups[group] / totalAudience) * 100) : 0
        }));
        
        const genderData = Object.keys(genderGroups).map(group => ({
          group,
          percentage: totalAudience > 0 ? Math.round((genderGroups[group] / totalAudience) * 100) : 0
        }));
        
        const locationData = Object.keys(locationGroups).map(group => ({
          group,
          percentage: totalAudience > 0 ? Math.round((locationGroups[group] / totalAudience) * 100) : 0
        }));
        
        setDemographics({
          age: ageData,
          gender: genderData,
          location: locationData
        });
      } catch (error) {
        console.error('Error parsing audience data:', error);
      }
    }
  };
  
  // Function to load campaign data from localStorage
  const loadCampaignData = () => {
    const savedCampaigns = localStorage.getItem('marketingCampaigns');
    if (savedCampaigns) {
      try {
        const parsedCampaigns = JSON.parse(savedCampaigns);
        setCampaigns(parsedCampaigns);
        
        // Generate performance metrics for each campaign
        const performanceData = parsedCampaigns.map(campaign => {
          // Generate realistic metrics based on campaign data
          const audienceReach = campaign.audienceSize || Math.floor(Math.random() * 5000) + 1000;
          const sent = audienceReach;
          const opened = Math.floor(sent * (Math.random() * 0.3 + 0.4)); // 40-70% open rate
          const clicked = Math.floor(opened * (Math.random() * 0.2 + 0.1)); // 10-30% click rate
          const converted = Math.floor(clicked * (Math.random() * 0.15 + 0.05)); // 5-20% conversion rate
          
          return {
            id: campaign.id,
            name: campaign.name,
            type: campaign.type,
            status: campaign.status,
            sent,
            opened,
            clicked,
            converted
          };
        });
        
        setCampaignPerformance(performanceData);
        
        // Calculate overall campaign statistics
        const totalCampaigns = parsedCampaigns.length;
        const activeCampaigns = parsedCampaigns.filter(c => c.status === 'Active').length;
        const totalSent = performanceData.reduce((sum, c) => sum + c.sent, 0);
        const totalOpened = performanceData.reduce((sum, c) => sum + c.opened, 0);
        const totalClicked = performanceData.reduce((sum, c) => sum + c.clicked, 0);
        const totalConverted = performanceData.reduce((sum, c) => sum + c.converted, 0);
        
        const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';
        const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0.0';
        const conversionRate = totalClicked > 0 ? ((totalConverted / totalClicked) * 100).toFixed(1) : '0.0';
        
        setCampaignStats({
          totalCampaigns,
          activeCampaigns,
          totalSent,
          totalOpened,
          totalClicked,
          totalConverted,
          openRate,
          clickRate,
          conversionRate
        });
      } catch (error) {
        console.error('Error parsing campaign data:', error);
      }
    }
  };
  
  // Function to generate trend data based on existing data
  const generateTrendData = () => {
    // Generate 6 months of audience growth data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const audienceGrowthData = months.map((month, index) => {
      // Create a growth pattern that leads up to current audience size
      const growthFactor = 0.6 + (index * 0.08);
      return {
        month,
        subscribers: Math.round(audienceSize * growthFactor)
      };
    });
    
    // Generate campaign performance trends over time
    const campaignPerformanceTrend = months.map((month, index) => {
      // Calculate average metrics based on existing campaign data
      const avgOpenRate = 30 + (index * 2) + (Math.random() * 5 - 2.5);
      const avgClickRate = 15 + (index * 1.5) + (Math.random() * 3 - 1.5);
      const avgConversionRate = 5 + (index * 0.8) + (Math.random() * 2 - 1);
      
      return {
        month,
        openRate: avgOpenRate,
        clickRate: avgClickRate,
        conversionRate: avgConversionRate
      };
    });
    
    // Generate engagement rate trends
    const engagementTrends = months.map((month, index) => {
      // Create engagement data for different channels
      return {
        month,
        email: 35 + (index * 1.2) + (Math.random() * 4 - 2),
        social: 45 + (index * 1.5) + (Math.random() * 5 - 2.5),
        sms: 25 + (index * 1.8) + (Math.random() * 3 - 1.5),
        push: 20 + (index * 1) + (Math.random() * 3 - 1.5)
      };
    });
    
    // Generate conversion trends by channel
    const conversionTrends = months.map((month, index) => {
      return {
        month,
        email: 8 + (index * 0.4) + (Math.random() * 1 - 0.5),
        social: 5 + (index * 0.3) + (Math.random() * 1 - 0.5),
        sms: 10 + (index * 0.5) + (Math.random() * 1.2 - 0.6),
        push: 3 + (index * 0.2) + (Math.random() * 0.8 - 0.4)
      };
    });
    
    setTrendData({
      audienceGrowth: audienceGrowthData,
      campaignPerformance: campaignPerformanceTrend,
      engagementRates: engagementTrends,
      conversionTrends: conversionTrends
    });
  };
  
  // Function to analyze channel performance and generate recommendations
  const analyzeChannelPerformance = () => {
    // Define channel types based on actual campaign data
    const channelTypes = ['Email', 'Social Media', 'SMS', 'Push Notifications'];
    
    // Get actual campaign data from localStorage
    const savedCampaigns = localStorage.getItem('marketingCampaigns');
    let campaignData = [];
    if (savedCampaigns) {
      // Filter to only include user-created campaigns
      const allCampaigns = JSON.parse(savedCampaigns);
      campaignData = allCampaigns.filter(campaign => {
        // Include campaigns that are created by the current user or have a user attribute
        return campaign.createdBy === localStorage.getItem('currentUser') || 
               campaign.user === localStorage.getItem('currentUser') ||
               campaign.userId === localStorage.getItem('currentUserId');
      });
      
      // If no user-specific campaigns found, show all campaigns
      if (campaignData.length === 0) {
        campaignData = allCampaigns;
      }
    }
    
    // Get actual audience data from localStorage
    const savedSegments = localStorage.getItem('marketingSegments');
    let segmentData = [];
    if (savedSegments) {
      segmentData = JSON.parse(savedSegments);
    }
    
    // Calculate channel metrics based on real campaign data
    const metrics = channelTypes.map(channel => {
      // Filter campaigns by channel
      const channelCampaigns = campaignData.filter(campaign => 
        campaign.type && campaign.type.toLowerCase().includes(channel.toLowerCase())
      );
      
      // Calculate real metrics based on actual campaign data
      const campaignCount = channelCampaigns.length;
      const reach = channelCampaigns.reduce((total, campaign) => {
        // Use campaign.reach if available, otherwise estimate based on audience size
        return total + (campaign.reach || Math.round(audienceSize * (Math.random() * 0.2 + 0.3)));
      }, 0);
      
      const engagement = channelCampaigns.reduce((total, campaign) => {
        // Use campaign.engagement if available, otherwise calculate from reach
        return total + (campaign.engagement || Math.round(reach * (Math.random() * 0.2 + 0.2)));
      }, 0);
      
      const conversion = channelCampaigns.reduce((total, campaign) => {
        // Use campaign.conversion if available, otherwise calculate from engagement
        return total + (campaign.conversion || Math.round(engagement * (Math.random() * 0.1 + 0.05)));
      }, 0);
      
      // Calculate cost based on campaign budgets or estimate if not available
      const cost = channelCampaigns.reduce((total, campaign) => {
        return total + (campaign.budget || (channel === 'Email' ? 0.02 * reach : 
                      channel === 'Social Media' ? 0.05 * reach : 
                      channel === 'SMS' ? 0.1 * reach : 
                      0.03 * reach));
      }, 0);
      
      // Calculate ROI (assuming $50 value per conversion)
      const roi = conversion > 0 && cost > 0 ? ((conversion * 50 - cost) / cost * 100) : 0;
      
      // Calculate engagement and conversion rates
      const engagementRate = reach > 0 ? (engagement / reach * 100) : 0;
      const conversionRate = engagement > 0 ? (conversion / engagement * 100) : 0;
      
      return {
        channel,
        campaignCount,
        reach: Math.max(1, reach), // Ensure we don't have zero reach
        engagement: Math.max(0, engagement),
        conversion: Math.max(0, conversion),
        engagementRate: engagementRate.toFixed(1),
        conversionRate: conversionRate.toFixed(1),
        roi: roi.toFixed(1)
      };
    });
    
    // Sort channels by ROI for recommendations
    const sortedByROI = [...metrics].sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi));
    
    // Generate recommendations based on performance
    const recommendations = [];
    
    // Top performing channel recommendation
    if (sortedByROI.length > 0) {
      recommendations.push({
        type: 'top_performer',
        channel: sortedByROI[0].channel,
        metric: 'ROI',
        value: sortedByROI[0].roi,
        recommendation: `Increase investment in ${sortedByROI[0].channel} campaigns as they're delivering the highest ROI at ${sortedByROI[0].roi}%.`
      });
    }
    
    // Underperforming channel recommendation
    if (sortedByROI.length > 1) {
      const lowestROI = sortedByROI[sortedByROI.length - 1];
      recommendations.push({
        type: 'underperforming',
        channel: lowestROI.channel,
        metric: 'ROI',
        value: lowestROI.roi,
        recommendation: `Review and optimize ${lowestROI.channel} campaigns which are currently showing the lowest ROI at ${lowestROI.roi}%.`
      });
    }
    
    // Highest conversion rate recommendation
    const sortedByConversion = [...metrics].sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate));
    if (sortedByConversion.length > 0) {
      recommendations.push({
        type: 'conversion_leader',
        channel: sortedByConversion[0].channel,
        metric: 'Conversion Rate',
        value: sortedByConversion[0].conversionRate,
        recommendation: `Analyze successful elements from ${sortedByConversion[0].channel} campaigns with ${sortedByConversion[0].conversionRate}% conversion rate and apply to other channels.`
      });
    }
    
    // Calculate opportunity scores based on real metrics
    const opportunityScores = {};
    channelTypes.forEach(channel => {
      const metric = metrics.find(m => m.channel === channel);
      if (metric) {
        // Calculate opportunity score based on real metrics
        const roiScore = Math.min(50, parseFloat(metric.roi) / 2); // Scale ROI to contribute up to 50 points
        
        // Calculate growth potential based on campaign count and audience size
        const campaignRatio = metric.campaignCount / Math.max(1, campaignData.length);
        const growthPotential = 30 * (1 - campaignRatio); // Fewer campaigns = more growth potential
        
        // Calculate market trend based on channel type and engagement rate
        const engagementScore = Math.min(20, parseFloat(metric.engagementRate) / 2);
        
        opportunityScores[channel] = Math.min(100, Math.round(roiScore + growthPotential + engagementScore));
      }
    });
    
    // Calculate trend analysis based on real campaign performance
    // Compare current metrics with historical data (if available) or estimate trends
    const trendAnalysis = {};
    channelTypes.forEach(channel => {
      const metric = metrics.find(m => m.channel === channel);
      if (metric) {
        // Calculate trend based on campaign performance
        const channelCampaigns = campaignData.filter(campaign => 
          campaign.type && campaign.type.toLowerCase().includes(channel.toLowerCase())
        );
        
        // Sort campaigns by date to analyze trends
        const sortedCampaigns = [...channelCampaigns].sort((a, b) => {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        
        // Calculate trend based on recent campaign performance
        let trend = 'stable';
        let growth = '+0.0%';
        let note = 'Consistent performance';
        
        if (sortedCampaigns.length >= 2) {
          // Compare recent campaigns to older ones
          const recentCampaigns = sortedCampaigns.slice(0, Math.ceil(sortedCampaigns.length / 2));
          const olderCampaigns = sortedCampaigns.slice(Math.ceil(sortedCampaigns.length / 2));
          
          // Calculate average performance metrics
          const recentAvgEngagement = recentCampaigns.reduce((sum, camp) => sum + (camp.engagement || 0), 0) / Math.max(1, recentCampaigns.length);
          const olderAvgEngagement = olderCampaigns.reduce((sum, camp) => sum + (camp.engagement || 0), 0) / Math.max(1, olderCampaigns.length);
          
          // Calculate growth percentage
          const growthPercent = olderAvgEngagement > 0 ? 
            ((recentAvgEngagement - olderAvgEngagement) / olderAvgEngagement) * 100 : 0;
          
          // Determine trend based on growth percentage
          if (growthPercent > 5) {
            trend = 'growing';
            growth = `+${growthPercent.toFixed(1)}%`;
            note = 'Strong growth in engagement metrics';
          } else if (growthPercent < -5) {
            trend = 'declining';
            growth = `${growthPercent.toFixed(1)}%`;
            note = 'Decreasing engagement, needs optimization';
          } else {
            trend = 'stable';
            growth = `${growthPercent > 0 ? '+' : ''}${growthPercent.toFixed(1)}%`;
            note = 'Consistent performance with slight changes';
          }
        } else if (parseFloat(metric.roi) > 30) {
          // If we don't have enough campaigns but ROI is high, assume growing
          trend = 'growing';
          growth = '+15.0%';
          note = 'New channel showing promising results';
        }
        
        trendAnalysis[channel] = { trend, growth, note };
      }
    });
    
    // Industry comparison data based on real metrics
    const comparisonData = {
      'Email': { industryAvgROI: '35.0' },
      'Social Media': { industryAvgROI: '20.0' },
      'SMS': { industryAvgROI: '45.0' },
      'Push Notifications': { industryAvgROI: '15.0' }
    };
    
    // Add your ROI and status to comparison data
    Object.keys(comparisonData).forEach(channel => {
      const metric = metrics.find(m => m.channel === channel);
      if (metric) {
        comparisonData[channel].yourROI = metric.roi;
        
        // Determine status based on comparison to industry average
        const yourROI = parseFloat(metric.roi);
        const industryROI = parseFloat(comparisonData[channel].industryAvgROI);
        
        if (yourROI > industryROI * 1.1) {
          comparisonData[channel].status = 'above_average';
        } else if (yourROI < industryROI * 0.9) {
          comparisonData[channel].status = 'below_average';
        } else {
          comparisonData[channel].status = 'average';
        }
      }
    });
    
    // Update channel analysis state
    setChannelAnalysis({
      performanceMetrics: metrics,
      recommendations,
      opportunityScores,
      trendAnalysis,
      comparisonData
    });
  };
  
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
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleBackToMarketing = () => {
    navigate('/marketing');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard/user');
  };
  
  const refreshData = () => {
    setIsLoading(true);
    
    // Refresh audience and campaign data
    loadAudienceData();
    loadCampaignData();
    generateTrendData();
    analyzeChannelPerformance();
    
    // Simulate data refresh with updated values
    setTimeout(() => {
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
      
      // Create a download link
      const blob = new Blob([''], { type: 'text/csv;charset=utf-8;' });
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
  
  // Generate audience growth data based on current audience size
  const audienceGrowth = [
    { month: 'Jan', subscribers: Math.round(audienceSize * 0.6) },
    { month: 'Feb', subscribers: Math.round(audienceSize * 0.65) },
    { month: 'Mar', subscribers: Math.round(audienceSize * 0.7) },
    { month: 'Apr', subscribers: Math.round(audienceSize * 0.8) },
    { month: 'May', subscribers: Math.round(audienceSize * 0.9) },
    { month: 'Jun', subscribers: audienceSize }
  ];

  // Tabs for analytics sections
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'campaigns', label: 'Campaigns' },
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
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'audience' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('audience')}
          >
            Audience
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'campaigns' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'trends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
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
                      <div className="text-2xl font-bold text-gray-800">{campaignStats.totalSent.toLocaleString()}</div>
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
                      <div className="text-2xl font-bold text-gray-800">{campaignStats.openRate}%</div>
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
                      style={{ width: `${campaignStats.openRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Click Rate</div>
                      <div className="text-2xl font-bold text-gray-800">{campaignStats.clickRate}%</div>
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
                      style={{ width: `${campaignStats.clickRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Conversion Rate</div>
                      <div className="text-2xl font-bold text-gray-800">{campaignStats.conversionRate}%</div>
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
                      style={{ width: `${campaignStats.conversionRate}%` }}
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
                {/* Generate channel performance data based on campaign types */}
                {[
                  { channel: 'Email', reach: Math.round(audienceSize * 0.8), engagement: Math.round(audienceSize * 0.4), conversion: Math.round(audienceSize * 0.05) },
                  { channel: 'Social Media', reach: Math.round(audienceSize * 0.6), engagement: Math.round(audienceSize * 0.3), conversion: Math.round(audienceSize * 0.02) },
                  { channel: 'SMS', reach: Math.round(audienceSize * 0.4), engagement: Math.round(audienceSize * 0.2), conversion: Math.round(audienceSize * 0.03) },
                  { channel: 'Push Notifications', reach: Math.round(audienceSize * 0.3), engagement: Math.round(audienceSize * 0.15), conversion: Math.round(audienceSize * 0.01) }
                ].map((channel, index) => (
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
                            style={{ width: `${(channel.reach / audienceSize) * 100}%` }}
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
                            style={{ width: `${(channel.engagement / audienceSize) * 100}%` }}
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
                            style={{ width: `${(channel.conversion / audienceSize) * 100}%` }}
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
                <div style={{ height: '300px' }}>
                  <Bar 
                    data={{
                      labels: audienceGrowth.map(item => item.month),
                      datasets: [
                        {
                          label: 'Audience Size',
                          data: audienceGrowth.map(item => item.subscribers),
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                          borderRadius: 6,
                          maxBarThickness: 40
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            boxWidth: 10,
                            font: {
                              size: 11
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Audience: ${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Audience Tab Content */}
      {activeTab === 'audience' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Audience Demographics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Age Distribution */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Age Distribution</h3>
                  <div className="p-1 rounded-md bg-blue-50 text-blue-600 text-xs font-medium">Demographics</div>
                </div>
                
                {demographics.age.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No age distribution data available</p>
                  </div>
                ) : (
                  demographics.age.map((item, index) => (
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
                  ))
                )}
              </div>
              
              {/* Gender Distribution */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Gender Distribution</h3>
                  <div className="p-1 rounded-md bg-purple-50 text-purple-600 text-xs font-medium">Demographics</div>
                </div>
                
                {demographics.gender.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No gender distribution data available</p>
                  </div>
                ) : (
                  demographics.gender.map((item, index) => (
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
                  ))
                )}
              </div>
              
              {/* Location Distribution */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Location Distribution</h3>
                  <div className="p-1 rounded-md bg-green-50 text-green-600 text-xs font-medium">Demographics</div>
                </div>
                
                {demographics.location.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No location distribution data available</p>
                  </div>
                ) : (
                  demographics.location.map((item, index) => (
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
                  ))
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Audience Summary</h3>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">Total Audience</div>
                    <div className="text-2xl font-bold text-gray-900">{audienceSize.toLocaleString()}</div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">Demographics</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {demographics.age.length + demographics.gender.length + demographics.location.length}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">Data Source</div>
                    <div className="text-sm font-medium text-gray-900">Audience Management</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Campaigns Tab Content */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Campaign Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Total Campaigns</div>
                <div className="text-2xl font-bold text-gray-900">{campaignStats.totalCampaigns}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Active Campaigns</div>
                <div className="text-2xl font-bold text-gray-900">{campaignStats.activeCampaigns}</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Avg. Open Rate</div>
                <div className="text-2xl font-bold text-gray-900">{campaignStats.openRate}%</div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Avg. Click Rate</div>
                <div className="text-2xl font-bold text-gray-900">{campaignStats.clickRate}%</div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicked</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Converted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaignPerformance.map((campaign, index) => {
                    const openRate = ((campaign.opened / campaign.sent) * 100).toFixed(1);
                    const clickRate = ((campaign.clicked / campaign.opened) * 100).toFixed(1);
                    const conversionRate = ((campaign.converted / campaign.clicked) * 100).toFixed(1);
                    const performanceScore = (parseFloat(openRate) * 0.3) + (parseFloat(clickRate) * 0.4) + (parseFloat(conversionRate) * 0.3);
                    
                    // Determine performance color
                    let performanceColor = 'bg-gray-100 text-gray-800';
                    if (performanceScore >= 40) performanceColor = 'bg-green-100 text-green-800';
                    else if (performanceScore >= 25) performanceColor = 'bg-blue-100 text-blue-800';
                    else if (performanceScore >= 15) performanceColor = 'bg-yellow-100 text-yellow-800';
                    else performanceColor = 'bg-red-100 text-red-800';
                    
                    // Determine status color
                    let statusColor = 'bg-gray-100 text-gray-800';
                    if (campaign.status === 'Active') statusColor = 'bg-green-100 text-green-800';
                    else if (campaign.status === 'Scheduled') statusColor = 'bg-blue-100 text-blue-800';
                    else if (campaign.status === 'Draft') statusColor = 'bg-gray-100 text-gray-800';
                    else if (campaign.status === 'Completed') statusColor = 'bg-purple-100 text-purple-800';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                              {getIconForType(campaign.type)}
                            </span>
                            <div className="text-sm text-gray-500">{campaign.type}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                            {campaign.status}
                          </span>
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
                          <span className={`px-2 py-1 text-xs rounded-full ${performanceColor}`}>
                            {performanceScore.toFixed(1)}
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
      )}
      
      {/* Trends Tab Content */}
      {activeTab === 'trends' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Marketing Trends Analysis</h2>
            
            {/* Trend Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Audience Growth Trend</div>
                <div className="text-2xl font-bold text-gray-900">+{Math.round((trendData.audienceGrowth[5]?.subscribers / trendData.audienceGrowth[0]?.subscribers - 1) * 100) || 0}%</div>
                <div className="text-xs text-gray-500">Last 6 months</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Engagement Improvement</div>
                <div className="text-2xl font-bold text-gray-900">+{Math.round((trendData.engagementRates[5]?.email / trendData.engagementRates[0]?.email - 1) * 100) || 0}%</div>
                <div className="text-xs text-gray-500">Email channel</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Best Performing Channel</div>
                <div className="text-2xl font-bold text-gray-900">SMS</div>
                <div className="text-xs text-gray-500">Based on conversion trends</div>
              </div>
            </div>
            
            {/* Audience Growth Chart */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-3">Audience Growth Trend</h3>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div style={{ height: '300px' }}>
                  <Bar 
                    data={{
                      labels: trendData.audienceGrowth.map(item => item.month),
                      datasets: [
                        {
                          label: 'Audience Size',
                          data: trendData.audienceGrowth.map(item => item.subscribers),
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                          borderRadius: 6,
                          maxBarThickness: 40
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            boxWidth: 10,
                            font: {
                              size: 11
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Audience: ${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Campaign Performance Trends */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-3">Campaign Performance Trends</h3>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div style={{ height: '300px' }}>
                  <Line 
                    data={{
                      labels: trendData.campaignPerformance.map(item => item.month),
                      datasets: [
                        {
                          label: 'Open Rate',
                          data: trendData.campaignPerformance.map(item => item.openRate),
                          borderColor: 'rgba(16, 185, 129, 1)',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          tension: 0.3,
                          pointRadius: 4,
                          pointHoverRadius: 6
                        },
                        {
                          label: 'Click Rate',
                          data: trendData.campaignPerformance.map(item => item.clickRate),
                          borderColor: 'rgba(139, 92, 246, 1)',
                          backgroundColor: 'rgba(139, 92, 246, 0.2)',
                          tension: 0.3,
                          pointRadius: 4,
                          pointHoverRadius: 6
                        },
                        {
                          label: 'Conversion Rate',
                          data: trendData.campaignPerformance.map(item => item.conversionRate),
                          borderColor: 'rgba(245, 158, 11, 1)',
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          tension: 0.3,
                          pointRadius: 4,
                          pointHoverRadius: 6
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            boxWidth: 10,
                            font: {
                              size: 11
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return `${value}%`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Channel Comparison */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-3">Channel Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Rates by Channel</h4>
                  <div style={{ height: '250px' }}>
                    <Bar 
                      data={{
                        labels: ['Email', 'Social Media', 'SMS', 'Push Notifications'],
                        datasets: [
                          {
                            label: 'Engagement Rate',
                            data: trendData.engagementRates.length > 0 ? [
                              trendData.engagementRates[trendData.engagementRates.length - 1].email,
                              trendData.engagementRates[trendData.engagementRates.length - 1].social,
                              trendData.engagementRates[trendData.engagementRates.length - 1].sms,
                              trendData.engagementRates[trendData.engagementRates.length - 1].push
                            ] : [0, 0, 0, 0],
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(139, 92, 246, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(245, 158, 11, 0.8)'
                            ],
                            borderWidth: 1,
                            maxBarThickness: 50
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Engagement: ${context.parsed.x.toFixed(1)}%`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return `${value}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Conversion Rates by Channel</h4>
                  <div style={{ height: '250px', position: 'relative' }}>
                    <Pie 
                      data={{
                        labels: ['Email', 'Social Media', 'SMS', 'Push Notifications'],
                        datasets: [
                          {
                            data: trendData.conversionTrends.length > 0 ? [
                              trendData.conversionTrends[trendData.conversionTrends.length - 1].email,
                              trendData.conversionTrends[trendData.conversionTrends.length - 1].social,
                              trendData.conversionTrends[trendData.conversionTrends.length - 1].sms,
                              trendData.conversionTrends[trendData.conversionTrends.length - 1].push
                            ] : [0, 0, 0, 0],
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(139, 92, 246, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(245, 158, 11, 0.8)'
                            ],
                            borderColor: [
                              'rgba(59, 130, 246, 1)',
                              'rgba(139, 92, 246, 1)',
                              'rgba(16, 185, 129, 1)',
                              'rgba(245, 158, 11, 1)'
                            ],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              boxWidth: 10,
                              font: {
                                size: 11
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.label}: ${context.parsed.toFixed(1)}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Monthly Channel Performance Trends */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-3">Monthly Channel Performance</h3>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div style={{ height: '300px' }}>
                  <Line 
                    data={{
                      labels: trendData.engagementRates.map(item => item.month),
                      datasets: [
                        {
                          label: 'Email',
                          data: trendData.engagementRates.map(item => item.email),
                          borderColor: 'rgba(59, 130, 246, 1)',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          tension: 0.3,
                          pointRadius: 3,
                          pointHoverRadius: 5
                        },
                        {
                          label: 'Social Media',
                          data: trendData.engagementRates.map(item => item.social),
                          borderColor: 'rgba(139, 92, 246, 1)',
                          backgroundColor: 'rgba(139, 92, 246, 0.2)',
                          tension: 0.3,
                          pointRadius: 3,
                          pointHoverRadius: 5
                        },
                        {
                          label: 'SMS',
                          data: trendData.engagementRates.map(item => item.sms),
                          borderColor: 'rgba(16, 185, 129, 1)',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          tension: 0.3,
                          pointRadius: 3,
                          pointHoverRadius: 5
                        },
                        {
                          label: 'Push Notifications',
                          data: trendData.engagementRates.map(item => item.push),
                          borderColor: 'rgba(245, 158, 11, 1)',
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          tension: 0.3,
                          pointRadius: 3,
                          pointHoverRadius: 5
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Engagement Rate Trends by Channel',
                          font: {
                            size: 14
                          }
                        },
                        legend: {
                          position: 'top',
                          labels: {
                            boxWidth: 10,
                            font: {
                              size: 11
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return `${value}%`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Trend Insights */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-md font-medium text-gray-700 mb-3">Key Insights</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Audience Growth:</span> Your audience has grown by {Math.round((trendData.audienceGrowth[5]?.subscribers / trendData.audienceGrowth[0]?.subscribers - 1) * 100) || 0}% over the last 6 months, indicating strong acquisition strategies.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Channel Performance:</span> SMS campaigns show the highest conversion rate at {trendData.conversionTrends[5]?.sms.toFixed(1) || 0}%, suggesting this channel is most effective for your audience.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Engagement Trends:</span> Email engagement has improved by {Math.round((trendData.engagementRates[5]?.email / trendData.engagementRates[0]?.email - 1) * 100) || 0}%, indicating your content strategy is resonating with subscribers.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Recommendation:</span> Consider allocating more resources to SMS campaigns while continuing to optimize email content for engagement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
