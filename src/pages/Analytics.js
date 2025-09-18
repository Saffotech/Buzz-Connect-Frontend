import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Filter,
  Download,
  Instagram,
  Globe,
  Facebook,
  Twitter,
  Eye,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  FileText,
  Target,
  AlertCircle,
  RefreshCw,
  Clock,
  Bookmark,
  MousePointer,
  Activity,
  Zap,
  Play,
  Image,
  Video,
  LayoutGrid,
  Hash,
  MapPin,
  PieChart,
  BarChart,
  LineChart,
  Grid
} from 'lucide-react';
import { useDashboardData } from '../hooks/useApi';
import apiClient from '../utils/api';
import Loader from '../components/common/Loader';
import './Analytics.css';

const Analytics = () => {
  // Global filter state
  const [filters, setFilters] = useState({
    period: '30d',
    platforms: ['all'],
    customDateRange: {
      start: '',
      end: ''
    }
  });



  // Active section state
  const [activeSection, setActiveSection] = useState('overview');

  // Data state
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    posts: [],
    topPost: null,
    engagement: null,
    audience: null,
    growth: null,
    hashtags: null,
    contentTypes: null,
    bestTimes: null
  });

  // Individual accounts data state
  const [individualAccountsData, setIndividualAccountsData] = useState({});

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Get user and connected accounts from hook
  const {
    user,
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError
  } = useDashboardData();

  // Analytics sections
  const analyticsSections = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'engagement', label: 'Engagement', icon: <Heart size={16} /> },
    { id: 'audience', label: 'Audience', icon: <Users size={16} /> },
    { id: 'content', label: 'Content Analysis', icon: <FileText size={16} /> },
    { id: 'growth', label: 'Growth', icon: <TrendingUp size={16} /> },
    // { id: 'hashtags', label: 'Hashtags', icon: <Hash size={16} /> },
    { id: 'timing', label: 'Best Times', icon: <Clock size={16} /> },
    // { id: 'reports', label: 'Reports', icon: <Download size={16} /> }
  ];

  // Period options matching your backend
  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Dynamic platform options based on connected accounts
  const getPlatformOptions = () => {
    const baseOptions = [
      { value: 'all', label: 'All Platforms', icon: <Globe size={20} /> }
    ];

    if (!user?.connectedAccounts) return baseOptions;

    const connectedPlatforms = user.connectedAccounts.map(account => account.platform);

    if (connectedPlatforms.includes('instagram')) {
      baseOptions.push({ value: 'instagram', label: 'Instagram', icon: <Instagram size={20} /> });
    }
    if (connectedPlatforms.includes('facebook')) {
      baseOptions.push({ value: 'facebook', label: 'Facebook', icon: <Facebook size={20} /> });
    }
    if (connectedPlatforms.includes('twitter')) {
      baseOptions.push({ value: 'twitter', label: 'Twitter', icon: <Twitter size={20} /> });
    }

    return baseOptions;
  };

  // Mock data for advanced analytics (replace with real API calls)
  const generateMockAdvancedData = () => {
    return {
      engagement: {
        trends: [
          { date: '2025-01-01', likes: 120, comments: 45, shares: 12, reach: 1200 },
          { date: '2025-01-02', likes: 135, comments: 52, shares: 18, reach: 1350 },
          { date: '2025-01-03', likes: 98, comments: 38, shares: 8, reach: 980 },
          { date: '2025-01-04', likes: 165, comments: 63, shares: 22, reach: 1650 },
          { date: '2025-01-05', likes: 142, comments: 55, shares: 15, reach: 1420 },
          { date: '2025-01-06', likes: 178, comments: 68, shares: 28, reach: 1780 },
          { date: '2025-01-07', likes: 156, comments: 59, shares: 19, reach: 1560 }
        ],
        engagementRate: 8.4,
        bestPerformingTime: '7:00 PM - 9:00 PM',
        topContentType: 'Carousel'
      },
      audience: {
        demographics: {
          age: [
            { range: '18-24', percentage: 25, count: 2500 },
            { range: '25-34', percentage: 45, count: 4500 },
            { range: '35-44', percentage: 20, count: 2000 },
            { range: '45-54', percentage: 8, count: 800 },
            { range: '55+', percentage: 2, count: 200 }
          ],
          gender: [
            { type: 'Female', percentage: 58, count: 5800 },
            { type: 'Male', percentage: 40, count: 4000 },
            { type: 'Other', percentage: 2, count: 200 }
          ],
          locations: [
            { country: 'United States', percentage: 35, count: 3500 },
            { country: 'United Kingdom', percentage: 15, count: 1500 },
            { country: 'Canada', percentage: 12, count: 1200 },
            { country: 'Australia', percentage: 10, count: 1000 },
            { country: 'Germany', percentage: 8, count: 800 },
            { country: 'Others', percentage: 20, count: 2000 }
          ]
        },
        activeHours: [
          { hour: '6:00', activity: 15 },
          { hour: '7:00', activity: 25 },
          { hour: '8:00', activity: 45 },
          { hour: '9:00', activity: 35 },
          { hour: '10:00', activity: 30 },
          { hour: '11:00', activity: 40 },
          { hour: '12:00', activity: 70 },
          { hour: '13:00', activity: 85 },
          { hour: '14:00', activity: 75 },
          { hour: '15:00', activity: 60 },
          { hour: '16:00', activity: 55 },
          { hour: '17:00', activity: 65 },
          { hour: '18:00', activity: 80 },
          { hour: '19:00', activity: 95 },
          { hour: '20:00', activity: 100 },
          { hour: '21:00', activity: 90 },
          { hour: '22:00', activity: 70 },
          { hour: '23:00', activity: 45 }
        ]
      },
      growth: {
        followers: [
          { date: '2025-01-01', instagram: 9850, facebook: 5200 },
          { date: '2025-01-02', instagram: 9865, facebook: 5210 },
          { date: '2025-01-03', instagram: 9892, facebook: 5225 },
          { date: '2025-01-04', instagram: 9915, facebook: 5240 },
          { date: '2025-01-05', instagram: 9932, facebook: 5255 },
          { date: '2025-01-06', instagram: 9958, facebook: 5275 },
          { date: '2025-01-07', instagram: 9980, facebook: 5290 }
        ],
        growthRate: 2.3,
        unfollowRate: 0.8
      },
      hashtags: [
        { tag: '#socialmedia', impressions: 15420, reach: 8500, posts: 12, engagement: 1250 },
        { tag: '#marketing', impressions: 12380, reach: 7200, posts: 8, engagement: 980 },
        { tag: '#digitalmarketing', impressions: 10250, reach: 6100, posts: 6, engagement: 850 },
        { tag: '#contentcreation', impressions: 8950, reach: 5400, posts: 10, engagement: 720 },
        { tag: '#branding', impressions: 7650, reach: 4800, posts: 5, engagement: 620 },
        { tag: '#entrepreneur', impressions: 6420, reach: 3900, posts: 4, engagement: 510 }
      ],
      contentTypes: [
        { type: 'carousel', count: 45, avgEngagement: 156, avgReach: 2340, performance: 'excellent' },
        { type: 'single_image', count: 32, avgEngagement: 128, avgReach: 1890, performance: 'good' },
        { type: 'video', count: 18, avgEngagement: 195, avgReach: 2850, performance: 'excellent' },
        { type: 'reel', count: 12, avgEngagement: 245, avgReach: 3250, performance: 'outstanding' },
        { type: 'story', count: 86, avgEngagement: 85, avgReach: 1200, performance: 'average' }
      ],
      bestTimes: {
        weekdays: [
          { day: 'Monday', bestHour: '19:00', engagement: 85 },
          { day: 'Tuesday', bestHour: '20:00', engagement: 92 },
          { day: 'Wednesday', bestHour: '18:00', engagement: 78 },
          { day: 'Thursday', bestHour: '19:00', engagement: 88 },
          { day: 'Friday', bestHour: '17:00', engagement: 95 },
          { day: 'Saturday', bestHour: '12:00', engagement: 82 },
          { day: 'Sunday', bestHour: '14:00', engagement: 76 }
        ],
        heatmap: [
          [15, 12, 18, 22, 28, 35, 45], // Monday
          [18, 15, 22, 28, 32, 38, 48], // Tuesday
          [12, 10, 16, 25, 30, 42, 38], // Wednesday
          [20, 18, 25, 30, 35, 40, 46], // Thursday
          [25, 22, 28, 35, 42, 50, 38], // Friday
          [35, 40, 45, 42, 38, 32, 28], // Saturday
          [30, 35, 38, 35, 30, 25, 22]  // Sunday
        ]
      }
    };
  };

  // Fetch individual account analytics data
  const fetchIndividualAccountsData = async () => {
    if (!user?.connectedAccounts?.length) {
      setIndividualAccountsData({});
      return;
    }

    try {
      const accountsData = {};

      // Fetch data for each connected account
      await Promise.all(
        user.connectedAccounts.map(async (account) => {
          try {
            const params = new URLSearchParams();

            // Add period parameter
            if (filters.period === 'custom' && filters.customDateRange.start && filters.customDateRange.end) {
              params.append('startDate', filters.customDateRange.start);
              params.append('endDate', filters.customDateRange.end);
            } else {
              params.append('period', filters.period);
            }

            console.log(`Fetching data for account ${account.id} (${account.platform}):`, params.toString());

            const response = await apiClient.request(`/api/analytics/account/${account.id}?${params.toString()}`, {
              method: 'GET'
            });

            if (response.success && response.data) {
              accountsData[account.id] = {
                ...response.data,
                accountInfo: account
              };
              console.log(`Data loaded for ${account.username || account.platform}:`, response.data);
            } else {
              console.warn(`No data found for account ${account.id}:`, response.message);
              accountsData[account.id] = {
                posts: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                reach: 0,
                impressions: 0,
                accountInfo: account
              };
            }
          } catch (accountError) {
            console.error(`Error fetching data for account ${account.id}:`, accountError);
            accountsData[account.id] = {
              posts: 0,
              likes: 0,
              comments: 0,
              shares: 0,
              reach: 0,
              impressions: 0,
              accountInfo: account
            };
          }
        })
      );

      setIndividualAccountsData(accountsData);
      console.log('All individual accounts data loaded:', accountsData);

    } catch (error) {
      console.error('Error fetching individual accounts data:', error);
    }
  };

  // Fetch analytics overview data
  const fetchAnalyticsOverview = async () => {
    if (!user?.connectedAccounts?.length) {
      setLoading(false);
      setError('No connected accounts found. Please connect your social media accounts first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Add period parameter
      if (filters.period === 'custom' && filters.customDateRange.start && filters.customDateRange.end) {
        params.append('startDate', filters.customDateRange.start);
        params.append('endDate', filters.customDateRange.end);
      } else {
        params.append('period', filters.period);
      }

      // Add platform filter if not 'all'
      if (!filters.platforms.includes('all') && filters.platforms.length > 0) {
        params.append('platforms', filters.platforms.join(','));
      }

      console.log('Fetching analytics with params:', params.toString());

      // Fetch overview data and individual account data concurrently
      const [overviewResponse] = await Promise.all([
        apiClient.request(`/api/analytics/overview?${params.toString()}`, {
          method: 'GET'
        }),
        fetchIndividualAccountsData() // Fetch individual data concurrently
      ]);

      if (overviewResponse.success && overviewResponse.data) {
        const advancedData = generateMockAdvancedData();

        setAnalyticsData({
          overview: overviewResponse.data,
          posts: [],
          topPost: overviewResponse.data.topPerformingPost || null,
          ...advancedData
        });
        setLastSyncTime(new Date().toISOString());
      } else {
        throw new Error(overviewResponse.message || 'Failed to fetch analytics data');
      }

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data. Please try again.');
      setAnalyticsData({
        overview: null,
        posts: [],
        topPost: null,
        engagement: null,
        audience: null,
        growth: null,
        hashtags: null,
        contentTypes: null,
        bestTimes: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync analytics data from social platforms
  const syncAnalyticsData = async () => {
    setSyncing(true);
    try {
      const params = new URLSearchParams();
      params.append('days', '7');

      const response = await apiClient.request(`/api/analytics/sync-all?${params.toString()}`, {
        method: 'POST'
      });

      if (response.success) {
        showToast(`Successfully synced analytics for ${response.data.platformsSynced} platforms`, 'success');
        // This will refresh both overview and individual account data
        await fetchAnalyticsOverview();
      } else {
        throw new Error(response.message || 'Failed to sync analytics');
      }
    } catch (error) {
      console.error('Error syncing analytics:', error);
      showToast('Failed to sync analytics data', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Export report function
  const exportReport = async (format = 'pdf') => {
    try {
      showToast(`Generating ${format.toUpperCase()} report...`, 'info');

      // Simulate report generation
      setTimeout(() => {
        showToast(`${format.toUpperCase()} report downloaded successfully!`, 'success');
      }, 2000);

    } catch (error) {
      showToast('Failed to generate report', 'error');
    }
  };

  // Toast notification function
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<div class="toast-content"><span>${message}</span></div>`;

    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 10000;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s ease;
        }
        .toast-success { background-color: #28a745; }
        .toast-error { background-color: #dc3545; }
        .toast-info { background-color: #007bff; }
        .toast.show {
          opacity: 1;
          transform: translateX(0);
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  // Effect to fetch data when filters change or user loads
  useEffect(() => {
    if (user && !dashboardLoading) {
      fetchAnalyticsOverview();
    }
  }, [filters, user, dashboardLoading]);

  // Handle filter changes
  const handlePeriodChange = (value) => {
    setFilters(prev => ({
      ...prev,
      period: value,
      customDateRange: value !== 'custom' ? { start: '', end: '' } : prev.customDateRange
    }));
  };

  const handlePlatformChange = (platform) => {
    setFilters(prev => {
      let newPlatforms;

      if (platform === 'all') {
        newPlatforms = ['all'];
      } else {
        newPlatforms = prev.platforms.includes('all')
          ? [platform]
          : prev.platforms.includes(platform)
            ? prev.platforms.filter(p => p !== platform)
            : [...prev.platforms.filter(p => p !== 'all'), platform];

        if (newPlatforms.length === 0) {
          newPlatforms = ['all'];
        }
      }

      return { ...prev, platforms: newPlatforms };
    });
  };

  const handleCustomDateChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      customDateRange: {
        ...prev.customDateRange,
        [field]: value
      }
    }));
  };

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Check if user has connected accounts
  const hasConnectedAccounts = user?.connectedAccounts?.length > 0;
  const platformOptions = getPlatformOptions();

  // Loading state
  if (dashboardLoading || loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <p>Loading your comprehensive analytics data...</p>
        </div>
        <div className="analytics-loading">
          <Loader />
        </div>
      </div>
    );
  }

  // No connected accounts state
  if (!hasConnectedAccounts) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <p>Track your social media performance and discover insights to grow your audience</p>
        </div>
        <div className="analytics-empty-state">
          <div className="empty-state-content">
            <BarChart3 size={64} />
            <h3>No Connected Accounts</h3>
            <p>Connect your social media accounts to start tracking analytics</p>
            <button
              className="btn-primary"
              onClick={() => window.location.href = '/settings?tab=accounts'}
            >
              Connect Accounts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Page Header */}
      <div className="analytics-header">
        <div className="analytics-title-section">
          <h1>Analytics Dashboard</h1>
          <p>Comprehensive social media performance insights and reporting</p>
        </div>
        <div className="analytics-header-actions">
          <button
            className="sync-analytics-btn synbtn"
            onClick={syncAnalyticsData}
            disabled={syncing}
          >
            <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
          {lastSyncTime && (
            <span className="last-sync-time ">
              Last synced : {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="analytics-filters">
        <div className="filter-group">
          <label>
            <Calendar size={16} />
            Time Period
          </label>
          <div className="filter-dropdown">
            <select
              value={filters.period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="filter-select"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="dropdown-icon" />
          </div>

          {filters.period === 'custom' && (
            <div className="custom-date-inputs">
              <input
                type="date"
                value={filters.customDateRange.start}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="date-input"
              />
              <span>to</span>
              <input
                type="date"
                value={filters.customDateRange.end}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="date-input"
              />
            </div>
          )}
        </div>

        <div className="filter-group">
          <label>
            <Filter size={16} />
            Platforms
          </label>
          <div className="platform-filters">
            {platformOptions.map(platform => (
              <button
                key={platform.value}
                onClick={() => handlePlatformChange(platform.value)}
                className={`platform-filter ${filters.platforms.includes(platform.value) ? 'active' : ''
                  }`}
              >
                <span className="platform-icon">{platform.icon}</span>
                {platform.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Navigation */}
      <div className="analytics-navigation">
        {analyticsSections.map(section => (
          <button
            key={section.id}
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="analytics-error">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={fetchAnalyticsOverview} className="btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {/* Analytics Content */}
      {!loading && !error && analyticsData.overview && (
        <div className="analytics-content">

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="analytics-section">
              <h2>Key Metrics Overview</h2>
              <div className="kpi-grid">

                <div className="kpi-card">
                  <div className="kpi-icon posts">
                    <FileText size={24} />
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{analyticsData.overview.totalPosts || 0}</div>
                    <div className="kpi-label">Total Posts</div>
                    <div className="kpi-change neutral">
                      <Minus size={12} />
                      Period total
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon engagement">
                    <Heart size={24} />
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{formatNumber(analyticsData.overview.totalLikes || 0)}</div>
                    <div className="kpi-label">Total Likes</div>
                    <div className="kpi-change positive">
                      <ArrowUp size={12} />
                      +{((analyticsData.overview.totalLikes || 0) * 0.15).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon comments">
                    <MessageCircle size={24} />
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{formatNumber(analyticsData.overview.totalComments || 0)}</div>
                    <div className="kpi-label">Total Comments</div>
                    <div className="kpi-change positive">
                      <ArrowUp size={12} />
                      +{((analyticsData.overview.totalComments || 0) * 0.12).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon shares">
                    <Share2 size={24} />
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{formatNumber(analyticsData.overview.totalShares || 0)}</div>
                    <div className="kpi-label">Total Shares</div>
                    <div className="kpi-change neutral">
                      <Minus size={12} />
                      +{((analyticsData.overview.totalShares || 0) * 0.08).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon reach">
                    <Eye size={24} />
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{formatNumber(analyticsData.overview.totalReach || 0)}</div>
                    <div className="kpi-label">Total Reach</div>
                    <div className="kpi-change positive">
                      <ArrowUp size={12} />
                      +{((analyticsData.overview.totalReach || 0) * 0.18).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon impressions">
                    <BarChart3 size={24} />
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{formatNumber(analyticsData.overview.totalImpressions || 0)}</div>
                    <div className="kpi-label">Total Impressions</div>
                    <div className="kpi-change positive">
                      <ArrowUp size={12} />
                      +{((analyticsData.overview.totalImpressions || 0) * 0.14).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon engagement-rate">
                    <Target size={24} />
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{(analyticsData.overview.avgEngagementRate || 0).toFixed(1)}%</div>
                    <div className="kpi-label">Avg Engagement Rate</div>
                    <div className="kpi-change positive">
                      <ArrowUp size={12} />
                      +{(analyticsData.overview.avgEngagementRate * 0.05 || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon followers">
                    <Users size={24} />
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{formatNumber(dashboardData?.stats?.totalFollowers || 15200)}</div>
                    <div className="kpi-label">Total Followers</div>
                    <div className="kpi-change positive">
                      <ArrowUp size={12} />
                      +2.3%
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Account Performance */}
              <div className="platform-performance-section">
                <h3 className='pfbtn'>Individual Account Performance</h3>
                <div className="platform-performance-grid">
                  {user?.connectedAccounts?.map((account, index) => {
                    // Get individual account data
                    const accountData = individualAccountsData[account.id] || {
                      posts: 0,
                      likes: 0,
                      comments: 0,
                      shares: 0,
                      reach: 0,
                      impressions: 0
                    };

                    return (
                      <div key={account.id || index} className="platform-performance-card">
                        <div className="platform-header">
                          <div className="platform-info">
                            {account.platform === 'instagram' && <Instagram size={20} />}
                            {account.platform === 'twitter' && <Twitter size={20} />}
                            {account.platform === 'facebook' && <Facebook size={20} />}
                            <span className="platform-name">
                              {account.username || account.name || `${account.platform.charAt(0).toUpperCase() + account.platform.slice(1)} Account`}
                            </span>
                          </div>
                        </div>
                        <div className="platform-metrics-grid">
                          <div className="platform-metric">
                            <span className="metric-value">{accountData.posts || 0}</span>
                            <span className="metric-label">Posts</span>
                          </div>
                          <div className="platform-metric">
                            <span className="metric-value">{formatNumber(accountData.likes || 0)}</span>
                            <span className="metric-label">Likes</span>
                          </div>
                          <div className="platform-metric">
                            <span className="metric-value">{formatNumber(accountData.comments || 0)}</span>
                            <span className="metric-label">Comments</span>
                          </div>
                          <div className="platform-metric">
                            <span className="metric-value">{formatNumber(accountData.shares || 0)}</span>
                            <span className="metric-label">Shares</span>
                          </div>
                          <div className="platform-metric">
                            <span className="metric-value">{formatNumber(accountData.reach || 0)}</span>
                            <span className="metric-label">Reach</span>
                          </div>
                          <div className="platform-metric">
                            <span className="metric-value">{formatNumber(accountData.impressions || 0)}</span>
                            <span className="metric-label">Impressions</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Show message if no accounts connected */}
                  {(!user?.connectedAccounts || user.connectedAccounts.length === 0) && (
                    <div className="platform-performance-card">
                      <div className="platform-header">
                        <div className="platform-info">
                          <Users size={20} />
                          <span className="platform-name">No Connected Accounts</span>
                        </div>
                      </div>
                      <div className="platform-metrics-grid">
                        <div className="platform-metric">
                          <span className="metric-value">0</span>
                          <span className="metric-label">Posts</span>
                        </div>
                        <div className="platform-metric">
                          <span className="metric-value">0</span>
                          <span className="metric-label">Likes</span>
                        </div>
                        <div className="platform-metric">
                          <span className="metric-value">0</span>
                          <span className="metric-label">Comments</span>
                        </div>
                        <div className="platform-metric">
                          <span className="metric-value">0</span>
                          <span className="metric-label">Shares</span>
                        </div>
                        <div className="platform-metric">
                          <span className="metric-value">0</span>
                          <span className="metric-label">Reach</span>
                        </div>
                        <div className="platform-metric">
                          <span className="metric-value">0</span>
                          <span className="metric-label">Impressions</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Engagement Section */}
          {activeSection === 'engagement' && analyticsData.engagement && (
            <div className="analytics-section">
              <h2>Engagement Trends & Analysis</h2>

              {/* Engagement Overview Cards */}
              <div className="engagement-overview-cards">


                {/* Total Engagement */}
                <div className="key-metrics-card">
                  <div className="metric-icon">
                    <Heart size={20} />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {formatNumber(analyticsData.overview.totalLikes + analyticsData.overview.totalComments + analyticsData.overview.totalShares)}
                    </div>
                    <div className="metric-label">Total Engagement</div>
                    <div className="metric-subtitle">— Period total</div>
                    <div className="metric-change positive">
                      <ArrowUp size={12} />
                      +15.2%
                    </div>
                  </div>
                </div>

                {/* Engagement Rate */}
                <div className="key-metrics-card">
                  <div className="metric-rate">
                    <Target size={20} />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      8.4%
                    </div>
                    <div className="metric-label">Engagement Rate</div>
                    <div className="metric-subtitle">— Period average</div>
                    <div className="metric-change positive">
                      <ArrowUp size={12} />
                      +0.8% vs last period
                    </div>
                  </div>
                </div>


                {/* Peak Engagement Rate */}
                <div className="key-metrics-card">
                  <div className="metric-peak">
                    <Clock size={20} />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {analyticsData.engagement.bestPerformingTime}
                    </div>
                    <div className="metric-label">Best Time</div>
                    <div className="metric-subtitle">— Peak engagement window</div>
                  </div>
                </div>

                {/* Top Content */}
                <div className="key-metrics-card">
                  <div className="metric-topcontent">
                    <Grid size={20} />
                  </div>
                  <div className="metric-content">
                     <div className="metric-value">
                      Carousel
                    </div>
                    <div className="metric-value">
                      {/* {analyticsData.content.topContent} */}
                    </div>
                    <div className="metric-label">Top Content</div>
                    <div className="metric-subtitle">— Best performing post</div>
                  </div>
                </div>
                
              </div>

                {/* 
                <div className="engagement-card">
                  <div className="card-header">
                    <Heart size={20} />
                    <span>Total Engagement</span>
                  </div>
                  <div className="card-value">
                    {formatNumber(analyticsData.overview.totalLikes + analyticsData.overview.totalComments + analyticsData.overview.totalShares)}
                  </div>
                  <div className="card-change positive">
                    <ArrowUp size={14} />
                    +15.2% vs last period
                  </div>
                </div>

                <div className="engagement-card">
                  <div className="card-header">
                    <Target size={20} />
                    <span>Engagement Rate</span>
                  </div>
                  <div className="card-value">{analyticsData.engagement.engagementRate}%</div>
                  <div className="card-change positive">
                    <ArrowUp size={14} />
                    +0.8% vs last period
                  </div>
                </div> */}

                {/* <div className="engagement-card">
                  <div className="card-header">
                    <Clock size={20} />
                    <span>Best Time</span>
                  </div>
                  <div className="card-value">{analyticsData.engagement.bestPerformingTime}</div>
                  <div className="card-subtitle">Peak engagement window</div>
                </div> */}

                {/* <div className="engagement-card">
                  <div className="card-header">
                    <LayoutGrid size={20} />
                    <span>Top Content</span>
                  </div>
                  <div className="card-value">{analyticsData.engagement.topContentType}</div>
                  <div className="card-subtitle">Best performing format</div>
                </div> */}


              {/* Engagement Trends Chart Placeholder */}
              <div className="chart-container">
                <h3>Engagement Trends (Last 7 Days)</h3>
                <div className="chart-placeholder">
                  <LineChart size={48} />
                  <p>Interactive engagement trend chart would appear here</p>
                  <div className="trend-data-preview">
                    {analyticsData.engagement.trends.map((day, index) => (
                      <div key={index} className="trend-day">
                        <span className="trend-date">{new Date(day.date).getDate()}</span>
                        <div className="trend-bars">
                          <div className="bar likes" style={{ height: `${(day.likes / 200) * 100}%` }} title={`${day.likes} likes`}></div>
                          <div className="bar comments" style={{ height: `${(day.comments / 80) * 100}%` }} title={`${day.comments} comments`}></div>
                          <div className="bar shares" style={{ height: `${(day.shares / 30) * 100}%` }} title={`${day.shares} shares`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audience Section */}
          {activeSection === 'audience' && analyticsData.audience && (
            <div className="analytics-section">
              <h2>Audience Demographics & Activity</h2>

              {/* Demographics Grid */}
              <div className="demographics-grid">
                {/* Age Demographics */}
                <div className="demo-card">
                  <h3>Age Distribution</h3>
                  <div className="demo-chart">
                    {analyticsData.audience.demographics.age.map((age, index) => (
                      <div key={index} className="demo-bar-item">
                        <span className="demo-label">{age.range}</span>
                        <div className="demo-bar">
                          <div
                            className="demo-fill"
                            style={{ width: `${age.percentage}%` }}
                          ></div>
                        </div>
                        <span className="demo-value">{age.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Demographics */}
                <div className="demo-card">
                  <h3>Gender Distribution</h3>
                  <div className="demo-chart">
                    {analyticsData.audience.demographics.gender.map((gender, index) => (
                      <div key={index} className="demo-bar-item">
                        <span className="demo-label">{gender.type}</span>
                        <div className="demo-bar">
                          <div
                            className="demo-fill"
                            style={{ width: `${gender.percentage}%` }}
                          ></div>
                        </div>
                        <span className="demo-value">{gender.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Demographics */}
                <div className="demo-card">
                  <h3>Top Locations</h3>
                  <div className="demo-chart">
                    {analyticsData.audience.demographics.locations.map((location, index) => (
                      <div key={index} className="demo-bar-item">
                        <span className="demo-label">
                          <MapPin size={12} />
                          {location.country}
                        </span>
                        <div className="demo-bar">
                          <div
                            className="demo-fill"
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                        <span className="demo-value">{location.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity Heatmap */}
              <div className="activity-section">
                <h3>Audience Activity by Hour</h3>
                <div className="activity-heatmap">
                  {analyticsData.audience.activeHours.map((hour, index) => (
                    <div key={index} className="activity-hour">
                      <div className="hour-label">{hour.hour}</div>
                      <div
                        className="activity-bar"
                        style={{
                          height: `${hour.activity}%`,
                          backgroundColor: `rgba(0, 123, 255, ${hour.activity / 100})`
                        }}
                        title={`${hour.activity}% activity`}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="activity-legend">
                  <span className="legend-item">
                    <div className="legend-color low"></div>
                    Low Activity
                  </span>
                  <span className="legend-item">
                    <div className="legend-color medium"></div>
                    Medium Activity
                  </span>
                  <span className="legend-item">
                    <div className="legend-color high"></div>
                    High Activity
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Content Analysis Section */}
          {activeSection === 'content' && analyticsData.contentTypes && (
            <div className="analytics-section">
              <h2>Content Performance Analysis</h2>

              {/* Content Types Performance */}
              <div className="content-types-grid">
                {analyticsData.contentTypes.map((type, index) => (
                  <div key={index} className={`content-type-card ${type.performance}`}>
                    <div className="content-type-header">
                      <div className="content-type-icon">
                        {type.type === 'carousel' && <LayoutGrid size={24} />}
                        {type.type === 'single_image' && <Image size={24} />}
                        {type.type === 'video' && <Video size={24} />}
                        {type.type === 'reel' && <Play size={24} />}
                        {type.type === 'story' && <Activity size={24} />}
                      </div>
                      <div className="content-type-info">
                        <h3>{type.type.replace('_', ' ').toUpperCase()}</h3>
                        <span className={`performance-badge ${type.performance}`}>
                          {type.performance}
                        </span>
                      </div>
                    </div>

                    <div className="content-type-stats">
                      <div className="stat-row">
                        <span className="stat-label">Posts Count:</span>
                        <span className="stat-value">{type.count}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Avg Engagement:</span>
                        <span className="stat-value">{formatNumber(type.avgEngagement)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Avg Reach:</span>
                        <span className="stat-value">{formatNumber(type.avgReach)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Engagement Rate:</span>
                        <span className="stat-value">
                          {((type.avgEngagement / type.avgReach) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Content Insights */}
              <div className="content-insights">
                <div className="insight-card">
                  <Zap size={20} />
                  <div className="insight-content">
                    <h4>Top Performing Content</h4>
                    <p>Reels generate 58% more engagement than static posts</p>
                  </div>
                </div>
                <div className="insight-card">
                  <Target size={20} />
                  <div className="insight-content">
                    <h4>Optimal Content Mix</h4>
                    <p>40% Reels, 30% Carousels, 20% Images, 10% Videos</p>
                  </div>
                </div>
                <div className="insight-card">
                  <TrendingUp size={20} />
                  <div className="insight-content">
                    <h4>Growth Opportunity</h4>
                    <p>Increase video content for 25% potential reach boost</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Growth Section */}
          {activeSection === 'growth' && analyticsData.growth && (
            <div className="analytics-section">
              <h2>Follower Growth & Trends</h2>

              {/* Growth Overview Cards */}
              <div className="growth-overview-cards">

                <div className="growth-card">
                  <div className="card-header">
                    <Users size={20} />
                    <span>Total Followers</span>
                  </div>
                  <div className="card-value">
                    {formatNumber(
                      analyticsData.growth.followers[analyticsData.growth.followers.length - 1].instagram +
                      analyticsData.growth.followers[analyticsData.growth.followers.length - 1].facebook
                    )}
                  </div>
                  <div className="card-change positive">
                    <ArrowUp size={14} />
                    +{analyticsData.growth.growthRate}% this period
                  </div>
                </div>

                <div className="growth-card">
                  <div className="card-header">
                    <TrendingUp size={20} />
                    <span>Growth Rate</span>
                  </div>
                  <div className="card-value">{analyticsData.growth.growthRate}%</div>
                  <div className="card-subtitle">Weekly average</div>
                </div>

                <div className="growth-card">
                  <div className="card-header">
                    <ArrowDown size={20} />
                    <span>Unfollow Rate</span>
                  </div>
                  <div className="card-value">{analyticsData.growth.unfollowRate}%</div>
                  <div className="card-subtitle">Below average</div>
                </div>

                <div className="growth-card">
                  <div className="card-header">
                    <Activity size={20} />
                    <span>Net Growth</span>
                  </div>
                  <div className="card-value">
                    +{formatNumber(
                      (analyticsData.growth.followers[analyticsData.growth.followers.length - 1].instagram +
                        analyticsData.growth.followers[analyticsData.growth.followers.length - 1].facebook) -
                      (analyticsData.growth.followers[0].instagram + analyticsData.growth.followers[0].facebook)
                    )}
                  </div>
                  <div className="card-subtitle">Last 7 days</div>
                </div>

              </div>

              {/* Growth Chart Placeholder */}
              <div className="chart-container">
                <h3>Follower Growth Trend</h3>
                <div className="chart-placeholder">
                  <LineChart size={48} />
                  <p>Interactive growth trend chart would appear here</p>
                  <div className="growth-data-preview">
                    {analyticsData.growth.followers.map((day, index) => (
                      <div key={index} className="growth-day">
                        <span className="growth-date">{new Date(day.date).getDate()}</span>
                        <div className="growth-bars">
                          <div className="bar instagram" style={{ height: `${(day.instagram / 10000) * 100}%` }} title={`${day.instagram} Instagram`}></div>
                          <div className="bar facebook" style={{ height: `${(day.facebook / 6000) * 100}%` }} title={`${day.facebook} Facebook`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Growth Comparison */}
              <div className="platform-growth-comparison">
                <h3>Platform Growth Comparison</h3>
                <div className="platform-growth-cards">
                  <div className="platform-growth-card instagram">
                    <Instagram size={24} />
                    <div className="platform-growth-info">
                      <span className="platform-name">Instagram</span>
                      <span className="follower-count">
                        {formatNumber(analyticsData.growth.followers[analyticsData.growth.followers.length - 1].instagram)}
                      </span>
                      <span className="growth-indicator positive">+2.8% growth</span>
                    </div>
                  </div>
                  <div className="platform-growth-card facebook">
                    <Facebook size={24} />
                    <div className="platform-growth-info">
                      <span className="platform-name">Facebook</span>
                      <span className="follower-count">
                        {formatNumber(analyticsData.growth.followers[analyticsData.growth.followers.length - 1].facebook)}
                      </span>
                      <span className="growth-indicator positive">+1.8% growth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hashtags Section */}
          {activeSection === 'hashtags' && analyticsData.hashtags && (
            <div className="analytics-section">
              <h2>Hashtag Performance Analysis</h2>

              {/* Top Performing Hashtags */}
              <div className="hashtags-table">
                <div className="table-header">
                  <div className="header-cell">Hashtag</div>
                  <div className="header-cell">Impressions</div>
                  <div className="header-cell">Reach</div>
                  <div className="header-cell">Posts</div>
                  <div className="header-cell">Engagement</div>
                  <div className="header-cell">Avg Performance</div>
                </div>

                {analyticsData.hashtags.map((hashtag, index) => (
                  <div key={index} className="table-row">
                    <div className="table-cell hashtag-cell">
                      <Hash size={16} />
                      <span className="hashtag-name">{hashtag.tag}</span>
                    </div>
                    <div className="table-cell">{formatNumber(hashtag.impressions)}</div>
                    <div className="table-cell">{formatNumber(hashtag.reach)}</div>
                    <div className="table-cell">{hashtag.posts}</div>
                    <div className="table-cell">{formatNumber(hashtag.engagement)}</div>
                    <div className="table-cell">
                      <div className="performance-indicator">
                        <div
                          className="performance-bar"
                          style={{
                            width: `${(hashtag.engagement / hashtag.reach) * 100}%`,
                            backgroundColor: '#007bff'
                          }}
                        ></div>
                        <span>{((hashtag.engagement / hashtag.reach) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hashtag Insights */}
              <div className="hashtag-insights">
                <div className="insight-card">
                  <Hash size={20} />
                  <div className="insight-content">
                    <h4>Best Performing Hashtag</h4>
                    <p>{analyticsData.hashtags[0].tag} with {formatNumber(analyticsData.hashtags[0].engagement)} engagement</p>
                  </div>
                </div>
                <div className="insight-card">
                  <Target size={20} />
                  <div className="insight-content">
                    <h4>Optimal Hashtag Count</h4>
                    <p>Use 8-12 hashtags for maximum reach and engagement</p>
                  </div>
                </div>
                <div className="insight-card">
                  <TrendingUp size={20} />
                  <div className="insight-content">
                    <h4>Trending Opportunity</h4>
                    <p>Mix popular and niche hashtags for better discovery</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Best Times Section */}
          {activeSection === 'timing' && analyticsData.bestTimes && (
            <div className="analytics-section">
              <h2>Optimal Posting Times</h2>

              {/* Best Times by Day */}
              <div className="best-times-grid">
                {analyticsData.bestTimes.weekdays.map((day, index) => (
                  <div key={index} className="day-card">
                    <div className="day-header">
                      <span className="day-name">{day.day}</span>
                      <span className="best-time">{day.bestHour}</span>
                    </div>
                    <div className="engagement-score">
                      <div className="score-value">{day.engagement}%</div>
                      <div className="score-label">Engagement</div>
                    </div>
                    <div className="engagement-bar">
                      <div
                        className="engagement-fill"
                        style={{ width: `${day.engagement}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Heatmap */}
              {/* <div className="timing-heatmap">
                <h3>Weekly Posting Heatmap</h3>
                <div className="heatmap-container">
                  <div className="heatmap-hours">
                    {['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'].map((hour, index) => (
                      <div key={index} className="hour-label">{hour}</div>
                    ))}
                  </div>
                  <div className="heatmap-grid">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                      <div key={dayIndex} className="heatmap-row">
                        <div className="day-label">{day}</div>
                        {analyticsData.bestTimes.heatmap[dayIndex].map((value, hourIndex) => (
                          <div 
                            key={hourIndex} 
                            className="heatmap-cell"
                            style={{ 
                              backgroundColor: `rgba(0, 123, 255, ${value / 50})`,
                              opacity: Math.max(0.1, value / 50)
                            }}
                            title={`${day} ${['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'][hourIndex]}: ${value}% engagement`}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="heatmap-legend">
                  <span>Low</span>
                  <div className="legend-gradient"></div>
                  <span>High</span>
                </div>
              </div> */}

              {/* Timing Recommendations */}
              <div className="timing-recommendations">
                <div className="recommendation-card">
                  <Clock size={20} />
                  <div className="recommendation-content">
                    <h4>Peak Engagement Time</h4>
                    <p>Tuesday at 8:00 PM shows highest engagement (92%)</p>
                  </div>
                </div>
                <div className="recommendation-card">
                  <Calendar size={20} />
                  <div className="recommendation-content">
                    <h4>Best Days to Post</h4>
                    <p>Tuesday, Thursday, and Friday show consistent high engagement</p>
                  </div>
                </div>
                <div className="recommendation-card">
                  <Activity size={20} />
                  <div className="recommendation-content">
                    <h4>Consistency Tip</h4>
                    <p>Post regularly between 6-9 PM for optimal reach</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Section */}
          {activeSection === 'reports' && (
            <div className="analytics-section">
              <h2>Analytics Reports & Export</h2>

              {/* Report Options */}
              <div className="report-options-grid">
                <div className="report-option-card">
                  <div className="report-icon">
                    <PieChart size={32} />
                  </div>
                  <div className="report-info">
                    <h3>Summary Report</h3>
                    <p>Overview of key metrics and performance insights</p>
                  </div>
                  <div className="report-actions">
                    <button
                      className="export-btn pdf"
                      onClick={() => exportReport('pdf')}
                    >
                      <Download size={16} />
                      PDF
                    </button>
                    <button
                      className="export-btn excel"
                      onClick={() => exportReport('excel')}
                    >
                      <Download size={16} />
                      Excel
                    </button>
                  </div>
                </div>

                <div className="report-option-card">
                  <div className="report-icon">
                    <BarChart size={32} />
                  </div>
                  <div className="report-info">
                    <h3>Detailed Analytics</h3>
                    <p>Comprehensive data breakdown by platform and content type</p>
                  </div>
                  <div className="report-actions">
                    <button
                      className="export-btn pdf"
                      onClick={() => exportReport('pdf')}
                    >
                      <Download size={16} />
                      PDF
                    </button>
                    <button
                      className="export-btn excel"
                      onClick={() => exportReport('excel')}
                    >
                      <Download size={16} />
                      Excel
                    </button>
                  </div>
                </div>

                <div className="report-option-card">
                  <div className="report-icon">
                    <LineChart size={32} />
                  </div>
                  <div className="report-info">
                    <h3>Growth Report</h3>
                    <p>Follower growth trends and audience development metrics</p>
                  </div>
                  <div className="report-actions">
                    <button
                      className="export-btn pdf"
                      onClick={() => exportReport('pdf')}
                    >
                      <Download size={16} />
                      PDF
                    </button>
                    <button
                      className="export-btn excel"
                      onClick={() => exportReport('excel')}
                    >
                      <Download size={16} />
                      Excel
                    </button>
                  </div>
                </div>

                <div className="report-option-card">
                  <div className="report-icon">
                    <Hash size={32} />
                  </div>
                  <div className="report-info">
                    <h3>Content Performance</h3>
                    <p>Detailed analysis of posts, hashtags, and content types</p>
                  </div>
                  <div className="report-actions">
                    <button
                      className="export-btn pdf"
                      onClick={() => exportReport('pdf')}
                    >
                      <Download size={16} />
                      PDF
                    </button>
                    <button
                      className="export-btn excel"
                      onClick={() => exportReport('excel')}
                    >
                      <Download size={16} />
                      Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Scheduled Reports */}
              <div className="scheduled-reports">
                <h3>Scheduled Reports</h3>
                <div className="scheduled-reports-list">
                  <div className="scheduled-report-item">
                    <div className="report-schedule-info">
                      <span className="report-name">Weekly Summary</span>
                      <span className="report-schedule">Every Monday at 9:00 AM</span>
                    </div>
                    <div className="report-schedule-actions">
                      <button className="btn-secondary">Edit</button>
                      <button className="btn-secondary">Disable</button>
                    </div>
                  </div>
                  <div className="scheduled-report-item">
                    <div className="report-schedule-info">
                      <span className="report-name">Monthly Growth Report</span>
                      <span className="report-schedule">First day of each month</span>
                    </div>
                    <div className="report-schedule-actions">
                      <button className="btn-secondary">Edit</button>
                      <button className="btn-secondary">Disable</button>
                    </div>
                  </div>
                </div>
                <button className="btn-primary">
                  <Calendar size={16} />
                  Schedule New Report
                </button>
              </div>

              {/* Report History */}
              <div className="report-history">
                <h3>Recent Reports</h3>
                <div className="report-history-list">
                  <div className="report-history-item">
                    <div className="report-info">
                      <span className="report-name">Weekly Analytics - Jan 2025</span>
                      <span className="report-date">Generated on Jan 7, 2025</span>
                    </div>
                    <div className="report-actions">
                      <button className="btn-secondary">
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="report-history-item">
                    <div className="report-info">
                      <span className="report-name">Monthly Summary - Dec 2024</span>
                      <span className="report-date">Generated on Jan 1, 2025</span>
                    </div>
                    <div className="report-actions">
                      <button className="btn-secondary">
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Performing Post - Show in all sections */}
          {analyticsData.topPost && (
            <div className="analytics-section">
              <h2>Top Performing Post</h2>
              <div className="top-post-container">
                <div className="top-post-card">
                  <div className="top-post-content">
                    {analyticsData.topPost.images && analyticsData.topPost.images.length > 0 && (
                      <div className="top-post-image">
                        <img
                          src={analyticsData.topPost.images[0].url}
                          alt={analyticsData.topPost.images[0].altText || "Top post"}
                        />
                      </div>
                    )}
                    <div className="top-post-details">
                      <div className="top-post-platforms">
                        {analyticsData.topPost.platforms?.map(platform => (
                          <span key={platform} className="platform-badge">
                            {platform === 'instagram' && <Instagram size={14} />}
                            {platform === 'facebook' && <Facebook size={14} />}
                            {platform === 'twitter' && <Twitter size={14} />}
                            {platform}
                          </span>
                        ))}
                      </div>
                      <p className="top-post-text">
                        {analyticsData.topPost.content?.substring(0, 150)}
                        {analyticsData.topPost.content?.length > 150 ? '...' : ''}
                      </p>
                      <div className="top-post-stats">
                        <div className="stat-item">
                          <Heart size={16} />
                          <span>{formatNumber(analyticsData.topPost.totalEngagement || 0)}</span>
                          <label>Total Engagement</label>
                        </div>
                        <div className="stat-item">
                          <Target size={16} />
                          <span>{(analyticsData.topPost.avgEngagementRate || 0).toFixed(1)}%</span>
                          <label>Engagement Rate</label>
                        </div>
                        <div className="stat-item">
                          <Calendar size={16} />
                          <span>{new Date(analyticsData.topPost.publishedAt || analyticsData.topPost.createdAt).toLocaleDateString()}</span>
                          <label>Published</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;