import { useState } from 'react';
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
  Loader,
  AlertCircle
} from 'lucide-react';
import { useMedia } from '../hooks/useApi';
import apiClient from '../utils/api';
import { PLATFORMS, PLATFORM_CONFIGS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';
import './CreatePost.css';

const CreatePost = ({ isOpen, onClose, onPostCreated }) => {
  const { uploadMedia } = useMedia();

  const [postData, setPostData] = useState({
    content: '',
    platforms: [],
    scheduledDate: '',
    scheduledTime: '',
    images: [],
    hashtags: [],
    mentions: []
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

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', connected: true },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2', connected: true },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', connected: false }
  ];

  const handlePlatformToggle = (platformId) => {
    setPostData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    setError(null);

    try {
      // Upload files to Cloudinary via API
      const response = await uploadMedia(files);
      const uploadedImages = response.data.map(media => ({
        url: media.url,
        altText: media.originalName,
        publicId: media.publicId
      }));

      setPostData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));
    } catch (error) {
      console.error('Failed to upload images:', error);
      setError(error.message || 'Failed to upload images');
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeImage = (index) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare post data for API
      const apiPostData = {
        content: postData.content,
        platforms: postData.platforms,
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

      // Create post via API
      const response = await onPostCreated(apiPostData);

      // Reset form on success
      resetForm();
      onClose();

    } catch (error) {
      console.error('Failed to create post:', error);
      setError(error.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPostData({
      content: '',
      platforms: [],
      scheduledDate: '',
      scheduledTime: '',
      images: [],
      hashtags: [],
      mentions: []
    });
    setIsScheduled(false);
    setPreviewMode(false);
    setShowAISuggestions(false);
    setAiSuggestions([]);
    setAiPrompt('');
    setError(null);
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
    } catch (error) {
      console.error('AI generation failed:', error);
      setError('Failed to generate AI content. Please try again.');

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
      setError('Please enter some content first to generate hashtags');
      return;
    }

    setIsGenerating(true);
    setError(null);

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
      } else {
        setError('Failed to generate hashtags. Please try again.');
      }
    } catch (error) {
      console.error('Hashtag generation failed:', error);
      setError('Failed to generate hashtags. Please try again.');
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
    // Keep AI suggestions visible for easy comparison and further editing
  };

  const copySuggestionContent = async (suggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.content);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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
            onClick={() => setActiveTab('preview')}
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
                {/* Platform Selection */}
                <div className="form-section">
                  <label className="section-label">Select Platforms</label>
                  <div className="platforms-grid">
                    {platforms.map(platform => {
                      const Icon = platform.icon;
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          className={`platform-btn ${postData.platforms.includes(platform.id) ? 'selected' : ''} ${!platform.connected ? 'disabled' : ''}`}
                          onClick={() => platform.connected && handlePlatformToggle(platform.id)}
                          disabled={!platform.connected}
                          style={{ '--platform-color': platform.color }}
                        >
                          <Icon size={20} />
                          <span>{platform.name}</span>
                          {!platform.connected && <span className="not-connected">Not Connected</span>}
                        </button>
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
                      {isGenerating ? <Loader size={14} className="spinning" /> : <Sparkles size={14} />}
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
                        <img src={image} alt={`Upload ${index + 1}`} />
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

              {/* Scheduling */}
              <div className="form-section">
                <div className="schedule-toggle">
                  <input
                    type="checkbox"
                    id="schedule-toggle"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                  />
                  <label htmlFor="schedule-toggle" className="toggle-label">
                    <Clock size={16} />
                    Schedule for later
                  </label>
                </div>
                
                {isScheduled && (
                  <div className="schedule-inputs">
                    <input
                      type="date"
                      value={postData.scheduledDate}
                      onChange={(e) => setPostData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <input
                      type="time"
                      value={postData.scheduledTime}
                      onChange={(e) => setPostData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="preview-tab">
              <div className="preview-content">
                <h3>Post Preview</h3>
                {postData.platforms.map(platformId => {
                  const platform = platforms.find(p => p.id === platformId);
                  const Icon = platform.icon;
                  return (
                    <div key={platformId} className="platform-preview" style={{ '--platform-color': platform.color }}>
                      <div className="platform-header">
                        <Icon size={20} />
                        <span>{platform.name}</span>
                      </div>
                      <div className="preview-post">
                        {postData.images.length > 0 && (
                          <div className="preview-images">
                            {postData.images.slice(0, 4).map((image, index) => (
                              <img key={index} src={image} alt={`Preview ${index + 1}`} />
                            ))}
                          </div>
                        )}
                        <div className="preview-text">
                          {postData.content}
                          {postData.hashtags && (
                            <div className="preview-hashtags">
                              {postData.hashtags.split(' ').filter(tag => tag.startsWith('#')).map((tag, index) => (
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
      </div>
    </div>
  );
};

export default CreatePost;
