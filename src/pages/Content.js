import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Image,
  Plus,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
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
  AlertTriangle,
  Maximize2,
  ExpandIcon,
  InfoIcon
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useDashboardData,
  useMedia
} from '../hooks/useApi';
import CreatePost from '../components/CreatePost';
import PostDetailModal from '../components/PostDetailModal';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import apiClient from '../utils/api';
import './Content.css';
import Loader from '../components/common/Loader';

// Create Post Button component that uses Dashboard's approach
const CreatePostButton = ({ onPostCreated, refreshPosts }) => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [notification, setNotification] = useState(null);

  const connectedPlatforms = ["instagram", "facebook", "linkedin"];
  const platformLabels = {
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    twitter: "Twitter",
    youtube: "YouTube",
  };

  const {
    createPost: apiCreatePost,
  } = useDashboardData();

  const handleCreatePost = async (postData) => {
    try {
      console.log('Creating post with data:', postData);
      const response = await apiCreatePost(postData);
      setNotification({ type: 'success', message: SUCCESS_MESSAGES.POST_CREATED });
      setShowCreatePost(false);

      if (refreshPosts) {
        await refreshPosts();
      }

      if (onPostCreated) {
        onPostCreated(response);
      }

      return response;
    } catch (error) {
      console.error('Post creation failed:', error);
      setNotification({ type: 'error', message: error.message || ERROR_MESSAGES.SERVER_ERROR });
      throw error;
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <>
      <button className="btn-primary" onClick={() => setShowCreatePost(true)}>
        <Plus size={18} />
        Create Post
      </button>

      <CreatePost
        isOpen={showCreatePost}
        onClose={() => {
          setShowCreatePost(false);
          setSelectedPost(null);
        }}
        onPostCreated={handleCreatePost}
        initialData={selectedPost}
      />

      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}
    </>
  );
};

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
  const [deleteFromInsta, setDeleteFromInsta] = useState(false);
  const [deleteFromYouTube, setDeleteFromYouTube] = useState(false); // Add this
const [deleteFromFacebook, setDeleteFromFacebook] = useState(false);

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
  const { createPost: apiCreatePost } = useDashboardData();
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


  // ✅ Create post function using apiCreatePost from dashboard hook
  const handleCreatePost = async (postData) => {
    try {
      const response = await apiCreatePost(postData);
      setNotification({ type: 'success', message: SUCCESS_MESSAGES.POST_CREATED });
      setShowCreatePost(false);

      await fetchAllPosts();
      return response;
    } catch (error) {
      setNotification({ type: 'error', message: error.message || ERROR_MESSAGES.SERVER_ERROR });
      throw error;
    }
  };

  // ✅ Update post function for editing
  const handleUpdatePost = async (postId, postData) => {
    try {


      const response = await apiClient.request(`/api/posts/${postId}`, {
        method: 'PUT',
        data: postData  // Use data instead of body
      });

      if (response && (response.success || response.data || response._id)) {
        setNotification({
          type: 'success',
          message: response.message || 'Post updated successfully'
        });

        setShowCreatePost(false);
        setSelectedPost(null);

        await fetchAllPosts();

        return response.data || response;
      } else {
        throw new Error('Update response indicated failure');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to update post'
      });
      throw error;
    }
  };

  // ✅ Delete post with confirmation
