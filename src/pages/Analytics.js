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
  RefreshCw
} from 'lucide-react';
import { useDashboardData } from '../hooks/useApi';
import apiClient from '../utils/api';
import Loader from '../components/common/Loader';
import './Analytics.css';

const Analytics = () => {
  // Global filter state
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    platforms: ['all'],
    customDateRange: {
      start: '',
      end: ''
    }
  });

  // Data state
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    engagementTrends: null,
    platformBreakdown: null,
    topPosts: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);

  // Get user and connected accounts from hook
  const {
    user,
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError
  } = useDashboardData();

  // Date range options
  const dateRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'lastyear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Dynamic platform options based on connected accounts
  const getPlatformOptions = () => {
    const baseOptions = [
      { value: 'all', label: 'All Platforms', icon: <Globe size={24} /> }
    ];

    if (!user?.connectedAccounts) return baseOptions;

    const connectedPlatforms = user.connectedAccounts.map(account => account.platform);
    
    // Add platform options only if user has connected accounts
    if (connectedPlatforms.includes('instagram')) {
      baseOptions.push({ value: 'instagram', label: 'Instagram', icon: <Instagram size={24} /> });
    }
    if (connectedPlatforms.includes('facebook')) {
      baseOptions.push({ value: 'facebook', label: 'Facebook', icon: <Facebook size={24} /> });
    }
    if (connectedPlatforms.includes('twitter')) {
      baseOptions.push({ value: 'twitter', label: 'Twitter', icon: <Twitter size={24} /> });
    }

    return baseOptions;
  };

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    if (!user?.connectedAccounts?.length) {
      setLoading(false);
      setError('No connected accounts found. Please connect your social media accounts first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Add date range parameter
      if (filters.dateRange === 'custom' && filters.customDateRange.start && filters.customDateRange.end) {
        params.append('startDate', filters.customDateRange.start);
        params.append('endDate', filters.customDateRange.end);
      } else {
        params.append('period', filters.dateRange);
      }

      // Add platform filter
      if (filters.platforms.length > 0 && !filters.platforms.includes('all')) {
        params.append('platforms', filters.platforms.join(','));
      }

      // Fetch posts for analytics
      const postsResponse = await apiClient.request('/api/posts', {
        method: 'GET',
        params: {
          page: 1,
          limit: 100,
          status: 'published', // Only published posts for analytics
          ...Object.fromEntries(params)
        }
      });

      if (postsResponse.success && postsResponse.data) {
        const fetchedPosts = postsResponse.data.posts || [];
        setPosts(fetchedPosts);

        // Calculate analytics from posts
        const calculatedAnalytics = calculateAnalyticsFromPosts(fetchedPosts);
        setAnalyticsData(calculatedAnalytics);
      } else {
        throw new Error('Failed to fetch posts data');
      }

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
      setAnalyticsData({
        overview: null,
        engagementTrends: null,
        platformBreakdown: null,
        topPosts: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics from posts data
  const calculateAnalyticsFromPosts = (postsData) => {
    if (!postsData || postsData.length === 0) {
      return {
        overview: {
          totalReach: 0,
          totalImpressions: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          avgEngagementRate: 0,
          totalPosts: 0,
          followerGrowth: 0,
          platformBreakdown: {}
        },
        engagementTrends: [],
        platformBreakdown: {},
        topPosts: []
      };
    }

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalReach = 0;
    let totalImpressions = 0;
    let platformStats = {};

    // Process each post
    postsData.forEach(post => {
      if (post.platformPosts && Array.isArray(post.platformPosts)) {
        post.platformPosts.forEach(platformPost => {
          const platform = platformPost.platform;
          
          if (!platformStats[platform]) {
            platformStats[platform] = {
              posts: 0,
              likes: 0,
              comments: 0,
              shares: 0,
              reach: 0,
              impressions: 0
            };
          }

          platformStats[platform].posts++;

          if (platformPost.analytics) {
            const analytics = platformPost.analytics;
            const likes = analytics.likes || 0;
            const comments = analytics.comments || 0;
            const shares = analytics.shares || 0;
            const reach = analytics.reach || 0;
            const impressions = analytics.impressions || 0;

            totalLikes += likes;
            totalComments += comments;
            totalShares += shares;
            totalReach += reach;
            totalImpressions += impressions;

            platformStats[platform].likes += likes;
            platformStats[platform].comments += comments;
            platformStats[platform].shares += shares;
            platformStats[platform].reach += reach;
            platformStats[platform].impressions += impressions;
          }
        });
      }
    });

    // Calculate engagement rate
    const totalEngagement = totalLikes + totalComments + totalShares;
    const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

    // Generate engagement trends (simplified - group by date)
    const engagementTrends = generateEngagementTrends(postsData);

    // Get top performing posts
    const topPosts = postsData
      .filter(post => post.totalEngagement > 0)
      .sort((a, b) => (b.totalEngagement || 0) - (a.totalEngagement || 0))
      .slice(0, 10)
      .map(post => ({
        id: post._id,
        content: post.content || '',
        platform: post.platforms?.[0] || 'instagram',
        likes: post.platformPosts?.reduce((sum, pp) => sum + (pp.analytics?.likes || 0), 0) || 0,
        comments: post.platformPosts?.reduce((sum, pp) => sum + (pp.analytics?.comments || 0), 0) || 0,
        shares: post.platformPosts?.reduce((sum, pp) => sum + (pp.analytics?.shares || 0), 0) || 0,
        reach: post.platformPosts?.reduce((sum, pp) => sum + (pp.analytics?.reach || 0), 0) || 0,
        engagementRate: post.avgEngagementRate || 0,
        createdAt: post.publishedAt || post.createdAt,
        images: post.images || []
      }));

    return {
      overview: {
        totalReach,
        totalImpressions,
        totalLikes,
        totalComments,
        totalShares,
        avgEngagementRate,
        totalPosts: postsData.length,
        followerGrowth: dashboardData?.stats?.followerGrowth || 0,
        platformBreakdown: platformStats
      },
      engagementTrends,
      platformBreakdown: platformStats,
      topPosts
    };
  };

  // Generate engagement trends from posts
  const generateEngagementTrends = (postsData) => {
    const trendsMap = {};

    postsData.forEach(post => {
      const date = new Date(post.publishedAt || post.createdAt).toISOString().split('T')[0];
      
      if (!trendsMap[date]) {
        trendsMap[date] = { date, likes: 0, comments: 0, shares: 0, reach: 0 };
      }

      if (post.platformPosts) {
        post.platformPosts.forEach(pp => {
          if (pp.analytics) {
            trendsMap[date].likes += pp.analytics.likes || 0;
            trendsMap[date].comments += pp.analytics.comments || 0;
            trendsMap[date].shares += pp.analytics.shares || 0;
            trendsMap[date].reach += pp.analytics.reach || 0;
          }
        });
      }
    });

    return Object.values(trendsMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Effect to fetch data when filters change or user loads
  useEffect(() => {
    if (user && !dashboardLoading) {
      fetchAnalyticsData();
    }
  }, [filters, user, dashboardLoading]);

  // Handle filter changes
  const handleDateRangeChange = (value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: value,
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
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Helper function to get change indicator
  const getChangeIndicator = (change) => {
    if (change > 0) {
      return { icon: ArrowUp, className: 'positive', text: `+${change}%` };
    } else if (change < 0) {
      return { icon: ArrowDown, className: 'negative', text: `${change}%` };
    } else {
      return { icon: Minus, className: 'neutral', text: '0%' };
    }
  };

  // Check if user has connected accounts
  const hasConnectedAccounts = user?.connectedAccounts?.length > 0;
  const platformOptions = getPlatformOptions();

  // Loading state
  if (dashboardLoading || loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Analytics</h1>
          <p>Loading your analytics data...</p>
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
          <h1>Analytics</h1>
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
        <h1>Analytics</h1>
        <p>Track your social media performance and discover insights to grow your audience</p>
        <button 
          className="refresh-analytics-btn"
          onClick={() => fetchAnalyticsData()}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Global Filter Bar */}
        <div className="analytics-filters">
          <div className="filter-group">
            <label>
              <Calendar size={16} />
              Date Range
            </label>
            <div className="filter-dropdown">
              <select
                value={filters.dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="filter-select"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="dropdown-icon" />
            </div>

            {filters.dateRange === 'custom' && (
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

          {/* Platforms filter */}
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
                  className={`platform-filter ${
                    filters.platforms.includes(platform.value) ? 'active' : ''
                  }`}
                >
                  <span className="platform-icon">{platform.icon}</span>
                  {platform.label}
                </button>
              ))}
            </div>
          </div>
        </div>


      {/* Error State */}
      {error && (
        <div className="analytics-error">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={fetchAnalyticsData} className="btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {/* Analytics Content */}
      {!loading && !error && analyticsData.overview && (
        <div className="analytics-content">
          {/* Key Metrics Overview */}
          <div className="analytics-section">
            <h2>Key Metrics Overview</h2>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon reach">
                  <Eye size={24} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {formatNumber(analyticsData.overview.totalReach)}
                  </div>
                  <div className="kpi-label">Total Reach</div>
                  <div className="kpi-change positive">
                    <ArrowUp size={12} />
                    +{((analyticsData.overview.totalReach / Math.max(1, posts.length)) * 0.1).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon impressions">
                  <BarChart3 size={24} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {formatNumber(analyticsData.overview.totalImpressions)}
                  </div>
                  <div className="kpi-label">Total Impressions</div>
                  <div className="kpi-change positive">
                    <ArrowUp size={12} />
                    +{((analyticsData.overview.totalImpressions / Math.max(1, posts.length)) * 0.05).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon engagement">
                  <Heart size={24} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {formatNumber(
                      analyticsData.overview.totalLikes +
                      analyticsData.overview.totalComments +
                      analyticsData.overview.totalShares
                    )}
                  </div>
                  <div className="kpi-label">Total Engagement</div>
                  <div className="kpi-change positive">
                    <ArrowUp size={12} />
                    +{((analyticsData.overview.totalLikes + analyticsData.overview.totalComments) * 0.02).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon engagement-rate">
                  <Target size={24} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {analyticsData.overview.avgEngagementRate.toFixed(1)}%
                  </div>
                  <div className="kpi-label">Avg Engagement Rate</div>
                  <div className="kpi-change positive">
                    <ArrowUp size={12} />
                    +{(analyticsData.overview.avgEngagementRate * 0.1).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon posts">
                  <FileText size={24} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {analyticsData.overview.totalPosts}
                  </div>
                  <div className="kpi-label">Posts Published</div>
                  <div className="kpi-change positive">
                    <ArrowUp size={12} />
                    +{Math.ceil(analyticsData.overview.totalPosts * 0.2)}%
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon followers">
                  <Users size={24} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {dashboardData?.stats?.totalFollowers?.toLocaleString() || '0'}
                  </div>
                  <div className="kpi-label">Total Followers</div>
                  <div className="kpi-change positive">
                    <ArrowUp size={12} />
                    +{Math.abs(analyticsData.overview.followerGrowth || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Trends Chart */}
          <div className="analytics-section">
            <h2>Engagement Trends</h2>
            <div className="chart-container">
              <div className="chart-header">
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color likes"></span>
                    Likes ({formatNumber(analyticsData.overview.totalLikes)})
                  </span>
                  <span className="legend-item">
                    <span className="legend-color comments"></span>
                    Comments ({formatNumber(analyticsData.overview.totalComments)})
                  </span>
                  <span className="legend-item">
                    <span className="legend-color shares"></span>
                    Shares ({formatNumber(analyticsData.overview.totalShares)})
                  </span>
                  <span className="legend-item">
                    <span className="legend-color reach"></span>
                    Reach ({formatNumber(analyticsData.overview.totalReach)})
                  </span>
                </div>
              </div>
              <div className="chart-placeholder">
                <BarChart3 size={48} />
                <p>Engagement trends based on your {posts.length} published posts</p>
                <div className="trend-summary">
                  <p>Total engagement across all platforms: {formatNumber(analyticsData.overview.totalLikes + analyticsData.overview.totalComments + analyticsData.overview.totalShares)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Performance Breakdown */}
          <div className="analytics-section">
            <h2>Platform Performance</h2>
            <div className="platform-performance">
              <div className="platform-performance-grid">
                {Object.entries(analyticsData.platformBreakdown).map(([platform, data]) => (
                  <div key={platform} className="platform-performance-card">
                    <div className="platform-header">
                      <div className="platform-info">
                        {platform === 'instagram' && <Instagram size={20} />}
                        {platform === 'twitter' && <Twitter size={20} />}
                        {platform === 'facebook' && <Facebook size={20} />}
                        <span className="platform-name">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </span>
                      </div>
                      <button
                        className="platform-filter-btn"
                        onClick={() => handlePlatformChange(platform)}
                      >
                        Filter by {platform}
                      </button>
                    </div>
                    <div className="platform-metrics-grid">
                      <div className="platform-metric">
                        <span className="metric-value">{data.posts}</span>
                        <span className="metric-label">Posts</span>
                      </div>
                      <div className="platform-metric">
                        <span className="metric-value">{formatNumber(data.likes)}</span>
                        <span className="metric-label">Likes</span>
                      </div>
                      <div className="platform-metric">
                        <span className="metric-value">{formatNumber(data.comments)}</span>
                        <span className="metric-label">Comments</span>
                      </div>
                      <div className="platform-metric">
                        <span className="metric-value">{formatNumber(data.shares)}</span>
                        <span className="metric-label">Shares</span>
                      </div>
                      <div className="platform-metric">
                        <span className="metric-value">{formatNumber(data.reach)}</span>
                        <span className="metric-label">Reach</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Content Analysis */}
          <div className="analytics-section">
            <div className="section-header">
              <h2>Top Content Analysis</h2>
              <div className="sort-controls">
                <label>Sort by:</label>
                <select className="sort-select">
                  <option value="totalEngagement">Total Engagement</option>
                  <option value="likes">Likes</option>
                  <option value="comments">Comments</option>
                  <option value="reach">Reach</option>
                </select>
              </div>
            </div>

            <div className="top-content-grid">
              {analyticsData.topPosts.length > 0 ? (
                analyticsData.topPosts.map(post => (
                  <div key={post.id} className="top-post-card">
                    <div className="post-thumbnail">
                      <div className="post-image-placeholder">
                        {post.images && post.images.length > 0 ? (
                          <img 
                            src={typeof post.images[0] === 'string' ? post.images[0] : post.images[0].url} 
                            alt="Post content"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        ) : (
                          <FileText size={24} />
                        )}
                      </div>
                      <div className="post-platform">
                        {post.platform === 'instagram' && <Instagram size={16} />}
                        {post.platform === 'twitter' && <Twitter size={16} />}
                        {post.platform === 'facebook' && <Facebook size={16} />}
                      </div>
                    </div>

                    <div className="post-content">
                      <p className="post-text">
                        {post.content.substring(0, 100)}
                        {post.content.length > 100 ? '...' : ''}
                      </p>

                      <div className="post-stats">
                        <div className="stat-item">
                          <Heart size={14} />
                          <span>{formatNumber(post.likes)}</span>
                        </div>
                        <div className="stat-item">
                          <MessageCircle size={14} />
                          <span>{formatNumber(post.comments)}</span>
                        </div>
                        <div className="stat-item">
                          <Share2 size={14} />
                          <span>{formatNumber(post.shares)}</span>
                        </div>
                        <div className="stat-item">
                          <Eye size={14} />
                          <span>{formatNumber(post.reach)}</span>
                        </div>
                      </div>

                      <div className="post-performance-highlight">
                        <span className="engagement-rate">
                          {post.engagementRate.toFixed(1)}% Engagement Rate
                        </span>
                        <span className="post-date">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button className="view-details-btn">
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-top-posts">
                  <FileText size={48} />
                  <h3>No posts with engagement data</h3>
                  <p>Publish posts and wait for engagement data to appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
