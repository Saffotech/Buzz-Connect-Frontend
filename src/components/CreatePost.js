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
  FolderOpen,
  Check,
  Search,
  Video,
  Play,
  FileText,
  GalleryHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Grid3X3,
  Maximize2,
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
  const [showImageCarousel, setShowImageCarousel] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const [postData, setPostData] = useState({
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
  const [publishMode, setPublishMode] = useState('now'); // 'now' or 'later'

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

  useEffect(() => {
    if (initialData) {
      console.log("Setting form data from initialData:", initialData);

      setPostData(prev => ({
        ...prev,
        content: initialData.content || '',
        platforms: initialData.platforms || [],
        hashtags: initialData.hashtags || '',
        mentions: initialData.mentions || '',
        selectedAccounts: initialData.selectedAccounts || {},
        images: initialData.images && initialData.images.length > 0 ? initialData.images : [],
        scheduledDate: initialData.scheduledDate ? new Date(initialData.scheduledDate) : null,
        scheduledTime: initialData.scheduledTime || '', // Keep in 24-hour format for backend
        metadata: {
          ...prev.metadata,
          ...(initialData.metadata || {})
        }
      }));

      // ✅ handle publish mode separately
      if (initialData.scheduledDate || initialData.status === 'scheduled') {
        setPublishMode('later');
      } else {
        setPublishMode('now');
      }
    }
  }, [initialData]);


  console.log("CreatePost component initialData:", initialData);


  // ✅ Helper functions for content formatting
  const formatContentForDisplay = (content) => {
    // Convert **text** to <strong>text</strong> for display in preview
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // ✅ Add these helper functions at the top of your component
  const convertToUnicodeBold = (text) => {
    const boldMap = {
      'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦',
      'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
      'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌',
      'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
      '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗',
      ' ': ' ' // Keep spaces as they are
    };

    return text.split('').map(char => boldMap[char] || char).join('');
  };

  // ✅ Updated function to convert to Unicode bold characters
  const stripMarkdownForSocialMedia = (content) => {
    // Convert **text** to Unicode bold characters
    return content.replace(/\*\*(.*?)\*\*/g, (match, text) => {
      return convertToUnicodeBold(text);
    });
  };

  // ✅ ADDED: Helper function to extract hashtags from content
  const extractHashtagsFromContent = (text) => {
    if (!text) return { content: '', hashtags: [] };

    // Split text into lines to better handle formatting
    const lines = text.split('\n');
    const contentLines = [];
    const hashtags = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();

      // Check if this line contains hashtags
      const lineHashtags = trimmedLine.match(/#\w+/g) || [];

      if (lineHashtags.length > 0) {
        hashtags.push(...lineHashtags);

        // Remove hashtags from the line
        const cleanLine = trimmedLine.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();

        // Only add the line if there's content left after removing hashtags
        if (cleanLine) {
          contentLines.push(cleanLine);
        }
      } else if (trimmedLine) {
        // Line with no hashtags, add as is
        contentLines.push(trimmedLine);
      }
    });

    return {
      content: contentLines.join('\n').trim(),
      hashtags: [...new Set(hashtags)] // Remove duplicates
    };
  };

  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24) => {
    if (!time24) return { hour: '12', minute: '00', period: 'PM' };
    
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const minute = minutes || '00';
    
    if (hour24 === 0) {
      return { hour: '12', minute, period: 'AM' };
    } else if (hour24 < 12) {
      return { hour: hour24.toString(), minute, period: 'AM' };
    } else if (hour24 === 12) {
      return { hour: '12', minute, period: 'PM' };
    } else {
      return { hour: (hour24 - 12).toString(), minute, period: 'PM' };
    }
  };

// Convert 12-hour time to 24-hour format
const convertTo24Hour = (hour12, minute, period) => {
  const hour = parseInt(hour12, 10);
  let hour24;
  
  if (period === 'AM') {
    hour24 = hour === 12 ? 0 : hour;
  } else {
    hour24 = hour === 12 ? 12 : hour + 12;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minute}`;
};


  // Carousel handlers
  const openCarousel = (index = 0) => {
    setCurrentCarouselIndex(index);
    setShowImageCarousel(true);
  };

  const closeCarousel = () => {
    setShowImageCarousel(false);
    setCurrentCarouselIndex(0);
  };

  const goToNextImage = () => {
    setCurrentCarouselIndex((prev) =>
      prev === postData.images.length - 1 ? 0 : prev + 1
    );
  };

  const goToPrevImage = () => {
    setCurrentCarouselIndex((prev) =>
      prev === 0 ? postData.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index) => {
    setCurrentCarouselIndex(index);
  };

  // ✅ 1. Define the function here (inside component, before return)
  const onSaveDraft = () => {
    const draftData = { ...postData, status: "draft" };
    console.log("Saving draft:", draftData);

    setToast({
      type: 'success',
      message: 'Draft saved successfully!',
    });

    // Auto-hide toast after 3 seconds
    setTimeout(() => setToast(null), 3000);
  };


  // Fetch user profile and connected accounts on mount
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    // Enhanced file validation for Instagram
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

      // ✅ Instagram-specific validations
      if (isVideo) {
        // Check video size for Instagram (250MB limit)
        if (file.size > 250 * 1024 * 1024) {
          invalidFiles.push({
            file,
            reason: 'Video too large for Instagram (max 250MB)'
          });
          return;
        }

        console.log('Video file accepted:', file.name, 'Size:', file.size);
      } else {
        // Image size limit
        if (file.size > 50 * 1024 * 1024) {
          invalidFiles.push({
            file,
            reason: 'Image too large (max 50MB)'
          });
          return;
        }
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
      console.log('✅ Uploading files:', validFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));

      const response = await uploadMedia(validFiles);
      console.log('✅ Upload response:', response);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid upload response format');
      }

      const uploadedMedia = response.data.map((media, index) => {
        const originalFile = validFiles[index];

        // ✅ CRITICAL: Ensure all required fields are present
        const processedMedia = {
          url: media.url || media.secure_url,
          altText: media.originalName || originalFile?.name || 'Post media',
          // ✅ FIX: Ensure originalName is always present
          originalName: media.originalName || originalFile?.name || media.filename || 'Untitled Media',
          displayName: media.originalName || originalFile?.name || media.filename || 'Untitled Media',
          filename: media.filename || originalFile?.name,
          publicId: media.publicId,
          fileType: media.fileType || (originalFile?.type.startsWith('video/') ? 'video' : 'image'),
          size: media.size || originalFile?.size,
          dimensions: media.dimensions,
          // Video-specific fields
          duration: media.duration || null,
          fps: media.fps || null,
          hasAudio: media.hasAudio || null,
          // Enhanced fields
          thumbnails: media.thumbnails || null,
          videoQualities: media.videoQualities || null,
          platformOptimized: media.platformOptimized || null,
          // ✅ Add metadata for better compatibility
          format: originalFile?.type || 'video/mp4',
          createdAt: new Date().toISOString()
        };

        console.log('✅ Processed media:', processedMedia);
        return processedMedia;
      });

      setPostData(prev => ({
        ...prev,
        images: prev.images.filter(img => !img.isLocal).concat(uploadedMedia)
      }));

      const fileTypeText = validFiles.length === 1
        ? (validFiles[0].type.startsWith('video/') ? 'video' : 'image')
        : 'files';

      showToast(`Successfully uploaded ${validFiles.length} ${fileTypeText}!`, 'success');

    } catch (error) {
      console.error('❌ Upload failed:', error);
      setError(error.message || 'Failed to upload media');
      showToast('Failed to upload media', 'error');

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

  // ✅ FIXED: Updated handleSubmit with markdown stripping
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ Enhanced debugging
      console.log('=== POST SUBMISSION DEBUG ===');
      console.log('Post data:', JSON.stringify(postData, null, 2));
      console.log('Images count:', postData.images?.length);
      console.log('Platforms:', postData.platforms);
      console.log('Selected accounts:', postData.selectedAccounts);

      postData.images?.forEach((item, index) => {
        console.log(`Media ${index}:`, {
          url: item.url ? '✅ HAS URL' : '❌ NO URL',
          fileType: item.fileType,
          originalName: item.originalName,
          size: item.size
        });
      });

      // Clean up selectedAccounts to remove null values and empty arrays
      const cleanedSelectedAccounts = {};
      Object.entries(postData.selectedAccounts).forEach(([platform, accounts]) => {
        const validAccounts = accounts.filter(account => account != null && account !== '');
        if (validAccounts.length > 0) {
          cleanedSelectedAccounts[platform] = validAccounts;
        }
      });


      // ✅ Enhanced post data preparation with better media handling
      const apiPostData = {
        content: stripMarkdownForSocialMedia(postData.content), // ✅ Apply markdown stripping
        platforms: postData.platforms,
        selectedAccounts: cleanedSelectedAccounts,
        images: postData.images.map((img, index) => ({
          url: img.url,
          altText: img.altText || img.originalName || 'Post media',
          originalName: img.originalName || img.filename || `Media ${index + 1}`,
          displayName: img.displayName || img.originalName || img.filename || `Media ${index + 1}`,
          filename: img.filename,
          publicId: img.publicId || null,
          fileType: img.fileType || 'image',
          size: img.size,
          dimensions: img.dimensions,
          duration: img.duration,
          // ✅ Add order for carousel
          order: index,
          // ✅ Enhanced metadata
          format: img.format,
          humanSize: img.size ? formatFileSize(img.size) : null
        })),
        hashtags: Array.isArray(postData.hashtags)
          ? postData.hashtags
          : postData.hashtags.split(/\s+/).filter(tag => tag.startsWith('#')),
        mentions: Array.isArray(postData.mentions)
          ? postData.mentions
          : postData.mentions.split(/\s+/).filter(mention => mention.startsWith('@')),
        metadata: {
          category: postData.metadata?.category || 'other',
          source: 'web'
        }
      };

      // ✅ Handle scheduling vs immediate publishing
      if (isScheduled && postData.scheduledDate && postData.scheduledTime) {
        // SCHEDULED POST
        const scheduledDateTime = new Date(`${postData.scheduledDate}T${postData.scheduledTime}`);
        apiPostData.scheduledDate = scheduledDateTime.toISOString();

        console.log('📅 Creating scheduled post for:', scheduledDateTime.toISOString());
        showToast('Scheduling post...', 'info');

        const response = await onPostCreated(apiPostData);
        console.log('✅ Scheduled post created:', response);

        showToast('Post scheduled successfully!', 'success');

      } else {
        // PUBLISH NOW
        console.log('🚀 Creating and publishing post immediately...');
        showToast('Creating and publishing post...', 'info');

        // Step 1: Create the post as draft
        const createResponse = await onPostCreated(apiPostData);
        console.log('✅ Post created:', createResponse);

        if (!createResponse?.data?._id) {
          throw new Error('Failed to create post - no ID returned');
        }

        // Step 2: Immediately publish the created post
        const postId = createResponse.data._id;
        console.log('📤 Publishing post with ID:', postId);

        const publishResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/posts/${postId}/publish`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log('✅ Publish response:', publishResponse);

        if (publishResponse.data.success) {
          showToast('Post published successfully!', 'success');
        } else {
          throw new Error(publishResponse.data.message || 'Publishing failed');
        }
      }

      // Reset form on success
      resetForm();
      onClose();

    } catch (error) {
      console.error('❌ Failed to create/publish post:', error);
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

  // AI Content Generation
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

      const response = await apiClient.generateContent({
        prompt: aiPrompt,
        tone: 'casual',
        platforms: selectedPlatforms,
        includeHashtags: true,
        maxLength: 280
      });

      console.log('AI Response:', response);

      if (response.success && response.data) {
        const suggestions = [];

        // ✅ UPDATED: Handle the response structure and extract hashtags
        Object.entries(response.data.content).forEach(([platform, data]) => {
          // Extract hashtags from the AI-generated content
          const { content, hashtags } = extractHashtagsFromContent(data.content);

          suggestions.push({
            id: `${platform}-${Date.now()}`,
            content: content, // Content without hashtags
            hashtags: hashtags.join(' '), // Hashtags as string
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
      const selectedPlatform = postData.platforms[0];

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

  const generateMentions = async () => {
    // Check if platforms are selected
    if (postData.platforms.length === 0) {
      showToast('Please select at least one social media platform first', 'error');
      return;
    }

    if (!postData.content.trim()) {
      showToast('Please enter some content first to generate mentions', 'error');
      return;
    }

    setIsGenerating(true);
    setError(null);
    showToast('Generating mentions...', 'info');

    try {
      const selectedPlatform = postData.platforms[0];

      const response = await apiClient.suggestMentions({
        content: postData.content,
        platform: selectedPlatform,
        count: 5,
        mentionTypes: ['influencers', 'brands'],
        verifiedOnly: false
      });

      console.log('Mentions Response:', response);

      if (response.success && response.data.mentions) {
        const newMentions = response.data.mentions.join(' ');
        setPostData(prev => ({
          ...prev,
          mentions: prev.mentions ? `${prev.mentions} ${newMentions}` : newMentions
        }));
        showToast(`Added ${response.data.mentions.length} mentions`, 'success');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Mentions generation failed:', error);
      setError('Failed to generate mentions. Please try again.');
      showToast('Failed to generate mentions', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ UPDATED: Apply AI suggestion with hashtag extraction
  const applyAISuggestion = (suggestion) => {
    console.log('Applying AI suggestion:', suggestion);
    console.log('Original content:', suggestion.content);
    console.log('Suggestion hashtags:', suggestion.hashtags);

    setPostData(prev => ({
      ...prev,
      content: suggestion.content, // Content should already be without hashtags
      hashtags: suggestion.hashtags || '', // Hashtags in separate field
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

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!showImageCarousel) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevImage();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'Escape') {
        closeCarousel();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showImageCarousel, postData.images.length]);

  if (!isOpen) return null;

  return (
    <div className={`create-post-overlay ${showMediaLibrary ? 'media-library-open' : ''}`}>
      {/* Toast Notification */}
      {/* {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )} */}

      {/* Image Carousel Modal */}
      {showImageCarousel && postData.images.length > 0 && (
        <div className="carousel-overlay" onClick={closeCarousel}>
          <div className="carousel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="carousel-header">
              <div className="carousel-counter">
                {currentCarouselIndex + 1} of {postData.images.length}
              </div>
              <div className="carousel-actions">
                <button
                  className="carousel-btn"
                  onClick={() => openCarousel(currentCarouselIndex)}
                  title="View details"
                >
                  <Maximize2 size={20} />
                </button>
                <button
                  className="carousel-btn"
                  onClick={closeCarousel}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="carousel-content">
              {postData.images.length > 1 && (
                <button
                  className="carousel-nav carousel-nav-prev"
                  onClick={goToPrevImage}
                  title="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <div className="carousel-main">
                {postData.images.map((mediaItem, index) => {
                  const isVideo = mediaItem.fileType === 'video' || mediaItem.url?.includes('video');
                  const displayName = mediaItem.displayName || mediaItem.originalName || mediaItem.altText || `Media ${index + 1}`;

                  return (
                    <div
                      key={index}
                      className={`carousel-slide ${index === currentCarouselIndex ? 'active' : ''}`}
                    >
                      {isVideo ? (
                        <video
                          src={mediaItem.url}
                          controls
                          className="carousel-media"
                          onError={(e) => {
                            console.error('Failed to load video:', mediaItem.url);
                          }}
                        />
                      ) : (
                        <img
                          src={mediaItem.url}
                          alt={mediaItem.altText || displayName}
                          className="carousel-media"
                          onError={(e) => {
                            console.error('Failed to load image:', mediaItem.url);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {postData.images.length > 1 && (
                <button
                  className="carousel-nav carousel-nav-next"
                  onClick={goToNextImage}
                  title="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {postData.images.length > 1 && (
              <div className="carousel-thumbnails">
                {postData.images.map((mediaItem, index) => {
                  const isVideo = mediaItem.fileType === 'video' || mediaItem.url?.includes('video');
                  const displayName = mediaItem.displayName || mediaItem.originalName || mediaItem.altText || `Media ${index + 1}`;

                  return (
                    <button
                      key={index}
                      className={`carousel-thumbnail ${index === currentCarouselIndex ? 'active' : ''}`}
                      onClick={() => goToImage(index)}
                      title={displayName}
                    >
                      {isVideo ? (
                        <div className="thumbnail-video">
                          <video src={mediaItem.url} muted />
                          <div className="video-indicator">
                            <Play size={12} />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={mediaItem.url}
                          alt={mediaItem.altText || displayName}
                          onError={(e) => {
                            console.error('Failed to load thumbnail:', mediaItem.url);
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="carousel-info">
              <div className="media-details">
                <h4>{postData.images[currentCarouselIndex]?.displayName || postData.images[currentCarouselIndex]?.originalName || `Media ${currentCarouselIndex + 1}`}</h4>
                {postData.images[currentCarouselIndex]?.size && (
                  <p className="file-size">{formatFileSize(postData.images[currentCarouselIndex].size)}</p>
                )}
                {postData.images[currentCarouselIndex]?.dimensions && (
                  <p className="dimensions">
                    {postData.images[currentCarouselIndex].dimensions.width} × {postData.images[currentCarouselIndex].dimensions.height}
                  </p>
                )}
              </div>
              <div className="carousel-remove-action">
                <button
                  className="remove-from-carousel-btn"
                  onClick={() => {
                    removeMedia(currentCarouselIndex);
                    if (postData.images.length <= 1) {
                      closeCarousel();
                    } else if (currentCarouselIndex >= postData.images.length - 1) {
                      setCurrentCarouselIndex(postData.images.length - 2);
                    }
                  }}
                  title="Remove this media"
                >
                  Remove Media
                </button>
              </div>
            </div>
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

          {/* {loadingProfile && (
            <div className="loading-profile">
              <Loader />
                            <span>Loading profile...</span>
            </div>
          )} */}

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
                            {/* ✅ FIXED: Display AI suggestion with formatted content */}
                            <div
                              className="suggestion-content"
                              dangerouslySetInnerHTML={{
                                __html: formatContentForDisplay(suggestion.content)
                              }}
                            />
                            <div className="suggestion-hashtags">
                              {/* <Hash size={12} /> */}
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

              {/* Main Form Column - ALWAYS visible */}
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
                      <button
                        type="button"
                        className="ai-hashtag-btn" // reuse the same styling as hashtags
                        onClick={generateMentions}
                        disabled={isGenerating || !postData.content.trim()}
                        title="Generate mentions with AI"
                      >
                        {isGenerating ? <></> : <Sparkles size={14} />}
                        AI
                      </button>
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

                {/* Enhanced Media Upload Section with Carousel Support */}
                <div className="form-section">

                  {/* <label className="section-label">
                    <Image size={16} />
                    Media (Images & Videos)
                    {postData.images.length > 0 && (
                      <div className="media-actions">
                        <button
                          type="button"
                          className="view-carousel-btn"
                          onClick={() => openCarousel(0)}
                          title="View in carousel"
                        >
                          <GalleryHorizontal size={14} />
                          View All
                        </button>
                      </div>
                    )}
                  </label> */}

                  <div className="headz">
                    <label className="section-label">
                      <Image size={16} />
                      Media (Images & Videos)
                    </label>

                    <label className="section-label px" onClick={() => setShowMediaLibrary(true)}>
                      <FolderOpen size={16} />
                      Import from Media Library
                    </label>
                  </div>



                  {/* Upload Options Grid */}
                  <div className="media-upload-container">
                    <div className="upload-options-grid">

                      {/* Upload New Files with Drag & Drop */}
                      <div className="upload-option">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*"
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
                                <span className='upidsc'><Image size={16} />  PNG, JPG, GIF up to 50MB</span>
                                <span className='upidsc'><Video size={16} />  MP4, MOV, AVI up to 250MB</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Import from Media Library */}

                      {/* <div className="upload-option">
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
                      </div> */}

                    </div>
                  </div>

                  {/* Enhanced Media Previews with Carousel Integration */}
                  {postData.images && postData.images.length > 0 && (
                    <div className="uploaded-media-section">
                      <div className="media-section-header">
                        <h4>Selected Media ({postData.images.length})</h4>
                        <div className="media-header-actions">
                          {postData.images.length > 1 && (
                            <button
                              type="button"
                              className="view-carousel-header-btn"
                              onClick={() => openCarousel(0)}
                              title="View in carousel"
                            >
                              <GalleryHorizontal size={16} />
                              View Carousel
                            </button>
                          )}
                          <button
                            type="button"
                            className="clear-all-media"
                            onClick={() => setPostData(prev => ({ ...prev, images: [] }))}
                            title="Remove all media"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      <div className="media-preview-grid">
                        {postData.images.map((mediaItem, index) => {
                          const MediaIcon = getMediaTypeIcon(mediaItem);
                          const isVideo = mediaItem.fileType === 'video' || mediaItem.url?.includes('video');
                          const displayName = mediaItem.displayName || mediaItem.originalName || mediaItem.altText || `Media ${index + 1}`;

                          return (
                            <div key={index} className="media-preview-item">
                              <div className="media-preview-container">
                                {/* Clickable Image/Video Preview */}
                                <div
                                  className="media-preview-wrapper"
                                  onClick={() => openCarousel(index)}
                                  title="Click to view in carousel"
                                >
                                  {isVideo ? (
                                    <div className="video-preview">
                                      <video
                                        src={mediaItem.url}
                                        className="media-preview-content"
                                        muted
                                        playsInline
                                      />
                                      <div className="video-overlay">
                                        <Play size={24} className="play-icon" />
                                      </div>
                                      <div className="preview-overlay">
                                        <Eye size={20} />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="image-preview">
                                      <img
                                        src={mediaItem.url}
                                        alt={mediaItem.altText || displayName}
                                        className="media-preview-content"
                                        onError={(e) => {
                                          console.error('Failed to load image preview:', mediaItem.url);
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                      <div className="preview-overlay">
                                        <Eye size={20} />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Media Controls */}
                                <div className="media-controls">
                                  <button
                                    type="button"
                                    className="media-control-btn view-btn"
                                    onClick={() => openCarousel(index)}
                                    title="View in carousel"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="media-control-btn remove-btn"
                                    onClick={() => removeMedia(index)}
                                    title={`Remove ${displayName}`}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                                {/* Position Indicator for Multiple Images */}
                                {postData.images.length > 1 && (
                                  <div className="position-indicator">
                                    {index + 1}
                                  </div>
                                )}

                                {/* Loading Overlay for uploading files */}
                                {mediaItem.isLocal && uploadingFiles && (
                                  <div className="upload-overlay">
                                    <Loader size={20} />
                                  </div>
                                )}
                              </div>

                              {/* Media Info */}
                              <div className="media-preview-info">
                                <div className="media-name" title={displayName}>
                                  <MediaIcon size={14} />
                                  <span>
                                    {displayName.length > 15
                                      ? `${displayName.substring(0, 15)}...`
                                      : displayName
                                    }
                                  </span>
                                </div>
                                {mediaItem.size && (
                                  <div className="media-size">
                                    {formatFileSize(mediaItem.size)}
                                  </div>
                                )}
                                {mediaItem.dimensions && (
                                  <div className="media-dimensions">
                                    {mediaItem.dimensions.width}×{mediaItem.dimensions.height}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Carousel Quick Navigation */}
                      {postData.images.length > 3 && (
                        <div className="carousel-quick-nav">
                          <button
                            className="quick-nav-btn"
                            onClick={() => openCarousel(0)}
                          >
                            <GalleryHorizontal size={16} />
                            View All {postData.images.length} Media Files
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Scheduler Section */}
                <div className="form-section">
                  <label className="section-label">
                    <Clock size={16} />
                    Scheduler
                  </label>

                  <div className="scheduler-options">
                    <div className="radio-group">
                      <label className={`radio-option ${!isScheduled ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="scheduler"
                          value="now"
                          checked={!isScheduled}
                          onChange={() => {
                            setIsScheduled(false);
                            setPostData(prev => ({
                              ...prev,
                              scheduledDate: '',
                              scheduledTime: ''
                            }));
                          }}
                        />
                        <span className="radio-custom"></span>
                        <div className="radio-content">
                          <small className="radio-description">
                            <span className="radio-label">Publish Now</span>
                          </small>
                        </div>
                      </label>

                      <label className={`radio-option ${isScheduled ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="scheduler"
                          value="later"
                          checked={isScheduled}
                          onChange={() => {
                            setIsScheduled(true);
                            // Default: 1 hour later if no date set
                            if (!postData.scheduledDate) {
                              const defaultDate = new Date();
                              defaultDate.setHours(defaultDate.getHours() + 1);
                              setPostData(prev => ({
                                ...prev,
                                scheduledDate: defaultDate.toISOString().split("T")[0],
                                scheduledTime: defaultDate.toTimeString().slice(0, 5)
                              }));
                            }
                          }}
                        />
                        <span className="radio-custom"></span>
                        <small className="radio-description">
                          <div className="radio-content">
                            <span className="radio-label">Schedule For Later</span>
                          </div>
                        </small>
                      </label>
                    </div>

                    {/* Show date/time picker only if scheduled */}
                    {isScheduled && (
<div className="schedule-inputs">
  <div className="input-group">
    <input
      type="date"
      value={postData.scheduledDate}
      onChange={(e) =>
        setPostData(prev => ({ ...prev, scheduledDate: e.target.value }))
      }
      className="form-input"
      min={new Date().toISOString().split("T")[0]}
      required
    />
  </div>
  
  <div className="input-group">
    <div className="time-input-container">
      <div className="time-input-header">
        <span className="time-input-label">Select time</span>
        <Clock size={16} className="time-input-icon" />
      </div>
      <div className="time-picker-12hr">
        <select
          value={postData.scheduledTime ? convertTo12Hour(postData.scheduledTime).hour : '12'}
          onChange={(e) => {
            const currentTime = postData.scheduledTime ? convertTo12Hour(postData.scheduledTime) : { hour: '12', minute: '00', period: 'PM' };
            const newTime = { ...currentTime, hour: e.target.value };
            const time24 = convertTo24Hour(newTime.hour, newTime.minute, newTime.period);
            setPostData(prev => ({ ...prev, scheduledTime: time24 }));
          }}
          className="time-select"
          required
        >
          {[...Array(12)].map((_, i) => {
            const hour = i + 1;
            return (
              <option key={hour} value={hour.toString()}>
                {hour}
              </option>
            );
          })}
        </select>
        
        <span className="time-separator">:</span>
        
        <select
          value={postData.scheduledTime ? convertTo12Hour(postData.scheduledTime).minute : '00'}
          onChange={(e) => {
            const currentTime = postData.scheduledTime ? convertTo12Hour(postData.scheduledTime) : { hour: '12', minute: '00', period: 'PM' };
            const newTime = { ...currentTime, minute: e.target.value };
            const time24 = convertTo24Hour(newTime.hour, newTime.minute, newTime.period);
            setPostData(prev => ({ ...prev, scheduledTime: time24 }));
          }}
          className="time-select"
          required
        >
          {[...Array(60)].map((_, i) => {
            const minute = i.toString().padStart(2, '0');
            return (
              <option key={minute} value={minute}>
                {minute}
              </option>
            );
          })}
        </select>
        
        <select
          value={postData.scheduledTime ? convertTo12Hour(postData.scheduledTime).period : 'PM'}
          onChange={(e) => {
            const currentTime = postData.scheduledTime ? convertTo12Hour(postData.scheduledTime) : { hour: '12', minute: '00', period: 'PM' };
            const newTime = { ...currentTime, period: e.target.value };
            const time24 = convertTo24Hour(newTime.hour, newTime.minute, newTime.period);
            setPostData(prev => ({ ...prev, scheduledTime: time24 }));
          }}
          className="time-select period-select"
          required
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  </div>

  


                        {/* {(postData.scheduledDate && postData.scheduledTime) && (
          <div className="scheduled-display">
            <Calendar size={14} />
            <span>
              Scheduled for{" "}
              {new Date(`${postData.scheduledDate}T${postData.scheduledTime}`)
                .toLocaleDateString()}{" "}
              at{" "}
              {new Date(`${postData.scheduledDate}T${postData.scheduledTime}`)
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )} */}
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
                            <div className={`preview-images ${postData.images.length === 1 ? 'single-image' :
                              postData.images.length === 2 ? 'two-images' :
                                postData.images.length === 3 ? 'three-images' :
                                  postData.images.length === 4 ? 'four-images' : ''
                              }`}>
                              {postData.images.map((mediaItem, index) => {
                                const isVideo = mediaItem.fileType === 'video' ||
                                  mediaItem.url?.includes('video') ||
                                  mediaItem.url?.includes('.mp4') ||
                                  mediaItem.url?.includes('.mov') ||
                                  mediaItem.url?.includes('.avi');

                                return isVideo ? (
                                  <video
                                    key={index}
                                    src={mediaItem.url}
                                    className="preview-video"
                                    controls
                                    muted
                                    playsInline
                                    onError={(e) => {
                                      console.error('Preview video failed to load');
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <img
                                    key={index}
                                    src={mediaItem.url}
                                    alt={mediaItem.altText || "Post preview"}
                                    onError={(e) => {
                                      console.error('Preview image failed to load');
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                );
                              })}
                            </div>
                          )}
                          <div className="preview-text">
                            <p>{postData.content}</p>
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

            <div className="footer-actions">
              {/* Save as Draft Button */}
              <button
                type="button"
                className="btn-secondary-draft"
                onClick={onSaveDraft}
                disabled={isSubmitting}
              >
                Save as Draft
              </button>

              {/* Publish / Schedule Button Footer */}
              <button
                type="submit"
                className="btn-primary scpst"
                disabled={
                  !postData.content.trim() ||
                  postData.platforms.length === 0 ||
                  charCount.remaining < 0 ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <>
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

// Enhanced Media Library Modal with Carousel Support
const MediaLibraryModal = ({ isOpen, onClose, onSelectImages }) => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLibraryCarousel, setShowLibraryCarousel] = useState(false);
  const [libraryCarouselIndex, setLibraryCarouselIndex] = useState(0);

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

      // Filter both images and videos
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
      const imageId = image._id || image.id;
      const isSelected = prev.some(img => (img._id || img.id) === imageId);

      if (isSelected) {
        return prev.filter(img => (img._id || img.id) !== imageId);
      } else {
        return [...prev, {
          url: image.url,
          altText: image.altText || image.originalName || image.filename,
          publicId: image.publicId,
          _id: imageId,
          filename: image.originalName || image.filename,
          fileType: image.fileType,
          size: image.size,
          dimensions: image.dimensions
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
    setShowLibraryCarousel(false);
    setLibraryCarouselIndex(0); // Reset carousel index when closing
    onClose();
  };

  const filteredMedia = mediaList.filter(item => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      item.filename?.toLowerCase().includes(searchTerm) ||
      item.originalName?.toLowerCase().includes(searchTerm) ||
      item.altText?.toLowerCase().includes(searchTerm)
    );
  });

  const openLibraryCarousel = (index) => {
    // Don't open carousel if no media or index is invalid
    if (filteredMedia.length === 0) return;

    // Ensure index is within bounds of filtered media
    const safeIndex = Math.max(0, Math.min(index, filteredMedia.length - 1));
    setLibraryCarouselIndex(safeIndex);
    setShowLibraryCarousel(true);
  };

  const closeLibraryCarousel = () => {
    setShowLibraryCarousel(false);
    setLibraryCarouselIndex(0); // Reset index when closing carousel
  };

  // Keyboard navigation for library carousel
  useEffect(() => {
    if (!showLibraryCarousel || filteredMedia.length <= 1) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setLibraryCarouselIndex(prev =>
            prev === 0 ? filteredMedia.length - 1 : prev - 1
          );
          break;
        case 'ArrowRight':
          e.preventDefault();
          setLibraryCarouselIndex(prev =>
            prev === filteredMedia.length - 1 ? 0 : prev + 1
          );
          break;
        case 'Escape':
          e.preventDefault();
          closeLibraryCarousel();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (filteredMedia[libraryCarouselIndex]) {
            handleImageToggle(filteredMedia[libraryCarouselIndex]);
            closeLibraryCarousel();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLibraryCarousel, filteredMedia.length, libraryCarouselIndex]);

  if (!isOpen) return null;

  return (
    <>
      {/* Library Carousel - Separate overlay */}
      {showLibraryCarousel && (
        <div
          className="library-carousel-overlay"
          onClick={closeLibraryCarousel}
        >
          <div
            className="library-carousel-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="carousel-header">
              <div className="carousel-counter">
                {libraryCarouselIndex + 1} of {filteredMedia.length}
              </div>
              <button
                className="carousel-close-btn"
                onClick={closeLibraryCarousel}
              >
                <X size={20} />
              </button>
            </div>

            <div className="carousel-content">
              {filteredMedia.length > 1 && (
                <button
                  className="carousel-nav carousel-nav-prev"
                  onClick={() => setLibraryCarouselIndex(prev =>
                    prev === 0 ? filteredMedia.length - 1 : prev - 1
                  )}
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <div className="carousel-main">
                {filteredMedia.map((mediaItem, index) => {
                  const isVideo = mediaItem.fileType?.startsWith('video');
                  const displayName = mediaItem.originalName || mediaItem.filename;

                  return (
                    <div
                      key={index}
                      className={`carousel-slide ${index === libraryCarouselIndex ? 'active' : ''}`}
                    >
                      {isVideo ? (
                        <video
                          src={mediaItem.url}
                          controls
                          className="carousel-media"
                        />
                      ) : (
                        <img
                          src={mediaItem.url}
                          alt={mediaItem.altText || displayName}
                          className="carousel-media"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredMedia.length > 1 && (
                <button
                  className="carousel-nav carousel-nav-next"
                  onClick={() => setLibraryCarouselIndex(prev =>
                    prev === filteredMedia.length - 1 ? 0 : prev + 1
                  )}
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            <div className="carousel-actions">
              <button
                className="carousel-action-btn select-btn"
                onClick={() => {
                  const currentMedia = filteredMedia[libraryCarouselIndex];
                  if (currentMedia) {
                    handleImageToggle(currentMedia);
                    closeLibraryCarousel();
                  }
                }}
                disabled={!filteredMedia[libraryCarouselIndex]}
              >
                {filteredMedia[libraryCarouselIndex] && selectedImages.some(img => (img._id || img.id) === (filteredMedia[libraryCarouselIndex]._id || filteredMedia[libraryCarouselIndex].id))
                  ? 'Remove from Selection'
                  : 'Add to Selection'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Media Library Modal */}
      {!showLibraryCarousel && (
        <div className="media-library-modal-overlay" onClick={handleClose}>
          <div className="media-library-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Media from Library</h3>
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
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Selected Images Counter */}
              {selectedImages.length > 0 && (
                <div className="selected-counter">
                  {selectedImages.length} item{selectedImages.length > 1 ? 's' : ''} selected
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
                    <h4>No media found</h4>
                    <p>
                      {searchQuery
                        ? `No media matches "${searchQuery}"`
                        : "Upload some media to your library first"
                      }
                    </p>
                  </div>
                ) : (
                  filteredMedia.map((media, index) => {
                    const mediaId = media._id || media.id;
                    const isSelected = selectedImages.some(img => (img._id || img.id) === mediaId);
                    const displayName = media.originalName || media.filename;
                    const isVideo = media.fileType?.startsWith('video');

                    return (
                      <div
                        key={mediaId}
                        className={`media-library-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleImageToggle(media)} // ✅ select whole container
                      >
                        <div className="media-thumbnail">
                          {isVideo ? (
                            <div className="video-thumbnail">
                              <video src={media.url} muted />
                              <div className="video-indicator">
                                <Play size={16} />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={media.url}
                              alt={media.altText || displayName}
                              loading="lazy"
                            />
                          )}

                          <div className="thumbnail-overlay">
                            <button
                              className={`media-action-btn select-btn ${isSelected ? 'selected' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();      // ✅ prevent bubbling to parent
                                handleImageToggle(media); // still works if you click just the button
                              }}
                              title={isSelected ? 'Remove from selection' : 'Add to selection'}
                            >
                              {isSelected ? <X size={14} /> : <Check size={14} />}
                            </button>
                          </div>
                        </div>

                        <div className="media-info">
                          <span className="media-filename" title={displayName}>
                            {displayName?.length > 25
                              ? `${displayName.substring(0, 25)}...`
                              : displayName || 'Untitled'
                            }
                          </span>
                          <div className="media-metadata">
                            <span className="media-size">
                              {media.humanSize || `${Math.round(media.size / 1024)}KB`}
                            </span>
                            {media.dimensions && (
                              <span className="media-dimensions">
                                {media.dimensions.width} × {media.dimensions.height}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="media-actions">
                          <button
                            className="media-action-btn view-btn"
                            onClick={(e) => {
                              e.stopPropagation(); // ✅ so selecting isn’t triggered
                              openLibraryCarousel(index);
                            }}
                            title="View in carousel"
                          >
                            <Eye size={14} />
                          </button>
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
                Add {selectedImages.length} Item{selectedImages.length !== 1 ? 's' : ''} to Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;