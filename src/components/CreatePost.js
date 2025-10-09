import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Image,
  Calendar,
  Instagram,
  Twitter,
  Facebook,
  Linkedin, // Added LinkedIn icon
  X,
  Youtube,
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
  ChevronLeftCircle,
  ChevronRight,
  ChevronRightCircle,
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";

const CreatePost = ({ isOpen, onClose, onPostCreated, connectedAccounts, initialData }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [hoveredPlatform, setHoveredPlatform] = useState(null);
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

  // ✅ ADD: Schedule DateTime Validation Function
  const validateScheduleDateTime = (date, time) => {
    if (!date || !time) return { isValid: true }; // Skip validation if not scheduling

    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (selectedDateTime <= now) {
      return {
        isValid: false,
        message: "Please select a future date and time to schedule your post."
      };
    }

    return { isValid: true };
  };

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

  // ✅ UPDATED: Enhanced real-time validation for schedule date/time changes
  useEffect(() => {
    if (isScheduled && postData.scheduledDate && postData.scheduledTime) {
      const validation = validateScheduleDateTime(postData.scheduledDate, postData.scheduledTime);
      if (!validation.isValid) {
        setError(validation.message);
      } else {
        // Clear error if it was a scheduling error
        if (error && (error.includes('future date') || error.includes('schedule') || error.includes('time'))) {
          setError(null);
        }
      }
    }
  }, [postData.scheduledDate, postData.scheduledTime, isScheduled, error]);


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

  const isValidInstagramAspectRatio = (width, height) => {
    if (!width || !height) return false;

    const ratio = width / height;
    const allowedRatios = [1, 4 / 5, 3 / 4, 1.91]; // exact ratios

    // allow small rounding errors (±0.01)
    return allowedRatios.some((r) => Math.abs(ratio - r) < 0.01);
  };

  const loadImageDimensions = (url) => {
    return new Promise((resolve) => {
      if (!url || url.match(/\.(mp4|mov|webm|avi|mkv)(\?|$)/i) || url.includes('video')) {
        return resolve(null);
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const ensureInstagramImagesValid = async (images) => {
    if (!images || images.length === 0) return true;

    for (let i = 0; i < images.length; i++) {
      const media = images[i];
      const isVideo = media.fileType === 'video' || (media.url && media.url.match(/\.(mp4|mov|webm|avi|mkv)(\?|$)/i)) || media.url?.includes('video');
      if (isVideo) continue;

      let dims = media.dimensions || (media.width && media.height ? { width: media.width, height: media.height } : null);
      if (!dims) dims = await loadImageDimensions(media.url);

      if (!dims || !dims.width || !dims.height) {
        showToast(`Couldn't determine dimensions for "${media.displayName || media.originalName || 'an image'}".`, 'error', 6000);
        return false;
      }

      if (!isValidInstagramAspectRatio(dims.width, dims.height)) {
        showToast(`"${media.displayName || media.originalName || 'An image'}" has unsupported aspect ratio (${(dims.width / dims.height).toFixed(2)}). Instagram feed accepts 0.8–1.91.`, 'error', 6000);
        return false;
      }
    }

    return true;
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

  const getFiveMinutesAhead = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const initialFiveMinAhead = useMemo(() => getFiveMinutesAhead(), []);

  // Set initial 5 min ahead only when scheduling is enabled
  useEffect(() => {
    if (isScheduled && !postData.scheduledTime) {
      console.log("⏳ Setting scheduledTime initially:", initialFiveMinAhead);
      setPostData(prev => ({ ...prev, scheduledTime: initialFiveMinAhead }));
    }
  }, [isScheduled, postData.scheduledTime, initialFiveMinAhead]);


  // Memoized conversion — ✅ re-runs when scheduledTime changes
  const currentTime12 = useMemo(() => {
    if (!postData.scheduledTime) return { hour: "12", minute: "00", period: "PM" };
    return convertTo12Hour(postData.scheduledTime);
  }, [postData.scheduledTime]);


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
    setTimeout(() => setToast(null), 6000);
  };

  // Fetch user profile and connected accounts on mount
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const validFiles = [];
    const invalidFiles = [];

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        invalidFiles.push({ file, reason: 'Unsupported file type' });
        return;
      }

      if (isVideo && file.size > 250 * 1024 * 1024) {
        invalidFiles.push({ file, reason: 'Video too large (max 250MB)' });
        return;
      }
      if (isImage && file.size > 50 * 1024 * 1024) {
        invalidFiles.push({ file, reason: 'Image too large (max 50MB)' });
        return;
      }

      validFiles.push(file);
    });

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
      console.log('✅ Uploading files:', validFiles);

      const response = await uploadMedia(validFiles);
      console.log('✅ Upload response:', response);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid upload response format');
      }

      const uploadedMedia = response.data.map((media, index) => {
        const originalFile = validFiles[index];

        // ✅ Always ensure url is present
        let mediaUrl = media.url || media.secure_url;
        if (!mediaUrl) {
          // fallback - use preview blob if server didn't return URL
          mediaUrl = URL.createObjectURL(originalFile);
        }

        return {
          url: mediaUrl, // REQUIRED for Joi validation
          altText: media.originalName || originalFile?.name || 'Post media',
          originalName: media.originalName || originalFile?.name || media.filename || 'Untitled Media',
          displayName: media.originalName || originalFile?.name || media.filename || 'Untitled Media',
          filename: media.filename || originalFile?.name,
          publicId: media.publicId,
          fileType: media.fileType || (originalFile?.type.startsWith('video/') ? 'video' : 'image'),
          size: media.size || originalFile?.size,
          dimensions: media.dimensions,
          duration: media.duration || null,
          fps: media.fps || null,
          hasAudio: media.hasAudio || null,
          thumbnails: media.thumbnails || null,
          videoQualities: media.videoQualities || null,
          platformOptimized: media.platformOptimized || null,
          format: originalFile?.type || 'application/octet-stream',
          createdAt: new Date().toISOString()
        };
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Get the raw data from API
        const userData = response.data.data;
        console.log('Raw API response data:', userData);

        // Ensure connectedPlatforms includes all platforms from connectedAccounts
        let connectedPlatforms = userData.connectedPlatforms || [];

        // Check if there are connected accounts for each platform type
        if (Array.isArray(userData.connectedAccounts)) {
          // Extract unique platform types from connectedAccounts
          const platformsFromAccounts = [
            ...new Set(userData.connectedAccounts.map(acc => acc.platform))
          ];

          // Ensure each platform from accounts exists in connectedPlatforms
          platformsFromAccounts.forEach(platform => {
            if (!connectedPlatforms.includes(platform)) {
              connectedPlatforms.push(platform);
            }
          });
        }

        // Update the userData with the enhanced connectedPlatforms
        userData.connectedPlatforms = connectedPlatforms;
        console.log('Enhanced user data:', userData);

        setUserProfile(userData);
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
      { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
      { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
      { id: 'twitter', name: 'X', icon: () => <FontAwesomeIcon icon={faXTwitter} size="lg" style={{ marginBottom: '4px' }} />, color: "#0A66C2" },
    ];

    return allPlatforms.map(platform => {
      // First check if there are platform-specific accounts (most reliable)
      const hasAccountsForPlatform = userProfile?.connectedAccounts?.some(acc =>
        acc.platform === platform.id && acc.connected !== false
      );
      // Then check if the platform is in the connectedPlatforms array
      const isInConnectedPlatforms = userProfile?.connectedPlatforms?.includes(platform.id);

      // A platform is connected if either condition is true
      const isConnected = hasAccountsForPlatform || isInConnectedPlatforms;
      return {
        ...platform,
        connected: isConnected,
        accounts: userProfile?.connectedAccounts?.filter(acc => acc.platform === platform.id) || []
      };
    });
  };

  const platforms = userProfile ? getAvailablePlatforms() : [];

  // Images are now required for all platforms
  const areImagesRequired = () => {
    return postData.platforms.includes('instagram', 'youtube', 'linkedin');
  };

  // Toast notification function
  const showToast = (message, type = 'info', duration = 5000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  // Enhanced character count based on platform limits from API response
  const getCharacterCount = () => {
    const limits = {
      twitter: 280,
      instagram: 2200,
      facebook: 63206,
      linkedin: 3000,
      youtube: 5000 // YouTube description limit
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

    // Check if accounts are selected for platforms that require it
    const platformsRequiringAccounts = ['instagram', 'facebook', 'linkedin', 'youtube'];
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

  // ✅ UPDATED: Enhanced validation for form submission with schedule validation
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

    // ✅ ADD: Validate schedule date/time
    if (isScheduled) {
      const dateTimeValidation = validateScheduleDateTime(postData.scheduledDate, postData.scheduledTime);
      if (!dateTimeValidation.isValid) {
        setError(dateTimeValidation.message);
        showToast(dateTimeValidation.message, 'error');
        return false;
      }
    }

    // Check if images are required but not provided
    if (areImagesRequired() && postData.images.length === 0) {
      setError('Images are required for all posts');
      return false;
    }

    // Add YouTube-specific validation
    if (postData.platforms.includes('youtube') && !validateYouTubeContent()) {
      return false;
    }

    // Check if accounts are selected for platforms that require it
    const platformsRequiringAccounts = ['instagram', 'facebook', 'linkedin']; // Added LinkedIn
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

  const validateYouTubeContent = () => {
    if (postData.platforms.includes('youtube')) {
      // Check if we have any video
      const hasVideo = postData.images.some(img =>
        img.fileType === 'video' ||
        img.url?.includes('video') ||
        img.url?.includes('.mp4')
      );

      if (!hasVideo) {
        showToast('YouTube posts require at least one video', 'error');
        return false;
      }

      // Check if title (content) is too long
      if (postData.content.length > 100) {
        showToast('YouTube title cannot exceed 100 characters', 'error');
        return false;
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

  console.log('Sending account usernames:', selectedAccountsWithNames);

  try {
    // Prepare base post data
    const apiPostData = {
      content: postData.content,
      platforms: postData.platforms,
      selectedAccounts: cleanedSelectedAccounts,
      selectedAccountsWithNames,
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
        order: index,
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

    // ✅ YouTube-specific handling
    if (postData.platforms.includes('youtube')) {
      apiPostData.title = postData.content.substring(0, 100);
      apiPostData.description =
        postData.hashtags ||
        `Thanks for watching this video about ${postData.content}!\n\nDon't forget to like and subscribe.`;

      const videoFiles = postData.images.filter(
        img => img.fileType === 'video' || img.url?.includes('.mp4')
      );

      if (videoFiles.length > 0) {
        const { _id, ...cleanedVideo } = videoFiles[0];
        apiPostData.youtubeVideo = cleanedVideo;

        if (postData.platforms.length === 1) {
          apiPostData.images = [cleanedVideo];
        }
      }

      if (postData.mentions) {
        apiPostData.tags = postData.mentions
          .split(/\s+/)
          .map(tag => (tag.startsWith('@') ? tag.substring(1) : tag))
          .filter(tag => tag.length > 0);
      }
    }

    // ✅ Scheduled vs Immediate
    if (isScheduled && postData.scheduledDate && postData.scheduledTime) {
      const scheduledDateTime = new Date(
        `${postData.scheduledDate}T${postData.scheduledTime}`
      );
      apiPostData.scheduledDate = scheduledDateTime.toISOString();

      console.log('📅 Scheduling post for:', scheduledDateTime.toISOString());
      const response = await onPostCreated(apiPostData);
      console.log('✅ Scheduled post created:', response);

      showToast('Post scheduled successfully!', 'success');
    } else {
      // Immediate publish flow
      console.log('🚀 Creating and publishing post immediately...');
      showToast('Creating and publishing post...', 'info');

      // Step 1: Create post
      const createResponse = await onPostCreated(apiPostData);
      if (!createResponse?.data?._id) throw new Error('Failed to create post - no ID returned');

      const postId = createResponse.data._id;
      console.log('📤 Publishing post with ID:', postId);

      // Step 2: Publish
      const publishResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/${postId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Publish response:', publishResponse);
      if (publishResponse.data.success) {
        showToast('Post published successfully!', 'success');
      } else {
        throw new Error(publishResponse.data.message || 'Publishing failed');
      }
    }

    // ✅ Cleanup
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


// ✅ MOVED MediaLibraryModal OUTSIDE CreatePost Component
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
    setLibraryCarouselIndex(0);
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
    if (filteredMedia.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, filteredMedia.length - 1));
    setLibraryCarouselIndex(safeIndex);
    setShowLibraryCarousel(true);
  };

  const closeLibraryCarousel = () => {
    setShowLibraryCarousel(false);
    setLibraryCarouselIndex(0);
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
                        onClick={() => handleImageToggle(media)}
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
                                e.stopPropagation();
                                handleImageToggle(media);
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
                              e.stopPropagation();
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
};

export default CreatePost;
