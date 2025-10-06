import React, { useEffect, useState, useRef } from "react";
import "./PostDetailModal.css";
import {
  X, Calendar, Clock, Heart, MessageCircle, Share, MoreHorizontal,
  Bookmark, Send, Eye, Instagram, Facebook, Twitter,Linkedin, Youtube, ChevronRightCircle,
  ChevronLeftCircle, Edit, Trash2, RefreshCw, TrendingUp, BarChart3,
  Users, ExternalLink, Copy
} from "lucide-react";
import axios from "axios";

const PostDetailModal = ({ post, isOpen, onClose, onEdit, onDelete, onPostAgain }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // New state for analytics and tabs
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [syncingAnalytics, setSyncingAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');


  // ✅ Ref for dropdown container
  const dropdownRef = useRef(null);

  // ✅ Outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // ✅ Add these helper functions at the top of your component
  const isVideoFile = (mediaItem) => {
    if (!mediaItem) return false;

    // Check fileType first
    if (mediaItem.fileType === 'video' || mediaItem.fileType?.startsWith('video/')) {
      return true;
    }

    // Check MIME type
    if (mediaItem.type && mediaItem.type.startsWith('video/')) {
      return true;
    }

    // Check URL patterns
    if (mediaItem.url) {
      const url = mediaItem.url.toLowerCase();

      // Common video extensions
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.m4v', '.wmv', '.3gp', '.ogg', '.ogv'];
      const hasVideoExtension = videoExtensions.some(ext => url.includes(ext));

      if (hasVideoExtension) {
        return true;
      }

      // Check for video-related URL patterns
      if (url.includes('/video/') || url.includes('video_') || url.includes('.video')) {
        return true;
      }
    }

    // Check filename if available
    if (mediaItem.filename) {
      const filename = mediaItem.filename.toLowerCase();
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.m4v', '.wmv', '.3gp', '.ogg', '.ogv'];
      return videoExtensions.some(ext => filename.endsWith(ext));
    }

    return false;
  };

  const getMediaType = (media) => {
    if (isVideoFile(media)) {
      return 'video';
    }
    return 'image';
  };

  const getMediaMimeType = (mediaItem) => {
    if (mediaItem.type) return mediaItem.type;
    if (mediaItem.fileType) return mediaItem.fileType;

    // Try to guess from URL extension
    if (mediaItem.url) {
      const url = mediaItem.url.toLowerCase();
      if (url.includes('.mp4')) return 'video/mp4';
      if (url.includes('.mov')) return 'video/quicktime';
      if (url.includes('.webm')) return 'video/webm';
      if (url.includes('.avi')) return 'video/x-msvideo';
      if (url.includes('.mkv')) return 'video/x-matroska';
    }

    return 'video/mp4'; // Default fallback
  };

  // Fixed: Declare platform first, handling null/undefined cases
  const platform = post?.selectedPlatform?.toLowerCase() || post?.platforms?.[0]?.toLowerCase() || "post";

  // Mock comments data (replace with real API data)
  const mockComments = [
    {
      id: 1,
      platform: 'instagram',
      author: 'sarah_marketing',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      content: 'This is amazing! Love the creativity 🔥',
      timestamp: '2 hours ago',
      likes: 12
    },
    {
      id: 2,
      platform: 'facebook',
      author: 'Digital Marketing Pro',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      content: 'Great content strategy! How did you come up with this concept?',
      timestamp: '4 hours ago',
      likes: 8
    },
    {
      id: 3,
      platform: 'instagram',
      author: 'creative_minds',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      content: 'Bookmarked for inspiration! 💡',
      timestamp: '6 hours ago',
      likes: 5
    }
  ];

  // Get account ID based on platform
  const getAccountId = () => {
    if (!post?.selectedAccounts) return null;

    const selectedAccounts = post.selectedAccounts;

    switch (platform) {
      case "facebook":
        return selectedAccounts.facebook?.[0] || null;
      case "instagram":
        return selectedAccounts.instagram?.[0] || null;
      case "twitter":
        return selectedAccounts.twitter?.[0] || null;
      default:
        const platformPost = post.platformPosts?.find(p => p.platform === platform);
        return platformPost?.accountId || null;
    }
  };

  const getAccountUsernames = () => {
  // Combine all possible username sources
  let allAccounts = [];
  
  // From platformPosts (most reliable source)
  if (post.platformPosts && post.platformPosts.length > 0) {
    post.platformPosts.forEach(pp => {
      if (pp.accountName || pp.accountId) {
        allAccounts.push({
          platform: pp.platform,
          username: pp.accountName || `Account on ${pp.platform}`,
          id: pp.accountId
        });
      }
    });
  }
  
  // From selectedAccountsWithNames
  if (post.selectedAccountsWithNames) {
    Object.entries(post.selectedAccountsWithNames).forEach(([platform, accounts]) => {
      accounts.forEach(acc => {
        if (acc.username || acc.id) {
          allAccounts.push({
            platform,
            username: acc.username || `Account on ${platform}`,
            id: acc.id
          });
        }
      });
    });
  }
  
  // From selectedAccounts
  if (post.selectedAccounts) {
    Object.entries(post.selectedAccounts).forEach(([platform, accountIds]) => {
      if (Array.isArray(accountIds) && accountIds.length > 0) {
        accountIds.forEach(id => {
          if (id) {
            allAccounts.push({
              platform,
              username: `Account on ${platform}`,
              id
            });
          }
        });
      }
    });
  }
  
  // Use accountDetails if available
  if (accountDetails) {
    const username = accountDetails.username ||
      accountDetails.name ||
      accountDetails.displayName ||
      accountDetails.pageName ||
      accountDetails.handle ||
      accountDetails.accountName ||
      accountDetails.pageUsername ||
      accountDetails.socialUsername;
    
    if (username) {
      allAccounts.push({
        platform,
        username,
        id: accountDetails.id || getAccountId()
      });
    }
  }
  
  // Deduplicate by ID
  const uniqueAccounts = [];
  const accountIds = new Set();
  
  allAccounts.forEach(account => {
    if (account.id && !accountIds.has(account.id)) {
      accountIds.add(account.id);
      uniqueAccounts.push(account);
    } else if (!account.id) {
      uniqueAccounts.push(account);
    }
  });
  
  return uniqueAccounts;
};

  // Fetch detailed analytics for the post
  const fetchPostAnalytics = async () => {
    if (!post?._id && !post?.id) return;

    setLoadingAnalytics(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const postId = post._id || post.id;
      console.log('Fetching analytics for post:', postId);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/analytics/posts/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        }
      );

      if (response.data.success) {
        console.log('Analytics data received:', response.data.data);
        setAnalyticsData(response.data.data);
      } else {
        console.error('Failed to fetch analytics:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching post analytics:', error);
      if (error.response?.status === 404) {
        console.log('Post not found in analytics - this is normal for draft posts');
      } else {
        showToast('Failed to load analytics data', 'error');
      }
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Sync analytics for this specific post
  const syncPostAnalytics = async () => {
    if (!post?._id && !post?.id) return;

    setSyncingAnalytics(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      const postId = post._id || post.id;
      console.log('Syncing analytics for post:', postId);

      showToast('Syncing analytics from social platforms...', 'info');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/analytics/posts/${postId}/sync`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        }
      );

      if (response.data.success) {
        console.log('Sync successful:', response.data);
        showToast(response.data.message || 'Analytics synced successfully!', 'success');

        // Refresh analytics data after sync
        await fetchPostAnalytics();
      } else {
        throw new Error(response.data.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing post analytics:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to sync analytics';
      showToast(errorMessage, 'error');
    } finally {
      setSyncingAnalytics(false);
    }
  };

  // Fetch account details
  const fetchAccountDetails = async () => {
    try {
      setLoadingAccount(true);
      const accountId = getAccountId();

      console.log("Fetching account details for ID:", accountId);

      if (accountId) {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');

        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/accounts/${accountId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const accountData = await response.json();
          console.log("Account data received:", accountData);
          setAccountDetails(accountData.data || accountData);
        } else {
          console.error('Failed to fetch account details:', response.status);
        }
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    } finally {
      setLoadingAccount(false);
    }
  };

  // Toast notification function
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span>${message}</span>
      </div>
    `;

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

const handlePostAgain = async () => {
  setShowDropdown(false);
  setIsPosting(true);

  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log('=== FIXED POST AGAIN ===');
    console.log('Original post object:', post);

    const cleanedSelectedAccounts = {};
    if (post.selectedAccounts) {
      Object.entries(post.selectedAccounts).forEach(([platform, accounts]) => {
        if (accounts && Array.isArray(accounts)) {
          const validAccounts = accounts.filter(account => account != null && account !== '');
          if (validAccounts.length > 0) {
            cleanedSelectedAccounts[platform] = validAccounts;
          }
        }
      });
    }

    // Create selectedAccountsWithNames for logging but don't send to API
    const selectedAccountsWithNames = {};
    if (post.selectedAccountsWithNames) {
      // Use existing data if available
      Object.entries(post.selectedAccountsWithNames).forEach(([platform, accounts]) => {
        if (accounts && Array.isArray(accounts)) {
          const validAccounts = accounts.filter(account => account && account.id);
          if (validAccounts.length > 0) {
            selectedAccountsWithNames[platform] = validAccounts;
          }
        }
      });
    } else if (cleanedSelectedAccounts) {
      // Generate basic version if not available
      Object.entries(cleanedSelectedAccounts).forEach(([platform, accountIds]) => {
        selectedAccountsWithNames[platform] = accountIds.map(id => ({
          id: id,
          username: 'Unknown Account'
        }));
      });
    }

    const processedImages = (post.images || []).map(img => ({
      url: img.url,
      altText: img.altText || 'Post image',
      publicId: img.publicId || null
    }));

    const processedHashtags = Array.isArray(post.hashtags)
      ? post.hashtags
      : [];

    const processedMentions = Array.isArray(post.mentions)
      ? post.mentions
      : [];

    const postData = {
      content: post.content || '',
      platforms: post.platforms || [],
      selectedAccounts: cleanedSelectedAccounts,
      // Don't include selectedAccountsWithNames in the request to avoid validation errors
      images: processedImages,
      hashtags: processedHashtags,
      mentions: processedMentions,
      metadata: {
        category: post.metadata?.category || 'other'
      }
    };

    // Log the account usernames but don't send in API request
    console.log('Account usernames (not sent to API):', selectedAccountsWithNames);
    console.log('Complete post data with images:', JSON.stringify(postData, null, 2));

    showToast('Creating new post...', 'info');

    const createResponse = await axios.post(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts`,
      postData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Post created successfully:', createResponse.data);

    if (!createResponse?.data?.data?._id && !createResponse?.data?._id) {
      throw new Error('Failed to create post - no ID returned');
    }

    const postId = createResponse.data.data?._id || createResponse.data._id;
    console.log('Publishing post with ID:', postId);

    showToast('Publishing post...', 'info');

    const publishResponse = await axios.post(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts/${postId}/publish`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Publish response:', publishResponse.data);

    showToast('Post published again successfully!', 'success');

    if (onPostAgain && typeof onPostAgain === 'function') {
      onPostAgain(post, publishResponse.data);
    }

    setTimeout(() => {
      handleClose();
    }, 1500);

  } catch (error) {
    console.error('Failed to post again:', error);

    console.error('=== DETAILED ERROR INFO ===');
    console.error('Status:', error.response?.status);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);

    if (error.response?.data?.errors) {
      console.error('Validation Errors:', error.response.data.errors);
    }

    const errorMessage = error.response?.data?.message || error.message || 'Failed to create post';
    showToast(`Failed to publish post: ${errorMessage}`, 'error');
  } finally {
    setIsPosting(false);
  }
};

  // Handle copy link
  const handleCopyLink = () => {
    const postId = post._id || post.id;
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    showToast('Post link copied to clipboard!', 'success');
  };

  // Handle share
  const handleShare = () => {
    const postId = post._id || post.id;
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        text: post.content?.substring(0, 100) + '...',
        url: `${window.location.origin}/post/${postId}`
      });
    } else {
      handleCopyLink();
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      setImgIndex(0);
      setShowDropdown(false);
      setAccountDetails(null);
      setAnalyticsData(null);
      setIsPosting(false);
      setActiveTab('preview');
    }
  }, [isOpen, post]);

  useEffect(() => {
    if (isOpen && post) {
      fetchAccountDetails();
      if (post.status === 'published') {
        fetchPostAnalytics();
      }
    }
  }, [isOpen, post]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Helper functions
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleModalClick = (event) => {
    event.stopPropagation();
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleEdit = () => {
    setShowDropdown(false);
    if (onEdit) {
      onEdit(post);
    }
  };

  const handleDelete = () => {
    setShowDropdown(false);
    if (onDelete) {
      onDelete(post);
    }
  };

  const getSocialMediaUsername = () => {
    if (loadingAccount) {
      return "Loading...";
    }

    if (accountDetails) {
      const username = accountDetails.username ||
        accountDetails.name ||
        accountDetails.displayName ||
        accountDetails.pageName ||
        accountDetails.handle ||
        accountDetails.accountName ||
        accountDetails.pageUsername ||
        accountDetails.socialUsername;

      if (username) {
        return username;
      }
    }

    const userDisplayName = post?.user?.displayName;
    if (userDisplayName) {
      return userDisplayName;
    }

    switch (platform) {
      case "instagram":
        return "instagram_user";
      case "facebook":
        return "facebook_page";
      case "twitter":
        return "twitter_user";
      default:
        return "social_user";
    }
  };

  const formatUsername = (username) => {
    if (!username) return "@user";
    if (username === "Loading...") return username;
    return username.startsWith('@') ? username : `@${username}`;
  };

  const getPlatformIcon = (platformName) => {
    switch (platformName) {
      case 'instagram':
        return <Instagram size={16} color="#E1306C" />;
      case 'facebook':
        return <Facebook size={16} color="#1877f2" />;
      case 'twitter':
        return <Twitter size={16} color="#1da1f2" />;
      default:
        return <MessageCircle size={16} color="#667eea" />;
    }
  };

  const getPlatformStyle = () => {
    switch (platform) {
      case "instagram":
        return {
          gradient: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
          primary: "#E1306C",
          text: "#262626",
          hashtag: "#00376b"
        };
      case "facebook":
        return {
          gradient: "linear-gradient(135deg, #1877f2, #42a5f5)",
          primary: "#1877f2",
          text: "#1c1e21",
          hashtag: "#385898"
        };
      case "twitter":
        return {
          gradient: "linear-gradient(135deg, #1da1f2, #14171a)",
          primary: "#1da1f2",
          text: "#0f1419",
          hashtag: "#1d9bf0"
        };
      default:
        return {
          gradient: "linear-gradient(135deg, #667eea, #764ba2)",
          primary: "#667eea",
          text: "#2d3748",
          hashtag: "#667eea"
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "";
    }
  };

  // Get platform-specific engagement stats
  const getEngagementStatsByPlatform = (platformName) => {
    if (analyticsData?.analytics?.platformPerformance) {
      const platformData = analyticsData.analytics.platformPerformance.find(p => p.platform === platformName);
      if (platformData) {
        return {
          likes: platformData.likes || 0,
          comments: platformData.comments || 0,
          shares: platformData.shares || 0,
          reach: platformData.reach || 0,
          impressions: platformData.impressions || 0,
          engagement: platformData.engagement || 0,
          clicks: platformData.clicks || 0,
          saves: platformData.saves || 0
        };
      }
    }

    // Fallback to platformPosts data
    const platformPost = post?.platformPosts?.find(p => p.platform === platformName);
    if (platformPost?.analytics) {
      return {
        likes: platformPost.analytics.likes || 0,
        comments: platformPost.analytics.comments || 0,
        shares: platformPost.analytics.shares || 0,
        reach: platformPost.analytics.reach || 0,
        impressions: platformPost.analytics.impressions || 0,
        engagement: platformPost.analytics.engagement || 0,
        clicks: platformPost.analytics.clicks || 0,
        saves: platformPost.analytics.saves || 0
      };
    }

    return {
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      impressions: 0,
      engagement: 0,
      clicks: 0,
      saves: 0
    };
  };

  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getImageSource = (image) => {
    if (typeof image === "string") {
      return image;
    } else if (image && typeof image === "object") {
      return image.url || image.src || image.path || "";
    }
    return "";
  };

  const platformStyle = getPlatformStyle();

  if (!isOpen || !post) return null;

  return (
    <div className="post-detail-overlay" onClick={handleOverlayClick}>
      <div className="post-detail-modal" onClick={handleModalClick}>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-left">
            <h2>Post Details</h2>
            {/* <div className="post-platforms">
              {post.platforms?.map(platformName => (
                <div 
                  key={platformName} 
                  className="platform-badge"
                  style={{ borderColor: getPlatformStyle().primary }}
                >
                  {getPlatformIcon(platformName)}
                  <span>{platformName}</span>
                </div>
              ))}
            </div> */}
          </div>



          <div className="header-actions">
            {post.status === 'published' && (
              <button
                className={`tab-btn sync-btn ${syncingAnalytics ? 'syncing' : ''}`}
                onClick={syncPostAnalytics}
                disabled={syncingAnalytics}
                title="Sync analytics from social platforms"
              >
                <RefreshCw size={16} className={syncingAnalytics ? 'spinning' : ''} />
                {syncingAnalytics ? 'Syncing...' : 'Sync'}
              </button>
            )}
            <div className="actions-dropdown" ref={dropdownRef}>
              <button
                className="actions-btn"
                onClick={handleDropdownToggle}
                disabled={isPosting}
              >
                <MoreHorizontal size={20} />
              </button>
              {showDropdown && (
                <div className="actions-menu">
                  {onEdit && (
                    <button onClick={handleEdit}>
                      <Edit size={16} />
                      Edit Post
                    </button>
                  )}
                  <button onClick={handlePostAgain} disabled={isPosting}>
                    <RefreshCw size={16} className={isPosting ? 'spinning' : ''} />
                    {isPosting ? 'Posting...' : 'Repost Now'}
                  </button>
                  {onDelete && (
                    <button className="delete-action" onClick={handleDelete}>
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
            <button className="close-btn" onClick={handleClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={16} />
            Analytics
          </button>
          {/* <button 
            className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            <MessageCircle size={16} />
            Comments ({mockComments.length})
          </button> */}

        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {activeTab === 'preview' && (
            <div className="preview-content-pd">
              {/* Left Side - Main Image/Video */}
              <div className="preview-left">
                {post.images && post.images.length > 0 && (
                  <div className="main-image-container">
                    {post.images.length > 1 && (
                      <div className="image-navigation">
                        <button
                          className="nav-btn nav-prev arrow-btnx"
                          onClick={() => setImgIndex(prev => Math.max(0, prev - 1))}
                          disabled={imgIndex === 0}
                        >
                          <ChevronLeftCircle size={24} />
                        </button>
                        <button
                          className="nav-btn nav-next arrow-btnx"
                          onClick={() => setImgIndex(prev => Math.min(post.images.length - 1, prev + 1))}
                          disabled={imgIndex === post.images.length - 1}
                        >
                          <ChevronRightCircle size={24} />
                        </button>
                      </div>
                    )}

                    {/* Conditionally render video or image */}
                    {isVideoFile(post.images[imgIndex]) ? (
                      <video
                        src={getImageSource(post.images[imgIndex])}
                        className="main-image main-video"
                        controls
                        preload="metadata"
                        onError={(e) => {
                          console.error('Video failed to load:', e);
                          e.target.style.display = 'none';
                          // Create a fallback image element
                          const fallback = document.createElement('img');
                          fallback.src = "https://via.placeholder.com/400x300?text=Video+Not+Available";
                          fallback.className = "main-image";
                          e.target.parentNode.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <img
                        src={getImageSource(post.images[imgIndex])}
                        alt={post.images[imgIndex]?.altText || "Post media"}
                        className="main-image"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                        }}
                      />
                    )}

                    {post.images.length > 1 && (
                      <div className="image-counter">
                        {imgIndex + 1} / {post.images.length}
                      </div>
                    )}

                    {/* Video type indicator */}
                    {isVideoFile(post.images[imgIndex]) && (
                      <div className="media-type-indicator">
                        <div className="video-badge">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          VIDEO
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side - Content */}
              <div className="preview-right">
                {/* Username */}
              <div className="post-username">
  {getAccountUsernames().length > 0 ? (
    getAccountUsernames().map((account, idx) => {
      // Define icon components for each platform
      let PlatformIcon;
      if (account.platform === 'instagram') PlatformIcon = Instagram;
      else if (account.platform === 'facebook') PlatformIcon = Facebook;
      else if (account.platform === 'linkedin') PlatformIcon = Linkedin;
      else if (account.platform === 'youtube') PlatformIcon = Youtube;
      else if (account.platform === 'twitter') PlatformIcon = Twitter;
      else PlatformIcon = MessageCircle;
      
      // Format username with @ if needed
      const formattedUsername = account.username.startsWith('@') 
        ? account.username 
        : `@${account.username}`;
      
      return (
        <span key={idx} className="username">
          {PlatformIcon && <PlatformIcon size={16} color={getPlatformStyle(account.platform).primary} />}
          {formattedUsername}
        </span>
      );
    })
  ) : (
    // Fallback to old method if no accounts found
    <span className="username">
      {formatUsername(getSocialMediaUsername())}
    </span>
  )}
</div>

                {/* Caption */}
                <div className="post-caption">
                  <p className="caption-text">{post.content}</p>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="hashtags">
                      {post.hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="hashtag"
                          style={{ color: platformStyle.hashtag }}
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date, Time and Status - MOVED HERE */}
                <div className="post-time-compact">
                  <div className="time-info-compact">
                    <Calendar size={14} />
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    <Clock size={14} />
                    <span>{formatTime(post.publishedAt || post.createdAt)}</span>
                  </div>
                  <span className={`status-badge status-${post.status}`}>
                    {post.status}
                  </span>
                </div>
              </div>

              {/* Bottom Section - Engagement Stats */}
              <div className="engagement-section">
                <div className="engagement-stats">
                  <div className="stat-item">
                    <Heart size={20} style={{ color: platformStyle.primary }} />
                    <span>{formatNumber(analyticsData?.analytics?.engagementBreakdown?.likes || 0)}</span>
                    <label>Likes</label>
                  </div>
                  <div className="stat-item">
                    <MessageCircle size={20} />
                    <span>{formatNumber(analyticsData?.analytics?.engagementBreakdown?.comments || 0)}</span>
                    <label>Comments</label>
                  </div>
                  <div className="stat-item">
                    <Share size={20} />
                    <span>{formatNumber(analyticsData?.analytics?.engagementBreakdown?.shares || 0)}</span>
                    <label>Shares</label>
                  </div>
                  <div className="stat-item">
                    <TrendingUp size={20} />
                    <span>{formatNumber(analyticsData?.analytics?.totalEngagement || 0)}</span>
                    <label>Total</label>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              {loadingAnalytics ? (
                <div className="analytics-loading">
                  <RefreshCw size={20} className="spinning" />
                  <span>Loading analytics...</span>
                </div>
              ) : analyticsData?.analytics ? (
                <div className="analytics-content">
                  {/* Platform-specific Analytics */}
                  <div className="platform-analytics-section">
                    <h3>Platform Performance</h3>
                    <div className="platform-analytics-grid">
                      {post.platforms?.map(platformName => {
                        const stats = getEngagementStatsByPlatform(platformName);
                        return (
                          <div key={platformName} className="platform-analytics-card">
                            <div className="platform-header">
                              {getPlatformIcon(platformName)}
                              <span className="platform-name">
                                {platformName.charAt(0).toUpperCase() + platformName.slice(1)}
                              </span>
                              <span className="platform-status published">Published</span>
                            </div>

                            <div className="analytics-grid">
                              <div className="analytics-card">
                                <div className="card-icon likes">
                                  <Heart size={24} />
                                </div>
                                <div className="card-content">
                                  <h3>{formatNumber(stats.likes)}</h3>
                                  <p>Likes</p>
                                </div>
                              </div>

                              <div className="analytics-card">
                                <div className="card-icon comments">
                                  <MessageCircle size={24} />
                                </div>
                                <div className="card-content">
                                  <h3>{formatNumber(stats.comments)}</h3>
                                  <p>Comments</p>
                                </div>
                              </div>

                              <div className="analytics-card">
                                <div className="card-icon shares">
                                  <Share size={24} />
                                </div>
                                <div className="card-content">
                                  <h3>{formatNumber(stats.shares)}</h3>
                                  <p>Shares</p>
                                </div>
                              </div>

                              <div className="analytics-card">
                                <div className="card-icon reach">
                                  <Users size={24} />
                                </div>
                                <div className="card-content">
                                  <h3>{formatNumber(stats.reach)}</h3>
                                  <p>Reach</p>
                                </div>
                              </div>

                              <div className="analytics-card">
                                <div className="card-icon impressions">
                                  <Eye size={24} />
                                </div>
                                <div className="card-content">
                                  <h3>{formatNumber(stats.impressions)}</h3>
                                  <p>Impressions</p>
                                </div>
                              </div>

                              <div className="analytics-card">
                                <div className="card-icon engagement">
                                  <TrendingUp size={24} />
                                </div>
                                <div className="card-content">
                                  <h3>{formatNumber(stats.engagement)}</h3>
                                  <p>Engagement</p>
                                </div>
                              </div>
                            </div>

                            {/* Platform-specific metrics */}
                            {platformName === 'instagram' && (
                              <div className="platform-specific-metrics">
                                <div className="metric-row">
                                  <span>Saves:</span>
                                  <span>{formatNumber(stats.saves)}</span>
                                </div>
                                <div className="metric-row">
                                  <span>Profile Visits:</span>
                                  <span>{formatNumber(stats.clicks)}</span>
                                </div>
                              </div>
                            )}

                            {platformName === 'facebook' && (
                              <div className="platform-specific-metrics">
                                <div className="metric-row">
                                  <span>Link Clicks:</span>
                                  <span>{formatNumber(stats.clicks)}</span>
                                </div>
                                <div className="metric-row">
                                  <span>Page Likes:</span>
                                  <span>{formatNumber(stats.saves)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Best Performing Platform */}
                  {analyticsData.analytics.bestPerformingPlatform && (
                    <div className="performance-summary">
                      <h3>Performance Summary</h3>
                      <div className="best-platform-badge">
                        <TrendingUp size={16} />
                        <span>Best performing on {analyticsData.analytics.bestPerformingPlatform}</span>
                      </div>
                      <div className="summary-stats">
                        <div className="summary-item">
                          <span className="label">Total Engagement:</span>
                          <span className="value">{formatNumber(analyticsData.analytics.totalEngagement || 0)}</span>
                        </div>
                        <div className="summary-item">
                          <span className="label">Engagement Rate:</span>
                          <span className="value">{(analyticsData.analytics.avgEngagementRate || 0).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-analytics">
                  <BarChart3 size={48} />
                  <span>No analytics data available</span>
                  <p>Analytics may take some time to appear after publishing</p>
                  {post.status === 'published' && (
                    <button onClick={syncPostAnalytics} disabled={syncingAnalytics}>
                      <RefreshCw size={16} className={syncingAnalytics ? 'spinning' : ''} />
                      Sync Analytics
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="comments-tab">
              <div className="comments-list">
                {mockComments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                    <div className="comment-content">
                      <div className="comment-header">
                        <div className="comment-author-info">
                          {getPlatformIcon(comment.platform)}
                          <span className="comment-author">{comment.author}</span>
                        </div>
                        <span className="comment-time">{comment.timestamp}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      <div className="comment-actions">
                        <button className="comment-like">
                          <Heart size={14} />
                          {comment.likes}
                        </button>
                        <button className="comment-reply">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-comment">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="comment-input"
                />
                <button className="comment-submit">Post</button>
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay when posting */}
        {isPosting && (
          <div className="posting-overlay">
            <div className="posting-spinner">
              <RefreshCw size={24} className="spinning" />
              <span>Posting again...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailModal;
