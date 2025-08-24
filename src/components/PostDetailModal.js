import React, { useEffect } from "react";
import "./PostDetailModal.css";
import { X, Calendar, Clock, Heart, MessageCircle, Share, MoreHorizontal, Bookmark, Send, Eye, Instagram, Facebook, Twitter } from "lucide-react";

const PostDetailModal = ({ post, isOpen, onClose, onEdit, onDelete }) => {
  // Add keyboard event listener for ESC key and body scroll management
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

  // Don't render if not open or no post
  if (!isOpen || !post) return null;

  // ✅ Fixed: Use the selected platform from the clicked icon, fallback to first platform
  const platform = post.selectedPlatform?.toLowerCase() || post.platforms?.[0]?.toLowerCase() || "post";

  // Debug platform detection
  console.log("Platform detected:", platform);
  console.log("Selected platform:", post.selectedPlatform);
  console.log("Post platforms array:", post.platforms);

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

  // Get engagement stats
  const getEngagementStats = () => {
    return {
      likes: post.likes || post.engagement?.likes || 0,
      comments: post.comments || post.engagement?.comments || 0,
      shares: post.shares || post.engagement?.shares || 0,
      views: post.views || post.engagement?.views || 0
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

            {/* Add action buttons for edit and delete if provided
            {(onEdit || onDelete) && (
              <div className="post-detail-header-actions">
                {onEdit && (
                  <button
                    className="post-detail-header-action-btn"
                    onClick={() => onEdit(post)}
                    type="button"
                    aria-label="Edit post"
                    title="Edit post"
                  >
                    <MoreHorizontal size={18} color="white" />
                  </button>
                )}
              </div>
            )} */}
        </div>

        {/* Main Content Area - Horizontal Layout */}
        <div className="post-detail-main-content">
          {/* Post Image */}
          {post.images?.length > 0 && (
            <div className="post-detail-image-container">
              <img
                className="post-detail-image"
                src={getImageSource(post.images[0])}
                alt="Post media"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }}
              />
              {post.images.length > 1 && (
                <div className="post-detail-image-count">
                  +{post.images.length - 1} more
                </div>
              )}
            </div>
          )}

          {/* Post Content */}
          <div className="post-detail-content">
            <p className="post-detail-text">{post.content || 'No content available'}</p>
            
            {/* Hashtags section */}
            {(post.tags && post.tags.length > 0) || (post.hashtags && post.hashtags.length > 0) ? (
              <div className="post-detail-tags">
                {(post.tags || post.hashtags || []).map((tag, i) => (
                  <span 
                    key={i} 
                    className="post-detail-tag" 
                    style={{ color: platformStyle.hashtag }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
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
            {(post.date || post.scheduledDate || post.createdAt) && (
              <>
                <div className="post-detail-metadata-item">
                  <Calendar size={16} />
                  <span className="post-detail-metadata-text">
                    {formatDate(post.date || post.scheduledDate || post.createdAt)}
                  </span>
                </div>
                <div className="post-detail-metadata-item">
                  <Clock size={16} />
                  <span className="post-detail-metadata-text">
                    {formatTime(post.date || post.scheduledDate || post.createdAt)}
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
      </div>
    </div>
  );
};

export default PostDetailModal;