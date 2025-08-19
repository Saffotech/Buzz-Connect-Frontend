import React from "react";
import "./PostDetailModal.css";
import { X, Calendar, Clock, Heart, MessageCircle, Share } from "lucide-react";

const PostDetailModal = ({ post, onClose }) => {
  if (!post) return null;

  const platform = post.platforms?.[0]?.toLowerCase() || "post";

  const getPlatformStyle = () => {
    switch (platform) {
      case "instagram":
        return { background: "linear-gradient(90deg, #f58529, #dd2a7b, #8134af, #515bd4)" };
      case "facebook":
        return { background: "#1877f2" };
      case "twitter":
        return { background: "#1da1f2" };
      default:
        return { background: "#6b7280" };
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No date available";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      shares: post.shares || post.engagement?.shares || 0
    };
  };

  const engagement = getEngagementStats();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="platform-header" style={getPlatformStyle()}>
          <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
        </div>

        {post.images?.length > 0 && (
          <div className="post-image">
            <img
              src={
                typeof post.images[0] === "string"
                  ? post.images[0]
                  : post.images[0]?.url || ""
              }
              alt="Post media"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/500x300?text=Image+Not+Found";
              }}
            />
          </div>
        )}

        <div className="post-content">
          <p>{post.content}</p>
          
          {/* Hashtags section */}
          {(post.tags && post.tags.length > 0) || (post.hashtags && post.hashtags.length > 0) ? (
            <div className="tags">
              {(post.tags || post.hashtags || []).map((tag, i) => (
                <span key={i} className="tag">#{tag}</span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Post metadata - date, time, and engagement stats */}
        <div className="post-metadata">
          {(post.date || post.scheduledDate || post.createdAt) && (
            <div className="post-date-time">
              <div className="date-item">
                <Calendar size={16} />
                <span>{formatDate(post.date || post.scheduledDate || post.createdAt)}</span>
              </div>
              <div className="date-item">
                <Clock size={16} />
                <span>{formatTime(post.date || post.scheduledDate || post.createdAt)}</span>
              </div>
            </div>
          )}
          
          {/* Engagement stats */}
          <div className="engagement-stats">
            <div className="stat">
              <Heart size={16} />
              <span>{engagement.likes}</span>
            </div>
            <div className="stat">
              <MessageCircle size={16} />
              <span>{engagement.comments}</span>
            </div>
            <div className="stat">
              <Share size={16} />
              <span>{engagement.shares}</span>
            </div>
          </div>
        </div>

        {/* Status information if available */}
        {post.status && (
          <div className="post-status">
            Status: <span className={`status ${post.status}`}>{post.status}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailModal;