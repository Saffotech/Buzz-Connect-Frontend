// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout'
  },
  POSTS: {
    BASE: '/api/posts',
    PUBLISH: (id) => `/api/posts/${id}/publish`
  },
  MEDIA: {
    UPLOAD: '/api/media/upload',
    BASE: '/api/media'
  },
  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
    POST: (id) => `/api/analytics/posts/${id}`,
    ENGAGEMENT_TRENDS: '/api/analytics/engagement-trends',
    PLATFORM_PERFORMANCE: '/api/analytics/platform-performance',
    CONTENT_PERFORMANCE: '/api/analytics/content-performance',
    AI_USAGE: '/api/analytics/ai-usage',
    USER_BEHAVIOR: '/api/analytics/user-behavior',
    PLATFORM_CONNECTIONS: '/api/analytics/platform-connections',
    HASHTAG_PERFORMANCE: '/api/analytics/hashtag-performance',
    POSTING_PATTERNS: '/api/analytics/posting-patterns',
    AUDIENCE_INSIGHTS: '/api/analytics/audience-insights'
  },
  SCHEDULER: {
    STATUS: '/api/scheduler/status',
    TRIGGER: '/api/scheduler/trigger',
    UPCOMING: '/api/scheduler/upcoming'
  },
  INSTAGRAM: {
    CONNECT: '/api/auth/instagram/connect',
    DISCONNECT: '/api/auth/instagram/disconnect',
    STATUS: '/api/auth/instagram/status'
  },
  AI: {
    GENERATE_CONTENT: '/api/ai/generate-content',
    SUGGEST_HASHTAGS: '/api/ai/suggest-hashtags',
    OPTIMIZE_CONTENT: '/api/ai/optimize-content'
  },
  USERS: {
    CONNECTED_ACCOUNTS: '/api/users/connected-accounts'
  }
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'BuzzConnect',
  TAGLINE: 'Aapke Brands. Ek Jagah.',
  VERSION: '1.0.0'
};

// Social Media Platforms
export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook'
};

export const PLATFORM_CONFIGS = {
  [PLATFORMS.INSTAGRAM]: {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    emoji: '📷',
    maxLength: 2200,
    supportsImages: true,
    supportsVideos: true,
    supportsHashtags: true,
    maxImages: 10,
    description: 'Share photos and stories'
  },
  [PLATFORMS.TWITTER]: {
    id: 'twitter',
    name: 'Twitter',
    color: '#1DA1F2',
    emoji: '🐦',
    maxLength: 280,
    supportsImages: true,
    supportsVideos: true,
    supportsHashtags: true,
    maxImages: 4,
    description: 'Share thoughts and updates'
  },
  [PLATFORMS.FACEBOOK]: {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    emoji: '👥',
    maxLength: 63206,
    supportsImages: true,
    supportsVideos: true,
    supportsHashtags: true,
    maxImages: 10,
    description: 'Connect with friends and family'
  }
};

 export const platformColors = {
  instagram: '#E1306C',
  twitter: '#1DA1F2',
  facebook: '#1877F2'
};

// Post Status
export const POST_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed'
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/mov', 'video/avi'],
  MAX_FILES: 10
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  USER_EMAIL: 'userEmail',
  THEME: 'theme'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully!',
  POST_DELETED: 'Post deleted successfully!',
  POST_PUBLISHED: 'Post published successfully!',
  MEDIA_UPLOADED: 'Media uploaded successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ACCOUNT_CONNECTED: 'Account connected successfully!',
  ACCOUNT_DISCONNECTED: 'Account disconnected successfully!'
};

// Tone options for content generation
export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'educational', label: 'Educational' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'inspirational', label: 'Inspirational' }
];

