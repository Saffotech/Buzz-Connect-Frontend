import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Image,
  Plus,
  Instagram,
  Twitter,
  Heart,
  MessageCircle,
  Share,
  Filter,
  Search,
  Grid,
  List,
  Loader,
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
  Download
} from 'lucide-react';
import {
  useDashboardData,
  useMedia
} from '../hooks/useApi';
import CreatePost from '../components/CreatePost';
import PostDetail from '../components/PostDetail';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import apiClient from '../utils/api';
import './Content.css';

const Content = () => {
  // Main Content Hub state
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'media'
  const [notification, setNotification] = useState(null);

  // Posts state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [postsViewMode, setPostsViewMode] = useState('grid'); // 'grid' or 'list'
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
  const [mediaViewMode, setMediaViewMode] = useState('grid'); // 'grid' or 'list'
  const [mediaFilters, setMediaFilters] = useState({
    type: 'all',
    folder: 'all',
    tags: '',
    sort: 'newest',
    search: '',
    page: 1
  });

  // Basic media hook (using existing functionality)
  const { media: basicMedia, loading: basicLoading, refetch: refetchMedia, uploadMedia } = useMedia();  
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const {
    posts,
    loading,
    error: dashboardError,
    createPost: apiCreatePost,
    deletePost: apiDeletePost,
    refetch: refetchDashboard
  } = useDashboardData();

  // Ensure posts is always an array
  const postsArray = Array.isArray(posts) ? posts : [];

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

  // Basic media handling
  const currentMedia = basicMedia || [];
  const currentLoading = basicLoading;

  // Handle filter changes (simplified)
  const handleFilterChange = (newFilters) => {
    setMediaFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Handle search (simplified)
  const handleSearch = (searchTerm) => {
    setMediaFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  // Handle pagination (simplified)
  const handleLoadMore = () => {
    // Basic implementation - will be enhanced later
    console.log('Load more media');
  };

  const handleMediaUpload = async (files) => {
    try {
      // ✅ Close modal immediately when upload starts
      setShowUploadModal(false);

      // Show uploading notification
      setNotification({ type: 'info', message: 'Uploading media...' });
      
      // Use the same upload method as CreatePost
      const response = await uploadMedia(files);
      console.log('Upload successful:', response);
      
      // Show success notification
      setNotification({ 
        type: 'success', 
        message: `Successfully uploaded ${files.length} file(s)` 
      });
      
      // Refresh media list and close modal
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
      // ✅ Close modal immediately when delete starts
      setShowMediaPreview(false);
      await apiClient.request(`/api/media/${mediaId}`, { method: 'DELETE' });
      setNotification({ type: 'success', message: 'Media deleted successfully' });
      refetchMedia(); // Refresh media list
    } catch (error) {
      console.error('Failed to delete media:', error);
      setNotification({ type: 'error', message: 'Failed to delete media' });
    }
  };

  // Filter posts based on all filters and search query
  const filteredPosts = postsArray.filter(post => {
    const matchesStatus = postsFilters.status === 'all' || post.status === postsFilters.status;
    const matchesPlatform = postsFilters.platform === 'all' ||
      (post.platforms && post.platforms.includes(postsFilters.platform));
    const matchesHashtag = !postsFilters.hashtag ||
      (post.hashtags && post.hashtags.some(tag =>
        tag.toLowerCase().includes(postsFilters.hashtag.toLowerCase())
      ));
    const matchesSearch = !postsSearchQuery ||
      post.content.toLowerCase().includes(postsSearchQuery.toLowerCase()) ||
      (post.hashtags && post.hashtags.some(tag =>
        tag.toLowerCase().includes(postsSearchQuery.toLowerCase())
      ));

    // Date range filtering
    let matchesDateRange = true;
    if (postsFilters.dateRange.start || postsFilters.dateRange.end) {
      const postDate = new Date(post.createdAt || post.publishedAt || post.scheduledDate);
      if (postsFilters.dateRange.start) {
        matchesDateRange = matchesDateRange && postDate >= new Date(postsFilters.dateRange.start);
      }
      if (postsFilters.dateRange.end) {
        matchesDateRange = matchesDateRange && postDate <= new Date(postsFilters.dateRange.end);
      }
    }

    return matchesStatus && matchesPlatform && matchesHashtag && matchesSearch && matchesDateRange;
  });

  // Filter media based on filters
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

  // Sort media
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
        <Loader className="spinner" size={48} />
        <p>Loading your content...</p>
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
        <div className="header-content">
          <h1>Content Hub</h1>
          <p>Your central repository for all creative assets, posts, and media</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="content-hub-nav">
        <button
          className={`nav-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FileText size={18} />
          Posts
        </button>
        <button
          className={`nav-tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <Image size={18} />
          Media Library
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
        onClose={() => setShowCreatePost(false)}
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

// Posts Sub-Page Component
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
  onRefetch
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

        <div className="control-actions">
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

      {/* Main Layout: Sidebar + Content */}
      <div className="posts-layout">
        {/* Filtering Sidebar */}
        <div className="posts-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>

          <div className="filter-section">
            <label>Status</label>
            <div className="filter-options">
              {['all', 'draft', 'scheduled', 'published', 'failed'].map(status => (
                <label key={status} className="filter-checkbox">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={filters.status === status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  />
                  <span className="checkmark"></span>
                  {status === 'all' ? 'All Posts' : status.charAt(0).toUpperCase() + status.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label>Platform</label>
            <div className="filter-options">
              {['all', 'instagram', 'twitter'].map(platform => (
                <label key={platform} className="filter-checkbox">
                  <input
                    type="radio"
                    name="platform"
                    value={platform}
                    checked={filters.platform === platform}
                    onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                  />
                  <span className="checkmark"></span>
                  <div className="platform-option">
                    {platform === 'instagram' && <Instagram size={16} />}
                    {platform === 'twitter' && <Twitter size={16} />}
                    {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label>Hashtag</label>
            <div className="filter-input">
              <Tag size={16} />
              <input
                type="text"
                placeholder="Enter hashtag..."
                value={filters.hashtag}
                onChange={(e) => setFilters(prev => ({ ...prev, hashtag: e.target.value }))}
              />
            </div>
          </div>

          <div className="filter-section">
            <label>Date Range</label>
            <div className="date-range-inputs">
              <input
                type="date"
                placeholder="Start Date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
              />
              <input
                type="date"
                placeholder="End Date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
              />
            </div>
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
              posts.map(post => (
                <PostCard key={post._id || post.id} post={post} onClick={() => onPostClick(post)} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Post Card Component
const PostCard = ({ post, onClick }) => {
  const [showActions, setShowActions] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    // This will be handled by parent component
    console.log('Edit post:', post._id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      // This will be handled by parent component
      console.log('Delete post:', post._id);
    }
  };

  return (
    <div
      className="post-card"
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
          <img
            src={post.images[0].url || post.images[0]}
            alt={post.images[0].altText || "Post content"}
          />
          {post.images.length > 1 && (
            <div className="image-count">+{post.images.length - 1}</div>
          )}
        </div>
      )}

      <div className="post-content">
        <p>{post.content}</p>
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="post-hashtags">
            {post.hashtags.slice(0, 3).map((tag, index) => (
              <span key={index} className="hashtag">{tag}</span>
            ))}
            {post.hashtags.length > 3 && (
              <span className="hashtag-more">+{post.hashtags.length - 3} more</span>
            )}
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
        <div className="media-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>

          <div className="filter-section">
            <label>Type</label>
            <div className="filter-options">
              {['all', 'image', 'video'].map(type => (
                <label key={type} className="filter-checkbox">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={filters.type === type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  />
                  <span className="checkmark"></span>
                  <div className="type-option">
                    {type === 'image' && <Image size={16} />}
                    {type === 'video' && <Play size={16} />}
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label>Folder</label>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="radio"
                  name="folder"
                  value="all"
                  checked={filters.folder === 'all'}
                  onChange={(e) => setFilters({ folder: e.target.value })}
                />
                <span className="checkmark"></span>
                <div className="folder-option">
                  <Folder size={16} />
                  All Folders
                  {media.length > 0 && <span className="count">({media.length})</span>}
                </div>
              </label>

              {/* Static folders for now */}
              {['general', 'posts', 'profile', 'campaigns'].map(folder => (
                <label key={folder} className="filter-checkbox">
                  <input
                    type="radio"
                    name="folder"
                    value={folder}
                    checked={filters.folder === folder}
                    onChange={(e) => setFilters({ folder: e.target.value })}
                  />
                  <span className="checkmark"></span>
                  <div className="folder-option">
                    <Folder size={16} />
                    {folder.charAt(0).toUpperCase() + folder.slice(1)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label>Tags</label>
            <div className="filter-input">
              <Tag size={16} />
              <input
                type="text"
                placeholder="Search by tags..."
                value={filters.tags}
                onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
          </div>

          <div className="filter-section">
            <label>Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostUsed">Most Used</option>
            </select>
          </div>
        </div>

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
