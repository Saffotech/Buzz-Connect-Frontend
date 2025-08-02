import { useState } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  Instagram,
  Twitter,
  Facebook,
  TrendingUp,
  Users,
  Eye
} from 'lucide-react';
import './PostDetail.css';

const PostDetail = ({ post, isOpen, onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showActions, setShowActions] = useState(false);

  if (!isOpen || !post) return null;

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram': return Instagram;
      case 'twitter': return Twitter;
      case 'facebook': return Facebook;
      default: return Instagram;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'instagram': return '#E4405F';
      case 'twitter': return '#1DA1F2';
      case 'facebook': return '#1877F2';
      default: return '#64748b';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mockAnalytics = {
    reach: '12.5K',
    impressions: '18.2K',
    engagement: '8.4%',
    clicks: '156',
    saves: '89',
    profileVisits: '23'
  };

  const mockComments = [
    {
      id: 1,
      author: 'sarah_marketing',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      content: 'This is amazing! Love the creativity 🔥',
      timestamp: '2 hours ago',
      likes: 12
    },
    {
      id: 2,
      author: 'digital_guru',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      content: 'Great content strategy! How did you come up with this concept?',
      timestamp: '4 hours ago',
      likes: 8
    },
    {
      id: 3,
      author: 'creative_minds',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      content: 'Bookmarked for inspiration! 💡',
      timestamp: '6 hours ago',
      likes: 5
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    // You could add a toast notification here
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        text: post.content.substring(0, 100) + '...',
        url: `${window.location.origin}/post/${post.id}`
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="post-detail-overlay">
      <div className="post-detail-modal">
        <div className="modal-header">
          <h2>Post Details</h2>
          <div className="header-actions">
            <div className="actions-dropdown">
              <button 
                className="actions-btn"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreHorizontal size={20} />
              </button>
              {showActions && (
                <div className="actions-menu">
                  <button onClick={() => { onEdit(post); setShowActions(false); }}>
                    <Edit size={16} />
                    Edit Post
                  </button>
                  <button onClick={handleCopyLink}>
                    <Copy size={16} />
                    Copy Link
                  </button>
                  <button onClick={handleShare}>
                    <Share size={16} />
                    Share
                  </button>
                  <button className="delete-action" onClick={() => { onDelete(post.id); setShowActions(false); }}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={16} />
            Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            <MessageCircle size={16} />
            Comments ({mockComments.length})
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="post-content-section">
                <div className="post-platforms">
                  {post.platforms?.map(platform => {
                    const Icon = getPlatformIcon(platform);
                    return (
                      <div 
                        key={platform} 
                        className="platform-badge"
                        style={{ '--platform-color': getPlatformColor(platform) }}
                      >
                        <Icon size={16} />
                        <span>{platform}</span>
                      </div>
                    );
                  })}
                </div>

                {post.images && post.images.length > 0 && (
                  <div className="post-images">
                    {post.images.map((image, index) => (
                      <img key={index} src={image} alt={`Post image ${index + 1}`} />
                    ))}
                  </div>
                )}

                <div className="post-text">
                  <p>{post.content}</p>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="hashtags">
                      {post.hashtags.map((tag, index) => (
                        <span key={index} className="hashtag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="post-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>Published: {formatDate(post.createdAt)}</span>
                  </div>
                  {post.scheduledDate && (
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>Scheduled: {formatDate(post.scheduledDate)}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className={`status-badge ${post.status}`}>
                      {post.status}
                    </span>
                  </div>
                </div>

                <div className="engagement-stats">
                  <div className="stat-item">
                    <Heart size={20} />
                    <span>{post.likes || 0}</span>
                    <label>Likes</label>
                  </div>
                  <div className="stat-item">
                    <MessageCircle size={20} />
                    <span>{post.comments || 0}</span>
                    <label>Comments</label>
                  </div>
                  <div className="stat-item">
                    <Share size={20} />
                    <span>{post.shares || 0}</span>
                    <label>Shares</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="card-icon reach">
                    <Users size={24} />
                  </div>
                  <div className="card-content">
                    <h3>{mockAnalytics.reach}</h3>
                    <p>Reach</p>
                    <span className="change positive">+12%</span>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="card-icon impressions">
                    <Eye size={24} />
                  </div>
                  <div className="card-content">
                    <h3>{mockAnalytics.impressions}</h3>
                    <p>Impressions</p>
                    <span className="change positive">+8%</span>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="card-icon engagement">
                    <Heart size={24} />
                  </div>
                  <div className="card-content">
                    <h3>{mockAnalytics.engagement}</h3>
                    <p>Engagement Rate</p>
                    <span className="change positive">+2.1%</span>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="card-icon clicks">
                    <ExternalLink size={24} />
                  </div>
                  <div className="card-content">
                    <h3>{mockAnalytics.clicks}</h3>
                    <p>Link Clicks</p>
                    <span className="change neutral">+5</span>
                  </div>
                </div>
              </div>

              <div className="performance-summary">
                <h3>Performance Summary</h3>
                <div className="summary-stats">
                  <div className="summary-item">
                    <span className="label">Total Saves:</span>
                    <span className="value">{mockAnalytics.saves}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Profile Visits:</span>
                    <span className="value">{mockAnalytics.profileVisits}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Best Performing Platform:</span>
                    <span className="value">Instagram</span>
                  </div>
                </div>
              </div>
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
                        <span className="comment-author">{comment.author}</span>
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
      </div>
    </div>
  );
};

export default PostDetail;
