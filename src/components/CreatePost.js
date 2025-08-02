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
  Copy
} from 'lucide-react';
import './CreatePost.css';

const CreatePost = ({ isOpen, onClose, onPostCreated }) => {
  const [postData, setPostData] = useState({
    content: '',
    platforms: [],
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setPostData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newPost = {
      id: Date.now(),
      content: postData.content,
      platforms: postData.platforms,
      images: postData.images,
      hashtags: postData.hashtags.split(' ').filter(tag => tag.startsWith('#')),
      mentions: postData.mentions.split(' ').filter(mention => mention.startsWith('@')),
      scheduledDate: isScheduled ? `${postData.scheduledDate} ${postData.scheduledTime}` : null,
      status: isScheduled ? 'scheduled' : 'published',
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0
    };

    onPostCreated(newPost);
    onClose();
    
    // Reset form
    setPostData({
      content: '',
      platforms: [],
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

    try {
      // Simulate AI API call - replace with actual LLM integration
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate contextual suggestions based on the prompt
      const generateContextualSuggestions = (prompt) => {
        const suggestions = [];
        const emojis = ['🚀', '✨', '💡', '🎯', '🔥', '💪', '🌟', '⚡', '🎉', '💫'];
        const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

        // Enthusiastic/Marketing tone
        suggestions.push({
          id: 1,
          content: `${getRandomEmoji()} Exciting news! ${prompt} is here to revolutionize your experience. Join thousands who are already loving the innovation! What are you most excited about?`,
          hashtags: '#Innovation #Exciting #Revolutionary #GameChanger #NewLaunch',
          tone: 'Enthusiastic',
          platforms: ['instagram', 'twitter']
        });

        // Professional/Informative tone
        suggestions.push({
          id: 2,
          content: `Discover the power of ${prompt}. Simple, effective, and designed with you in mind. Ready to transform your workflow? ${getRandomEmoji()}`,
          hashtags: '#Productivity #Workflow #Innovation #Professional #Efficiency',
          tone: 'Professional',
          platforms: ['twitter', 'facebook']
        });

        // Storytelling/Behind-the-scenes tone
        suggestions.push({
          id: 3,
          content: `Behind the scenes: How ${prompt} came to life. From concept to reality, here's our journey of creating something amazing! ${getRandomEmoji()}${getRandomEmoji()}`,
          hashtags: '#BehindTheScenes #Journey #Creation #Story #Process',
          tone: 'Storytelling',
          platforms: ['instagram']
        });

        // Question/Engagement tone
        suggestions.push({
          id: 4,
          content: `What do you think about ${prompt}? We'd love to hear your thoughts and experiences! Share in the comments below ${getRandomEmoji()}`,
          hashtags: '#Community #Feedback #Thoughts #Engagement #Discussion',
          tone: 'Engaging',
          platforms: ['instagram', 'facebook']
        });

        // Tips/Educational tone
        suggestions.push({
          id: 5,
          content: `Pro tip: ${prompt} can help you achieve better results in less time. Here's how to get started and make the most of it! ${getRandomEmoji()}`,
          hashtags: '#ProTip #Tutorial #HowTo #Tips #Education',
          tone: 'Educational',
          platforms: ['twitter', 'instagram']
        });

        return suggestions;
      };

      const mockSuggestions = generateContextualSuggestions(aiPrompt);

      setAiSuggestions(mockSuggestions);
    } catch (error) {
      console.error('AI generation failed:', error);
      // You could show an error toast here
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
                  <label htmlFor="image-upload" className="upload-label">
                    <Upload size={24} />
                    <span>Click to upload images or drag and drop</span>
                    <small>PNG, JPG, GIF up to 10MB each</small>
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
              disabled={!postData.content.trim() || postData.platforms.length === 0 || charCount.remaining < 0}
            >
              {isScheduled ? (
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
