import { ANALYTICS_EVENTS, ANALYTICS_METRICS, PLATFORM_ANALYTICS, PLATFORMS } from './constants';
import ReactGA from "react-ga4";


/**
 * Analytics tracking utility functions
 */


// Mock analytics service - replace with real analytics service (Google Analytics, Mixpanel, etc.)
class AnalyticsService {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.userId = null;
    this.sessionId = this.generateSessionId();


    // Initialize GA4 here
    ReactGA.initialize("G-9PGRR9L086"); // <-- Your Measurement ID
  }


  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }


  setUserId(userId) {
    this.userId = userId;
  }


  track(event, properties = {}) {
    if (!this.isEnabled) {
      console.log('Analytics Event:', event, properties);
      return;
    }


    const eventData = {
      event,
      properties: {
        ...properties,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };


    // Send to analytics service
    this.sendToAnalytics(eventData);
  }


  sendToAnalytics(eventData) {
    // Replace with actual analytics service call
    // Examples: Google Analytics, Mixpanel, Amplitude, etc.
    // console.log('Sending to analytics:', eventData);
   
    // Example for Google Analytics 4
    // gtag('event', eventData.event, eventData.properties);
   
    // Example for Mixpanel
    // mixpanel.track(eventData.event, eventData.properties);
    if (!this.isEnabled) {
      console.log('Analytics Event (DEV MODE):', eventData);
      return;
    }


    if (eventData.event === ANALYTICS_EVENTS.PAGE_VIEWED) {
      ReactGA.send({ hitType: "pageview", page: eventData.properties.page });
    } else {
      ReactGA.event(eventData.event, eventData.properties);
    }


    // Send event to GA4
    ReactGA.event(eventData.event, eventData.properties);
   
  }
}


const analytics = new AnalyticsService();


/**
 * Track platform selection events
 */
export const trackPlatformSelection = (platformId, isSelected, context = 'unknown') => {
  const event = isSelected ? ANALYTICS_EVENTS.PLATFORM_SELECTED : ANALYTICS_EVENTS.PLATFORM_DESELECTED;
 
  analytics.track(event, {
    platform: platformId,
    context, // 'ai_assistant', 'create_post', etc.
    platform_name: PLATFORM_ANALYTICS[platformId]?.name || platformId
  });
};


/**
 * Track AI Assistant usage
 */
export const trackAIUsage = (feature, data = {}) => {
  const eventMap = {
    'content_generation': ANALYTICS_EVENTS.AI_CONTENT_GENERATED,
    'hashtag_suggestion': ANALYTICS_EVENTS.AI_HASHTAGS_SUGGESTED,
    'content_optimization': ANALYTICS_EVENTS.AI_CONTENT_OPTIMIZED
  };


  const event = eventMap[feature] || ANALYTICS_EVENTS.FEATURE_USED;
 
  analytics.track(event, {
    ai_feature: feature,
    ...data
  });
};


/**
 * Track content actions
 */
export const trackContentAction = (action, contentData = {}) => {
  const eventMap = {
    'copy': ANALYTICS_EVENTS.CONTENT_COPIED,
    'use': ANALYTICS_EVENTS.AI_SUGGESTION_USED,
    'create': ANALYTICS_EVENTS.POST_CREATED,
    'schedule': ANALYTICS_EVENTS.POST_SCHEDULED,
    'publish': ANALYTICS_EVENTS.POST_PUBLISHED
  };


  const event = eventMap[action] || ANALYTICS_EVENTS.FEATURE_USED;
 
  analytics.track(event, {
    action,
    content_length: contentData.content?.length || 0,
    platforms: contentData.platforms || [],
    has_media: !!(contentData.images?.length || contentData.videos?.length),
    hashtag_count: contentData.hashtags?.length || 0
  });
};


/**
 * Track page views
 */
export const trackPageView = (pageName, additionalData = {}) => {
  analytics.track(ANALYTICS_EVENTS.PAGE_VIEWED, {
    page: pageName,
    ...additionalData
  });
};


/**
 * Track platform connection events
 */
export const trackPlatformConnection = (platformId, success, error = null) => {
  const event = success
    ? ANALYTICS_EVENTS.PLATFORM_CONNECTED
    : ANALYTICS_EVENTS.PLATFORM_CONNECTION_FAILED;
 
  analytics.track(event, {
    platform: platformId,
    success,
    error: error?.message || null
  });
};


/**
 * Track user behavior patterns
 */
export const trackUserBehavior = (action, element, context = {}) => {
  analytics.track(ANALYTICS_EVENTS.BUTTON_CLICKED, {
    action,
    element,
    ...context
  });
};


/**
 * Calculate engagement metrics
 */
export const calculateEngagementRate = (likes, comments, shares, impressions) => {
  if (!impressions || impressions === 0) return 0;
  return ((likes + comments + shares) / impressions) * 100;
};


/**
 * Get platform-specific optimal posting times
 */
export const getOptimalPostingTimes = (platformId) => {
  return PLATFORM_ANALYTICS[platformId]?.optimalPostingTimes || [];
};


/**
 * Get platform-specific metrics
 */
export const getPlatformMetrics = (platformId) => {
  return {
    primary: PLATFORM_ANALYTICS[platformId]?.primaryMetrics || [],
    secondary: PLATFORM_ANALYTICS[platformId]?.secondaryMetrics || []
  };
};


/**
 * Format analytics data for charts
 */
export const formatChartData = (rawData, metric, timeRange = '7d') => {
  // Transform raw analytics data into chart-friendly format
  return {
    labels: rawData.map(item => item.date),
    datasets: [{
      label: metric,
      data: rawData.map(item => item[metric] || 0),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4
    }]
  };
};


/**
 * Get analytics summary for dashboard
 */
export const getAnalyticsSummary = (data) => {
  if (!data || !Array.isArray(data)) return null;


  const totalPosts = data.length;
  const totalEngagement = data.reduce((sum, post) => sum + (post.engagement || 0), 0);
  const totalReach = data.reduce((sum, post) => sum + (post.reach || 0), 0);
  const avgEngagementRate = totalPosts > 0 ? (totalEngagement / totalReach) * 100 : 0;


  return {
    totalPosts,
    totalEngagement,
    totalReach,
    avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
    topPerformingPost: data.reduce((best, current) =>
      (current.engagement || 0) > (best.engagement || 0) ? current : best, data[0]
    )
  };
};


/**
 * Track PlatformGrid interactions
 */
export const trackPlatformGridUsage = (action, data = {}) => {
  analytics.track(ANALYTICS_EVENTS.PLATFORM_GRID_VIEWED, {
    action,
    layout: data.layout || 'horizontal',
    multiSelect: data.multiSelect || false,
    showLabels: data.showLabels || false,
    connectedPlatforms: data.connectedPlatforms || [],
    selectedPlatforms: data.selectedPlatforms || []
  });
};


/**
 * Generate analytics report
 */
export const generateAnalyticsReport = (startDate, endDate, platforms = []) => {
  analytics.track(ANALYTICS_EVENTS.REPORT_GENERATED, {
    startDate,
    endDate,
    platforms,
    reportType: 'custom'
  });
};


/**
 * Initialize analytics with user data
 */
export const initializeAnalytics = (userId, userProperties = {}) => {
  analytics.setUserId(userId);
 
  // Track user properties
  analytics.track('user_identified', {
    userId,
    ...userProperties
  });
};


/**
 * Export analytics utilities
 */
export {
  analytics,
  ANALYTICS_EVENTS,
  ANALYTICS_METRICS,
  PLATFORM_ANALYTICS
};


export default analytics;