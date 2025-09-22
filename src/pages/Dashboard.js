import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Heart,
  Image,
  TrendingUp,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Plus,
  Calendar,
  BarChart3,
  AlertCircle,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Upload,
  Clock,
  Activity,
  ExternalLink,
  RefreshCw,
  X,
  Sparkles,
  Link2
} from 'lucide-react';
import { useDashboardData } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import apiClient from '../utils/api';
import './Dashboard.css';
import { platformColors } from '../utils/constants';
import Loader from '../components/common/Loader';
import Logo from "../assets/img/Logo.png";


const Dashboard = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [slicePosts, setSlicePosts] = useState(1);
  const [posts, setPosts] = useState([]);
  const [upcomingPosts, setUpcomingPosts] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [spinning, setSpinning] = useState(false);
  // useEffect(() => {
  //   if (upcomingPosts.length === 1) {
  //     setSlicePosts(1);
  //   } else {
  //     setSlicePosts(upcomingPosts.length);
  //   }
  // }, [upcomingPosts]);
  const getTotalPlatformCount = (posts) => {
    return posts.reduce((count, post) => {
      if (Array.isArray(post.platforms) && post.platforms.length > 0) {
        return count + post.platforms.length;
      }
      return count + 1; // default to 1 (instagram fallback)
    }, 0);
  };

  // useEffect(() => {
  //   const totalCards = getTotalPlatformCount(upcomingPosts);
  //   setSlicePosts(totalCards);

  //   if (slicePosts > 1) {
  //     setSlicePosts(1)
  //   }
  // }, [upcomingPosts]);

  const navigate = useNavigate();

  const handleMediaUpload = async (files) => {
    try {
      setShowUploadModal(false);
      setNotification({ type: 'info', message: 'Uploading media...' });

      const response = await uploadMedia(files);
      console.log('Upload successful:', response);

      setNotification({
        type: 'success',
        message: `Successfully uploaded ${files.length} file(s)`
      });

      refetchMedia();
    } catch (error) {
      console.error('Failed to upload media:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to upload media'
      });
    }
  };

  const {
    user,
    analytics,
    instagramStatus,
    loading: dashboardLoading,
    error: dashboardError,
    createPost: apiCreatePost,
    refetch: refetchDashboard,
    data
  } = useDashboardData();

  // Fetch posts from API
  const fetchPosts = async (refresh = false) => {
    if (!refresh && posts.length > 0) return; // Avoid unnecessary refetches

    setPostsLoading(true);
    setPostsError(null);

    try {
      const response = await apiClient.request('/api/posts', {
        method: 'GET',
        params: {
          page: 1,
          limit: 50, // Fetch more posts for better dashboard data
          // You can add filters here if needed
          // status: 'all',
          // platform: 'all'
        }
      });

      if (response.success && response.data) {
        const fetchedPosts = response.data.posts || [];
        setPosts(fetchedPosts);

        // Filter upcoming posts (scheduled status and future dates)
        const now = new Date();
        const upcoming = fetchedPosts.filter(post =>
          post.status === 'scheduled' &&
          new Date(post.scheduledDate) > now
        );
        setUpcomingPosts(upcoming);

        // Calculate user stats from posts
        calculateUserStats(fetchedPosts);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPostsError(error.message || 'Failed to fetch posts');
      setPosts([]);
      setUpcomingPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Calculate user stats from posts data
  const calculateUserStats = (postsData) => {
    if (!postsData || postsData.length === 0) {
      setUserStats({
        totalPosts: 0,
        publishedPosts: 0,
        scheduledPosts: 0,
        totalEngagement: 0,
        avgEngagementRate: 0,
        totalReach: 0,
        totalFollowers: 0
      });
      return;
    }

    const published = postsData.filter(post => post.status === 'published');
    const scheduled = postsData.filter(post => post.status === 'scheduled');

    // Calculate engagement from platformPosts
    let totalEngagement = 0;
    let totalReach = 0;
    let totalFollowers = 0;

    postsData.forEach(post => {
      if (post.platformPosts && Array.isArray(post.platformPosts)) {
        post.platformPosts.forEach(platformPost => {
          if (platformPost.analytics) {
            const analytics = platformPost.analytics;
            totalEngagement += (analytics.likes || 0) +
              (analytics.comments || 0) +
              (analytics.shares || 0);
            totalReach += analytics.reach || 0;
          }
        });
      }
      // Use post-level totalEngagement if available
      if (post.totalEngagement) {
        totalEngagement += post.totalEngagement;
      }
    });

    const avgEngagementRate = published.length > 0 ?
      postsData.reduce((sum, post) => sum + (post.avgEngagementRate || 0), 0) / published.length : 0;

    setUserStats({
      totalPosts: postsData.length,
      publishedPosts: published.length,
      scheduledPosts: scheduled.length,
      totalEngagement,
      avgEngagementRate,
      totalReach,
      totalFollowers // This should ideally come from user profile or separate API
    });
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      console.log('User accounts from API:', user.connectedAccounts);
      fetchPosts();
    }
  }, [user]);

  const handleCreatePost = async (postData) => {
    try {
      const response = await apiCreatePost(postData);
      setNotification({ type: 'success', message: SUCCESS_MESSAGES.POST_CREATED });
      setShowCreatePost(false);

      // Refresh posts after creating new one
      fetchPosts(true);

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

  const handleRefreshPosts = () => {
    // fetchPosts(true);
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
    }, 3000); // stop after 3 seconds
  };

  // Calculate posts this month from fetched data
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const postsThisMonth = posts.filter(post =>
    new Date(post.createdAt) >= startOfMonth
  ).length;




  // In Dashboard.js, update the stats calculation
  const isConnected = data?.stats?.connectedPlatforms > 0;

  // Simplified stats object - let individual cards handle the connection logic
  const stats = {
    followers: isConnected ? (data?.stats?.totalFollowers?.toLocaleString() || '0') : '0',
    engagement: isConnected ? (data?.analyticsOverview?.avgEngagementRate?.toFixed(1) || '0') : '0',
    postsThisMonth: isConnected ? (data?.stats?.publishedPosts?.toLocaleString() || '0') : '0',
    reach: isConnected ? (data?.analyticsOverview?.totalReach?.toLocaleString() || '0') : '0'
  };



  const upcomingPostsFromAPI = data?.upcomingPosts || [];


  // Show notification temporarily
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Loading state
  if (dashboardLoading || (postsLoading && posts.length === 0)) {
    return (
      <div className="page-loading">
        <Loader />
      </div>
    );
  }

  // Error state
  if (dashboardError && !user) {
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


      {/* Three Column Layout */}
      <div className="dashboard-layout">
        {/* Center Column: Core Content */}
        <div className="dashboard-center">
          {/* Performance Snapshot */}
          <div className="performance-snapshot">
            <div className="stats-grid">
              {/* Row 1 */}
              <div className="stat-card clickable" onClick={() => navigate('/settings?tab=accounts')}>
                <div className="stat-icon followers">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3>{isConnected ? (data?.stats?.totalFollowers?.toLocaleString() || '0') : '0'}</h3>
                  <p>Total Followers</p>
                  <span className={`stat-change ${isConnected ? 'positive' : 'neutral'}`}>
                    {isConnected
                      ? `${data?.stats?.connectedPlatforms || 0} platforms connected`
                      : 'No platforms connected'
                    }
                  </span>
                </div>
              </div>

              <div className="stat-card clickable" onClick={() => navigate('/content')}>
                <div className="stat-icon posts">
                  <Image size={24} />
                </div>
                <div className="stat-content">
                  <h3>{isConnected ? (data?.stats?.totalPosts || 0) : 0}</h3>
                  <p>Total Posts</p>
                  <span className={`stat-change ${isConnected ? 'positive' : 'neutral'}`}>
                    {isConnected
                      ? 'All time posts created'
                      : 'Connect accounts to create posts'
                    }
                  </span>
                </div>
              </div>

              <div className="stat-card clickable" onClick={() => navigate('/planner')}>
                <div className="stat-icon scheduled">
                  <Calendar size={24} />
                </div>
                <div className="stat-content">
                  <h3>{isConnected ? (data?.stats?.scheduledPosts || 0) : 0}</h3>
                  <p>Scheduled Posts</p>
                  <span className={`stat-change ${isConnected ? 'neutral' : 'neutral'}`}>
                    {isConnected
                      ? 'Awaiting publication'
                      : 'Connect accounts to schedule'
                    }
                  </span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="stat-card clickable" onClick={() => navigate("/planner")} style={{ cursor: "pointer" }}>
                <div className="stat-icon published">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h3>{isConnected ? (data?.stats?.publishedPosts || 0) : 0}</h3>
                  <p>Published Posts</p>
                  <span className={`stat-change ${isConnected ? 'positive' : 'neutral'}`}>
                    {isConnected
                      ? 'Live on social media'
                      : 'Connect accounts to publish'
                    }
                  </span>
                </div>
              </div>

              <div className="stat-card clickable" onClick={() => navigate('/content?tab=media')}>
                <div className="stat-icon media">
                  <Upload size={24} />
                </div>
                <div className="stat-content">
                  <h3>{isConnected ? (data?.stats?.mediaFiles || 0) : 0}</h3>
                  <p>Media Files</p>
                  <span className={`stat-change ${isConnected ? 'neutral' : 'neutral'}`}>
                    {isConnected
                      ? 'Images and videos stored'
                      : 'Connect accounts to upload media'
                    }
                  </span>
                </div>
              </div>

              <div className="stat-card clickable" onClick={() => navigate('/analytics')}>
                <div className="stat-icon engagement">
                  <Heart size={24} />
                </div>
                <div className="stat-content">
                  <h3>{isConnected ? (data?.analyticsOverview?.avgEngagementRate?.toFixed(1) || '0') : '0'}%</h3>
                  <p>Engagement Rate</p>
                  <span className={`stat-change ${isConnected ? 'positive' : 'neutral'}`}>
                    {isConnected
                      ? `${data?.analyticsOverview?.totalLikes || 0} total likes`
                      : 'Connect accounts for engagement'
                    }
                  </span>
                </div>
              </div>
            </div>


          </div>

          {/* Upcoming Posts */}
          <div className="upcoming-posts-section">
            <div className="header-with-button">

              <h3>Upcoming Posts</h3>
              <button
                className="inline-refresh-btn"
                onClick={handleRefreshPosts}
                disabled={postsLoading}
              >
                <RefreshCw size={16} className={spinning ? "spinning" : ""} />
                <span style={{ marginLeft: "6px" }}>Refresh Now</span>

              </button>
            </div>



            {postsError && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{postsError}</span>
                <button onClick={() => fetchPosts(true)}>Retry</button>
              </div>
            )}

            <div className={`upcoming-posts-scroll ${upcomingPosts.length == 0 ? 'upsflx' : ''}`} onClick={() => { navigate('/content') }}>
              {postsLoading && posts.length === 0 ? (
                <div className="loading-posts">
                  <Loader />

                </div>
              ) : upcomingPosts.length > 0 ? (
                upcomingPosts.slice(0, slicePosts).flatMap(post => {
                  console.log('=== POST DEBUG ===');
                  console.log('Post:', post);
                  console.log('Images:', post.images);
                  console.log('Videos:', post.videos);
                  console.log('Media:', post.media);
                  console.log('==================');

                  // Defensive platforms array
                  const platformsArray = Array.isArray(post.platforms) && post.platforms.length > 0 ?
                    post.platforms : ['instagram'];

                  // Helper function to detect if URL is a video
                  const isVideoUrl = (url) => {
                    if (!url) return false;
                    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|m4v|3gp|mkv)(\?.*)?$/i;
                    return videoExtensions.test(url);
                  };

                  // Helper function to get all media items
                  const getAllMedia = () => {
                    const allMedia = [];

                    // Check post.images array
                    if (post.images && Array.isArray(post.images)) {
                      post.images.forEach(item => {
                        const url = typeof item === 'string' ? item : item.url || item.src;
                        if (url) {
                          allMedia.push({
                            type: isVideoUrl(url) ? 'video' : 'image',
                            url: url,
                            alt: 'Post media'
                          });
                        }
                      });
                    }

                    // Check post.videos array
                    if (post.videos && Array.isArray(post.videos)) {
                      post.videos.forEach(item => {
                        const url = typeof item === 'string' ? item : item.url || item.src;
                        if (url) {
                          allMedia.push({
                            type: 'video',
                            url: url,
                            alt: 'Post video'
                          });
                        }
                      });
                    }

                    // Check post.media array
                    if (post.media && Array.isArray(post.media)) {
                      post.media.forEach(item => {
                        const url = typeof item === 'string' ? item : item.url || item.src;
                        if (url) {
                          allMedia.push({
                            type: item.type || (isVideoUrl(url) ? 'video' : 'image'),
                            url: url,
                            alt: 'Post media'
                          });
                        }
                      });
                    }

                    // Check if there's a single video or image field
                    if (post.video) {
                      const url = typeof post.video === 'string' ? post.video : post.video.url || post.video.src;
                      if (url) {
                        allMedia.push({
                          type: 'video',
                          url: url,
                          alt: 'Post video'
                        });
                      }
                    }

                    if (post.image && !post.images) {
                      const url = typeof post.image === 'string' ? post.image : post.image.url || post.image.src;
                      if (url) {
                        allMedia.push({
                          type: isVideoUrl(url) ? 'video' : 'image',
                          url: url,
                          alt: 'Post image'
                        });
                      }
                    }

                    return allMedia;
                  };

                  // For each platform, create a separate card
                  return platformsArray.map(platform => {
                    const primary = platform.toLowerCase();
                    const colorMap = {
                      instagram: '#E4405F',
                      twitter: '#1DA1F2',
                      facebook: '#1877F2',
                      linkedin: '#0A66C2',
                      youtube: '#FF0000'
                    };
                    const style = {
                      '--platform-color': colorMap[primary] || colorMap['instagram'],
                      border: '1px solid ' + (colorMap[primary] || colorMap['instagram']),
                      borderBottom: '6px solid ' + (colorMap[primary] || colorMap['instagram'])
                    };

                    const mediaItems = getAllMedia();

                    return (
                      <div
                        key={`${post._id}-${primary}`}
                        className={`upcoming-post-card platform-preview ${primary}`}
                        style={style}
                      >
                        <div className="platform-header">
                          <Clock size={38} />
                          <span className="schedule-time">
                            {new Date(post.scheduledDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="platform-name  platform-name-db">
                            {primary === 'instagram' && <Instagram size={16} />}
                            {primary === 'facebook' && <Facebook size={16} />}
                            {primary === 'twitter' && <Twitter size={16} />}
                            {primary === 'linkedin' && <Linkedin size={16} />}
                            {primary === 'youtube' && <Youtube size={16} />}
                            {primary}
                          </span>
                        </div>


                        {/* Media Section */}
                        {mediaItems.length > 0 && (
                          <div className="preview-media">
                            {mediaItems.slice(0, 1).map((media, i) => (
                              <div key={i} className="media-item">
                                {media.type === 'video' ? (
                                  <>
                                    <video
                                      src={media.url}
                                      muted
                                      loop
                                      playsInline
                                      onMouseEnter={(e) => {
                                        e.target.currentTime = 0;
                                        e.target.play().catch(console.error);
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.pause();
                                        e.target.currentTime = 0;
                                      }}
                                    />
                                    <div className="video-indicator">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  </>
                                ) : (
                                  <img
                                    src={media.url}
                                    alt={media.alt}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      borderRadius: '4px'
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                            {mediaItems.length > 4 && (
                              <div className="media-count-overlay">
                                +{mediaItems.length - 4}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="preview-text">
                          <p>{post.content.substring(0, 80)}{post.content.length > 80 ? '…' : ''}</p>
                        </div>

                        <div className="preview-hashtags">
                          {post.hashtags?.slice(0, 3).map((hashtag, i) => (
                            <span key={i} className="hashtag">{hashtag}</span>
                          )) || <span className="hashtag">#{primary}</span>}
                        </div>

                        <div className="post-status">
                          <span className={`status-badge ${post.status}`}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })
              ) : (
                <div className="empty-upcoming">
                  <Calendar size={32} />
                  <p>No upcoming posts scheduled</p>
                  <p className="empty-subtitle">Create posts with future dates to see them here</p>
                </div>
              )}
            </div>
            {upcomingPosts.length > 0 &&
              <div className='ctBtn'>
                <button
                  className="inline-refresh-btn"
                  style={{ width: 'fit-content' }}
                  onClick={() => {
                    navigate('/content')
                  }}
                  disabled={postsLoading}
                >
                  View All
                </button>
              </div>
            }
          </div>

          {/* Top Performing Post */}
          {/* {(() => {
            // Find top performing post from fetched posts
            const publishedPosts = posts.filter(post => post.status === 'published');
            const topPost = publishedPosts.reduce((top, post) => {
              const currentEngagement = post.totalEngagement || 0;
              const topEngagement = top?.totalEngagement || 0;
              return currentEngagement > topEngagement ? post : top;
            }, null);

            if (!topPost) return null;

            return (
              <div className="top-performing-post">
                <h3>Top Performing Post</h3>
                <div className="top-post-card">
                  {topPost.images && topPost.images.length > 0 && (
                    <div className="top-post-image">
                      <img
                        src={typeof topPost.images[0] === 'string' ? topPost.images[0] : topPost.images[0].url}
                        alt="Top performing post"
                      />
                    </div>
                  )}
                  <div className="top-post-content">
                    <p>{topPost.content.substring(0, 120)}{topPost.content.length > 120 ? '...' : ''}</p>
                    <div className="top-post-metrics">
                      <div className="metric">
                        <Heart size={16} />
                        <span>{topPost.platformPosts?.reduce((sum, pp) => sum + (pp.analytics?.likes || 0), 0) || 0}</span>
                      </div>
                      <div className="metric">
                        <span>💬</span>
                        <span>{topPost.platformPosts?.reduce((sum, pp) => sum + (pp.analytics?.comments || 0), 0) || 0}</span>
                      </div>
                      <div className="metric">
                        <span>🔄</span>
                        <span>{topPost.platformPosts?.reduce((sum, pp) => sum + (pp.analytics?.shares || 0), 0) || 0}</span>
                      </div>
                      <div className="metric engagement-rate">
                        <TrendingUp size={16} />
                        <span>{topPost.avgEngagementRate?.toFixed(1) || 0}%</span>
                      </div>
                    </div>
                    <div className="post-platforms">
                      {topPost.platforms?.map(platform => (
                        <span key={platform} className={`platform-tag ${platform}`}>
                          {platform}
                        </span>
                      ))}
                    </div>
                    <button
                      className="btn-primary view-analytics-btn"
                      onClick={() => navigate(`/analytics/posts/${topPost._id}`)}
                    >
                      <ExternalLink size={16} />
                      View Post Analytics
                    </button>
                  </div>
                </div>
              </div>
            );
          })()} */}
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
              <button className="btn-secondary action-btn" onClick={
                // () => document.getElementById('media-upload').click()
                () => navigate('/ai-assistant')
              }>
                <Sparkles size={18} />
                AI Assistant
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
            <div className="accounts-list" onClick={() => navigate('/settings?tab=accounts')} style={{ cursor: "pointer" }}>
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
                        {account.platform === 'linkedin' && <Linkedin size={20} />}
                        {account.platform === 'youtube' && <Youtube size={20} />}
                      </div>
                      <div className="account-details">
                        <span className="platform-name">
                          {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                        </span>
                        <span className="username">@{account.username}</span>
                      </div>
                      <div
                        className={`connection-status ${account.connected ? 'connected' : 'disconnected'}`}
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
          <div className="recent-activity-sidebar" onClick={() => navigate("/content")} style={{ cursor: "pointer" }}>
            <h3>Recent Activity</h3>
            <div className="activity-feed">
              {posts.slice(0, 5).map(post => (
                <div key={post._id} className="activity-item">
                  <div className="activity-icon">
                    <Activity size={16} />
                  </div>
                  <div className="activity-content">
                    <p>
                      Post to {post.platforms?.join(', ')} was {post.status === 'published' ? 'published' : post.status}.
                    </p>
                    <span className="activity-time">
                      {new Date(post.publishedAt || post.updatedAt || post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {posts.length === 0 && !postsLoading && (
                <div className="no-activity">
                  <p>No recent activity</p>
                </div>
              )}
              {postsLoading && (
                <div className="loading-activity">
                  <Loader />

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

      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleMediaUpload}
      />
    </div>
  );
};

const MediaUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Upload Media</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleAreaClick}
          >
            <Upload size={48} />
            <h4>Drag and drop files here</h4>
            <p>or click to select files</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="file-input"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files ({selectedFiles.length})</h4>
              <div className="file-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>{file.name}</span>
                    <span className="file-size">{Math.round(file.size / 1024)}KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
          >
            Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;