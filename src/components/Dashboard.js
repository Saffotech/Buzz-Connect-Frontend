import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Image,
  Settings,
  User,
  LogOut,
  Instagram,
  Twitter,
  Plus,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share,
  Loader,
  AlertCircle
} from 'lucide-react';
import CreatePost from './CreatePost';
import PostDetail from './PostDetail';
import { useDashboardData } from '../hooks/useApi';
import { STORAGE_KEYS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
  // Use optimized dashboard hook that fetches all data efficiently
  const {
    user,
    posts,
    analytics,
    instagramStatus,
    loading,
    error: dashboardError,
    createPost: apiCreatePost,
    deletePost: apiDeletePost,
    connectInstagram,
    disconnectInstagram,
    refetch: refetchDashboard
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    localStorage.removeItem('isAuthenticated');
    window.location.reload();
  };

  const handleLogout = () => {
    handleSignOut();
  };

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

  const handleDeletePost = async (postId) => {
    try {
      await apiDeletePost(postId);
      setNotification({ type: 'success', message: SUCCESS_MESSAGES.POST_DELETED });
    } catch (error) {
      setNotification({ type: 'error', message: error.message || ERROR_MESSAGES.SERVER_ERROR });
    }
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setShowPostDetail(false);
    setShowCreatePost(true);
  };



  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  // Real analytics data with fallbacks
  const stats = {
    followers: analytics?.totalFollowers || '0',
    engagement: analytics?.avgEngagementRate ? `${analytics.avgEngagementRate.toFixed(1)}%` : '0%',
    posts: posts?.length || '0',
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

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">
          <Loader className="spinner" size={48} />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (dashboardError) {
    return (
      <div className="dashboard error">
        <div className="error-message">
          <AlertCircle size={48} />
          <h2>Unable to load dashboard</h2>
          <p>{dashboardError}</p>
          <button onClick={() => refetchDashboard()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>BuzzConnect</h1>
            <span className="tagline">Social Media Management</span>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <Settings size={18} />
              Settings
            </button>
            <button className="btn-danger" onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={20} />
              Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <Image size={20} />
              Posts
            </button>
            <button
              className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <Calendar size={20} />
              Schedule
            </button>
            <button
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <TrendingUp size={20} />
              Analytics
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              Profile
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="welcome-section">
                <h2>Welcome back! 👋</h2>
                <p>Here's what's happening with your social media accounts today.</p>
                {user && (
                  <div className="user-info">
                    <p>Logged in as: <strong>{user.displayName || user.email}</strong></p>
                    {user.email && <p className="user-email">{user.email}</p>}
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon followers">
                    <Users size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.followers}</h3>
                    <p>Total Followers</p>
                    <span className="stat-change positive">+12% this month</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon engagement">
                    <Heart size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.engagement}</h3>
                    <p>Engagement Rate</p>
                    <span className="stat-change positive">+2.1% this week</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon posts">
                    <Image size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.posts}</h3>
                    <p>Total Posts</p>
                    <span className="stat-change neutral">+5 this week</span>
                  </div>
                </div>
                <div className="stat-card">
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

              {/* Connected Accounts */}
              <div className="section">
                <h3>Connected Accounts</h3>
                <div className="connected-accounts">
                  <div className="account-card instagram">
                    <Instagram size={24} />
                    <div className="account-info">
                      <h4>Instagram</h4>
                      <p>@yourusername</p>
                      <span className="status connected">Connected</span>
                    </div>
                  </div>
                  <div className="account-card twitter">
                    <Twitter size={24} />
                    <div className="account-info">
                      <h4>Twitter</h4>
                      <p>@yourusername</p>
                      <span className="status connected">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="posts-content">
              <div className="section-header">
                <h2>Recent Posts</h2>
                <button className="btn-primary" onClick={() => setShowCreatePost(true)}>
                  <Plus size={18} />
                  Create Post
                </button>
              </div>

              <div className="posts-grid">
                {posts.length === 0 ? (
                  <div className="empty-state">
                    <Image size={48} />
                    <h3>No posts yet</h3>
                    <p>Create your first post to get started!</p>
                    <button onClick={() => setShowCreatePost(true)} className="btn-primary">
                      <Plus size={18} />
                      Create Your First Post
                    </button>
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post._id || post.id} className="post-card" onClick={() => handlePostClick(post)}>
                      <div className="post-header">
                        <div className="platform-badges">
                          {post.platforms?.map(platform => {
                            const Icon = platform === 'instagram' ? Instagram : Twitter;
                            return (
                              <div key={platform} className="platform-badge">
                                <Icon size={16} />
                                <span>{platform}</span>
                              </div>
                            );
                          })}
                        </div>
                        <span className="post-date">
                          {post.status === 'scheduled'
                            ? new Date(post.scheduledDate).toLocaleDateString()
                            : new Date(post.createdAt).toLocaleDateString()
                          }
                        </span>
                      </div>
                      {post.images && post.images.length > 0 && (
                        <div className="post-image">
                          <img src={post.images[0].url || post.images[0]} alt={post.images[0].altText || "Post content"} />
                        </div>
                      )}
                      <div className="post-content">
                        <p>{post.content}</p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="post-hashtags">
                            {post.hashtags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="hashtag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="post-stats">
                        <span><Heart size={14} /> {post.totalEngagement || 0}</span>
                        <span><MessageCircle size={14} /> {post.platformPosts?.[0]?.analytics?.comments || 0}</span>
                        <span><Share size={14} /> {post.platformPosts?.[0]?.analytics?.shares || 0}</span>
                      </div>
                      <div className="post-status">
                        <span className={`status-badge ${post.status}`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-content">
              <div className="section-header">
                <h2>Content Calendar</h2>
                <button className="btn-primary" onClick={() => setShowCreatePost(true)}>
                  <Plus size={18} />
                  Schedule Post
                </button>
              </div>
              <div className="calendar-placeholder">
                <Calendar size={48} />
                <h3>Content Calendar</h3>
                <p>Schedule and manage your social media posts across all platforms.</p>
                <button className="btn-secondary">View Calendar</button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-content">
              <h2>Analytics & Insights</h2>
              <div className="analytics-placeholder">
                <BarChart3 size={48} />
                <h3>Analytics Dashboard</h3>
                <p>Track your performance across all social media platforms.</p>
                <button className="btn-secondary">View Detailed Analytics</button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-content">
              <h2>Profile Settings</h2>
              <div className="profile-placeholder">
                <User size={48} />
                <h3>Profile Management</h3>
                <p>Manage your account settings and connected social media profiles.</p>
                <button className="btn-secondary">Edit Profile</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreatePost
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handleCreatePost}
      />

      <PostDetail
        post={selectedPost}
        isOpen={showPostDetail}
        onClose={() => setShowPostDetail(false)}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />
    </div>
  );
};

export default Dashboard;
