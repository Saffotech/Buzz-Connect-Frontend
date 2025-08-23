import React from "react";
import "./PostDetailModal.css";
import { X, Calendar, Clock, Heart, MessageCircle, Share, MoreHorizontal, Bookmark, Send, Eye, Instagram, Facebook, Twitter } from "lucide-react";

const PostDetailModal = ({ post, onClose }) => {
  if (!post) return null;

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
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="post-detail-overlay" onClick={onClose}>
      <div className="post-detail-container" onClick={(e) => e.stopPropagation()}>
        <button className="post-detail-close-btn" onClick={onClose}>
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
          {/* Post Image */}
          {post.images?.length > 0 && (
            <div className="post-detail-image-container">
              <img
                className="post-detail-image"
                src={
                  typeof post.images[0] === "string"
                    ? post.images[0]
                    : post.images[0]?.url || ""
                }
                alt="Post media"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }}
              />
            </div>
          )}

          {/* Post Content */}
          <div className="post-detail-content">
            <p className="post-detail-text">{post.content}</p>
            
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
            <button className="post-detail-action-btn" style={{ color: platformStyle.primary }}>
              <Heart size={22} />
              <span>{engagement.likes}</span>
            </button>
            <button className="post-detail-action-btn">
              <MessageCircle size={22} />
              <span>{engagement.comments}</span>
            </button>
            <button className="post-detail-action-btn">
              {platform === 'twitter' ? <Share size={22} /> : <Send size={22} />}
              <span>{engagement.shares}</span>
            </button>
            {engagement.views > 0 && (
              <button className="post-detail-action-btn">
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
                  <span className="post-detail-metadata-text">{formatDate(post.date || post.scheduledDate || post.createdAt)}</span>
                </div>
                <div className="post-detail-metadata-item">
                  <Clock size={16} />
                  <span className="post-detail-metadata-text">{formatTime(post.date || post.scheduledDate || post.createdAt)}</span>
                </div>
              </>
            )}
          </div>
          
          {/* Status on the right */}
          {post.status && (
            <div className="post-detail-status-section">
              <span className="post-detail-status-label">Status:</span>
              <span className={`post-detail-status-badge post-detail-status-${post.status.toLowerCase()}`}>
                {post.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;