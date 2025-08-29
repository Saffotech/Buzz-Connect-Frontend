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
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useDashboardData,
  useMedia
} from '../hooks/useApi';
import CreatePost from '../components/CreatePost';
import PostDetailModal from '../components/PostDetailModal'; // ✅ Updated import
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import apiClient from '../utils/api';
import './Content.css';
import Loader from '../components/common/Loader';

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

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

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

  const { media: basicMedia, loading: basicLoading, refetch: refetchMedia, uploadMedia } = useMedia();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Fetch posts for content view
  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.request('/api/posts', {
        params: {
          limit: 100
        }
      });

      const postsData = response?.data?.posts || response?.data || [];
      console.log('Fetched posts:', postsData);

      setAllPosts(postsData);
      setDashboardError(null);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setDashboardError('Failed to load posts');
      setNotification({ type: 'error', message: 'Failed to load posts' });
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Create post function
  const handleCreatePost = async (postData) => {
    try {
      const response = await apiClient.request('/api/posts', {
        method: 'POST',
        data: postData
      });
      setNotification({ type: 'success', message: SUCCESS_MESSAGES.POST_CREATED });
      setShowCreatePost(false);

      await fetchAllPosts();
      return response;
    } catch (error) {
      setNotification({ type: 'error', message: error.message || ERROR_MESSAGES.SERVER_ERROR });
      throw error;
    }
  };

  // ✅ NEW: Update post function for editing
  const handleUpdatePost = async (postId, postData) => {
    try {
      const response = await apiClient.request(`/api/posts/${postId}`, {
        method: 'PUT',
        data: postData
      });
      setNotification({ type: 'success', message: 'Post updated successfully' });
      setShowCreatePost(false);
      setSelectedPost(null);

      await fetchAllPosts();
      return response;
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Failed to update post' });
      throw error;
    }
  };

  // ✅ NEW: Delete post with confirmation
  const handleDeletePost = async (postId) => {
    try {
      await apiClient.request(`/api/posts/${postId}`, { method: 'DELETE' });
      setNotification({ type: 'success', message: 'Post deleted successfully' });
      setShowDeleteConfirm(false);
      setPostToDelete(null);
      await fetchAllPosts();
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Failed to delete post' });
    }
  };

  // ✅ NEW: Show delete confirmation
  const showDeleteConfirmation = (post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  // ✅ Handle post click
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  // ✅ NEW: Handle edit post - fetch latest data first
  const handleEditPost = async (post) => {
    try {
      // Fetch the latest post data before editing
      const response = await apiClient.request(`/api/posts/${post._id || post.id}`);
      const latestPostData = response.data;

      setSelectedPost(latestPostData);
      setShowPostDetail(false);
      setShowCreatePost(true);
    } catch (error) {
      console.error('Failed to fetch post for editing:', error);
      // Fallback to using the existing post data
      setSelectedPost(post);
      setShowPostDetail(false);
      setShowCreatePost(true);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

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

  // Media handling
  const currentMedia = basicMedia || [];
  const currentLoading = basicLoading;

  const handleFilterChange = (newFilters) => {
    setMediaFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (searchTerm) => {
    setMediaFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleLoadMore = () => {
    console.log('Load more media');
  };

  const handleMediaUpload = async (files) => {
    try {
      setShowUploadModal(false);
      setNotification({ type: 'info', message: 'Uploading media...' });

      const response = await uploadMedia(files);
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

  // Filter posts based on all filters and search query
  const filteredPosts = allPosts.filter(post => {
    if (!post) return false;

    if (postsFilters.status !== 'all' && post.status !== postsFilters.status) {
      return false;
    }

    if (postsFilters.platform !== 'all' &&
      post.platforms && post.platforms.length > 0 &&
      !post.platforms.some(p => p === postsFilters.platform)) {
      return false;
    }

    const postHashtags = post.hashtags || [];
    const postContent = post.content || '';

    const matchesHashtag = !postsFilters.hashtag ||
      postHashtags.some(tag =>
        (tag || '').toLowerCase().includes(postsFilters.hashtag.toLowerCase())
      );

    const matchesSearch = !postsSearchQuery ||
      postContent.toLowerCase().includes(postsSearchQuery.toLowerCase()) ||
      postHashtags.some(tag =>
        (tag || '').toLowerCase().includes(postsSearchQuery.toLowerCase())
      );

    let matchesDateRange = true;
    if (postsFilters.dateRange.start || postsFilters.dateRange.end) {
      let postDate;
      if (post.status === 'published' && post.publishedAt) {
        postDate = new Date(post.publishedAt);
      } else if (post.scheduledDate) {
        postDate = new Date(post.scheduledDate);
      } else {
        postDate = new Date(post.createdAt);
      }

      if (postsFilters.dateRange.start) {
        matchesDateRange = matchesDateRange && postDate >= new Date(postsFilters.dateRange.start);
      }
      if (postsFilters.dateRange.end) {
        matchesDateRange = matchesDateRange && postDate <= new Date(postsFilters.dateRange.end);
      }
    }

    return matchesHashtag && matchesSearch && matchesDateRange;
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
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="page-error">
        <AlertCircle size={48} />
        <h3>Unable to load content</h3>
        <p>{dashboardError}</p>
        <button onClick={fetchAllPosts} className="btn-primary">
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
          Posts
        </button>
        <button
          className={`nav-tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => handleTabChange('media')}
        >
          <Image size={18} />
          Media Library
        </button>
      </div>

      {/* Main Content Area */}
      <div className="content-hub-main">
        {activeTab === 'posts' ? (
          <PostsSubPage
            posts={allPosts}
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
            onRefetch={fetchAllPosts}
            onEditPost={handleEditPost}
            onDeletePost={showDeleteConfirmation} // ✅ Use confirmation function
          />
        ) : (
          <MediaLibrarySubPage
            media={currentMedia}
            loading={currentLoading}
            viewMode={mediaViewMode}
            setViewMode={setMediaViewMode}
            filters={mediaFilters}
            setFilters={setMediaFilters}
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

      {/* ✅ Updated CreatePost Modal - handles both create and edit */}
      <CreatePost
        isOpen={showCreatePost}
        onClose={() => {
          setShowCreatePost(false);
          setSelectedPost(null);
        }}
        onPostCreated={selectedPost ?
          (postData) => handleUpdatePost(selectedPost._id || selectedPost.id, postData) :
          handleCreatePost
        }
        initialData={selectedPost}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={showPostDetail}
        onClose={() => setShowPostDetail(false)}
        onEdit={handleEditPost}
        onDelete={showDeleteConfirmation} // ✅ Use confirmation function
      />

      {/* ✅ NEW: Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPostToDelete(null);
        }}
        onConfirm={() => handleDeletePost(postToDelete?._id || postToDelete?.id)}
        postTitle={postToDelete?.content?.substring(0, 50) || 'this post'}
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

// ✅ UPDATED: PlatformPostCard Component with Smart Image Detection
const PlatformPostCard = ({ post, platform, onClick, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [imageAspectRatios, setImageAspectRatios] = useState(new Map()); // ✅ NEW: Track aspect ratios

  if (!post) {
    return null;
  }

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const primary = platform.toLowerCase();
  const colorMap = {
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    facebook: '#1877F2',
  };
  const style = { '--platform-color': colorMap[primary] || colorMap['instagram'] };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      default: return FileText;
    }
  };

  const PlatformIcon = getPlatformIcon(platform);

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

  // ✅ NEW: Function to handle image loading errors
  const handleImageError = (imageIndex) => {
    setImageLoadErrors(prev => new Set([...prev, imageIndex]));
  };

  // ✅ UPDATED: Enhanced image load handler with aspect ratio detection
  const handleImageLoad = (e, imageIndex) => {
    const img = e.target;
    const container = img.parentNode;
    container.classList.add('loaded');

    // ✅ NEW: Detect aspect ratio and apply appropriate styling
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let aspectClass = '';

    if (aspectRatio > 2.5) {
      // Very wide images (panoramic, banners, etc.)
      aspectClass = 'wide';
      img.style.objectFit = 'contain'; // Show full image
      img.style.objectPosition = 'center';
    } else if (aspectRatio < 0.6) {
      // Very tall images (portraits, vertical screenshots)
      aspectClass = 'tall';
      img.style.objectFit = 'cover'; // Crop to fit nicely
      img.style.objectPosition = 'center top';
    } else {
      // Normal aspect ratio images
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
    }

    // Store aspect ratio info
    setImageAspectRatios(prev => new Map(prev.set(imageIndex, aspectClass)));

    // Remove from error set if it was there
    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageIndex);
      return newSet;
    });
  };

  // ✅ NEW: Get valid images and filter out broken ones
  const getValidImages = () => {
    if (!post.images || !Array.isArray(post.images)) {
      return [];
    }

    return post.images
      .map((img, index) => {
        let src = '';
        if (typeof img === 'string') {
          src = img;
        } else if (img && typeof img === 'object') {
          src = img.url || img.src || img.path || '';
        }

        return src ? { src, index } : null;
      })
      .filter(Boolean);
  };

  // ✅ NEW: Get CSS class based on image count
  const getImageLayoutClass = (count) => {
    if (count === 1) return 'single-image';
    if (count === 2) return 'two-images';
    if (count === 3) return 'three-images';
    return 'four-plus-images';
  };

  const validImages = getValidImages();
  const displayImages = validImages.slice(0, 4); // Show max 4 images
  const layoutClass = getImageLayoutClass(displayImages.length);

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
          <button className="action-btn edit" onClick={handleEdit} title="Edit Post">
            <Edit size={16} />
          </button>
          <button className="action-btn delete" onClick={handleDelete} title="Delete Post">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Platform Header */}
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

      {/* ✅ UPDATED: Smart Post Images with Adaptive Display */}
      {displayImages.length > 0 && (
        <div className={`preview-images ${layoutClass}`}>
          {displayImages.map(({ src, index }) => {
            // Skip images that failed to load
            if (imageLoadErrors.has(index)) {
              return null;
            }

            const aspectClass = imageAspectRatios.get(index) || '';

            return (
              <div key={index} className={`preview-image-container ${aspectClass}`}>
                <img
                  src={src}
                  alt={`Post image ${index + 1}`}
                  loading="lazy"
                  onError={() => handleImageError(index)}
                  onLoad={(e) => handleImageLoad(e, index)}
                  data-aspect={aspectClass} // ✅ NEW: CSS can use this attribute
                />
              </div>
            );
          }).filter(Boolean)}

          {/* ✅ Image count overlay - only show if more than 4 images */}
          {validImages.length > 4 && (
            <div className="image-count">
              +{validImages.length - 4}
            </div>
          )}

          {/* ✅ Show placeholder if no valid images loaded */}
          {displayImages.length === 0 && post.images && post.images.length > 0 && (
            <div className="preview-image-container">
              <div className="image-error">
                <FileText size={20} color="#999" />
                <span style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  Image unavailable
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className=''>

        {/* Post Content */}
        <div className="preview-text">
          <p>{postContent.substring(0, 80)}{postContent.length > 80 ? '…' : ''}</p>
        </div>

        {/* Hashtags */}
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

        {/* Status Badge */}
        <div className="post-status">
          <span className={`status-badge ${postStatus}`}>
            {postStatus === 'published' && <CheckCircle size={12} />}
            {postStatus === 'failed' && <XCircle size={12} />}
            {postStatus === 'scheduled' && <Clock size={12} />}
            &nbsp; &nbsp;{postStatus.charAt(0).toUpperCase() + postStatus.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, postTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-simple">
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="warning-icon-container">
            <div className="warning-icon-circle">
              <AlertTriangle size={24} />
            </div>
          </div>

          <h3 className="modal-title">Delete Post</h3>

          <div className="post-info-box">
            <div className="post-icon">
              <FileText size={20} />
            </div>
            <div className="post-details">
              <span className="post-name">{postTitle}</span>
              <span className="post-subtitle">Post</span>
            </div>
          </div>

          <p className="warning-description">
            This action cannot be undone. You'll need to recreate this post to continue using it for your blog.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            <Trash2 size={16} />
            Yes, Delete Post
          </button>
        </div>
      </div>
    </div>
  );
};
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

  const allPosts = posts;

  const postCounts = {
    all: allPosts.length,
    draft: allPosts.filter(p => (p?.status || 'draft') === 'draft').length,
    scheduled: allPosts.filter(p => (p?.status || 'draft') === 'scheduled').length,
    published: allPosts.filter(p => (p?.status || 'draft') === 'published').length,
    failed: allPosts.filter(p => (p?.status || 'draft') === 'failed').length
  };

  const filteredPosts = allPosts.filter(post => {
    if (!post) return false;

    if (filters.status !== 'all' && post.status !== filters.status) {
      return false;
    }

    if (filters.platform !== 'all' &&
      post.platforms && post.platforms.length > 0 &&
      !post.platforms.some(p => p === filters.platform)) {
      return false;
    }

    const postHashtags = post.hashtags || [];
    const postContent = post.content || '';

    const matchesHashtag = !filters.hashtag ||
      postHashtags.some(tag =>
        (tag || '').toLowerCase().includes(filters.hashtag.toLowerCase())
      );

    const matchesSearch = !searchQuery ||
      postContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      postHashtags.some(tag =>
        (tag || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

    let matchesDateRange = true;
    if (filters.dateRange.start || filters.dateRange.end) {
      let postDate;
      if (post.status === 'published' && post.publishedAt) {
        postDate = new Date(post.publishedAt);
      } else if (post.scheduledDate) {
        postDate = new Date(post.scheduledDate);
      } else {
        postDate = new Date(post.createdAt);
      }

      if (filters.dateRange.start) {
        matchesDateRange = matchesDateRange && postDate >= new Date(filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        matchesDateRange = matchesDateRange && postDate <= new Date(filters.dateRange.end);
      }
    }

    return matchesHashtag && matchesSearch && matchesDateRange;
  });

  const platformCards = filteredPosts.flatMap(post => {
    const platformsArray = Array.isArray(post.platforms) && post.platforms.length > 0 ?
      post.platforms : ['instagram'];

    if (filters.platform !== 'all') {
      return platformsArray
        .filter(platform => platform?.toLowerCase() === filters.platform?.toLowerCase())
        .map(platform => ({
          post,
          platform,
          key: `${post._id || post.id}-${platform}`
        }));
    }

    return platformsArray.map(platform => ({
      post,
      platform,
      key: `${post._id || post.id}-${platform}`
    }));
  });

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
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Posts</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filters.platform}
            onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>

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

          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All
          </button>
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

      {/* Posts Grid/List */}
      <div className="posts-content">
        <div className={`posts-container ${viewMode}`}>
          {platformCards.length === 0 ? (
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
            platformCards.map(({ post, platform, key }) => (
              <PlatformPostCard
                key={key}
                post={post}
                platform={platform}
                onClick={() => onPostClick(post)}
                onEdit={() => onEditPost(post)}
                onDelete={() => onDeletePost(post)} // ✅ Pass entire post object
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};





// ✅ Keep your existing MediaLibrarySubPage and other components unchanged
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
  // ... (keep your existing MediaLibrarySubPage implementation)
  // I'll keep the existing implementation from your original code
const clearFilters = () => {
    setFilters({
      type: 'all',
      folder: 'all',
      tags: '',
      sort: 'newest',
      search: '',
      page: 1
    });
  };

  const filteredMedia = media.filter(mediaItem => {
    if (!mediaItem) return false;

    const matchesType = filters.type === 'all' ||
      (filters.type === 'image' && mediaItem.fileType?.startsWith('image')) ||
      (filters.type === 'video' && mediaItem.fileType?.startsWith('video'));

    const mediaFolder = mediaItem.folder || 'general';
    const matchesFolder = filters.folder === 'all' || mediaFolder === filters.folder;

    const matchesTags = !filters.tags ||

      (mediaItem.tags && Array.isArray(mediaItem.tags) && 
       mediaItem.tags.some(tag =>
         tag && tag.toLowerCase().includes(filters.tags.toLowerCase())
       ));
    
    // ✅ FIXED: Include originalName in search

    const matchesSearch = !filters.search ||
      (mediaItem.filename && mediaItem.filename.toLowerCase().includes(filters.search.toLowerCase())) ||
      (mediaItem.originalName && mediaItem.originalName.toLowerCase().includes(filters.search.toLowerCase())) || // ✅ Added this line
      (mediaItem.altText && mediaItem.altText.toLowerCase().includes(filters.search.toLowerCase())) ||
      (mediaItem.tags && Array.isArray(mediaItem.tags) &&
        mediaItem.tags.some(tag =>
          tag && tag.toLowerCase().includes(filters.search.toLowerCase())
        ));

    return matchesType && matchesFolder && matchesTags && matchesSearch;
  });

  const sortedMedia = [...filteredMedia].sort((a, b) => {
    switch (filters.sort) {
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'mostUsed':
        return (b.usage?.timesUsed || 0) - (a.usage?.timesUsed || 0);
      case 'newest':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

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
      <div className="media-control-bar">
        <div className="control-left">
          <button className="btn-primary" onClick={onUpload}>
            <Upload size={18} />
            Upload New Media
          </button>
        </div>
        <div className="filters-bar">
          <div className="search-section">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search media..."
                value={filters.search || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                }}
              />
            </div>
          </div>

          <select
            value={filters.type}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, type: e.target.value }));
            }}
          >
            <option value="all">All Types ({media.length})</option>
            <option value="image">
              Images ({media.filter(m => m.fileType?.startsWith('image')).length})
            </option>
            <option value="video">
              Videos ({media.filter(m => m.fileType?.startsWith('video')).length})
            </option>
          </select>

          <select
            value={filters.folder}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, folder: e.target.value }));
            }}
          >
            <option value="all">All Folders</option>
            <option value="general">General</option>
            <option value="posts">Posts</option>
            <option value="profile">Profile</option>
            <option value="campaigns">Campaigns</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, sort: e.target.value }));
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostUsed">Most Used</option>
          </select>

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

      <div className="media-content">
        <div className={`media-container ${viewMode}`}>
          {sortedMedia.length === 0 ? (
            <div className="empty-state">
              <Image size={48} />
              <h3>No media found</h3>
              <p>
                {(filters.type !== 'all' || filters.folder !== 'all' || filters.tags || filters.search)
                  ? 'Try adjusting your filters to see more results'
                  : 'Upload your first media file to get started!'
                }
              </p>
              {(filters.type === 'all' && filters.folder === 'all' && !filters.tags && !filters.search) && (
                <button onClick={onUpload} className="btn-primary">
                  <Upload size={18} />
                  Upload Your First Media
                </button>
              )}
            </div>
          ) : (
            sortedMedia.map(mediaItem => (
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
  );
};

// ✅ Keep all your existing component implementations for:
// - MediaCard
// - MediaUploadModal  
// - MediaPreviewModal

// Media Card Component
const MediaCard = ({ media, onClick }) => {
  const isVideo = media.fileType?.startsWith('video');
  const humanSize = media.humanSize || `${Math.round(media.size / 1024)}KB`;

  // ✅ FIXED: Prioritize originalName over processed filename
  const displayName = media.originalName || media.filename || 'Untitled';

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
          <img src={media.url} alt={media.altText || displayName} />
        )}
        <div className="media-type-indicator">
          {isVideo ? <Play size={12} /> : <Image size={12} />}
        </div>
      </div>

      <div className="media-info">
        {/* ✅ FIXED: Show original filename instead of processed filename */}
        <div className="media-filename" title={displayName}>
          {displayName.length > 20 
            ? `${displayName.substring(0, 20)}...` 
            : displayName
          }
        </div>
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

  // ✅ FIXED: Prioritize originalName for display
  const displayName = media.originalName || media.filename || 'Untitled';

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      onDelete(media._id || media.id);
    }
  };

  const handleDownload = async () => {
    try {
      // Fetch the file as a blob
      const response = await fetch(media.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      // ✅ FIXED: Use original name for download
      link.download = media.originalName || media.filename || `media-${media._id || media.id}`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
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
              <img src={media.url} alt={media.altText || displayName} className="preview-image" />
            )}
          </div>

          <div className="media-metadata">
            <div className="metadata-section">
              <h4>File Information</h4>
              <div className="metadata-grid">
                {/* ✅ FIXED: Show original filename in metadata */}
                <div className="metadata-item">
                  <label>Filename:</label>
                  <span title={displayName}>{displayName}</span>
                </div>
                {/* ✅ OPTIONAL: Show Cloudinary filename separately */}
                {media.originalName && media.filename !== media.originalName && (
                  <div className="metadata-item">
                    <label>Storage Name:</label>
                    <span className="storage-name">{media.filename}</span>
                  </div>
                )}
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

            {/* {media.usage && (
              <div className="metadata-section">
                <h4>Usage Statistics</h4>
                <p>Used in {media.usage.timesUsed || 0} posts</p>
                {media.usage.lastUsed && (
                  <p>Last used: {new Date(media.usage.lastUsed).toLocaleDateString()}</p>
                )}
              </div>
            )} */}
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-left">
            <button className="btn-secondary" onClick={handleDownload}>
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
