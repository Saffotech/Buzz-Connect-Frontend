import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  Image,
  TrendingUp,
  Instagram,
  Facebook,
  Twitter,
  Plus,
  Calendar,
  BarChart3,
  Loader,
  AlertCircle,
  Settings,
  LogOut,
  ChevronDown,
  Upload,
  Clock,
  Activity,
  ExternalLink
} from 'lucide-react';
import { useDashboardData } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import apiClient from '../utils/api';
import './Dashboard.css';
import { platformColors } from '../utils/constants';

const Dashboard = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [upcomingPosts, setUpcomingPosts] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const navigate = useNavigate();

  const {
    user,
    posts,
    analytics,
    instagramStatus,
    loading,
    error: dashboardError,
    createPost: apiCreatePost,
    refetch: refetchDashboard
  } = useDashboardData();

  // Fetch additional data for dashboard
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [upcomingRes, statsRes] = await Promise.allSettled([
          apiClient.getUpcomingPosts(),
          apiClient.request('/api/users/stats')
        ]);

        if (upcomingRes.status === 'fulfilled') {
          setUpcomingPosts(upcomingRes.value?.data || []);
        }

        if (statsRes.status === 'fulfilled') {
          setUserStats(statsRes.value?.data || null);
        }
      } catch (error) {
        console.warn('Failed to fetch additional dashboard data:', error);
      }
    };

    if (user) {
      fetchAdditionalData();
    }
  }, [user]);

  const handleCreatePost = async (postData) => {
    try {
      const response = await apiCreatePost(postData);
      setNotification({ type: 'success', message: SUCCESS_MESSAGES.POST_CREATED });
      setShowCreatePost(false);
      return response;
    } catch (error) {
      setNotification({ type: 'error', message: error.message || ERROR_MESSAGES.SERVER_ERROR });
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth');
      window.location.reload();
    }
  };

  // Ensure posts is always an array with better error handling
  const postsArray = Array.isArray(posts) ? posts : [];

  // Calculate posts this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const postsThisMonth = postsArray.filter(post =>
    new Date(post.createdAt) >= startOfMonth
  ).length;

  // Real analytics data with fallbacks
  const stats = {
    followers: userStats?.totalFollowers || analytics?.totalFollowers || '0',
    engagement: analytics?.avgEngagementRate ? `${analytics.avgEngagementRate.toFixed(1)}%` : '0%',
    postsThisMonth: postsThisMonth || '0',
    reach: analytics?.totalReach || '0'
  };


  // Show notification temporarily
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return (
      <div className="page-loading">
        <Loader className="spinner" size={48} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="page-error">
        <AlertCircle size={48} />
        <h3>Unable to load dashboard</h3>
        <p>{dashboardError}</p>
        <button onClick={refetchDashboard} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <h1>BuzzConnect</h1>
          </div>
        </div>
        <div className="header-right">
          <span className="welcome-message">
            Welcome back, {user?.displayName || user?.email || 'User'}!
          </span>
          <div className="user-profile-dropdown">
            <button
              className="user-avatar-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="user-avatar">
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={16} />
            </button>
            {showUserDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => navigate('/settings?tab=profile')} className="dropdown-item">
                  <Settings size={16} />
                  Settings
                </button>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="dashboard-layout">

        {/* Center Column: Core Content */}
        <div className="dashboard-center">
          {/* Performance Snapshot */}
          <div className="performance-snapshot">
            <div className="stats-grid">
              <div className="stat-card clickable" onClick={() => navigate('/analytics')}>
                <div className="stat-icon followers">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.followers}</h3>
                  <p>Total Followers</p>
                  <span className="stat-change positive">+12% this month</span>
                </div>
              </div>
              <div className="stat-card clickable" onClick={() => navigate('/analytics')}>
                <div className="stat-icon engagement">
                  <Heart size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.engagement}</h3>
                  <p>Engagement Rate</p>
                  <span className="stat-change positive">+2.1% this week</span>
                </div>
              </div>
              <div className="stat-card clickable" onClick={() => navigate('/analytics')}>
                <div className="stat-icon posts">
                  <Image size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.postsThisMonth}</h3>
                  <p>Posts This Month</p>
                  <span className="stat-change neutral">+{stats.postsThisMonth} this month</span>
                </div>
              </div>
              <div className="stat-card clickable" onClick={() => navigate('/analytics')}>
                <div className="stat-icon reach">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.reach}</h3>
                  <p>Total Reach</p>
                  <span className="stat-change positive">+18% this month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Posts */}
          <div className="upcoming-posts-section">
            <h3>Upcoming Posts</h3>
            <div className="upcoming-posts-scroll">
              {upcomingPosts.length > 0 ? (
                upcomingPosts.slice(0, 5).map(post => (
                  <div key={post._id} className="upcoming-post-card">
                    <div className="post-schedule">
                      <Clock size={16} />
                      <span className="schedule-time">
                        {new Date(post.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="post-content-preview">
                      <p>{post.content.substring(0, 80)}...</p>
                    </div>
                    <div className="post-platforms">
                      {post.platforms.map(platform => (
                        <span key={platform} className={`platform-icon ${platform}`}>
                          {platform === 'instagram' && <Instagram size={14} />}
                          {platform === 'twitter' && <Twitter size={14} />}
                        </span>
                      ))}
                    </div>
                    {post.images && post.images.length > 0 && (
                      <div className="post-thumbnail">
                        <img src={post.images[0].url || post.images[0]} alt="Post preview" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-upcoming">
                  <Calendar size={32} />
                  <p>No upcoming posts scheduled</p>
                  <p className="empty-subtitle">Create posts with future dates to see them here</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Performing Post */}
          {analytics?.topPerformingPost && (
            <div className="top-performing-post">
              <h3>Top Performing Post</h3>
              <div className="top-post-card">
                {analytics.topPerformingPost.images && analytics.topPerformingPost.images.length > 0 && (
                  <div className="top-post-image">
                    <img
                      src={analytics.topPerformingPost.images[0].url || analytics.topPerformingPost.images[0]}
                      alt="Top performing post"
                    />
                  </div>
                )}
                <div className="top-post-content">
                  <p>{analytics.topPerformingPost.content.substring(0, 120)}...</p>
                  <div className="top-post-metrics">
                    <div className="metric">
                      <Heart size={16} />
                      <span>{analytics.topPerformingPost.totalLikes || 0}</span>
                    </div>
                    <div className="metric">
                      <span>💬</span>
                      <span>{analytics.topPerformingPost.totalComments || 0}</span>
                    </div>
                    <div className="metric">
                      <span>🔄</span>
                      <span>{analytics.topPerformingPost.totalShares || 0}</span>
                    </div>
                    <div className="metric engagement-rate">
                      <TrendingUp size={16} />
                      <span>{analytics.topPerformingPost.avgEngagementRate?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                  <button
                    className="btn-primary view-analytics-btn"
                    onClick={() => navigate(`/analytics/posts/${analytics.topPerformingPost._id}`)}
                  >
                    <ExternalLink size={16} />
                    View Post Analytics
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions & Status */}
        <div className="dashboard-right">
          {/* Quick Actions */}
          <div className="quick-actions-sidebar">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="btn-primary action-btn" onClick={() => setShowCreatePost(true)}>
                <Plus size={18} />
                Create Post
              </button>
              <button className="btn-secondary action-btn" onClick={() => navigate('/planner')}>
                <Calendar size={18} />
                Plan Content
              </button>
              <button className="btn-secondary action-btn" onClick={() => document.getElementById('media-upload').click()}>
                <Upload size={18} />
                Upload Media
              </button>
              <input
                id="media-upload"
                type="file"
                multiple
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  // Handle file upload
                  console.log('Files selected:', e.target.files);
                }}
              />
            </div>
          </div>

          {/* Connected Accounts */}
          {/* Connected Accounts */}
          <div className="connected-accounts-sidebar">
            <h3>Connected Accounts</h3>
            <div className="accounts-list">
              {(() => {
                let accounts = user?.connectedAccounts ? [...user.connectedAccounts] : [];

                // Check if Instagram exists but Facebook not yet added
                const instaAccount = accounts.find(acc => acc.platform === 'instagram');
                if (instaAccount && !accounts.some(acc => acc.platform === 'facebook')) {
                  accounts.push({
                    platform: 'facebook',
                    username: instaAccount.fbUsername || 'Facebook (linked via Instagram)',
                    connected: true,
                  });
                }

                return accounts.length > 0 ? (
                  accounts.map((account, index) => (
                    <div key={index} className={`account-item ${account.platform}`}>
                      <div
                        className="account-icon"
                        style={{ backgroundColor: platformColors[account.platform] || '#ccc' }}>
                        {account.platform === 'instagram' && <Instagram size={20} />}
                        {account.platform === 'twitter' && <Twitter size={20} />}
                        {account.platform === 'facebook' && <Facebook size={20} />}
                      </div>
                      <div className="account-details">
                        <span className="platform-name">
                          {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                        </span>
                        <span className="username">@{account.username}</span>
                      </div>
                      <div
                        className={`connection-status ${account.connected ? 'connected' : 'disconnected'
                          }`}
                      >
                        <div className="status-dot"></div>
                        <span>{account.connected ? 'Connected' : 'Disconnected'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-accounts">
                    <p>No accounts connected</p>
                  </div>
                );
              })()}
             <button
  className="btn-link manage-accounts"
  onClick={() => navigate('/settings?tab=accounts')}
>
  Manage Accounts
</button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity-sidebar">
            <h3>Recent Activity</h3>
            <div className="activity-feed">
              {postsArray.slice(0, 5).map(post => (
                <div key={post._id} className="activity-item">
                  <div className="activity-icon">
                    <Activity size={16} />
                  </div>
                  <div className="activity-content">
                    <p>
                      Post to {post.platforms?.join(', ')} was {post.status === 'published' ? 'published' : post.status}.
                    </p>
                    <span className="activity-time">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {postsArray.length === 0 && (
                <div className="no-activity">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePost
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handleCreatePost}
      />
    </div>
  );
};

export default Dashboard;
