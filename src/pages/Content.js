import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Image,
  Plus,
  Instagram,
  Twitter,
  Facebook,
  Heart,
  MessageCircle,
  Share,
  Filter,
  Search,
  Grid,
  List,
  AlertCircle,
  Upload,
  Play,
  FileText,
  Calendar,
  Tag,
  Folder,
  Eye,
  Edit,
  Trash2,
  X,
  MoreHorizontal,
  Download,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useDashboardData,
  useMedia
} from '../hooks/useApi';
import CreatePost from '../components/CreatePost';
import PostDetail from '../components/PostDetail';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import apiClient from '../utils/api';
import './Content.css';
import Loader from '../components/common/Loader'


const Content = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Main Content Hub state
  const [activeTab, setActiveTab] = useState('posts');
  const [notification, setNotification] = useState(null);

  // Posts state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [postsViewMode, setPostsViewMode] = useState('grid');
  const [postsFilters, setPostsFilters] = useState({
    status: 'all',
    platform: 'all',
    hashtag: '',
    dateRange: { start: '', end: '' }
  });
  const [postsSearchQuery, setPostsSearchQuery] = useState('');

  // Enhanced Media state
  const [mediaList, setMediaList] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaViewMode, setMediaViewMode] = useState('grid');
  const [mediaFilters, setMediaFilters] = useState({
    type: 'all',
    folder: 'all',
    tags: '',
    sort: 'newest',
    search: '',
    page: 1
  });

  // Basic media hook
  const { media: basicMedia, loading: basicLoading, refetch: refetchMedia, uploadMedia } = useMedia();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ✅ Use dashboard data (same as dashboard component)
  const {
    user,
    posts,
    loading,
    error: dashboardError,
    createPost: apiCreatePost,
    deletePost: apiDeletePost,
    refetch: refetchDashboard,
    data // This contains the dashboard API data including upcomingPosts
  } = useDashboardData();

  // ✅ Get all posts from dashboard data and API upcoming posts
  const allPosts = [
    ...(Array.isArray(posts) ? posts : []),
    ...(data?.upcomingPosts || [])
  ];

  // ✅ Remove duplicates based on _id
  const uniquePosts = allPosts.filter((post, index, self) => 
    index === self.findIndex(p => p._id === post._id)
  );

  // Handle URL tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['posts', 'media'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  // Handle tab changes and update URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newUrl = `/content?tab=${tab}`;
    navigate(newUrl, { replace: true });
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

  // Media handling
  const currentMedia = basicMedia || [];
  const currentLoading = basicLoading;

  const handleFilterChange = (newFilters) => {
    setMediaFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleSearch = (searchTerm) => {
    setMediaFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  const handleLoadMore = () => {
    console.log('Load more media');
  };

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

  const handleMediaDelete = async (mediaId) => {
    try {
      setShowMediaPreview(false);
      await apiClient.request(`/api/media/${mediaId}`, { method: 'DELETE' });
      setNotification({ type: 'success', message: 'Media deleted successfully' });
      refetchMedia();
    } catch (error) {
      console.error('Failed to delete media:', error);
      setNotification({ type: 'error', message: 'Failed to delete media' });
    }
  };

  // ✅ Filter posts based on all filters and search query
  const filteredPosts = uniquePosts.filter(post => {
  if (!post) return false;

  const postStatus = post.status || 'draft';
  const postPlatforms = post.platforms || [];
  const postHashtags = post.hashtags || [];
  const postContent = post.content || '';

  const matchesStatus = postsFilters.status === 'all' || postStatus === postsFilters.status;
  const matchesPlatform = postsFilters.platform === 'all' || 
    postPlatforms.includes(postsFilters.platform);
  const matchesHashtag = !postsFilters.hashtag ||
    postHashtags.some(tag =>
      (tag || '').toLowerCase().includes(postsFilters.hashtag.toLowerCase())
    );
  const matchesSearch = !postsSearchQuery ||
    postContent.toLowerCase().includes(postsSearchQuery.toLowerCase()) ||
    postHashtags.some(tag =>
      (tag || '').toLowerCase().includes(postsSearchQuery.toLowerCase())
    );

  // Date range filtering with safety checks
  let matchesDateRange = true;
  if (postsFilters.dateRange.start || postsFilters.dateRange.end) {
    const postDate = new Date(post.createdAt || post.publishedAt || post.scheduledDate || Date.now());
    if (postsFilters.dateRange.start) {
      matchesDateRange = matchesDateRange && postDate >= new Date(postsFilters.dateRange.start);
    }
    if (postsFilters.dateRange.end) {
      matchesDateRange = matchesDateRange && postDate <= new Date(postsFilters.dateRange.end);
    }
  }

  return matchesStatus && matchesPlatform && matchesHashtag && matchesSearch && matchesDateRange;
});

  // Filter and sort media
  const mediaArray = Array.isArray(mediaList) ? mediaList : [];
  const filteredMedia = mediaArray.filter(media => {
    if (!media) return false;

    const matchesType = mediaFilters.type === 'all' ||
      (mediaFilters.type === 'image' && media.fileType?.startsWith('image')) ||
      (mediaFilters.type === 'video' && media.fileType?.startsWith('video'));
    const matchesFolder = mediaFilters.folder === 'all' || media.folder === mediaFilters.folder;
    const matchesTags = !mediaFilters.tags ||
      (media.tags && media.tags.some(tag =>
        tag.toLowerCase().includes(mediaFilters.tags.toLowerCase())
      ));

    return matchesType && matchesFolder && matchesTags;
  });

  const sortedMedia = [...filteredMedia].sort((a, b) => {
    switch (mediaFilters.sort) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'mostUsed':
        return (b.usage?.timesUsed || 0) - (a.usage?.timesUsed || 0);
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Fetch media when tab changes to media
  useEffect(() => {
    if (activeTab === 'media') {
      refetchMedia();
    }
  }, [activeTab]);

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
        <Loader />
        {/* <Loader className="spinner" size={48} />
        <p>Loading your content...</p> */}
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="page-error">
        <AlertCircle size={48} />
        <h3>Unable to load content</h3>
        <p>{dashboardError}</p>
        <button onClick={refetchDashboard} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="content-hub">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="header-content header-content-left">
          <h1>Content Hub</h1>
          <p>Your central repository for all creative assets, posts, and media</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="content-hub-nav">
        <button
          className={`nav-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => handleTabChange('posts')}
        >
          <FileText size={18} />
          Posts ({uniquePosts.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => handleTabChange('media')}
        >
          <Image size={18} />
          Media Library ({currentMedia.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="content-hub-main">
        {activeTab === 'posts' ? (
          <PostsSubPage
            posts={filteredPosts}
            loading={loading}
            error={dashboardError}
            viewMode={postsViewMode}
            setViewMode={setPostsViewMode}
            filters={postsFilters}
            setFilters={setPostsFilters}
            searchQuery={postsSearchQuery}
            setSearchQuery={setPostsSearchQuery}
            onCreatePost={() => setShowCreatePost(true)}
            onPostClick={handlePostClick}
            onRefetch={refetchDashboard}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
          />
        ) : (
          <MediaLibrarySubPage
            media={currentMedia}
            loading={currentLoading}
            viewMode={mediaViewMode}
            setViewMode={setMediaViewMode}
            filters={mediaFilters}
            setFilters={handleFilterChange}
            onUpload={() => setShowUploadModal(true)}
            onMediaClick={(media) => {
              setSelectedMedia(media);
              setShowMediaPreview(true);
            }}
            onRefetch={refetchMedia}
            onSearch={handleSearch}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>

      {/* Modals */}
      <CreatePost
        isOpen={showCreatePost}
        onClose={() => {
          setShowCreatePost(false);
          setSelectedPost(null);
        }}
        onPostCreated={handleCreatePost}
        initialData={selectedPost}
      />

      <PostDetail
        post={selectedPost}
        isOpen={showPostDetail}
        onClose={() => setShowPostDetail(false)}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />

      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleMediaUpload}
      />

      <MediaPreviewModal
        media={selectedMedia}
        isOpen={showMediaPreview}
        onClose={() => setShowMediaPreview(false)}
        onDelete={handleMediaDelete}
      />
    </div>
  );
};

// ✅ Updated Posts Sub-Page Component
const PostsSubPage = ({
  posts,
  loading,
  error,
  viewMode,
  setViewMode,
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  onCreatePost,
  onPostClick,
  onRefetch,
  onEditPost,
  onDeletePost
}) => {
  const clearFilters = () => {
    setFilters({
      status: 'all',
      platform: 'all',
      hashtag: '',
      dateRange: { start: '', end: '' }
    });
    setSearchQuery('');
  };

  // ✅ Count posts by status for filter labels
  const postCounts = {
  all: posts.length,
  draft: posts.filter(p => (p?.status || 'draft') === 'draft').length,
  scheduled: posts.filter(p => (p?.status || 'draft') === 'scheduled').length,
  published: posts.filter(p => (p?.status || 'draft') === 'published').length,
  failed: posts.filter(p => (p?.status || 'draft') === 'failed').length
};

  if (loading) {
    return (
      <div className="page-loading">
        <Loader className="spinner" size={48} />
        <p>Loading your posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <AlertCircle size={48} />
        <h3>Unable to load posts</h3>
        <p>{error}</p>
        <button onClick={onRefetch} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="posts-subpage">
      {/* Control Bar & Search */}
      <div className="posts-control-bar">
        <div className="search-section">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search posts by content or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="filters-bar">
          {/* ✅ Enhanced Status Dropdown with counts */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Posts ({postCounts.all})</option>
            <option value="draft">Draft ({postCounts.draft})</option>
            <option value="scheduled">Scheduled ({postCounts.scheduled})</option>
            <option value="published">Published ({postCounts.published})</option>
            <option value="failed">Failed ({postCounts.failed})</option>
          </select>

          {/* Platform Dropdown */}
          <select
            value={filters.platform}
            onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
          </select>

          {/* Date Range */}
          <div className="date-range-dropdown">
            <span className="date-label">Date Range:</span>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) =>
                setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))
              }
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) =>
                setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))
              }
            />
          </div>

          {/* ✅ Clear Filters Button */}
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All
          </button>
        </div>

        <div className="control-actions">
          {/* ✅ Refresh Button */}
          <button className="refresh-btn" onClick={onRefetch} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>

          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>

          <button className="btn-primary" onClick={onCreatePost}>
            <Plus size={18} />
            Create Post
          </button>
        </div>
      </div>

      {/* Posts Grid/List */}
      <div className="posts-content">
<div className={`posts-container ${viewMode}`}>
  {posts.length === 0 ? (
    <div className="empty-state">
      <FileText size={48} />
      <h3>No posts found</h3>
      <p>
        {searchQuery || filters.status !== 'all' || filters.platform !== 'all' || filters.hashtag || filters.dateRange.start || filters.dateRange.end
          ? 'Try adjusting your search or filters'
          : 'Create your first post to get started!'
        }
      </p>
      {(!searchQuery && filters.status === 'all' && filters.platform === 'all' && !filters.hashtag && !filters.dateRange.start && !filters.dateRange.end) && (
        <button onClick={onCreatePost} className="btn-primary">
          <Plus size={18} />
          Create Your First Post
        </button>
      )}
    </div>
  ) : (
    // ✅ Use flatMap to create separate cards for each platform (like dashboard)
    posts.flatMap(post => {
      // ✅ Same logic as dashboard upcoming posts
      const platformsArray = Array.isArray(post.platforms) && post.platforms.length > 0 ? 
        post.platforms : ['instagram'];

      // ✅ For each platform, create a separate card
      return platformsArray.map(platform => (
        <PlatformPostCard 
          key={`${post._id || post.id}-${platform}`}
          post={post} 
          platform={platform}
          onClick={() => onPostClick(post)}
          onEdit={() => onEditPost(post)}
          onDelete={() => onDeletePost(post._id || post.id)}
        />
      ));
    })
  )}
</div>

      </div>
    </div>
  );
};

// ✅ New PlatformPostCard Component (similar to dashboard upcoming posts)
const PlatformPostCard = ({ post, platform, onClick, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  // ✅ Add safety check for post object
  if (!post) {
    return null;
  }

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete();
    }
  };

  // ✅ Platform-specific styling (same as dashboard)
  const primary = platform.toLowerCase();
  const colorMap = {
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    facebook: '#1877F2',
  };
  const style = { '--platform-color': colorMap[primary] || colorMap['instagram'] };

  // ✅ Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      default: return FileText;
    }
  };

  const PlatformIcon = getPlatformIcon(platform);

  // ✅ Determine which date to show with safety checks
  const getDisplayDate = () => {
    if (post.status === 'scheduled' && post.scheduledDate) {
      return new Date(post.scheduledDate);
    }
    if (post.publishedAt) {
      return new Date(post.publishedAt);
    }
    if (post.createdAt) {
      return new Date(post.createdAt);
    }
    return new Date();
  };

  const displayDate = getDisplayDate();
  const postStatus = post.status || 'draft';
  const postContent = post.content || '';

  return (
    <div
      className={`platform-post-card platform-preview ${primary}`}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Hover Actions */}
      {showActions && (
        <div className="post-actions">
          <button className="action-btn edit" onClick={handleEdit}>
            <Edit size={16} />
          </button>
          <button className="action-btn delete" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Platform Header (same as dashboard) */}
      <div className="platform-header">
        <div className="platform-info">
          <PlatformIcon size={16} />
          <span className="platform-name">{primary}</span>
        </div>
        <div className="schedule-info">
          {postStatus === 'scheduled' && <Clock size={16} />}
          <span className="schedule-time">
            {displayDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Post Images (same as dashboard) */}
      {post.images && Array.isArray(post.images) && post.images.length > 0 && (
        <div className="preview-images">
          {post.images.slice(0, 4).map((img, i) => {
            const src = typeof img === 'string' ? img : (img?.url || '');
            if (!src) return null;
            return <img key={i} src={src} alt={`Post image ${i + 1}`} />;
          }).filter(Boolean)}
          {post.images.length > 4 && (
            <div className="image-count">+{post.images.length - 4}</div>
          )}
        </div>
      )}

      {/* Post Content (same as dashboard) */}
      <div className="preview-text">
        <p>{postContent.substring(0, 80)}{postContent.length > 80 ? '…' : ''}</p>
      </div>

      {/* Hashtags (same as dashboard) */}
      <div className="preview-hashtags">
        {post.hashtags?.slice(0, 3).map((hashtag, i) => (
          <span key={i} className="hashtag">{hashtag}</span>
        )) || <span className="hashtag">#{primary}</span>}
      </div>

      {/* Post Stats */}
      <div className="post-stats">
        <span><Heart size={14} /> {post.totalEngagement || 0}</span>
        <span><MessageCircle size={14} /> {post.platformPosts?.[0]?.analytics?.comments || 0}</span>
        <span><Share size={14} /> {post.platformPosts?.[0]?.analytics?.shares || 0}</span>
      </div>

      {/* Status Badge (same as dashboard) */}
      <div className="post-status">
        <span className={`status-badge ${postStatus}`}>
          {postStatus === 'published' && <CheckCircle size={12} />}
          {postStatus === 'failed' && <XCircle size={12} />}
          {postStatus === 'scheduled' && <Clock size={12} />}
          {postStatus.charAt(0).toUpperCase() + postStatus.slice(1)}
        </span>
      </div>
    </div>
  );
};


// Media Library Sub-Page Component
const MediaLibrarySubPage = ({
  media,
  loading,
  viewMode,
  setViewMode,
  filters,
  setFilters,
  onUpload,
  onMediaClick,
  onRefetch,
  onSearch,
  onLoadMore
}) => {
  const clearFilters = () => {
    setFilters({
      type: 'all',
      folder: 'all',
      tags: '',
      sort: 'newest'
    });
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Loader className="spinner" size={48} />
        <p>Loading media library...</p>
      </div>
    );
  }

  return (
    <div className="media-subpage">
      {/* Control Bar */}
      <div className="media-control-bar">
        <div className="control-left">
          <button className="btn-primary" onClick={onUpload}>
            <Upload size={18} />
            Upload New Media
          </button>
        </div>
         <div className="filters-bar">
  {/* Type Dropdown */}
  <select
    value={filters.type}
    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
  >
    <option value="all">All Types</option>
    <option value="image">Image</option>
    <option value="video">Video</option>
  </select>

  {/* Folder Dropdown */}
  <select
    value={filters.folder}
    onChange={(e) => setFilters(prev => ({ ...prev, folder: e.target.value }))}
  >
    <option value="all">All Folders ({media.length})</option>
    <option value="general">General</option>
    <option value="posts">Posts</option>
    <option value="profile">Profile</option>
    <option value="campaigns">Campaigns</option>
  </select>

  {/* Tags Input */}
  <div className="filter-input">
    <Tag size={16} />
    <input
      type="text"
      placeholder="Search by tags..."
      value={filters.tags}
      onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
    />
  </div>

  {/* Sort By Dropdown */}
  <select
    value={filters.sort}
    onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="mostUsed">Most Used</option>
  </select>

  {/* Clear All */}
  <button className="clear-filters-btn" onClick={clearFilters}>
    Clear All
  </button>
</div>


        <div className="control-right">
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="media-layout">
        {/* Filtering Sidebar */}
       

        {/* Media Grid/List */}
        <div className="media-content">
          <div className={`media-container ${viewMode}`}>
            {media.length === 0 ? (
              <div className="empty-state">
                <Image size={48} />
                <h3>No media found</h3>
                <p>
                  {filters.type !== 'all' || filters.folder !== 'all' || filters.tags
                    ? 'Try adjusting your filters'
                    : 'Upload your first media file to get started!'
                  }
                </p>
                {(filters.type === 'all' && filters.folder === 'all' && !filters.tags) && (
                  <button onClick={onUpload} className="btn-primary">
                    <Upload size={18} />
                    Upload Your First Media
                  </button>
                )}
              </div>
            ) : (
              media.map(mediaItem => (
                <MediaCard
                  key={mediaItem._id || mediaItem.id}
                  media={mediaItem}
                  onClick={() => onMediaClick(mediaItem)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Media Card Component
const MediaCard = ({ media, onClick }) => {
  const isVideo = media.fileType?.startsWith('video');
  const humanSize = media.humanSize || `${Math.round(media.size / 1024)}KB`;

  return (
    <div className="media-card" onClick={onClick}>
      <div className="media-thumbnail">
        {isVideo ? (
          <div className="video-thumbnail">
            <video src={media.url} />
            <div className="play-overlay">
              <Play size={24} />
            </div>
          </div>
        ) : (
          <img src={media.url} alt={media.altText || media.filename} />
        )}
        <div className="media-type-indicator">
          {isVideo ? <Play size={12} /> : <Image size={12} />}
        </div>
      </div>

      <div className="media-info">
        <div className="media-filename">{media.filename}</div>
        <div className="media-details">
          <span className="media-size">{humanSize}</span>
          {media.usage?.timesUsed > 0 && (
            <span className="media-usage">Used {media.usage.timesUsed}x</span>
          )}
        </div>
        {media.tags && media.tags.length > 0 && (
          <div className="media-tags">
            {media.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="media-tag">{tag}</span>
            ))}
            {media.tags.length > 2 && (
              <span className="tag-more">+{media.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Media Upload Modal Component
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

// Media Preview Modal Component
const MediaPreviewModal = ({ media, isOpen, onClose, onDelete }) => {
  if (!isOpen || !media) return null;

  const isVideo = media.fileType?.startsWith('video');
  const humanSize = media.humanSize || `${Math.round(media.size / 1024)}KB`;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      onDelete(media._id || media.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Media Details</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="media-preview">
            {isVideo ? (
              <video src={media.url} controls className="preview-video" />
            ) : (
              <img src={media.url} alt={media.altText || media.filename} className="preview-image" />
            )}
          </div>

          <div className="media-metadata">
            <div className="metadata-section">
              <h4>File Information</h4>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <label>Filename:</label>
                  <span>{media.filename}</span>
                </div>
                <div className="metadata-item">
                  <label>Size:</label>
                  <span>{humanSize}</span>
                </div>
                <div className="metadata-item">
                  <label>Type:</label>
                  <span>{media.fileType}</span>
                </div>
                {media.dimensions && (
                  <div className="metadata-item">
                    <label>Dimensions:</label>
                    <span>{media.dimensions.width} × {media.dimensions.height}</span>
                  </div>
                )}
                <div className="metadata-item">
                  <label>Folder:</label>
                  <span>{media.folder || 'general'}</span>
                </div>
                <div className="metadata-item">
                  <label>Uploaded:</label>
                  <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {media.altText && (
              <div className="metadata-section">
                <h4>Alt Text</h4>
                <p>{media.altText}</p>
              </div>
            )}

            {media.tags && media.tags.length > 0 && (
              <div className="metadata-section">
                <h4>Tags</h4>
                <div className="media-tags">
                  {media.tags.map((tag, index) => (
                    <span key={index} className="media-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {media.usage && (
              <div className="metadata-section">
                <h4>Usage Statistics</h4>
                <p>Used in {media.usage.timesUsed || 0} posts</p>
                {media.usage.lastUsed && (
                  <p>Last used: {new Date(media.usage.lastUsed).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-left">
            <button className="btn-secondary">
              <Edit size={16} />
              Edit Details
            </button>
            <button className="btn-secondary">
              <Download size={16} />
              Download
            </button>
          </div>
          <div className="footer-right">
            <button className="btn-danger" onClick={handleDelete}>
              <Trash2 size={16} />
              Delete Media
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
