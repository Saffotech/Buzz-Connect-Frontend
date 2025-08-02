import React, { useState } from 'react';
import { useSignOut, useUserData } from '@nhost/react';
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
  Share
} from 'lucide-react';
import CreatePost from './CreatePost';
import PostDetail from './PostDetail';
import './Dashboard.css';

const Dashboard = () => {
  const { signOut } = useSignOut();
  const user = useUserData();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);

  const handleSignOut = () => {
    signOut();
    localStorage.removeItem('mockAuthenticated');
    localStorage.clear();
  };

  const handleCreatePost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setShowPostDetail(false);
    setShowCreatePost(true);
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    setShowPostDetail(false);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const mockStats = {
    followers: '12.5K',
    engagement: '8.2%',
    posts: '156',
    reach: '45.2K'
  };

  // Initialize with some mock posts if empty
  React.useEffect(() => {
    if (posts.length === 0) {
      const initialPosts = [
        {
          id: 1,
          platforms: ['instagram'],
          content: 'Amazing sunset at the beach! 🌅 #sunset #beach #photography',
          images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop'],
          hashtags: ['#sunset', '#beach', '#photography'],
          likes: 234,
          comments: 18,
          shares: 12,
          status: 'published',
          createdAt: '2025-01-15T18:00:00Z'
        },
        {
          id: 2,
          platforms: ['twitter'],
          content: 'Just launched our new product! Excited to share this journey with you all 🚀 #startup #innovation',
          hashtags: ['#startup', '#innovation'],
          likes: 89,
          comments: 23,
          shares: 45,
          status: 'published',
          createdAt: '2025-01-16T10:30:00Z'
        },
        {
          id: 3,
          platforms: ['instagram', 'twitter'],
          content: 'Behind the scenes of our latest photoshoot 📸 #bts #photography #creative',
          images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'],
          hashtags: ['#bts', '#photography', '#creative'],
          likes: 156,
          comments: 31,
          shares: 8,
          status: 'scheduled',
          scheduledDate: '2025-01-17T14:15:00Z',
          createdAt: '2025-01-16T12:00:00Z'
        }
      ];
      setPosts(initialPosts);
    }
  }, [posts.length]);

  return (
    <div className="dashboard">
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
            <button className="btn-danger" onClick={handleSignOut}>
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
                    <p>Logged in as: <strong>{user.email || 'Instagram User'}</strong></p>
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
                    <h3>{mockStats.followers}</h3>
                    <p>Total Followers</p>
                    <span className="stat-change positive">+12% this month</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon engagement">
                    <Heart size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{mockStats.engagement}</h3>
                    <p>Engagement Rate</p>
                    <span className="stat-change positive">+2.1% this week</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon posts">
                    <Image size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{mockStats.posts}</h3>
                    <p>Total Posts</p>
                    <span className="stat-change neutral">+5 this week</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon reach">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{mockStats.reach}</h3>
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
                {posts.map(post => (
                  <div key={post.id} className="post-card" onClick={() => handlePostClick(post)}>
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
                        {post.status === 'scheduled' ? post.scheduledDate : post.createdAt}
                      </span>
                    </div>
                    {post.images && post.images.length > 0 && (
                      <div className="post-image">
                        <img src={post.images[0]} alt="Post content" />
                      </div>
                    )}
                    <div className="post-content">
                      <p>{post.content}</p>
                      {post.hashtags && (
                        <div className="post-hashtags">
                          {post.hashtags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="hashtag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="post-stats">
                      <span><Heart size={14} /> {post.likes}</span>
                      <span><MessageCircle size={14} /> {post.comments}</span>
                      <span><Share size={14} /> {post.shares}</span>
                    </div>
                    <div className="post-status">
                      <span className={`status-badge ${post.status}`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))}
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
