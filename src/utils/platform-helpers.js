import { Instagram, Twitter, Facebook, Linkedin, Music, Youtube } from 'lucide-react';
import { PLATFORM_CONFIGS, PLATFORMS } from './constants';

/**
 * Get the appropriate icon component for a platform
 * @param {string} platformId - The platform identifier
 * @returns {React.Component|null} - The icon component or null if not found
 */
export const getPlatformIcon = (platformId) => {
  switch (platformId) {
    case PLATFORMS.INSTAGRAM:
      return Instagram;
    case PLATFORMS.TWITTER:
      return Twitter;
    case PLATFORMS.FACEBOOK:
      return Facebook;
    case PLATFORMS.LINKEDIN:
      return Linkedin;
    case PLATFORMS.TIKTOK:
      return Music; // Using Music icon for TikTok
    case PLATFORMS.YOUTUBE:
      return Youtube;
    default:
      return null;
  }
};

/**
 * Get the brand color for a platform
 * @param {string} platformId - The platform identifier
 * @returns {string} - The hex color code
 */
export const getPlatformColor = (platformId) => {
  return PLATFORM_CONFIGS[platformId]?.color || '#64748b';
};

/**
 * Get the emoji for a platform
 * @param {string} platformId - The platform identifier
 * @returns {string} - The emoji character
 */
export const getPlatformEmoji = (platformId) => {
  return PLATFORM_CONFIGS[platformId]?.emoji || '🌐';
};

/**
 * Get the display name for a platform
 * @param {string} platformId - The platform identifier
 * @returns {string} - The platform display name
 */
export const getPlatformName = (platformId) => {
  return PLATFORM_CONFIGS[platformId]?.name || 'Unknown Platform';
};

/**
 * Get the maximum character length for a platform
 * @param {string} platformId - The platform identifier
 * @returns {number} - The maximum character length
 */
export const getPlatformMaxLength = (platformId) => {
  return PLATFORM_CONFIGS[platformId]?.maxLength || 280;
};

/**
 * Check if a platform supports hashtags
 * @param {string} platformId - The platform identifier
 * @returns {boolean} - Whether the platform supports hashtags
 */
export const platformSupportsHashtags = (platformId) => {
  return PLATFORM_CONFIGS[platformId]?.supportsHashtags || false;
};

/**
 * Check if a platform supports images
 * @param {string} platformId - The platform identifier
 * @returns {boolean} - Whether the platform supports images
 */
export const platformSupportsImages = (platformId) => {
  return PLATFORM_CONFIGS[platformId]?.supportsImages || false;
};

/**
 * Check if a platform supports videos
 * @param {string} platformId - The platform identifier
 * @returns {boolean} - Whether the platform supports videos
 */
export const platformSupportsVideos = (platformId) => {
  return PLATFORM_CONFIGS[platformId]?.supportsVideos || false;
};

/**
 * Get all available platforms as an array
 * @returns {Array} - Array of platform objects
 */
export const getAllPlatforms = () => {
  return Object.values(PLATFORMS).map(platformId => ({
    id: platformId,
    ...PLATFORM_CONFIGS[platformId]
  }));
};

/**
 * Validate if a platform ID is supported
 * @param {string} platformId - The platform identifier
 * @returns {boolean} - Whether the platform is supported
 */
export const isValidPlatform = (platformId) => {
  return Object.values(PLATFORMS).includes(platformId);
};

/**
 * Format content for a specific platform (truncate if needed)
 * @param {string} content - The content to format
 * @param {string} platformId - The platform identifier
 * @returns {string} - The formatted content
 */
export const formatContentForPlatform = (content, platformId) => {
  const maxLength = getPlatformMaxLength(platformId);
  if (content.length <= maxLength) {
    return content;
  }
  
  // Truncate and add ellipsis
  return content.substring(0, maxLength - 3) + '...';
};

/**
 * Get platform-specific optimization suggestions
 * @param {string} platformId - The platform identifier
 * @returns {Array} - Array of optimization suggestions
 */
export const getPlatformOptimizationTips = (platformId) => {
  const tips = {
    [PLATFORMS.INSTAGRAM]: [
      'Use high-quality visuals',
      'Include relevant hashtags (5-10 recommended)',
      'Write engaging captions',
      'Post during peak hours (6-9 PM)',
      'Use Instagram Stories for behind-the-scenes content'
    ],
    [PLATFORMS.TWITTER]: [
      'Keep it concise and punchy',
      'Use 1-2 relevant hashtags',
      'Include engaging visuals when possible',
      'Tweet during business hours for B2B content',
      'Engage with replies and mentions'
    ],
    [PLATFORMS.FACEBOOK]: [
      'Write longer, more detailed posts',
      'Use eye-catching images or videos',
      'Ask questions to encourage engagement',
      'Post when your audience is most active',
      'Share valuable, shareable content'
    ]
  };
  
  return tips[platformId] || [
    'Create engaging, platform-appropriate content',
    'Use relevant hashtags',
    'Post consistently',
    'Engage with your audience'
  ];
};

/**
 * Get the CSS class name for a platform
 * @param {string} platformId - The platform identifier
 * @returns {string} - The CSS class name
 */
export const getPlatformClassName = (platformId) => {
  return `platform-${platformId}`;
};

/**
 * Check if multiple platforms are selected and return validation
 * @param {Array} selectedPlatforms - Array of selected platform IDs
 * @returns {Object} - Validation result with isValid and message
 */
export const validatePlatformSelection = (selectedPlatforms) => {
  if (!selectedPlatforms || selectedPlatforms.length === 0) {
    return {
      isValid: false,
      message: 'Please select at least one platform'
    };
  }
  
  const invalidPlatforms = selectedPlatforms.filter(id => !isValidPlatform(id));
  if (invalidPlatforms.length > 0) {
    return {
      isValid: false,
      message: `Invalid platforms: ${invalidPlatforms.join(', ')}`
    };
  }
  
  return {
    isValid: true,
    message: 'Platform selection is valid'
  };
};
