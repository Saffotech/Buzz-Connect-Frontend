import { useState, useEffect } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { useMedia } from '../hooks/useApi';
import apiClient from '../utils/api';
import { PLATFORMS, PLATFORM_CONFIGS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import './CreatePost.css';
import Loader from '../components/common/Loader';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const CreatePost = ({ isOpen, onClose, onPostCreated, connectedAccounts }) => {
  const { uploadMedia } = useMedia();
  const { user, token } = useAuth();
  const navigate = useNavigate();


  const [userProfile, setUserProfile] = useState(null);


  const [postData, setPostData] = useState({
    content: '',
    platforms: [],
    selectedAccounts: {}, // { platformId: [accountId1, accountId2, ...] }
    scheduledDate: '',
    scheduledTime: '',
    images: [],
    hashtags: '',
    mentions: ''
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

  // Fetch user profile and connected accounts on mount
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);


  const handleConnectClick = (e) => {
    e.stopPropagation(); // prevent triggering toggle
    navigate('/settings?tab=accounts');
  };


  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserProfile(response.data.data); // same pattern as working code
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
      { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
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
    return postData.platforms.length > 0; // Images required if any platform is selected
  };

  // Toast notification function
  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

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
        if (selectedAccountsForPlatform.length === 0) {
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
    const charCount = getCharacterCount();
    if (charCount.remaining < 0) {
      setError('Content exceeds character limit');
      return false;
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
        if (selectedAccountsForPlatform.length === 0) {
          const platformName = platforms.find(p => p.id === platform)?.name;
          setError(`Please select at least one account for ${platformName}`);
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
    setPostData(prev => {
      const currentAccounts = prev.selectedAccounts[platformId] || [];
      
      let newAccounts;
      if (isSelected) {
        // Add account if not already present
        newAccounts = currentAccounts.includes(accountId) 
          ? currentAccounts 
          : [...currentAccounts, accountId];
      } else {
        // Remove account
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

    console.log('Files selected:', files);
    setUploadingFiles(true);
    setError(null);

    try {
      // For immediate preview, create local URLs
      const localPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        altText: file.name,
        isLocal: true
      }));

      // Add local previews immediately
      setPostData(prev => ({
        ...prev,
        images: [...prev.images, ...localPreviews]
      }));

      showToast('Uploading images...', 'info');

      // Upload files to Cloudinary via API
      const response = await uploadMedia(files);
      console.log('Upload response:', response);

      const uploadedImages = response.data.map(media => ({
        url: media.url,
        altText: media.originalName,
        publicId: media.publicId
      }));

      console.log('Uploaded images:', uploadedImages);

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
      // Prepare post data for API
      const apiPostData = {
        content: postData.content,
        platforms: postData.platforms,
        selectedAccounts: postData.selectedAccounts,
        images: postData.images.map(img => ({
          url: img.url || img,
          altText: img.altText || 'Post image'
        })),
        hashtags: Array.isArray(postData.hashtags)
          ? postData.hashtags
          : postData.hashtags.split(' ').filter(tag => tag.startsWith('#')),
        mentions: Array.isArray(postData.mentions)
          ? postData.mentions
          : postData.mentions.split(' ').filter(mention => mention.startsWith('@'))
      };

      // Add scheduled date if scheduling
      if (isScheduled && postData.scheduledDate && postData.scheduledTime) {
        const scheduledDateTime = new Date(`${postData.scheduledDate}T${postData.scheduledTime}`);
        apiPostData.scheduledDate = scheduledDateTime.toISOString();
      }

      showToast(isScheduled ? 'Scheduling post...' : 'Publishing post...', 'info');

      // Create post via API
      const response = await onPostCreated(apiPostData);

      showToast(isScheduled ? 'Post scheduled successfully!' : 'Post published successfully!', 'success');

      // Reset form on success
      resetForm();
      onClose();

    } catch (error) {
      console.error('Failed to create post:', error);
      setError(error.message || ERROR_MESSAGES.SERVER_ERROR);
      showToast('Failed to create post', 'error');
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
      mentions: ''
    });
    setIsScheduled(false);
    setPreviewMode(false);
    setShowAISuggestions(false);
    setAiSuggestions([]);
    setAiPrompt('');
    setError(null);
    setToast(null);
  };

  const getCharacterCount = () => {
    const twitterSelected = postData.platforms.includes('twitter');
    const maxLength = twitterSelected ? 280 : 2200;
    return {
      current: postData.content.length,
      max: maxLength,
      remaining: maxLength - postData.content.length
    };
  };

  const charCount = getCharacterCount();

  // AI Content Generation
  const generateAIContent = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    showToast('Generating AI content...', 'info');

    try {
      // Generate content for different tones using the real AI API
      const tones = ['enthusiastic', 'professional', 'casual', 'educational'];
      const selectedPlatforms = postData.platforms.length > 0 ? postData.platforms : ['instagram'];

      const suggestions = [];

      // Generate content for each tone
      for (let i = 0; i < tones.length; i++) {
        const tone = tones[i];

        try {
          const response = await apiClient.generateContent({
            prompt: aiPrompt,
            platforms: selectedPlatforms,
            tone: tone,
            includeHashtags: true,
            includeEmojis: true
          });

          if (response.success) {
            // Process each platform's content
            Object.entries(response.data).forEach(([platform, data]) => {
              suggestions.push({
                id: `${tone}-${platform}-${i}`,
                content: data.content,
                hashtags: data.hashtags ? data.hashtags.join(' ') : '',
                tone: tone.charAt(0).toUpperCase() + tone.slice(1),
                platforms: [platform],
                characterCount: data.characterCount,
                withinLimit: data.withinLimit,
                provider: response.provider || 'ai'
              });
            });
          }
        } catch (toneError) {
          console.error(`Failed to generate ${tone} content:`, toneError);
          // Continue with other tones even if one fails
        }
      }

      // If no suggestions were generated, create a fallback
      if (suggestions.length === 0) {
        suggestions.push({
          id: 'fallback-1',
          content: `✨ ${aiPrompt} - Let's make this amazing! What do you think?`,
          hashtags: '#content #social #engagement',
          tone: 'Casual',
          platforms: selectedPlatforms,
          characterCount: 0,
          withinLimit: true,
          provider: 'fallback'
        });
      }

      setAiSuggestions(suggestions);
      showToast(`Generated ${suggestions.length} AI suggestions`, 'success');
    } catch (error) {
      console.error('AI generation failed:', error);
      setError('Failed to generate AI content. Please try again.');
      showToast('Failed to generate AI content', 'error');

      // Provide fallback suggestions
      setAiSuggestions([{
        id: 'error-fallback',
        content: `🚀 ${aiPrompt} - Share your thoughts with the world!`,
        hashtags: '#content #social #share',
        tone: 'Casual',
        platforms: postData.platforms.length > 0 ? postData.platforms : ['instagram'],
        characterCount: 0,
        withinLimit: true,
        provider: 'fallback'
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Hashtag Generation
  const generateHashtags = async () => {
    if (!postData.content.trim()) {
      showToast('Please enter some content first to generate hashtags', 'error');
      return;
    }

    setIsGenerating(true);
    setError(null);
    showToast('Generating hashtags...', 'info');

    try {
      const selectedPlatform = postData.platforms.length > 0 ? postData.platforms[0] : 'instagram';

      const response = await apiClient.suggestHashtags({
        content: postData.content,
        platform: selectedPlatform,
        count: 10
      });

      if (response.success && response.data.hashtags) {
        const newHashtags = response.data.hashtags.join(' ');
        setPostData(prev => ({
          ...prev,
          hashtags: prev.hashtags ? `${prev.hashtags} ${newHashtags}` : newHashtags
        }));
        showToast(`Added ${response.data.hashtags.length} hashtags`, 'success');
      } else {
        setError('Failed to generate hashtags. Please try again.');
        showToast('Failed to generate hashtags', 'error');
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
    // Keep AI suggestions visible for easy comparison and further editing
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
      // Clean up any blob URLs when component unmounts
      postData.images.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="create-post-overlay">
      <div className="create-post-modal">
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
                {/* Platform Selection - Updated with Multi-Account Selection */}
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

                          {/* Multi-Account Selection with Checkboxes */}
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
                                  const accountId = account.accountId || account.id;
                                  const isChecked = isAccountSelected(platform.id, accountId);
                                  
                                  return (
                                    <label key={accountId} className="account-checkbox-item">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => handleAccountSelection(platform.id, accountId, e.target.checked)}
                                        className="account-checkbox"
                                      />
                                      <span className="checkbox-custom"></span>
                                      <span className="account-name">
                                        {account.username || account.name || accountId}
                                        {account.pageId && (
                                          <span className="account-id"> (ID: {account.pageId})</span>
                                        )}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                              
                              {/* Select All / Deselect All buttons */}
                              {platform.accounts.length > 1 && (
                                <div className="account-selection-controls">
                                  <button
                                    type="button"
                                    className="select-all-btn"
                                    onClick={() => {
                                      platform.accounts.forEach(account => {
                                        const accountId = account.accountId || account.id;
                                        if (!isAccountSelected(platform.id, accountId)) {
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
                        {isGenerating ? <Loader /> : <Sparkles size={14} />}
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
                    Images
                  </label>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className={`upload-label ${uploadingFiles ? 'uploading' : ''}`}>
                      {uploadingFiles ? (
                        <>
                          <Loader className="spinner" size={24} />
                          <span>Uploading images...</span>
                          <small>Please wait while we upload your files</small>
                        </>
                      ) : (
                        <>
                          <Upload size={24} />
                          <span>Click to upload images or drag and drop</span>
                          <small>PNG, JPG, GIF up to 10MB each</small>
                        </>
                      )}
                    </label>
                  </div>

                  {postData.images.length > 0 && (
                    <div className="uploaded-images">
                      {postData.images.map((image, index) => (
                        <div key={index} className="image-preview">
                          <img
                            src={image.url || image}
                            alt={image.altText || `Upload ${index + 1}`}
                            onError={(e) => {
                              console.error('Image failed to load:', image);
                              e.target.style.display = 'none';
                              e.target.parentElement.classList.add('error');
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', image);
                            }}
                          />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => removeImage(index)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
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
                  <Loader className="spinner" size={16} />
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
    </div>
  );
};

export default CreatePost;