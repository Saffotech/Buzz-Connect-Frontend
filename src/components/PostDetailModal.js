import React, { useEffect, useState } from "react";
import "./PostDetailModal.css";
import { X, Calendar, Clock, Heart, MessageCircle, Share, MoreHorizontal, Bookmark, Send, Eye, Instagram, Facebook, Twitter, ChevronRightCircle, ChevronLeftCircle, Edit, Trash2, RefreshCw } from "lucide-react";
import axios from "axios";

const PostDetailModal = ({ post, isOpen, onClose, onEdit, onDelete, onPostAgain }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // ✅ Add these helper functions at the top of your component
  const isVideoFile = (mediaItem) => {
    if (!mediaItem) return false;
    
    // Check fileType first
    if (mediaItem.fileType === 'video' || mediaItem.fileType?.startsWith('video/')) {
      return true;
    }
    
    // Check URL patterns
    if (mediaItem.url) {
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv'];
      const hasVideoExtension = videoExtensions.some(ext => 
        mediaItem.url.toLowerCase().includes(ext)
      );
      
      if (hasVideoExtension || mediaItem.url.includes('/video/')) {
        return true;
      }
    }
    
    return false;
  };

  const getMediaType = (media) => {
    if (isVideoFile(media)) {
      return 'video';
    }
    return 'image';
  };

  // ✅ Fixed: Declare platform first, handling null/undefined cases
  const platform = post?.selectedPlatform?.toLowerCase() || post?.platforms?.[0]?.toLowerCase() || "post";

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
        // Try to get from platformPosts
        const platformPost = post.platformPosts?.find(p => p.platform === platform);
        return platformPost?.accountId || null;
    }
  };

  // Fetch account details
  const fetchAccountDetails = async () => {
    try {
      setLoadingAccount(true);
      const accountId = getAccountId();
      
      console.log("Fetching account details for ID:", accountId);
      
      if (accountId) {
        // Get token from localStorage or wherever you store it
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
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span>${message}</span>
      </div>
    `;
    
    // Add toast styles if they don't exist
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
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  // Handle post again action - FIXED VERSION
  const handlePostAgain = async () => {
    setShowDropdown(false);
    setIsPosting(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('=== FIXED POST AGAIN ===');
      console.log('Original post object:', post);

      // Clean up selectedAccounts to remove null values and empty arrays
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

      // Process images properly - THIS WAS THE MISSING PART
      const processedImages = (post.images || []).map(img => ({
        url: img.url,
        altText: img.altText || 'Post image',
        publicId: img.publicId || null
      }));

      // Process hashtags
      const processedHashtags = Array.isArray(post.hashtags) 
        ? post.hashtags 
        : [];

      // Process mentions
      const processedMentions = Array.isArray(post.mentions) 
        ? post.mentions 
        : [];

      // Prepare the complete post data
      const postData = {
        content: post.content || '',
        platforms: post.platforms || [],
        selectedAccounts: cleanedSelectedAccounts,
        images: processedImages, // Include the original images
        hashtags: processedHashtags,
        mentions: processedMentions,
        metadata: {
          category: post.metadata?.category || 'other'
        }
      };

      console.log('Complete post data with images:', JSON.stringify(postData, null, 2));

      showToast('Creating new post...', 'info');

      // Step 1: Create the post as draft
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

      // Step 2: Immediately publish the created post
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

      // Call the parent callback if provided
      if (onPostAgain && typeof onPostAgain === 'function') {
        onPostAgain(post, publishResponse.data);
      }

      // Close the modal after successful post
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Failed to post again:', error);
      
      // Enhanced error logging
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


  // Add keyboard event listener for ESC key and body scroll management
  useEffect(() => {
    if (isOpen) {
      setImgIndex(0);
      setShowDropdown(false); // Close dropdown when modal opens
      setAccountDetails(null); // Reset account details
      setIsPosting(false); // Reset posting state
    }
  }, [isOpen, post]);

  // Fetch account details when modal opens
  useEffect(() => {
    if (isOpen && post) {
      fetchAccountDetails();
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
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Enhanced close handler
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  // Handle overlay click (close when clicking outside modal)
  const handleOverlayClick = (event) => {
    // Only close if clicking directly on the overlay, not on child elements
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  // Prevent modal content clicks from bubbling to overlay
  const handleModalClick = (event) => {
    event.stopPropagation();
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle edit action
  const handleEdit = () => {
    setShowDropdown(false);
    if (onEdit) {
      onEdit(post);
    }
  };

  // Handle delete action
  const handleDelete = () => {
    setShowDropdown(false);
    if (onDelete) {
      onDelete(post);
    }
  };

  // Get social media username from account details or fallback
  const getSocialMediaUsername = () => {
    console.log("=== USERNAME DEBUG ===");
    console.log("Account details:", accountDetails);
    console.log("Loading account:", loadingAccount);
    console.log("Platform:", platform);
    
    if (loadingAccount) {
      return "Loading...";
    }
    
    if (accountDetails) {
      // Extract username from account details
      // Adjust these field names based on what your account API returns
      const username = accountDetails.username || 
                       accountDetails.name || 
                       accountDetails.displayName ||
                       accountDetails.pageName ||
                       accountDetails.handle ||
                       accountDetails.accountName ||
                       accountDetails.pageUsername ||
                       accountDetails.socialUsername;
      
      console.log("Found username from account details:", username);
      
      if (username) {
        return username;
      }
    }
    
    // Fallback to user displayName if available
    const userDisplayName = post?.user?.displayName;
    if (userDisplayName) {
      console.log("Using user displayName as fallback:", userDisplayName);
      return userDisplayName;
    }
    
    // Final fallback usernames
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

  // Format username to ensure it has @ prefix
  const formatUsername = (username) => {
    if (!username) return "@user";
    if (username === "Loading...") return username;
    return username.startsWith('@') ? username : `@${username}`;
  };

  // Get platform icon for the username display
  const getPlatformIcon = () => {
    switch (platform) {
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

  const platformStyle = getPlatformStyle();

  // Format date for display
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

  // Format time for display
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

  // Get engagement stats from analytics
  const getEngagementStats = () => {
    // Get analytics from platformPosts for the current platform
    const currentPlatformPost = post?.platformPosts?.find(p => p.platform === platform);
    const analytics = currentPlatformPost?.analytics;
    
    if (analytics) {
      return {
        likes: analytics.likes || 0,
        comments: analytics.comments || 0,
        shares: analytics.shares || 0,
        views: analytics.reach || analytics.impressions || 0
      };
    }
    
    // Fallback to post level engagement
    return {
      likes: post?.likes || post?.engagement?.likes || 0,
      comments: post?.comments || post?.engagement?.comments || 0,
      shares: post?.shares || post?.engagement?.shares || 0,
      views: post?.views || post?.engagement?.views || 0
    };
  };

  const engagement = getEngagementStats();

  // Handle image source
  const getImageSource = (image) => {
    if (typeof image === "string") {
      return image;
    } else if (image && typeof image === "object") {
      return image.url || image.src || image.path || "";
    }
    return "";
  };

  // ✅ Move the conditional return AFTER all hooks have been called
  if (!isOpen || !post) return null;

  // Debug platform detection
  console.log("Platform detected:", platform);
  console.log("Selected platform:", post.selectedPlatform);
  console.log("Post platforms array:", post.platforms);

  return (
    <div className="post-detail-overlay" onClick={handleOverlayClick}>
      <div className="post-detail-container" onClick={handleModalClick}>
        <button
          className="post-detail-close-btn"
          onClick={handleClose}
          type="button"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Platform Header */}
        <div className="post-detail-header" style={{ background: platformStyle.gradient }}>
          <div className="post-detail-platform-info">
            <div className="post-detail-platform-icon">
              {platform === 'instagram' && <Instagram size={20} color="white" />}
              {platform === 'facebook' && <Facebook size={20} color="white" />}
              {platform === 'twitter' && <Twitter size={20} color="white" />}
              {platform === 'post' && <MessageCircle size={20} color="white" />}
            </div>
            <div className="post-detail-platform-details">
              <span className="post-detail-platform-name">
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
              <span className="post-detail-post-type">Post</span>
            </div>
          </div>
        </div>

        {/* Main Content Area - Horizontal Layout */}
        <div className="post-detail-main-content">
          {/* ✅ UPDATED: Post Media (Images and Videos) */}
          {post.images?.length > 0 && (
            <div className="post-detail-image-container">
              {post.images?.length > 1 && (
                <div className="arrowsf">
                  <ChevronLeftCircle 
                    onClick={() => {
                      if (imgIndex > 0) {
                        setImgIndex(prev => prev - 1);
                      }
                    }}
                    style={{ 
                      opacity: imgIndex > 0 ? 1 : 0.5,
                      cursor: imgIndex > 0 ? 'pointer' : 'not-allowed'
                    }}
                  />
                  <ChevronRightCircle 
                    onClick={() => {
                      if (imgIndex < post.images?.length - 1) {
                        setImgIndex(prev => prev + 1);
                      }
                    }}
                    style={{ 
                      opacity: imgIndex < post.images?.length - 1 ? 1 : 0.5,
                      cursor: imgIndex < post.images?.length - 1 ? 'pointer' : 'not-allowed'
                    }}
                  />
                </div>
              )}

              {(() => {
                const currentMedia = post.images[imgIndex];
                const mediaType = getMediaType(currentMedia);
                const mediaSource = getImageSource(currentMedia);

                return mediaType === 'video' ? (
                  <video
                    className="post-detail-video"
                    src={mediaSource}
                    controls
                    muted
                    playsInline
                    poster={currentMedia?.thumbnail || currentMedia?.poster}
                    onError={(e) => {
                      console.error('Failed to load video:', mediaSource);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    className="post-detail-image"
                    src={mediaSource}
                    alt={currentMedia?.altText || currentMedia?.displayName || "Post media"}
                    onError={(e) => {
                      console.error('Failed to load image:', mediaSource);
                      e.target.src = "https://via.placeholder.com/400x300?text=Media+Not+Found";
                    }}
                  />
                );
              })()}

              {/* Media info indicator */}
              {post.images?.length > 1 && (
                <div className="media-indicator">
                  {imgIndex + 1} / {post.images.length}
                </div>
              )}
            </div>
          )}

          {/* Post Content */}
          <div className="post-detail-content">
            {/* Social Media Username and Dropdown Section */}
            <div className="post-detail-user-header">
              <div className="post-detail-username-info">
                <span className="sm-username">
                  {formatUsername(getSocialMediaUsername())}
                </span>
              </div>
              
              {/* Dropdown Menu */}
              {(onEdit || onDelete || onPostAgain) && (
                <div className="post-detail-dropdown-container">
                  <button
                    className="post-detail-dropdown-btn"
                    onClick={handleDropdownToggle}
                    type="button"
                    aria-label="More options"
                    disabled={isPosting}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  
                  {showDropdown && (
                    <div className="post-detail-dropdown-menu">
                      {onEdit && (
                        <button
                          className="post-detail-dropdown-item"
                          onClick={handleEdit}
                          type="button"
                          disabled={isPosting}
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                      )}
                      
                      {/* Post Again Option */}
                      <button
                        className="post-detail-dropdown-item post-again-item"
                        onClick={handlePostAgain}
                        type="button"
                        disabled={isPosting}
                      >
                        <RefreshCw size={16} className={isPosting ? 'spinning' : ''} />
                        <span>{isPosting ? 'Posting...' : 'Repost Now'}</span>
                      </button>
                      {onDelete && (
                        <button
                          className="post-detail-dropdown-item delete-item"
                          onClick={handleDelete}
                          type="button"
                          disabled={isPosting}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="post-detail-text">{post.content || 'No content available'}</p>

            {/* Hashtags section */}
            {(post.hashtags && post.hashtags.length > 0) && (
              <div className="post-detail-tags">
                {post.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="post-detail-tag"
                    style={{ color: platformStyle.hashtag }}
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Engagement Actions */}
        <div className="post-detail-engagement">
          <div className="post-detail-action-buttons">
            <button
              className="post-detail-action-btn"
              style={{ color: platformStyle.primary }}
              type="button"
            >
              <Heart size={22} />
              <span>{engagement.likes}</span>
            </button>
            <button className="post-detail-action-btn" type="button">
              <MessageCircle size={22} />
              <span>{engagement.comments}</span>
            </button>
            <button className="post-detail-action-btn" type="button">
              {platform === 'twitter' ? <Share size={22} /> : <Send size={22} />}
              <span>{engagement.shares}</span>
            </button>
            {engagement.views > 0 && (
              <button className="post-detail-action-btn" type="button">
                <Eye size={22} />
                <span>{engagement.views}</span>
              </button>
            )}
          </div>
        </div>

        {/* Post metadata - date, time and status */}
        <div className="post-detail-metadata">
          <div className="post-detail-datetime-section">
            {(post.createdAt || post.publishedAt || post.date || post.scheduledDate) && (
              <>
                <div className="post-detail-metadata-item">
                  <Calendar size={16} />
                  <span className="post-detail-metadata-text">
                    {formatDate(post.publishedAt || post.createdAt || post.date || post.scheduledDate)}
                  </span>
                </div>
                <div className="post-detail-metadata-item">
                  <Clock size={16} />
                  <span className="post-detail-metadata-text">
                    {formatTime(post.publishedAt || post.createdAt || post.date || post.scheduledDate)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Status on the right */}
          {post.status && (
            <div className="post-detail-status-section">
              <span className="post-detail-status-label">Status:</span>
              <span className={`post-detail-status-badge post-detail-status-${post.status.toLowerCase()}`}>
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </span>
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
