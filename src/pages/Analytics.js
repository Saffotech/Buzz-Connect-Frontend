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
  Target
} from 'lucide-react';
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

  // Date range options
  const dateRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'lastyear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Platform options
  const platformOptions = [
       { value: 'all', label: 'All Platforms', icon: <Globe size={24} /> },
    { value: 'instagram', label: 'Instagram', icon:<Instagram size={24} /> },
    { value: 'twitter', label: 'Twitter', icon: <Twitter size={24} /> },
    { value: 'facebook', label: 'Facebook', icon: <Facebook size={24} /> }
	

  ];

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
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

      // For now, use mock data - will be replaced with real API calls
      const mockOverviewData = {
        totalReach: 45200,
        totalImpressions: 89100,
        totalLikes: 3420,
        totalComments: 567,
        totalShares: 234,
        avgEngagementRate: 8.2,
        totalPosts: 24,
        followerGrowth: 12.5,
        platformBreakdown: {
          instagram: { posts: 12, likes: 2100, comments: 340, shares: 150, reach: 28000 },
          twitter: { posts: 8, likes: 890, comments: 156, shares: 67, reach: 12000 },
          facebook: { posts: 4, likes: 430, comments: 71, shares: 17, reach: 5200 }
        }
      };

      const mockTrendsData = [
        { date: '2024-01-01', likes: 120, comments: 25, shares: 8, reach: 1500 },
        { date: '2024-01-02', likes: 145, comments: 32, shares: 12, reach: 1800 },
        { date: '2024-01-03', likes: 98, comments: 18, shares: 6, reach: 1200 },
        { date: '2024-01-04', likes: 167, comments: 41, shares: 15, reach: 2100 },
        { date: '2024-01-05', likes: 134, comments: 28, shares: 9, reach: 1650 }
      ];

      const mockTopPosts = [
        {
          id: 1,
          content: 'Holiday marketing campaign with engaging visuals and compelling copy...',
          platform: 'instagram',
          likes: 1200,
          comments: 89,
          shares: 45,
          reach: 8500,
          engagementRate: 15.8,
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          content: 'Behind the scenes content showing our team at work...',
          platform: 'twitter',
          likes: 956,
          comments: 67,
          shares: 32,
          reach: 6200,
          engagementRate: 17.2,
          createdAt: '2024-01-12'
        }
      ];

      setAnalyticsData({
        overview: mockOverviewData,
        engagementTrends: mockTrendsData,
        platformBreakdown: mockOverviewData.platformBreakdown,
        topPosts: mockTopPosts
      });

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

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

  return (
    <div className="analytics-page">
      {/* Page Header */}
      <div className="analytics-header">
        <h1>Analytics</h1>
        <p>Track your social media performance and discover insights to grow your audience</p>
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


      {/* Loading State */}
      {loading && (
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="analytics-error">
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
                    +18.3%
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
                    +15.7%
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
                    +12.4%
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon engagement-rate">
                  <Target size={24} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    {analyticsData.overview.avgEngagementRate}%
                  </div>
                  <div className="kpi-label">Avg Engagement Rate</div>
                  <div className="kpi-change positive">
                    <ArrowUp size={12} />
                    +2.1%
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
                    +20.0%
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon followers">
                  <Users size={24} />
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">
                    +{analyticsData.overview.followerGrowth}%
                  </div>
                  <div className="kpi-label">Follower Growth</div>
                  <div className="kpi-change positive">
                    <ArrowUp size={12} />
                    +5.2%
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
                    Likes
                  </span>
                  <span className="legend-item">
                    <span className="legend-color comments"></span>
                    Comments
                  </span>
                  <span className="legend-item">
                    <span className="legend-color shares"></span>
                    Shares
                  </span>
                  <span className="legend-item">
                    <span className="legend-color reach"></span>
                    Reach
                  </span>
                </div>
              </div>
              <div className="chart-placeholder">
                <BarChart3 size={48} />
                <p>Interactive engagement chart will be displayed here</p>
                <small>Chart.js integration coming in next phase</small>
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
                        {platform === 'facebook' && <span>👥</span>}
                        <span className="platform-name">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </span>
                      </div>
                      <button
                        className="platform-filter-btn"
                        onClick={() => handlePlatformChange(platform)}
                      >
                        View Details
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
                        <span className="metric-value">{data.comments}</span>
                        <span className="metric-label">Comments</span>
                      </div>
                      <div className="platform-metric">
                        <span className="metric-value">{data.shares}</span>
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
                  <option value="impressions">Impressions</option>
                </select>
              </div>
            </div>

            <div className="top-content-grid">
              {analyticsData.topPosts.map(post => (
                <div key={post.id} className="top-post-card">
                  <div className="post-thumbnail">
                    <div className="post-image-placeholder">
                      <FileText size={24} />
                    </div>
                    <div className="post-platform">
                      {post.platform === 'instagram' && <Instagram size={16} />}
                      {post.platform === 'twitter' && <Twitter size={16} />}
                      {post.platform === 'facebook' && <span>👥</span>}
                    </div>
                  </div>

                  <div className="post-content">
                    <p className="post-text">{post.content}</p>

                    <div className="post-stats">
                      <div className="stat-item">
                        <Heart size={14} />
                        <span>{formatNumber(post.likes)}</span>
                      </div>
                      <div className="stat-item">
                        <MessageCircle size={14} />
                        <span>{post.comments}</span>
                      </div>
                      <div className="stat-item">
                        <Share2 size={14} />
                        <span>{post.shares}</span>
                      </div>
                      <div className="stat-item">
                        <Eye size={14} />
                        <span>{formatNumber(post.reach)}</span>
                      </div>
                    </div>

                    <div className="post-performance-highlight">
                      <span className="engagement-rate">
                        {post.engagementRate}% Engagement Rate
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
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