// Analytics Event Types
export const ANALYTICS_EVENTS = {
  // Platform Grid Events
  PLATFORM_SELECTED: 'platform_selected',
  PLATFORM_DESELECTED: 'platform_deselected',
  PLATFORM_GRID_VIEWED: 'platform_grid_viewed',

  // AI Assistant Events
  AI_CONTENT_GENERATED: 'ai_content_generated',
  AI_HASHTAGS_SUGGESTED: 'ai_hashtags_suggested',
  AI_CONTENT_OPTIMIZED: 'ai_content_optimized',
  AI_SUGGESTION_COPIED: 'ai_suggestion_copied',
  AI_SUGGESTION_USED: 'ai_suggestion_used',

  // Post Events
  POST_CREATED: 'post_created',
  POST_SCHEDULED: 'post_scheduled',
  POST_PUBLISHED: 'post_published',
  POST_EDITED: 'post_edited',
  POST_DELETED: 'post_deleted',

  // Platform Connection Events
  PLATFORM_CONNECTED: 'platform_connected',
  PLATFORM_DISCONNECTED: 'platform_disconnected',
  PLATFORM_CONNECTION_FAILED: 'platform_connection_failed',

  // User Behavior Events
  PAGE_VIEWED: 'page_viewed',
  FEATURE_USED: 'feature_used',
  BUTTON_CLICKED: 'button_clicked',
  FORM_SUBMITTED: 'form_submitted',

  // Content Events
  CONTENT_COPIED: 'content_copied',
  HASHTAG_COPIED: 'hashtag_copied',
  MEDIA_UPLOADED: 'media_uploaded',

  // Analytics Views
  ANALYTICS_VIEWED: 'analytics_viewed',
  REPORT_GENERATED: 'report_generated',
  EXPORT_REQUESTED: 'export_requested'
};

// Analytics Metrics
export const ANALYTICS_METRICS = {
  ENGAGEMENT_RATE: 'engagement_rate',
  REACH: 'reach',
  IMPRESSIONS: 'impressions',
  LIKES: 'likes',
  COMMENTS: 'comments',
  SHARES: 'shares',
  CLICKS: 'clicks',
  SAVES: 'saves',
  FOLLOWER_GROWTH: 'follower_growth',
  POST_FREQUENCY: 'post_frequency',
  OPTIMAL_POSTING_TIME: 'optimal_posting_time',
  HASHTAG_PERFORMANCE: 'hashtag_performance',
  CONTENT_TYPE_PERFORMANCE: 'content_type_performance'
};

// Platform Analytics Configurations
export const PLATFORM_ANALYTICS = {
  [PLATFORMS.INSTAGRAM]: {
    primaryMetrics: ['engagement_rate', 'reach', 'impressions'],
    secondaryMetrics: ['likes', 'comments', 'saves', 'shares'],
    contentTypes: ['photo', 'video', 'carousel', 'reel', 'story'],
    optimalPostingTimes: ['9:00', '11:00', '13:00', '17:00', '19:00'],
    hashtagLimit: 30,
    trackingPixel: true
  },
  [PLATFORMS.TWITTER]: {
    primaryMetrics: ['engagement_rate', 'impressions', 'clicks'],
    secondaryMetrics: ['likes', 'retweets', 'replies', 'mentions'],
    contentTypes: ['text', 'image', 'video', 'poll', 'thread'],
    optimalPostingTimes: ['8:00', '12:00', '17:00', '19:00'],
    hashtagLimit: 2,
    trackingPixel: false
  },
  [PLATFORMS.FACEBOOK]: {
    primaryMetrics: ['engagement_rate', 'reach', 'clicks'],
    secondaryMetrics: ['likes', 'comments', 'shares', 'reactions'],
    contentTypes: ['text', 'photo', 'video', 'link', 'event'],
    optimalPostingTimes: ['9:00', '13:00', '15:00', '20:00'],
    hashtagLimit: 5,
    trackingPixel: true
  }
};

// Default values
export const DEFAULTS = {
  HASHTAG_COUNT: 10,
  MAX_HASHTAG_COUNT: 30,
  MIN_HASHTAG_COUNT: 5,
  DEFAULT_TONE: 'professional',
  DEFAULT_PLATFORMS: [PLATFORMS.INSTAGRAM],
  INCLUDE_HASHTAGS: true,
  ANALYTICS_REFRESH_INTERVAL: 300000, // 5 minutes
  ANALYTICS_DATE_RANGE: 30, // 30 days
  CHART_ANIMATION_DURATION: 750
};