import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Hash,
  Zap,
  Wand2,
  Copy,
  Send,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import PlatformGrid from '../components/PlatformGrid';
import apiClient from '../utils/api';

import { TONE_OPTIONS, DEFAULTS } from '../utils/constants';
import './AIAssistant.css';

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Add error state

  // Tab configuration
  const tabs = [
    {
      id: 'generator',
      label: 'Content Generator',
      icon: Sparkles,
      description: 'Generate multiple post variations from your ideas'
    },
    {
      id: 'hashtags',
      label: 'Hashtag Suggester',
      icon: Hash,
      description: 'Find relevant and trending hashtags for your content'
    },
    {
      id: 'optimizer',
      label: 'Content Optimizer',
      icon: Zap,
      description: 'Optimize content for specific social media platforms'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generator':
        return <ContentGeneratorTab loading={loading} setLoading={setLoading} setError={setError} />;
      case 'hashtags':
        return <HashtagSuggesterTab loading={loading} setLoading={setLoading} setError={setError} />;
      case 'optimizer':
        return <ContentOptimizerTab loading={loading} setLoading={setLoading} setError={setError} />;
      default:
        return <ContentGeneratorTab loading={loading} setLoading={setLoading} setError={setError} />;
    }
  };
  // Add this useEffect to test API connection when component mounts
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await apiClient.healthCheck();
        console.log('API Health Check:', response);
      } catch (error) {
        console.error('API connection failed:', error);
        setError('Unable to connect to AI services. Please check your connection.');
      }
    };

    testConnection();
  }, []);



  return (
    <div className="ai-assistant-page">
      {/* Add error message display */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Page Header */}
      <div className="ai-assistant-header">
        <div className="header-content">
          <div className='ai-hd'>
            <div className="header-icon">
              <Wand2 size={32} />
            </div>
            <div className="header-text hxt">
              <h1>AI Assistant</h1>
              <p>Your creative partner for generating, optimizing, and enhancing social media content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation responsive-tabs">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <div className="tab-icon">
                <IconComponent size={20} />
              </div>
              <div className="tab-content">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-description">{tab.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content-container">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Content Generator Tab Component
const ContentGeneratorTab = ({ loading, setLoading, setError }) => {
  const [formData, setFormData] = useState({
    prompt: '',
    tone: DEFAULTS.DEFAULT_TONE,
    platforms: DEFAULTS.DEFAULT_PLATFORMS,
    includeHashtags: DEFAULTS.INCLUDE_HASHTAGS,
    maxLength: 280
  });
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateContent = async () => {
    if (!formData.prompt.trim()) return;

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await apiClient.generateContent({
        prompt: formData.prompt,
        tone: formData.tone,
        platforms: formData.platforms,
        includeHashtags: formData.includeHashtags,
        maxLength: formData.maxLength
      });

      console.log('API Response:', response);

      if (response.success && response.data) {
        const suggestions = [];

        // Handle the response structure from your API
        Object.entries(response.data.content).forEach(([platform, data]) => {
          if (platform === 'youtube') {
            // Special handling for YouTube content
            suggestions.push({
              id: `${platform}-${Date.now()}`,
              content: data.description || '', // Use description as content
              title: data.title || '',
              hashtags: data.tags ? data.tags.map(tag => `#${tag.replace(/\s+/g, '')}`) : [], // Convert tags to hashtags
              tone: response.data.options.tone,
              characterCount: data.characterCount || 0,
              platform: platform,
              withinLimit: data.withinLimit || true,
              isYouTube: true, // Flag to identify YouTube content
              videoIdeas: data.videoIdeas || [],
              callToAction: data.callToAction || ''
            });
          } else {
            // Regular handling for other platforms
            suggestions.push({
              id: `${platform}-${Date.now()}`,
              content: data.content,
              hashtags: extractHashtagsFromContent(data.content),
              tone: response.data.options.tone,
              characterCount: data.characterCount,
              platform: platform,
              withinLimit: data.withinLimit,
              isYouTube: false
            });
          }
        });

        setSuggestions(suggestions);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error generating content:', error);
      setError(error.message || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract hashtags from content
  const extractHashtagsFromContent = (content) => {
    // If content is not a string (like in YouTube's case), handle it differently
    if (typeof content !== 'string') {
      // For YouTube, return the tags array if available
      if (content.tags && Array.isArray(content.tags)) {
        // Return tags with # prefix
        return content.tags.map(tag => `#${tag.replace(/\s+/g, '')}`);
      }

      // If there's a description field, extract hashtags from there
      if (content.description) {
        const hashtagRegex = /#\w+/g;
        const matches = content.description.match(hashtagRegex);
        return matches || [];
      }

      return []; // No hashtags found
    }

    // Original behavior for string content
    const hashtagRegex = /#\w+/g;
    const matches = content.match(hashtagRegex);
    return matches || [];
  };


  // const generateContent = async () => {
  //   if (!formData.prompt.trim()) return;

  //   setLoading(true);

  //   try {
  //     // Mock API call - replace with actual API integration
  //     await new Promise(resolve => setTimeout(resolve, 2000));

  //     const mockSuggestions = [
  //       {
  //         id: 1,
  //         content: "🌱 Introducing our revolutionary eco-friendly water bottle! Made from 100% recycled materials, it's not just hydration - it's a statement for our planet. Join the sustainability movement today!",
  //         hashtags: ["#EcoFriendly", "#Sustainability", "#GreenLiving", "#ZeroWaste"],
  //         tone: formData.tone,
  //         characterCount: 187,
  //         platform: 'instagram'
  //       },
  //       {
  //         id: 2,
  //         content: "Stay hydrated, stay sustainable! 💧 Our new eco-friendly water bottle combines style with environmental responsibility. Every sip makes a difference!",
  //         hashtags: ["#SustainableLiving", "#EcoBottle", "#GreenChoice"],
  //         tone: formData.tone,
  //         characterCount: 156,
  //         platform: 'twitter'
  //       }
  //     ];

  //     setSuggestions(mockSuggestions);
  //   } catch (error) {
  //     console.error('Error generating content:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Add success feedback here
  };

  const useContent = (suggestion) => {

    // This will integrate with CreatePost modal
    console.log('Using content:', suggestion);
  };

  return (
    <div className="content-generator-tab">
      {/* Input Section */}
      <div className="input-section">
        <div className="section-header">
          <h2>Generate Content</h2>
          <p>Describe your idea and let AI create engaging posts for your social media</p>
        </div>

        <div className="form-group">
          <label htmlFor="prompt">Your Idea or Prompt</label>
          <textarea
            id="prompt"
            value={formData.prompt}
            onChange={(e) => handleInputChange('prompt', e.target.value)}
            placeholder="e.g., Launch post for our new eco-friendly water bottle"
            rows={4}
            className="prompt-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tone">Tone of Voice</label>
            <select
              id="tone"
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
              className="tone-select"
            >
              {TONE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Target Platforms</label>
            <PlatformGrid
              selectedPlatforms={formData.platforms}
              onPlatformChange={(platforms) => handleInputChange('platforms', platforms)}
              layout="horizontal"
              multiSelect={true}
              showLabels={false}
              showOnlyConnected={false}
              context="ai_assistant_content_generator"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.includeHashtags}
                onChange={(e) => handleInputChange('includeHashtags', e.target.checked)}
              />
              Include Hashtags
            </label>
          </div>
        </div>

        <button
          onClick={generateContent}
          disabled={loading || !formData.prompt.trim()}
          className="generate-button"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="spinning" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate Content
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      {suggestions.length > 0 && (
        <div className="output-section">
          <div className="section-header">
            <h2>Generated Suggestions</h2>
            <p>Choose your favorite or use as inspiration for your posts</p>
          </div>

          <div className="suggestions-grid">
            {suggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onCopy={copyToClipboard}
                onUse={useContent}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Suggestion Card Component
const SuggestionCard = ({ suggestion, onCopy, onUse }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = suggestion.content + " " + suggestion.hashtags.join(" ");
    onCopy(textToCopy);
    setCopied(true);

    // Reset after 3 seconds
    setTimeout(() => setCopied(false), 3000);
  };

  



  // Special rendering for YouTube content
  if (suggestion.isYouTube) {
    return (
      <div className="suggestion-card youtube-card">
        <div className="suggestion-header">
          <span className="suggestion-platform">YouTube</span>
          <span className="suggestion-tone">{suggestion.tone}</span>
          <span className="character-count">{suggestion.characterCount} chars</span>
        </div>

        <div className="youtube-title">
          <h3>{suggestion.title}</h3>
        </div>

        <div className="suggestion-content">
          <p>{suggestion.content}</p>
        </div>

        {suggestion.videoIdeas && suggestion.videoIdeas.length > 0 && (
          <div className="video-ideas">
            <h4>Video Ideas:</h4>
            <ul>
              {suggestion.videoIdeas.map((idea, index) => (
                <li key={index}>{idea}</li>
              ))}
            </ul>
          </div>
        )}

        {suggestion.callToAction && (
          <div className="call-to-action">
            <h4>Call to Action:</h4>
            <p>{suggestion.callToAction}</p>
          </div>
        )}

        {suggestion.hashtags && suggestion.hashtags.length > 0 && (
          <div className="suggestion-hashtags">
            <h4>Recommended Tags:</h4>
            {suggestion.hashtags.map((hashtag, index) => (
              <span key={index} className="hashtag">{hashtag}</span>
            ))}
          </div>
        )}

        <div className="suggestion-actions">
          <button
            onClick={() => onCopy(
              `Title: ${suggestion.title}\n\nDescription:\n${suggestion.content}\n\nTags: ${suggestion.hashtags.join(' ')}`
            )}
            className="action-button secondary"
          >
            <Copy size={16} />
            Copy
          </button>
          <button
            onClick={() => onUse(suggestion)}
            className="action-button primary"
          >
            <Send size={16} />
            Use Content
          </button>
        </div>
      </div>
    );
  }

  // Regular rendering for other platforms
  return (
    <div className="suggestion-card">
      <div className="suggestion-header">
        <span className="suggestion-platform">{suggestion.platform}</span>
        <span className="suggestion-tone">{suggestion.tone}</span>
        <span className="character-count">{suggestion.characterCount} chars</span>
      </div>

      <div className="suggestion-content">
        <p>{suggestion.content}</p>
      </div>

      {suggestion.hashtags && suggestion.hashtags.length > 0 && (
        <div className="suggestion-hashtags">
          {suggestion.hashtags.map((hashtag, index) => (
            <span key={index} className="hashtag">{hashtag}</span>
          ))}
        </div>
      )}

      <div className="suggestion-actions">

        <button
          onClick={handleCopy}
          className={`action-button secondary ${copied ? "copied" : ""}`}
        >
          <Copy size={16} />
          {copied ? "Copied" : "Copy"}
        </button>
        {/* <button
          onClick={() => onUse(suggestion)}
          className="action-button primary"
        >
          <Send size={16} />
          Use Content
        </button> */}
      </div>
    </div>
  );
};

// Hashtag Suggester Tab Component
const HashtagSuggesterTab = ({ loading, setLoading }) => {
  const [formData, setFormData] = useState({
    content: '',
    platform: 'instagram',
    count: DEFAULTS.HASHTAG_COUNT
  });
  const [hashtags, setHashtags] = useState([]);
  const [selectedHashtags, setSelectedHashtags] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const suggestHashtags = async () => {
    if (!formData.content.trim()) return;

    setLoading(true);
    try {
      // Use real API instead of mock
      const response = await apiClient.suggestHashtags({
        content: formData.content,
        platform: formData.platform,
        count: formData.count
      });

      console.log('Hashtag API Response:', response);

      if (response.success && response.data.hashtags) {
        setHashtags(response.data.hashtags);
        setSelectedHashtags([]);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error suggesting hashtags:', error);
      alert('Failed to suggest hashtags. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // const suggestHashtags = async () => {
  //   if (!formData.content.trim()) return;

  //   setLoading(true);
  //   try {
  //     // Mock API call - replace with actual API integration
  //     await new Promise(resolve => setTimeout(resolve, 1500));

  //     const mockHashtags = [
  //       '#SocialMedia', '#Marketing', '#ContentCreation', '#DigitalMarketing',
  //       '#Branding', '#Engagement', '#SocialMediaTips', '#OnlineMarketing',
  //       '#ContentStrategy', '#SocialMediaMarketing', '#InfluencerMarketing',
  //       '#SocialMediaManager', '#ContentMarketing', '#SocialMediaStrategy'
  //     ];

  //     setHashtags(mockHashtags);
  //     setSelectedHashtags([]);
  //   } catch (error) {
  //     console.error('Error suggesting hashtags:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const toggleHashtag = (hashtag) => {
    setSelectedHashtags(prev =>
      prev.includes(hashtag)
        ? prev.filter(h => h !== hashtag)
        : [...prev, hashtag]
    );
  };

  const copySelected = () => {
    if (selectedHashtags.length > 0) {
      navigator.clipboard.writeText(selectedHashtags.join(' '));
    }
  };

  return (
    <div className="hashtag-suggester-tab">
      {/* Input Section */}
      <div className="input-section">
        <div className="section-header">
          <h2>Hashtag Suggester</h2>
          <p>Get relevant hashtags for your content to increase discoverability</p>
        </div>

        <div className="form-group">
          <label htmlFor="content">Your Content</label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Paste your post content here..."
            rows={4}
            className="content-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Platform</label>
            <PlatformGrid
              selectedPlatforms={formData.platform ? [formData.platform] : []}
              onPlatformChange={(platforms) => handleInputChange('platform', platforms[0] || 'instagram')}
              layout="horizontal"
              multiSelect={false}
              showLabels={false}
              showOnlyConnected={false}
              context="ai_assistant_hashtag_suggester"
            />
          </div>

          <div className="form-group">
            <label htmlFor="count">Number of Hashtags</label>
            <input
              type="range"
              id="count"
              min="5"
              max="30"
              value={formData.count}
              onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
              className="count-slider"
            />
            <span className="count-display">{formData.count}</span>
          </div>
        </div>

        <button
          onClick={suggestHashtags}
          disabled={loading || !formData.content.trim()}
          className="generate-button"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="spinning" />
              Suggesting...
            </>
          ) : (
            <>
              <Hash size={20} />
              Suggest Hashtags
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      {hashtags.length > 0 && (
        <div className="output-section">
          <div className="section-header">
            <h2>Suggested Hashtags</h2>
            <p>Select the hashtags you want to use</p>
          </div>

          <div className="hashtags-grid">
            {hashtags.map((hashtag, index) => (
              <label key={index} className="hashtag-option">
                <input
                  type="checkbox"
                  checked={selectedHashtags.includes(hashtag)}
                  onChange={() => toggleHashtag(hashtag)}
                />
                <span className="hashtag-text">{hashtag}</span>
              </label>
            ))}
          </div>

          {selectedHashtags.length > 0 && (
            <div className="selected-hashtags">
              <h3>Selected ({selectedHashtags.length})</h3>
              <div className="selected-list">
                {selectedHashtags.join(' ')}
              </div>
              <button onClick={copySelected} className="copy-button">
                <Copy size={16} />
                Copy Selected
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Content Optimizer Tab Component
const ContentOptimizerTab = ({ loading, setLoading }) => {
  const [formData, setFormData] = useState({
    content: '',
    platform: 'instagram'
  });
  const [optimizedContent, setOptimizedContent] = useState(null);
  const [copyOptimizedContent, setCopyOptimizedContent] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const optimizeContent = async () => {
    if (!formData.content.trim()) return;

    setLoading(true);
    try {
      // Use real API instead of mock
      const response = await apiClient.optimizeContent({
        content: formData.content,
        targetPlatform: formData.platform
      });

      console.log('Optimize API Response:', response);

      if (response.success && response.data) {
        const optimizedData = {
          original: response.data.original,
          optimized: response.data.optimizedContent,
          improvements: response.data.improvements || [],
          suggestions: response.data.suggestions || [],
          platform: response.data.platform
        };

        setOptimizedContent(optimizedData);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error optimizing content:', error);
      alert('Failed to optimize content. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // const optimizeContent = async () => {
  //   if (!formData.content.trim()) return;

  //   setLoading(true);
  //   try {
  //     // Mock API call - replace with actual API integration
  //     await new Promise(resolve => setTimeout(resolve, 2000));

  //     const mockOptimizedContent = {
  //       original: formData.content,
  //       optimized: formData.content + " 🚀 Ready to take action? Click the link in our bio! #CallToAction #Engagement #SocialMedia",
  //       improvements: [
  //         "Added engaging emoji to catch attention",
  //         "Included clear call-to-action",
  //         "Optimized character length for " + formData.platform,
  //         "Added relevant hashtags for better discoverability",
  //         "Enhanced engagement potential with action-oriented language"
  //       ],
  //       platform: formData.platform
  //     };

  //     setOptimizedContent(mockOptimizedContent);
  //   } catch (error) {
  //     console.error('Error optimizing content:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const copyOptimized = () => {
    if (optimizedContent) {
      navigator.clipboard.writeText(optimizedContent.optimized);
      setCopyOptimizedContent(true);
    }
  };

  const useOptimized = () => {
    // This will integrate with CreatePost modal
    console.log('Using optimized content:', optimizedContent);
  };

  return (
    <div className="content-optimizer-tab">
      {/* Input Section */}
      <div className="input-section">
        <div className="section-header">
          <h2>Content Optimizer</h2>
          <p>Optimize your content for specific social media platforms</p>
        </div>

        <div className="form-group">
          <label htmlFor="content">Original Content</label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Enter your content to optimize..."
            rows={4}
            className="content-input"
          />
        </div>

        <div className="form-group">
          <label>Optimize for Platform</label>
          <PlatformGrid
            selectedPlatforms={formData.platform ? [formData.platform] : []}
            onPlatformChange={(platforms) => handleInputChange('platform', platforms[0] || 'instagram')}
            layout="horizontal"
            multiSelect={false}
            showLabels={false}
            showOnlyConnected={false}
            context="ai_assistant_content_optimizer"
          />
        </div>

        <button
          onClick={optimizeContent}
          disabled={loading || !formData.content.trim()}
          className="generate-button"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="spinning" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap size={20} />
              Optimize Content
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      {optimizedContent && (
        <div className="output-section">
          <div className="section-header">
            <h2>Optimized Content</h2>
            <p>See how your content has been improved for {optimizedContent.platform}</p>
          </div>

          <div className="comparison-view">
            <div className="comparison-panel">
              <h3>Original</h3>
              <div className="content-box original">
                <p>{optimizedContent.original}</p>
              </div>
            </div>

            <div className="comparison-arrow">
              <ArrowRight size={24} />
            </div>

            <div className="comparison-panel">
              <h3>Optimized</h3>
              <div className="content-box optimized">
                <p>{optimizedContent.optimized}</p>
              </div>
            </div>
          </div>

          <div className="improvements-section">
            <h3>Improvements Made</h3>
            <ul className="improvements-list">
              {optimizedContent.improvements.map((improvement, index) => (
                <li key={index} className="improvement-item">
                  <CheckCircle size={16} />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="optimizer-actions">
            <button onClick={copyOptimized} className="action-button secondary">
              <Copy size={16} />
              {copyOptimizedContent ? "Copied Optimized Text" : "Copy Optimized Text"}
            </button>

            {/* <button onClick={useOptimized} className="action-button primary">
              <Send size={16} />
              Use in New Post
            </button> */}

          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