const handleDeletePost = async (postId) => {
  try {
    console.log('🗑️ Starting post deletion process for ID:', postId);
    console.log('📊 Post to delete details:', {
      id: postToDelete?._id || postToDelete?.id,
      platforms: postToDelete?.platforms,
      platformPosts: postToDelete?.platformPosts?.map(p => ({
        platform: p.platform,
        status: p.status,
        id: p.platformPostId,
        accountId: p.accountId
      }))
    });

    // First delete from database
    console.log('🗑️ Deleting post from database...');
    await apiClient.request(`/api/posts/${postId}`, { method: 'DELETE' });
    console.log('✅ Post deleted from database successfully');
    
// Handle Instagram deletion if checked
if (deleteFromInsta) {
  const instagramPosts = postToDelete?.platformPosts?.filter(
    post => post.platform === 'instagram' && post.status === 'published'
  );
  
  console.log(`📸 Found ${instagramPosts?.length || 0} Instagram posts to delete`);
  let instagramDeletionFailed = false;
  
  for (const post of instagramPosts || []) {
    try {
      console.log(`🗑️ Attempting to delete Instagram post: ${post.platformPostId}`);
      await apiClient.request(`/api/auth/instagram/posts/instagram/${post.platformPostId}`, { method: 'DELETE' });
      console.log(`✅ Deleted Instagram post: ${post.platformPostId}`);
    } catch (error) {
      console.error(`❌ Failed to delete Instagram post ${post.platformPostId}:`, error);
      instagramDeletionFailed = true;
    }
  }
  
  // Always show this notification for Instagram posts since deletion usually fails
  if (instagramDeletionFailed) {
    setNotification({ 
      type: 'warning', 
      message: 'Post deleted from the app, but Instagram posts need to be deleted manually from the Instagram app'
    });
  }
}
    
    // Handle Facebook deletion if checked
    if (deleteFromFacebook) {
      const facebookPosts = postToDelete?.platformPosts?.filter(
        post => post.platform === 'facebook' && post.status === 'published'
      );
      
      console.log(`📘 Found ${facebookPosts?.length || 0} Facebook posts to delete`);
      
      for (const post of facebookPosts || []) {
        try {
          console.log(`🗑️ Deleting Facebook post: ${post.platformPostId}`);
          // FIXED: Correct endpoint path based on router configuration
          await apiClient.request(`/api/auth/instagram/posts/facebook/${post.platformPostId}`, { method: 'DELETE' });
          console.log(`✅ Deleted Facebook post: ${post.platformPostId}`);
        } catch (error) {
          console.error(`❌ Failed to delete Facebook post ${post.platformPostId}:`, error);
          console.error('Error details:', error.response?.data);
        }
      }
    }
    
    // Handle YouTube deletion if checked (unchanged)
    if (deleteFromYouTube) {
      const youtubePosts = postToDelete?.platformPosts?.filter(
        post => post.platform === 'youtube' && post.status === 'published'
      );
      
      console.log(`📺 Found ${youtubePosts?.length || 0} YouTube videos to delete`);
      
      for (const post of youtubePosts || []) {
        try {
          console.log(`🗑️ Attempting to delete YouTube video:`, {
            videoId: post.platformPostId,
            accountId: post.accountId,
            url: post?.additionalInfo?.url || 'N/A'
          });
          
          const deleteResponse = await apiClient.request(
            `/api/auth/youtube/videos/${post.platformPostId}`, 
            { method: 'DELETE' }
          );
          
          console.log(`✅ YouTube API response:`, deleteResponse?.data);
          console.log(`✅ Deleted YouTube video: ${post.platformPostId}`);
        } catch (error) {
          console.error(`❌ Failed to delete YouTube video ${post.platformPostId}:`, error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          
          // Show specific error for YouTube deletion
          setNotification({ 
            type: 'warning', 
            message: `Post deleted, but YouTube video deletion failed: ${error.response?.data?.error || error.message}` 
          });
        }
      }
    } else {
      console.log('📺 YouTube deletion not requested (checkbox not checked)');
    }
    
    setNotification({ type: 'success', message: 'Post deleted successfully' });
    setShowDeleteConfirm(false);
    setPostToDelete(null);
    setDeleteFromInsta(false);
    setDeleteFromFacebook(false);
    setDeleteFromYouTube(false);
    await fetchAllPosts();
  } catch (error) {
    console.error('❌ Post deletion error:', error);
    console.error('Error response:', error.response?.data);
    setNotification({ type: 'error', message: error.message || 'Failed to delete post' });
  }
};

  // ✅ Show delete confirmation
const showDeleteConfirmation = async (post) => {
  try {
    // Get the complete post data if we don't have platformPosts already
    if (!post.platformPosts || post.platformPosts.length === 0) {
      console.log('📊 Fetching complete post data for deletion...');
      const postId = post._id || post.id;
      const response = await apiClient.request(`/api/posts/${postId}`);
      
      if (response && (response.data || response._id)) {
        // Use the complete post data
        const completePost = response.data || response;
        console.log('📊 Complete post data fetched:', {
          id: completePost._id || completePost.id,
          platforms: completePost.platforms,
          hasPlatformPosts: Boolean(completePost.platformPosts),
          platformPostsCount: completePost.platformPosts?.length || 0
        });
        
        setPostToDelete(completePost);
      } else {
        console.warn('⚠️ Could not fetch complete post data, using partial data');
        setPostToDelete(post);
      }
    } else {
      setPostToDelete(post);
    }
    
    setShowDeleteConfirm(true);
  } catch (error) {
    console.error('❌ Error preparing post for deletion:', error);
    // Fallback to using the existing post data
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  }
};

  // ✅ Handle post click
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handleEditPost = async (post) => {
    try {
      const postId = post._id || post.id;
      const response = await apiClient.request(`/api/posts/${postId}`);

      if (response && response.data) {
        setSelectedPost(response.data);
        setShowPostDetail(false);
        setShowCreatePost(true);
      }
      else if (response && response._id) {
        setSelectedPost(response);
        setShowPostDetail(false);
        setShowCreatePost(true);
      }
      else {
        console.error("Unexpected API response structure:", response);
        throw new Error('Post data not found in API response');
      }
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
          <p>
            A complete library of images, videos, and post media powering your content.
          </p>
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
            onDeletePost={showDeleteConfirmation}
            createPostButton={<CreatePostButton refreshPosts={fetchAllPosts} />}
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

      {/* ✅ Create Post Modal - Using the Dashboard approach */}
      <CreatePost
        isOpen={showCreatePost}
        onClose={() => {
          setShowCreatePost(false);
          setSelectedPost(null);
        }}
        onPostCreated={selectedPost
          ? (postData) => handleUpdatePost(selectedPost._id || selectedPost.id, postData)
          : handleCreatePost
        }
        initialData={selectedPost}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
  post={selectedPost}
  isOpen={showPostDetail}
  onClose={() => setShowPostDetail(false)}
  onEdit={handleEditPost}
  onDelete={() => {
    setShowPostDetail(false);
    showDeleteConfirmation(selectedPost);
  }}
/>

      {/* Delete Confirmation Modal */}
    <DeleteConfirmationModal
  deleteFromInsta={deleteFromInsta}
  setDeleteFromInsta={setDeleteFromInsta}
  deleteFromFacebook={deleteFromFacebook}
  setDeleteFromFacebook={setDeleteFromFacebook}
  deleteFromYouTube={deleteFromYouTube}
  setDeleteFromYouTube={setDeleteFromYouTube}
  isOpen={showDeleteConfirm}
  post={postToDelete}
  onClose={() => {
    setShowDeleteConfirm(false);
    setPostToDelete(null);
    setDeleteFromInsta(false);
    setDeleteFromFacebook(false);
    setDeleteFromYouTube(false);
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

// Updated PostsSubPage Component with CreatePostButton component
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
  onDeletePost,
  createPostButton // New prop to accept the CreatePostButton component
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

  const { user } = useDashboardData();


  const getPlatformOptions = () => {
    const baseOptions = [
      { value: 'all', label: 'All Platforms', icon: '' }
    ];

    if (!user?.connectedAccounts) return baseOptions;

    const connectedPlatforms = user.connectedAccounts.map(account => account.platform);

    if (connectedPlatforms.includes('instagram')) {
      baseOptions.push({ value: 'instagram', label: 'Instagram', icon: '' });
    }
    if (connectedPlatforms.includes('facebook')) {
      baseOptions.push({ value: 'facebook', label: 'Facebook', icon: '' });
    }
    if (connectedPlatforms.includes('twitter')) {
      baseOptions.push({ value: 'twitter', label: 'Twitter', icon: '' });
    }

    if (connectedPlatforms.includes('youtube')) {
      baseOptions.push({ value: 'youtube', label: 'YouTube', icon: '' });
    }

    if (connectedPlatforms.includes('linkedin')) {
      baseOptions.push({ value: 'linkedin', label: 'LinkedIn', icon: '' });
    }

    return baseOptions;
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
        const startDate = new Date(filters.dateRange.start);
        startDate.setHours(0, 0, 0, 0); // Start of the day
        matchesDateRange = matchesDateRange && postDate >= startDate;
      }

      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999); // End of the day - INCLUSIVE
        matchesDateRange = matchesDateRange && postDate <= endDate;
      }
    }
    return matchesHashtag && matchesSearch && matchesDateRange;
  });

  const displayPosts = filteredPosts;

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

          {/* <select
            value={filters.platform}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, platform: e.target.value }))
            }
          >
            <option value="all">All Platforms</option>
            {connectedPlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platformLabels[platform]}
              </option>
            ))}
          </select> */}


          <select
            value={filters.platform}
            onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
          >
            {getPlatformOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="date-range-dropdown">
            <span className="date-label">Date Range :</span>
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
          {/* <div className="view-controls">
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
          </div> */}

          {/* Use the CreatePostButton component instead of a simple button */}
          {createPostButton || (
            <button className="btn-primary" onClick={onCreatePost}>
              <Plus size={18} />
              Create Post
            </button>
          )}
        </div>
      </div>

      {/* Posts Grid/List */}
      <div className="posts-content">
        <div className={`posts-container ${viewMode}`}>
          {displayPosts.length === 0 ? (
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
                <>
                  {createPostButton || (
                    <button onClick={onCreatePost} className="btn-primary">
                      <Plus size={18} />
                      Create Your First Post
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            displayPosts.map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onClick={() => onPostClick(post)}
                onEdit={() => onEditPost(post)}
                onDelete={() => onDeletePost(post)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// PostCard Component (unchanged)
const PostCard = ({ post, onClick, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [imageAspectRatios, setImageAspectRatios] = useState(new Map());

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



const platforms = Array.isArray(post.platforms) && post.platforms.length > 0 
  ? post.platforms 
  : (post.platformPosts?.map(p => p.platform) || ['instagram']); // Include platformPosts check

  const uniquePlatforms = [...new Set(platforms)];


  // Platform icon mapping
  const getPlatformIcon = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return Instagram;
    case 'facebook': return Facebook;
    case 'twitter': return Twitter;
    case 'youtube': return Youtube;  // ⬅️ updated
    case 'linkedin': return Linkedin;
    default: return FileText;
  }
};


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

  // Helper function to detect if URL is a video
  const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|m4v|3gp|mkv)(\?.*)?$/i;
    return videoExtensions.test(url);
  };

  // Get all media items
  const getAllMedia = () => {
    const allMedia = [];

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

  const handleImageError = (imageIndex) => {
    setImageLoadErrors(prev => new Set([...prev, imageIndex]));
  };

  const handleImageLoad = (e, imageIndex) => {
    const img = e.target;
    const container = img.parentNode;
    container.classList.add('loaded');

    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let aspectClass = '';

    if (aspectRatio > 2.5) {
      aspectClass = 'wide';
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
    } else if (aspectRatio < 0.6) {
      aspectClass = 'tall';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center top';
    } else {
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
    }

    setImageAspectRatios(prev => new Map(prev.set(imageIndex, aspectClass)));
    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageIndex);
      return newSet;
    });
  };

  const getMediaLayoutClass = (count) => {
    if (count === 1) return 'single-media';
    if (count === 2) return 'two-media';
    if (count === 3) return 'three-media';
    return 'four-plus-media';
  };

  const mediaItems = getAllMedia();
  const displayMedia = mediaItems.slice(0, 4); // Show max 4 media items
  const layoutClass = getMediaLayoutClass(displayMedia.length);

  return (
    <div
      className="unified-post-card"
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

      {showActions && (
        <div className="shw-exp-icon">
          <Maximize2 size={16} />
        </div>
      )}

      {/* Post Header with Multiple Platforms */}
      <div className="post-header">
        <div className="post-schedule">
          <Clock size={16} />
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

        {/* Platform Icons */}

       <div className="post-platforms">
  {uniquePlatforms.map((platform, index) => {
    const PlatformIcon = getPlatformIcon(platform);
    return (
      <div 
        key={index} 
        className={`platform-icon ${platform.toLowerCase()}`}
        title={platform}
      >
        <PlatformIcon size={20} />
      </div>
    );
  })}
</div>
      </div>

      {/* Media Section */}
      {displayMedia.length > 0 && (
        <div className={`preview-images ${layoutClass}`}>
          {(() => {
            const media = displayMedia[0];
            if (!media) return null; // handle empty array

            if (media.type === 'image' && imageLoadErrors.has(0)) {
              return null;
            }

            const aspectClass = imageAspectRatios.get(0) || '';

            return (
              <div className={`media-item ${aspectClass}`}>
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
                      onError={() => console.error('Video failed to load:', media.url)}
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
                    loading="lazy"
                    onError={() => handleImageError(0)}
                    onLoad={(e) => handleImageLoad(e, 0)}
                    data-aspect={aspectClass}
                  />
                )}
              </div>
            );
          })()}

          {/* {displayMedia.map((media, index) => {
            if (media.type === 'image' && imageLoadErrors.has(index)) {
              return null;
            }

            const aspectClass = imageAspectRatios.get(index) || '';

            return (
              <div key={index} className={`media-item ${aspectClass}`}>
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
                      onError={() => console.error('Video failed to load:', media.url)}
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
                    loading="lazy"
                    onError={() => handleImageError(index)}
                    onLoad={(e) => handleImageLoad(e, index)}
                    data-aspect={aspectClass}
                  />
                )}
              </div>
            );
          }).filter(Boolean)} */}

          {mediaItems.length > 4 && (
            <div className="image-count">
              +{mediaItems.length - 4}
            </div>
          )}

          {displayMedia.length === 0 && (post.images?.length > 0 || post.videos?.length > 0 || post.media?.length > 0) && (
            <div className="preview-image-container">
              <div className="image-error">
                <FileText size={20} color="#999" />
                <span style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  Media unavailable
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className='postdesc'>
        {/* Post Content */}
        <div className="preview-text">
          <p>{postContent.substring(0, 80)}{postContent.length > 80 ? '…' : ''}</p>
        </div>

        {/* Hashtags */}
        <div className="preview-hashtags">
          {post.hashtags?.slice(0, 3).map((hashtag, i) => (
            <span key={i} className="hashtag">{hashtag}</span>
          ))}
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

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  postTitle, 
  post, 
  deleteFromInsta, 
  setDeleteFromInsta,
  deleteFromYouTube,
  setDeleteFromYouTube,
  deleteFromFacebook,    // Add this new prop
  setDeleteFromFacebook  // Add this new prop
}) => {
  if (!isOpen) return null;

  // Check if this post has YouTube videos
  const youtubeVideos = post?.platformPosts?.filter(
    platformPost => platformPost.platform === 'youtube' && platformPost.status === 'published'
  ) || [];
  
  const hasYouTubePost = youtubeVideos.length > 0;
  
  // Check if this post has Instagram posts
  const instagramPosts = post?.platformPosts?.filter(
    platformPost => platformPost.platform === 'instagram' && platformPost.status === 'published'
  ) || [];
  
  const hasInstagramPost = instagramPosts.length > 0;
  
  // Check if this post has Facebook posts
  const facebookPosts = post?.platformPosts?.filter(
    platformPost => platformPost.platform === 'facebook' && platformPost.status === 'published'
  ) || [];
  
  const hasFacebookPost = facebookPosts.length > 0;
  
  // Log if no platform posts were found
  if (!post?.platformPosts || post.platformPosts.length === 0) {
    console.log('⚠️ No platform posts found in this post object:', post);
  }

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
              <Trash2 size={28} />
            </div>
          </div>

          <p className="warning-description">
            Are you sure you want to delete this post?
          </p>

          <div className="delete-extra-options">
     {hasInstagramPost && (
  <div className="platform-deletion-option">
    <div className="deletion-option instagram disabled">
      <span className="deletion-label">
        <Instagram size={16} />
        Instagram
      </span>
      <div className="deletion-note">
        <InfoIcon size={14} />
        <small>
          Instagram posts must be deleted manually through the Instagram app due to API limitations.
        </small>
      </div>
    </div>
  </div>
)}
            
            {hasFacebookPost && (
              <label id='ctfb'>
                <input
                  type="checkbox"
                  checked={deleteFromFacebook}
                  onChange={(e) => setDeleteFromFacebook(e.target.checked)}
                />
                &nbsp; Delete from Facebook also
              </label>
            )}
            
            {hasYouTubePost && (
              <label id='ctyoutube'>
                <input
                  type="checkbox"
                  checked={deleteFromYouTube}
                  onChange={(e) => setDeleteFromYouTube(e.target.checked)}
                />
                &nbsp; Delete from YouTube also {youtubeVideos.length > 1 ? `(${youtubeVideos.length} videos)` : ''}
              </label>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className='btnflx'>
            <button className="btn-danger" onClick={onConfirm}>
              <Trash2 size={16} />
              Delete Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Media Library Subpage Component
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

    const matchesSearch = !filters.search ||
      (mediaItem.filename && mediaItem.filename.toLowerCase().includes(filters.search.toLowerCase())) ||
      (mediaItem.originalName && mediaItem.originalName.toLowerCase().includes(filters.search.toLowerCase())) ||
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
          <button className="btn-primary" onClick={onUpload}>
            <Upload size={18} />
            Upload New Media
          </button>
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

// Media Card Component
const MediaCard = ({ media, onClick }) => {
  const isVideo = media.fileType?.startsWith('video');
  const humanSize = media.humanSize || `${Math.round(media.size / 1024)}KB`;

  // Prioritize originalName over processed filename
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedCount, setUploadedCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]); // ✅ NEW: Track validation errors
  const fileInputRef = useRef(null);

  // ✅ NEW: Get file size limits from backend (you should fetch this from your API)
  const FILE_SIZE_LIMITS = {
    video: {
      maxSize: 250 * 1024 * 1024, // 100MB to match backend
      maxSizeMB: 250
    },
    image: {
      maxSize: 50 * 1024 * 1024, // 10MB to match backend
      maxSizeMB: 50
    }
  };

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setIsUploading(false);
      setUploadProgress({});
      setUploadedCount(0);
      setValidationErrors([]);
    }
  }, [isOpen]);

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
      const files = Array.from(e.dataTransfer.files);
      validateFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      validateFiles(files);
    }
  };

  const validateFiles = (files) => {
    const validFiles = [];
    const errors = [];

    console.log('🔍 Validating files:', files.length);

    files.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      console.log(`📁 File: ${file.name}`);
      console.log(`   Type: ${file.type}`);
      console.log(`   Size: ${formatFileSize(file.size)} (${file.size} bytes)`);
      console.log(`   Is Video: ${isVideo}, Is Image: ${isImage}`);

      if (!isImage && !isVideo) {
        errors.push({
          fileName: file.name,
          reason: 'Unsupported file type. Only images and videos are allowed.'
        });
        console.log(`   ❌ Rejected: Unsupported file type`);
        return;
      }

      // ✅ UPDATED: Use backend limits
      const limits = isVideo ? FILE_SIZE_LIMITS.video : FILE_SIZE_LIMITS.image;
      const fileTypeLabel = isVideo ? 'Video' : 'Image';

      console.log(`   Max allowed size: ${limits.maxSizeMB}MB (${limits.maxSize} bytes)`);
      console.log(`   File size check: ${file.size} > ${limits.maxSize} = ${file.size > limits.maxSize}`);

      if (file.size > limits.maxSize) {
        errors.push({
          fileName: file.name,
          reason: `${fileTypeLabel} file too large. Maximum size is ${limits.maxSizeMB}MB, your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        });
        console.log(`   ❌ Rejected: File too large`);
        return;
      }

      validFiles.push(file);
      console.log(`   ✅ Accepted`);
    });

    setValidationErrors(errors);
    setSelectedFiles(validFiles);

    console.log(`✅ Valid files: ${validFiles.length}`);
    console.log(`❌ Invalid files: ${errors.length}`);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadedCount(0);

    // Initialize progress for each file
    const initialProgress = {};
    selectedFiles.forEach((file, index) => {
      initialProgress[index] = { progress: 0, status: 'pending', name: file.name };
    });
    setUploadProgress(initialProgress);

    try {
      console.log('🚀 Starting upload for', selectedFiles.length, 'files');

      // Create FormData
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        console.log(`📤 Adding file ${index + 1}: ${file.name} (${formatFileSize(file.size)})`);
        formData.append('files', file);
      });

      // Add any additional data
      formData.append('folder', 'general');

      // Log FormData contents
      console.log('📋 FormData entries:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`   ${pair[0]}: File(${pair[1].name}, ${formatFileSize(pair[1].size)})`);
        } else {
          console.log(`   ${pair[0]}: ${pair[1]}`);
        }
      }

      // Simulate progress for demo (remove this in production)
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress(prev => ({
          ...prev,
          [i]: { ...prev[i], status: 'uploading' }
        }));

        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => ({
            ...prev,
            [i]: { ...prev[i], progress }
          }));
        }

        setUploadProgress(prev => ({
          ...prev,
          [i]: { ...prev[i], status: 'completed', progress: 100 }
        }));

        setUploadedCount(prev => prev + 1);
      }

      // Call the actual upload function
      console.log('📡 Calling onUpload function...');
      const response = await onUpload(selectedFiles);
      console.log('✅ Upload response:', response);

      // Close modal after successful upload
      setTimeout(() => {
        onClose();
        setSelectedFiles([]);
        setIsUploading(false);
        setUploadProgress({});
        setUploadedCount(0);
        setValidationErrors([]);
      }, 1000);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      console.error('Error details:', error.response?.data || error.message);

      setIsUploading(false);

      // Mark all as failed
      setUploadProgress(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = { ...updated[key], status: 'failed' };
        });
        return updated;
      });

      // Show error to user
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAreaClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (file) => {
    if (file.type.startsWith('video/')) {
      return <Play size={16} className="file-type-icon video" />;
    }
    return <Image size={16} className="file-type-icon image" />;
  };

  // ✅ NEW: Remove a file from selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {isUploading ? 'Uploading Media...' : 'Upload Media'}
          </h3>
          {!isUploading && (
            <button className="modal-close" onClick={handleClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body">
          {!isUploading ? (
            // File Selection UI
            <>
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
                <div className="upload-specs">
                  <small>📷 Images: PNG, JPG, GIF up to {FILE_SIZE_LIMITS.image.maxSizeMB}MB</small>
                  <small>🎥 Videos: MP4, MOV, AVI up to {FILE_SIZE_LIMITS.video.maxSizeMB}MB</small>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="file-input"
                />
              </div>

              {/* ✅ NEW: Show validation errors */}
              {validationErrors.length > 0 && (
                <div className="validation-errors">
                  <h4 className="error-title">
                    <AlertTriangle size={16} />
                    The following files were rejected:
                  </h4>
                  <div className="error-list">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="error-item">
                        <span className="error-filename">{error.fileName}:</span>
                        <span className="error-reason">{error.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  <h4>Selected Files ({selectedFiles.length})</h4>
                  <div className="file-list">
                    {selectedFiles.map((file, index) => {
                      const isVideo = file.type.startsWith('video/');
                      const limits = isVideo ? FILE_SIZE_LIMITS.video : FILE_SIZE_LIMITS.image;
                      const sizePercent = (file.size / limits.maxSize) * 100;
                      const sizeWarning = sizePercent > 80;

                      return (
                        <div key={index} className={`file-item ${sizeWarning ? 'size-warning' : ''}`}>
                          <div className="file-info">
                            {getFileTypeIcon(file)}
                            <span className="file-name">{file.name}</span>
                          </div>
                          <div className="file-meta">
                            <span className={`file-size ${sizeWarning ? 'warning' : ''}`}>
                              {formatFileSize(file.size)}
                              {sizeWarning && ` (${Math.round(sizePercent)}% of limit)`}
                            </span>
                            <button
                              className="remove-file"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              title="Remove file"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Upload Progress UI
            <div className="upload-progress-container">
              {/* ... existing upload progress code ... */}
            </div>
          )}
        </div>

        {!isUploading && (
          <div className="modal-footer">
            <button className="btn-secondary" onClick={handleClose}>
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
        )}
      </div>
    </div>
  );
};


// Media Preview Modal Component
const MediaPreviewModal = ({ media, isOpen, onClose, onDelete }) => {
  if (!isOpen || !media) return null;

  const isVideo = media.fileType?.startsWith('video');
  const humanSize = media.humanSize || `${Math.round(media.size / 1024)}KB`;

  // Prioritize originalName for display
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
      // Use original name for download
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
      <div className="modal-content preview-modal xyz" onClick={(e) => e.stopPropagation()}>
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
                <div className="metadata-item">
                  <label>Filename:</label>
                  <span title={displayName}>{displayName}</span>
                </div>
                <div className="metadata-item">
                  <label>Size:</label>
                  <span>{humanSize}</span>
                </div>
                {media.dimensions && (
                  <div className="metadata-item">
                    <label>Dimensions:</label>
                    <span>{media.dimensions.width} × {media.dimensions.height}</span>
                  </div>
                )}
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
