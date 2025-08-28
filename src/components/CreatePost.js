//before changing entire code showing 6 account including personal profile 

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Image,
  Calendar,
  Instagram,
  Twitter,
  Facebook,
  Upload,
  Eye,
  Send,
  Clock,
  Hash,
  AtSign,
  Wand2,
  Sparkles,
  RefreshCw,
  Copy,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  FolderOpen, // Add this new import
  Check,
  Search,
  Video, // ✅ Add Video icon
  Play,  // ✅ Add Play icon
  FileText
} from 'lucide-react';
import { useMedia } from '../hooks/useApi';
import apiClient from '../utils/api';
import { PLATFORMS, PLATFORM_CONFIGS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import './CreatePost.css';
import Loader from '../components/common/Loader';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const CreatePost = ({ isOpen, onClose, onPostCreated, connectedAccounts, initialData }) => {
  const { uploadMedia } = useMedia();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);


  const [postData, setPostData] = useState({
    content: '',
    platforms: [],
    selectedAccounts: {}, // { platformId: [accountId1, accountId2, ...] }
    scheduledDate: '',
    scheduledTime: '',
    images: [],
    hashtags: '',
    mentions: '',
    metadata: {
      category: 'other'
    }
  });

  const [activeTab, setActiveTab] = useState('compose');
  const [isScheduled, setIsScheduled] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch user profile and connected accounts on mount
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    // ✅ Enhanced file validation
    const validFiles = [];
    const invalidFiles = [];

    Array.from(files).forEach(file => {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        invalidFiles.push({ file, reason: 'Unsupported file type' });
        return;
      }

      // Check file size - 250MB for videos, 50MB for images
      const maxSize = isVideo ? 250 * 1024 * 1024 : 50 * 1024 * 1024; // 250MB for video, 50MB for images
      if (file.size > maxSize) {
        const maxSizeText = isVideo ? '250MB' : '50MB';
        invalidFiles.push({ 
          file, 
          reason: `File too large (max ${maxSizeText})` 
        });
        return;
      }

      validFiles.push(file);
    });

    // Show warnings for invalid files
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(({ file, reason }) => 
        `${file.name}: ${reason}`
      ).join('\n');
      showToast(`Some files were skipped:\n${errorMessages}`, 'error', 5000);
    }

    if (validFiles.length === 0) return;

    setUploadingFiles(true);
    setError(null);

    try {
      // For immediate preview, create local URLs
      const localPreviews = validFiles.map(file => ({
        url: URL.createObjectURL(file),
        altText: file.name,
        isLocal: true,
        fileType: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size
      }));

      setPostData(prev => ({
        ...prev,
        images: [...prev.images, ...localPreviews] // Note: keeping "images" for backward compatibility, but it now includes videos
      }));

      const fileTypeText = validFiles.length === 1 
        ? (validFiles[0].type.startsWith('video/') ? 'video' : 'image')
        : 'files';
      
      showToast(`Uploading ${validFiles.length} ${fileTypeText}...`, 'info');

      const response = await uploadMedia(validFiles);
      
      const uploadedMedia = response.data.map(media => ({
        url: media.url,
        altText: media.originalName || 'Post media',
        publicId: media.publicId,
        fileType: media.fileType || (media.url.includes('video') ? 'video' : 'image'),
        size: media.size,
        dimensions: media.dimensions
      }));

      // Replace local previews with actual uploaded URLs
      setPostData(prev => ({
        ...prev,
        images: prev.images.filter(img => !img.isLocal).concat(uploadedMedia)
      }));

      showToast(`Successfully uploaded ${validFiles.length} ${fileTypeText}!`, 'success');

    } catch (error) {
      console.error('Failed to upload media:', error);
      setError(error.message || 'Failed to upload media');
      showToast('Failed to upload media', 'error');

      // Remove local previews on error
      setPostData(prev => ({
        ...prev,
        images: prev.images.filter(img => !img.isLocal)
      }));
    } finally {
      setUploadingFiles(false);
    }
  };

  // ✅ Handle file input change
  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files);
  };

  // ✅ Drag and drop handlers
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
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  // ✅ Updated remove media function
  const removeMedia = (index) => {
    const mediaItem = postData.images[index];
    if (mediaItem.url && mediaItem.url.startsWith('blob:')) {
      URL.revokeObjectURL(mediaItem.url);
    }
    
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    showToast('Media removed', 'info');
  };

  // ✅ Helper function to get media type icon
  const getMediaTypeIcon = (mediaItem) => {
    if (mediaItem.fileType === 'video' || mediaItem.url?.includes('video')) {
      return Video;
    }
    return Image;
  };


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

    const handleImportFromLibrary = (selectedImages) => {
    setPostData(prev => ({
      ...prev,
      images: [...prev.images, ...selectedImages]
    }));
    showToast(`Added ${selectedImages.length} image(s) from media library`, 'success');
  };

  const handleConnectClick = (e) => {
    e.stopPropagation();
    navigate('/settings?tab=accounts');
  };

  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      showToast('Failed to load user profile', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Generate platforms array based on connected accounts
  const getAvailablePlatforms = () => {
    const allPlatforms = [
      { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
      { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
      // { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    ];

    return allPlatforms.map(platform => ({
      ...platform,
      connected: userProfile?.connectedPlatforms?.includes(platform.id) || false,
      accounts: userProfile?.connectedAccounts?.filter(acc => acc.platform === platform.id) || []
    }));
  };

  const platforms = userProfile ? getAvailablePlatforms() : [];

  // Images are now required for all platforms
  const areImagesRequired = () => {
    return postData.platforms.length > 0;
  };

  // Toast notification function
  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  // Enhanced character count based on platform limits from API response
  const getCharacterCount = () => {
    const limits = {
      twitter: 280,
      instagram: 2200,
      facebook: 63206
    };

    const selectedPlatforms = postData.platforms;
    const currentLength = postData.content.length;
    
    if (selectedPlatforms.length === 0) {
      return { current: currentLength, max: 2200, remaining: 2200 - currentLength };
    }

    // Find the most restrictive limit
    const minLimit = Math.min(...selectedPlatforms.map(platform => limits[platform] || 2200));
    
    return {
      current: currentLength,
      max: minLimit,
      remaining: minLimit - currentLength,
      platformLimits: selectedPlatforms.reduce((acc, platform) => {
        acc[platform] = {
          current: currentLength,
          max: limits[platform] || 2200,
          remaining: (limits[platform] || 2200) - currentLength
        };
        return acc;
      }, {})
    };
  };

  const charCount = getCharacterCount();

  // Validation function with toast
  const validatePreview = () => {
    if (!postData.content.trim()) {
      showToast('Please enter some content before viewing the preview', 'error');
      return false;
    }
    if (postData.platforms.length === 0) {
      showToast('Please select at least one platform', 'error');
      return false;
    }

    // Check if images are required but not provided
    if (areImagesRequired() && postData.images.length === 0) {
      showToast('Images are required for all posts', 'error');
      return false;
    }

    // Check if accounts are selected for platforms that require it
    const platformsRequiringAccounts = ['instagram', 'facebook'];
    for (const platform of postData.platforms) {
      if (platformsRequiringAccounts.includes(platform)) {
        const selectedAccountsForPlatform = postData.selectedAccounts[platform] || [];
        const validAccounts = selectedAccountsForPlatform.filter(account => account != null && account !== '');
        
        if (validAccounts.length === 0) {
          const platformName = platforms.find(p => p.id === platform)?.name;
          showToast(`Please select at least one account for ${platformName}`, 'error');
          return false;
        }
      }
    }

    return true;
  };

  // Enhanced validation for form submission
  const validateForm = () => {
    if (!postData.content.trim()) {
      setError('Content is required');
      return false;
    }

    if (postData.platforms.length === 0) {
      setError('Please select at least one platform');
      return false;
    }

    // Check character limits
    if (charCount.remaining < 0) {
      setError(`Content exceeds character limit (${charCount.current}/${charCount.max})`);
      return false;
    }

    // Check platform-specific limits
    if (charCount.platformLimits) {
      for (const [platform, limits] of Object.entries(charCount.platformLimits)) {
        if (limits.remaining < 0) {
          const platformName = platforms.find(p => p.id === platform)?.name;
          setError(`Content exceeds ${platformName} limit (${limits.current}/${limits.max})`);
          return false;
        }
      }
    }

    // Check if images are required but not provided
    if (areImagesRequired() && postData.images.length === 0) {
      setError('Images are required for all posts');
      return false;
    }

    // Check if accounts are selected for platforms that require it
    const platformsRequiringAccounts = ['instagram', 'facebook'];
    for (const platform of postData.platforms) {
      if (platformsRequiringAccounts.includes(platform)) {
        const selectedAccountsForPlatform = postData.selectedAccounts[platform] || [];
        const validAccounts = selectedAccountsForPlatform.filter(account => account != null && account !== '');
        
        if (validAccounts.length === 0) {
          const platformName = platforms.find(p => p.id === platform)?.name;
          setError(`Please select at least one valid account for ${platformName}`);
          return false;
        }
      }
    }

    return true;
  };

  // Handle preview tab click with validation
  const handlePreviewClick = () => {
    if (validatePreview()) {
      setActiveTab('preview');
    }
  };

  const handlePlatformToggle = (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform || !platform.connected) return;

    setPostData(prev => {
      const newPlatforms = prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId];

      // Remove selected accounts if platform is deselected
      const newSelectedAccounts = { ...prev.selectedAccounts };
      if (!newPlatforms.includes(platformId)) {
        delete newSelectedAccounts[platformId];
      }

      return {
        ...prev,
        platforms: newPlatforms,
        selectedAccounts: newSelectedAccounts
      };
    });
  };

  // Updated account selection handler for multiple accounts
  const handleAccountSelection = (platformId, accountId, isSelected) => {
    if (!accountId || accountId === null || accountId === undefined) {
      console.warn('Invalid account ID detected:', accountId);
      return;
    }

    setPostData(prev => {
      const currentAccounts = prev.selectedAccounts[platformId] || [];
      
      let newAccounts;
      if (isSelected) {
        newAccounts = currentAccounts.includes(accountId) 
          ? currentAccounts 
          : [...currentAccounts, accountId];
      } else {
        newAccounts = currentAccounts.filter(id => id !== accountId);
      }

      return {
        ...prev,
        selectedAccounts: {
          ...prev.selectedAccounts,
          [platformId]: newAccounts
        }
      };
    });
  };

  // Helper function to check if an account is selected
  const isAccountSelected = (platformId, accountId) => {
    if (!accountId) return false;
    const selectedAccounts = postData.selectedAccounts[platformId] || [];
    return selectedAccounts.includes(accountId);
  };

  // Helper function to get selected accounts count for a platform
  const getSelectedAccountsCount = (platformId) => {
    const selectedAccounts = postData.selectedAccounts[platformId] || [];
    return selectedAccounts.length;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    setError(null);

    try {
      // For immediate preview, create local URLs
      const localPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        altText: file.name,
        isLocal: true
      }));

      setPostData(prev => ({
        ...prev,
        images: [...prev.images, ...localPreviews]
      }));

      showToast('Uploading images...', 'info');

      const response = await uploadMedia(files);
      
      const uploadedImages = response.data.map(media => ({
        url: media.url,
        altText: media.originalName || 'Post image',
        publicId: media.publicId
      }));

      // Replace local previews with actual uploaded URLs
      setPostData(prev => ({
        ...prev,
        images: prev.images.filter(img => !img.isLocal).concat(uploadedImages)
      }));

      showToast(`Successfully uploaded ${files.length} image(s)`, 'success');

    } catch (error) {
      console.error('Failed to upload images:', error);
      setError(error.message || 'Failed to upload images');
      showToast('Failed to upload images', 'error');

      // Remove local previews on error
      setPostData(prev => ({
        ...prev,
        images: prev.images.filter(img => !img.isLocal)
      }));
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeImage = (index) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    showToast('Image removed', 'info');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  if (!validateForm()) {
    setIsSubmitting(false);
    return;
  }

  try {
    // Clean up selectedAccounts to remove null values and empty arrays
    const cleanedSelectedAccounts = {};
    Object.entries(postData.selectedAccounts).forEach(([platform, accounts]) => {
      const validAccounts = accounts.filter(account => account != null && account !== '');
      if (validAccounts.length > 0) {
        cleanedSelectedAccounts[platform] = validAccounts;
      }
    });

    // Prepare post data for API (matching Swagger structure)
    const apiPostData = {
      content: postData.content,
      platforms: postData.platforms,
      selectedAccounts: cleanedSelectedAccounts,
      images: postData.images.map(img => ({
        url: img.url,
        altText: img.altText || 'Post image',
        publicId: img.publicId || null
      })),
      hashtags: Array.isArray(postData.hashtags)
        ? postData.hashtags
        : postData.hashtags.split(/\s+/).filter(tag => tag.startsWith('#')),
      mentions: Array.isArray(postData.mentions)
        ? postData.mentions
        : postData.mentions.split(/\s+/).filter(mention => mention.startsWith('@')),
      metadata: {
        category: postData.metadata?.category || 'other'
      }
    };

    console.log('Submitting post data:', apiPostData);

    let response;
    
    if (isScheduled && postData.scheduledDate && postData.scheduledTime) {
      // SCHEDULED POST - Create first, then schedule
      const scheduledDateTime = new Date(`${postData.scheduledDate}T${postData.scheduledTime}`);
      apiPostData.scheduledDate = scheduledDateTime.toISOString();
      
      showToast('Scheduling post...', 'info');
      response = await onPostCreated(apiPostData);
      
    } else {
      // PUBLISH NOW - Create and immediately publish
      showToast('Creating and publishing post...', 'info');
      
      // Step 1: Create the post as draft
      const createResponse = await onPostCreated(apiPostData);
      console.log('Post created:', createResponse);
      
      if (!createResponse?.data?._id) {
        throw new Error('Failed to create post - no ID returned');
      }
      
      // Step 2: Immediately publish the created post
      const postId = createResponse.data._id;
      console.log('Publishing post with ID:', postId);
      
      const publishResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/${postId}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Publish response:', publishResponse);
      response = publishResponse;
    }
    
    console.log('Final response:', response);

    const successMessage = isScheduled 
      ? 'Post scheduled successfully!' 
      : response?.data?.status === 'published' 
        ? 'Post published successfully!' 
        : 'Post created successfully!';

    showToast(successMessage, 'success');

    // Reset form on success
    resetForm();
    onClose();

  } catch (error) {
    console.error('Failed to create/publish post:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create post';
    setError(errorMessage);
    showToast(isScheduled ? 'Failed to schedule post' : 'Failed to publish post', 'error');
  } finally {
    setIsSubmitting(false);
  }
};


  const resetForm = () => {
    setPostData({
      content: '',
      platforms: [],
      selectedAccounts: {},
      scheduledDate: '',
      scheduledTime: '',
      images: [],
      hashtags: '',
      mentions: '',
      metadata: {
        category: 'other'
      }
    });
    setIsScheduled(false);
    setPreviewMode(false);
    setShowAISuggestions(false);
    setAiSuggestions([]);
    setAiPrompt('');
    setError(null);
    setToast(null);
  };

  // AI Content Generation (keeping existing functionality)
  // Update the generateAIContent function with platform validation:
  const generateAIContent = async () => {
    // Check if platforms are selected
    if (postData.platforms.length === 0) {
      showToast('Please select at least one social media platform first', 'error');
      return;
    }

    if (!aiPrompt.trim()) {
      showToast('Please enter a prompt for AI content generation', 'error');
      return;
    }

    setIsGenerating(true);
    setError(null);
    showToast('Generating AI content...', 'info');

    try {
      const selectedPlatforms = postData.platforms;
      
      // Use the exact structure that works in Swagger
      const response = await apiClient.generateContent({
        prompt: aiPrompt,
        tone: 'casual', // or allow user selection
        platforms: selectedPlatforms,
        includeHashtags: true,
        maxLength: 280 // adjust based on platforms
      });

      console.log('AI Response:', response);

      if (response.success && response.data) {
        const suggestions = [];
        
        // Handle the response structure from your Swagger example
        Object.entries(response.data.content).forEach(([platform, data]) => {
          suggestions.push({
            id: `${platform}-${Date.now()}`,
            content: data.content,
            hashtags: '', // Extract hashtags from content if needed
            tone: response.data.options.tone,
            platforms: [platform],
            characterCount: data.characterCount,
            withinLimit: data.withinLimit,
            provider: 'openai'
          });
        });

        setAiSuggestions(suggestions);
        showToast(`Generated ${suggestions.length} AI suggestions`, 'success');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('AI generation failed:', error);
      setError('Failed to generate AI content. Please try again.');
      showToast('Failed to generate AI content', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update the generateHashtags function with platform validation:
  const generateHashtags = async () => {
    // Check if platforms are selected
    if (postData.platforms.length === 0) {
      showToast('Please select at least one social media platform first', 'error');
      return;
    }

    if (!postData.content.trim()) {
      showToast('Please enter some content first to generate hashtags', 'error');
      return;
    }

    setIsGenerating(true);
    setError(null);
    showToast('Generating hashtags...', 'info');

    try {
      const selectedPlatform = postData.platforms[0]; // Use the first selected platform

      // Use the exact structure that works in Swagger
      const response = await apiClient.suggestHashtags({
        content: postData.content,
        platform: selectedPlatform,
        count: 10
      });

      console.log('Hashtag Response:', response);

      if (response.success && response.data.hashtags) {
        const newHashtags = response.data.hashtags.join(' ');
        setPostData(prev => ({
          ...prev,
          hashtags: prev.hashtags ? `${prev.hashtags} ${newHashtags}` : newHashtags
        }));
        showToast(`Added ${response.data.hashtags.length} hashtags`, 'success');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Hashtag generation failed:', error);
      setError('Failed to generate hashtags. Please try again.');
      showToast('Failed to generate hashtags', 'error');
    } finally {
      setIsGenerating(false);
    }
  };


  const applyAISuggestion = (suggestion) => {
    setPostData(prev => ({
      ...prev,
      content: suggestion.content,
      hashtags: suggestion.hashtags,
      platforms: suggestion.platforms
    }));
    showToast('AI suggestion applied successfully', 'success');
  };

  const copySuggestionContent = async (suggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.content);
      showToast('Content copied to clipboard', 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast('Failed to copy content', 'error');
    }
  };

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      postData.images.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

  if (!isOpen) return null;


  return (
     <div className={`create-post-overlay ${showMediaLibrary ? 'media-library-open' : ''}`}>
    {/* Toast Notification */}
    {toast && (
      <div className={`toast toast-${toast.type}`}>
        <div className="toast-content">
          {toast.type === 'success' && <CheckCircle size={16} />}
          {toast.type === 'error' && <AlertCircle size={16} />}
          {toast.type === 'info' && <Info size={16} />}
          <span>{toast.message}</span>
        </div>
      </div>
    )}

    <div className={`create-post-modal ${showMediaLibrary ? 'media-library-open' : ''}`}>
        <div className="modal-header">
          <div className="header-left">
            <h2>Create New Post</h2>
            <button
              className="ai-assistant-btn"
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              title="AI Content Assistant"
            >
              <Wand2 size={20} />
              <Sparkles size={16} className="sparkle-icon" />
            </button>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'compose' ? 'active' : ''}`}
            onClick={() => setActiveTab('compose')}
          >
            Compose
          </button>
          <button
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={handlePreviewClick}
          >
            <Eye size={16} />
            Preview
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          {/* Error Display */}
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Loading Profile */}
          {loadingProfile && (
            <div className="loading-profile">
              <Loader />
              <span>Loading profile...</span>
            </div>
          )}

          {activeTab === 'compose' && (
            <div className={`compose-tab ${showAISuggestions ? 'with-ai' : ''}`}>
              {/* AI Suggestions Column */}
              {showAISuggestions && (
                <div className="ai-suggestions-column">
                  <div className="ai-column-header">
                    <Wand2 size={18} />
                    <h3>AI Content Assistant</h3>
                  </div>

                  <div className="ai-prompt-section">
                    <label>Tell AI what you want to post about:</label>
                    <div className="ai-input-group">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g., new product launch, team achievement, industry insights..."
                        className="ai-prompt-input"
                        onKeyPress={(e) => e.key === 'Enter' && generateAIContent()}
                      />
                      <button
                        type="button"
                        className="ai-generate-btn"
                        onClick={generateAIContent}
                        disabled={!aiPrompt.trim() || isGenerating}
                      >
                        {isGenerating ? (
                          <RefreshCw size={16} className="spinning" />
                        ) : (
                          <Sparkles size={16} />
                        )}
                        {isGenerating ? 'Generating...' : 'Generate'}
                      </button>
                    </div>

                    {!aiPrompt && (
                      <div className="quick-prompts">
                        <span className="quick-prompts-label">Quick ideas:</span>
                        {[
                          'new product launch',
                          'team milestone',
                          'industry insights',
                          'customer success story',
                          'behind the scenes',
                          'tips and tricks'
                        ].map(prompt => (
                          <button
                            key={prompt}
                            type="button"
                            className="quick-prompt-btn"
                            onClick={() => setAiPrompt(prompt)}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {aiSuggestions.length > 0 && (
                    <div className="ai-suggestions">
                      <div className="suggestions-header">
                        <h4>AI Suggestions:</h4>
                        <button
                          type="button"
                          className="regenerate-btn"
                          onClick={generateAIContent}
                          disabled={isGenerating}
                          title="Generate new suggestions"
                        >
                          <RefreshCw size={14} className={isGenerating ? 'spinning' : ''} />
                          Regenerate
                        </button>
                      </div>
                      <div className="suggestions-list">
                        {aiSuggestions.map(suggestion => (
                          <div key={suggestion.id} className="suggestion-card">
                            <div className="suggestion-header">
                              <span className="suggestion-tone">{suggestion.tone}</span>
                              <div className="suggestion-platforms">
                                {suggestion.platforms.map(platform => {
                                  const Icon = platform === 'instagram' ? Instagram :
                                    platform === 'twitter' ? Twitter : Facebook;
                                  return <Icon key={platform} size={14} />;
                                })}
                              </div>
                            </div>
                            <p className="suggestion-content">{suggestion.content}</p>
                            <div className="suggestion-hashtags">
                              <Hash size={12} />
                              <span>{suggestion.hashtags}</span>
                            </div>
                            <div className="suggestion-actions">
                              <button
                                type="button"
                                className="copy-suggestion-btn"
                                onClick={() => copySuggestionContent(suggestion)}
                                title="Copy content to clipboard"
                              >
                                <Copy size={14} />
                                Copy
                              </button>
                              <button
                                type="button"
                                className="apply-suggestion-btn"
                                onClick={() => applyAISuggestion(suggestion)}
                              >
                                Use This Content
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Column */}
              <div className="form-column">
                {/* Platform Selection */}
                <div className="form-section">
                  <label className="section-label">Select Platforms</label>
                  <div className="platforms-grid">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = postData.platforms.includes(platform.id);
                      const selectedAccountsCount = getSelectedAccountsCount(platform.id);
                      
                      return (
                        <div key={platform.id} className="platform-container">
                          <button
                            type="button"
                            className={`platform-btn ${isSelected ? 'selected' : ''} ${!platform.connected ? 'not-connected-btn' : ''}`}
                            onClick={(e) =>
                              platform.connected
                                ? handlePlatformToggle(platform.id)
                                : handleConnectClick(e)
                            }
                            style={{ '--platform-color': platform.color }}
                          >
                            <Icon size={20} />
                            <span>{platform.name}</span>
                            <span className="connect-status">
                              {platform.connected ? 
                                (selectedAccountsCount > 0 ? `${selectedAccountsCount} account${selectedAccountsCount > 1 ? 's' : ''} selected` : 'Connected') 
                                : 'Connect Now'
                              }
                            </span>
                          </button>

                          {/* Multi-Account Selection */}
                          {isSelected && platform.connected && platform.accounts && platform.accounts.length > 0 && (
                            <div className="account-multi-selector">
                              <label className="account-label">
                                Select {platform.name} Account{platform.accounts.length > 1 ? 's' : ''}:
                                <span className="account-count">
                                  ({selectedAccountsCount} of {platform.accounts.length} selected)
                                </span>
                              </label>
                              <div className="accounts-checkbox-list">
                                {platform.accounts.map((account) => {
                                  const accountId = account.accountId || account.id || account._id || account.pageId;
                                  
                                  if (!accountId) {
                                    console.warn('Account missing ID:', account);
                                    return null;
                                  }
                                  
                                  const isChecked = isAccountSelected(platform.id, accountId);
                                  
                                  return (
                                    <label key={`${platform.id}-${accountId}`} className="account-checkbox-item">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => handleAccountSelection(platform.id, accountId, e.target.checked)}
                                        className="account-checkbox"
                                      />
                                      <span className="checkbox-custom"></span>
                                      <span className="account-name">
                                        {account.username || account.name || account.displayName || accountId}
                                        {account.pageId && account.pageId !== accountId && (
                                          <span className="account-id"> (ID: {account.pageId})</span>
                                        )}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                              
                              {platform.accounts.length > 1 && (
                                <div className="account-selection-controls">
                                  <button
                                    type="button"
                                    className="select-all-btn"
                                    onClick={() => {
                                      platform.accounts.forEach(account => {
                                        const accountId = account.accountId || account.id || account._id || account.pageId;
                                        if (accountId && !isAccountSelected(platform.id, accountId)) {
                                          handleAccountSelection(platform.id, accountId, true);
                                        }
                                      });
                                    }}
                                    disabled={selectedAccountsCount === platform.accounts.length}
                                  >
                                    Select All
                                  </button>
                                  <button
                                    type="button"
                                    className="deselect-all-btn"
                                    onClick={() => {
                                      setPostData(prev => ({
                                        ...prev,
                                        selectedAccounts: {
                                          ...prev.selectedAccounts,
                                          [platform.id]: []
                                        }
                                      }));
                                    }}
                                    disabled={selectedAccountsCount === 0}
                                  >
                                    Deselect All
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>


                {/* Content */}
                <div className="form-section">
                  <label className="section-label">
                    Content
                    <span className={`char-count ${charCount.remaining < 0 ? 'over-limit' : ''}`}>
                      {charCount.current}/{charCount.max}
                    </span>
                  </label>
                  <textarea
                    value={postData.content}
                    onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="What's happening? Share your thoughts..."
                    className="content-textarea"
                    rows={6}
                    required
                  />
                </div>

                {/* Hashtags and Mentions */}
                <div className="form-row">
                  <div className="form-section">
                    <label className="section-label">
                      <Hash size={16} />
                      Hashtags
                      <button
                        type="button"
                        className="ai-hashtag-btn"
                        onClick={generateHashtags}
                        disabled={isGenerating || !postData.content.trim()}
                        title="Generate hashtags with AI"
                      >
                        {isGenerating ? <></> : <Sparkles size={14} />}
                        AI
                      </button>
                    </label>
                    <input
                      type="text"
                      value={postData.hashtags}
                      onChange={(e) => setPostData(prev => ({ ...prev, hashtags: e.target.value }))}
                      placeholder="#marketing #socialmedia #content"
                      className="form-input"
                    />
                  </div>
                  <div className="form-section">
                    <label className="section-label">
                      <AtSign size={16} />
                      Mentions
                    </label>
                    <input
                      type="text"
                      value={postData.mentions}
                      onChange={(e) => setPostData(prev => ({ ...prev, mentions: e.target.value }))}
                      placeholder="@username @brand"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Image Upload */}
              <div className="form-section">
                  <label className="section-label">
                    <Image size={16} />
                    Media (Images & Videos)
                  </label>
                  
                  {/* Enhanced Upload Area with Drag & Drop */}
                  <div className="media-upload-container">
                    <div className="upload-options-grid">
                      {/* Upload New Files with Drag & Drop */}
                      <div className="upload-option">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*" // ✅ Accept both images and videos
                          onChange={handleFileInputChange}
                          className="file-input"
                          id="media-upload"
                        />
                        <div
                          className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadingFiles ? 'uploading' : ''}`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={handleUploadAreaClick}
                        >
                          {uploadingFiles ? (
                            <>
                              <Loader className="spinner" size={32} />
                              <span className="upload-title">Uploading media...</span>
                              <small>Please wait while we upload your files</small>
                            </>
                          ) : (
                            <>
                              <Upload size={32} />
                              <span className="upload-title">
                                {dragActive ? 'Drop files here' : 'Upload Media Files'}
                              </span>
                              <small className="upload-subtitle">
                                Drag & drop or click to select
                              </small>
                              <div className="upload-specs">
                                <span>📷 Images: PNG, JPG, GIF up to 50MB</span>
                                <span>🎥 Videos: MP4, MOV, AVI up to 250MB</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Import from Media Library */}
                      <div className="upload-option">
                        <button
                          type="button"
                          className="media-library-btn"
                          onClick={() => setShowMediaLibrary(true)}
                          disabled={uploadingFiles}
                        >
                          <FolderOpen size={32} />
                          <span className="upload-title">Import from Media Library</span>
                          <small className="upload-subtitle">Choose from your existing files</small>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Display Selected Media (Images & Videos) */}
                  {postData.images.length > 0 && (
                    <div className="uploaded-media">
                      <div className="media-grid">
                        {postData.images.map((mediaItem, index) => {
                          const MediaIcon = getMediaTypeIcon(mediaItem);
                          const isVideo = mediaItem.fileType === 'video' || 
                                         mediaItem.url?.includes('video');
                          
                          return (
                            <div key={index} className="media-preview">
                              {isVideo ? (
                                <div className="video-preview">
                                  <video
                                    src={mediaItem.url || mediaItem}
                                    className="media-thumbnail"
                                    muted
                                    onError={(e) => {
                                      console.error('Video failed to load:', mediaItem);
                                      e.target.style.display = 'none';
                                      e.target.parentElement.classList.add('error');
                                    }}
                                  />
                                  <div className="video-overlay">
                                    <Play size={20} />
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={mediaItem.url || mediaItem}
                                  alt={mediaItem.altText || `Media ${index + 1}`}
                                  className="media-thumbnail"
                                  onError={(e) => {
                                    console.error('Image failed to load:', mediaItem);
                                    e.target.style.display = 'none';
                                    e.target.parentElement.classList.add('error');
                                  }}
                                />
                              )}
                              
                              <button
                                type="button"
                                className="remove-media"
                                onClick={() => removeMedia(index)}
                                title="Remove media"
                              >
                                <X size={16} />
                              </button>
                              
                              {/* Media Info Overlay */}
                              <div className="media-info-overlay">
                                <div className="media-type-indicator">
                                  <MediaIcon size={12} />
                                  {isVideo ? 'Video' : 'Image'}
                                </div>
                                {mediaItem.size && (
                                  <div className="media-size-indicator">
                                    {formatFileSize(mediaItem.size)}
                                  </div>
                                )}
                              </div>

                              {/* Source indicator */}
                              <div className="media-source-indicator">
                                {mediaItem.publicId ? (
                                  <FolderOpen size={10} title="From Media Library" />
                                ) : (
                                  <Upload size={10} title="Newly Uploaded" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Scheduling - Updated with Radio Buttons and Tooltips */}
                <div className="form-section">
                  <label className="section-label">
                    <Clock size={16} />
                    Scheduler
                  </label>

                  <div className="scheduler-options">
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="scheduler"
                          value="now"
                          checked={!isScheduled}
                          onChange={() => setIsScheduled(false)}
                        />
                        <span className="radio-custom"></span>
                        <div className="radio-content">

                          <small
                            className="radio-description"
                            data-tooltip="Post will be published immediately"
                          ><span className="radio-label">Schedule Now</span>
                          </small>
                        </div>
                      </label>

                      <label className="radio-option">
                        <input
                          type="radio"
                          name="scheduler"
                          value="later"
                          checked={isScheduled}
                          onChange={() => setIsScheduled(true)}
                        />
                        <span className="radio-custom"></span>
                        <small
                          className="radio-description"
                          data-tooltip="Choose a specific date and time for publishing"
                        >
                          <div className="radio-content">
                            <span className="radio-label">Schedule For Later</span>
                          </div>
                        </small>

                      </label>
                    </div>

                    {/* Date and Time inputs */}
                    {isScheduled && (
                      <div className="schedule-inputs">
                        <div className="input-group">
                          <div className="date-input-wrapper">
                            <input
                              type="date"
                              value={postData.scheduledDate}
                              onChange={(e) => setPostData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                              className="form-input"
                              min={new Date().toISOString().split('T')[0]}
                              required
                            />
                          </div>
                        </div>
                        <div className="input-group">
                          <div className="time-input-wrapper">
                            <input
                              type="time"
                              value={postData.scheduledTime}
                              onChange={(e) => setPostData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="preview-tab">
              <div className="preview-content">
                <h3>Post Preview</h3>
                <div className="preview-platforms-grid">
                  {postData.platforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    const Icon = platform.icon;

                    return (
                      <div key={platformId} className={`platform-preview ${platformId}`} style={{ '--platform-color': platform.color }}>
                        <div className="platform-header">
                          <Icon size={20} />
                          <span>{platform.name}</span>
                        </div>
                        <div className="preview-post">
                          {postData.images.length > 0 && (
                            <div className="preview-images">
                              <img
                                src={postData.images[0].url || postData.images[0]}
                                alt={postData.images[0].altText || "Post preview"}
                                onError={(e) => {
                                  console.error('Preview image failed to load');
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="preview-text">
                            <p>{postData.content}</p>
                            {/* Fixed hashtags rendering */}
                            {postData.hashtags && (
                              <div className="preview-hashtags">
                                {(typeof postData.hashtags === 'string' ?
                                  postData.hashtags.split(' ') :
                                  Array.isArray(postData.hashtags) ? postData.hashtags : []
                                )
                                  .filter(tag => tag.startsWith('#'))
                                  .map((tag, index) => (
                                    <span key={index} className="hashtag">{tag}</span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!postData.content.trim() || postData.platforms.length === 0 || charCount.remaining < 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  {/* <Loader className="spinner" size={16} /> */}
                  {isScheduled ? 'Scheduling...' : 'Publishing...'}
                </>
              ) : isScheduled ? (
                <>
                  <Calendar size={16} />
                  Schedule Post
                </>
              ) : (
                <>
                  <Send size={16} />
                  Publish Now
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toast Notification */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <span className="toast-message">{toast.message}</span>
          </div>
        )}
      </div>
        <MediaLibraryModal
      isOpen={showMediaLibrary}
      onClose={() => setShowMediaLibrary(false)}
      onSelectImages={handleImportFromLibrary}
    />
    </div>
  );
};

const MediaLibraryModal = ({ isOpen, onClose, onSelectImages }) => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch media when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMediaLibrary();
    }
  }, [isOpen]);

   const fetchMediaLibrary = async () => {
    setLoading(true);
    try {
      const response = await apiClient.request('/api/media');
      const media = response?.data?.data?.media || response?.data?.media || [];
      
      // ✅ Filter both images and videos
      const mediaFiles = media.filter(item => 
        (item.fileType?.startsWith('image') || item.fileType?.startsWith('video')) && item.url
      );
      
      setMediaList(mediaFiles);
    } catch (error) {
      console.error('Failed to fetch media library:', error);
      setMediaList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageToggle = (image) => {
    setSelectedImages(prev => {
      // ✅ Use the correct ID field from the API response
      const imageId = image._id || image.id;
      const isSelected = prev.some(img => (img._id || img.id) === imageId);
      
      if (isSelected) {
        return prev.filter(img => (img._id || img.id) !== imageId);
      } else {
        return [...prev, {
          url: image.url,
          altText: image.altText || image.originalName || image.filename, // ✅ Use originalName if available
          publicId: image.publicId,
          _id: imageId, // ✅ Use consistent ID
          filename: image.originalName || image.filename // ✅ Prefer originalName for display
        }];
      }
    });
  };

  const handleSelectImages = () => {
    onSelectImages(selectedImages);
    onClose();
    setSelectedImages([]);
  };

  const handleClose = () => {
    setSelectedImages([]);
    onClose();
  };

  const filteredMedia = mediaList.filter(item => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      item.filename?.toLowerCase().includes(searchTerm) ||
      item.originalName?.toLowerCase().includes(searchTerm) || // ✅ Search originalName too
      item.altText?.toLowerCase().includes(searchTerm)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="media-library-modal-overlay" onClick={handleClose}>
      <div className="media-library-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select Images from Media Library</h3>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Search Bar */}
          <div className="media-search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Selected Images Counter */}
          {selectedImages.length > 0 && (
            <div className="selected-counter">
              {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
            </div>
          )}

          {/* Media Grid */}
          <div className="media-library-grid">
            {loading ? (
              <div className="loading-media">
                <Loader />
                <span>Loading media library...</span>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="no-media">
                <Image size={48} />
                <h4>No images found</h4>
                <p>
                  {searchQuery 
                    ? `No images match "${searchQuery}"`
                    : "Upload some images to your media library first"
                  }
                </p>
              </div>
            ) : (
              filteredMedia.map(image => {
                const imageId = image._id || image.id;
                const isSelected = selectedImages.some(img => (img._id || img.id) === imageId);
                const displayName = image.originalName || image.filename;
                
                return (
                  <div
                    key={imageId}
                    className={`media-library-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleImageToggle(image)}
                  >
                    <div className="media-thumbnail">
                      <img
                        src={image.url}
                        alt={image.altText || displayName}
                        loading="lazy"
                        onError={(e) => {
                          console.error('Failed to load image:', image.url);
                          e.target.style.display = 'none';
                        }}
                      />
                      {isSelected && (
                        <div className="selection-overlay">
                          <Check size={20} />
                        </div>
                      )}
                    </div>
                    <div className="media-info">
                      <span className="media-filename" title={displayName}>
                        {displayName?.length > 25 
                          ? `${displayName.substring(0, 25)}...` 
                          : displayName || 'Untitled'
                        }
                      </span>
                      <span className="media-size">
                        {image.humanSize || `${Math.round(image.size / 1024)}KB`}
                      </span>
                      {/* ✅ Show dimensions if available */}
                      {image.dimensions && (
                        <span className="media-dimensions">
                          {image.dimensions.width} × {image.dimensions.height}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSelectImages}
            disabled={selectedImages.length === 0}
          >
            Add {selectedImages.length} Image{selectedImages.length !== 1 ? 's' : ''} to Post
          </button>
        </div>
      </div>
    </div>
  );
};




export default CreatePost;