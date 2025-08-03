import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { 
  trackPlatformSelection, 
  trackAIUsage, 
  trackContentAction,
  trackPageView,
  trackPlatformConnection,
  trackUserBehavior,
  trackPlatformGridUsage,
  formatChartData,
  getAnalyticsSummary
} from '../utils/analytics-helpers';
import { API_ENDPOINTS, DEFAULTS } from '../utils/constants';

/**
 * Custom hook for analytics tracking and data fetching
 */
export const useAnalytics = () => {
  // Tracking functions
  const track = {
    platformSelection: trackPlatformSelection,
    aiUsage: trackAIUsage,
    contentAction: trackContentAction,
    pageView: trackPageView,
    platformConnection: trackPlatformConnection,
    userBehavior: trackUserBehavior,
    platformGridUsage: trackPlatformGridUsage
  };

  return { track };
};

/**
 * Hook for fetching analytics overview data
 */
export const useAnalyticsOverview = (dateRange = DEFAULTS.ANALYTICS_DATE_RANGE) => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.get(API_ENDPOINTS.ANALYTICS.OVERVIEW, {
      params: { dateRange }
    }),
    [dateRange]
  );

  const summary = data?.data ? getAnalyticsSummary(data.data) : null;

  return {
    data: data?.data || null,
    summary,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for fetching engagement trends
 */
export const useEngagementTrends = (platforms = [], dateRange = '7d') => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.get(API_ENDPOINTS.ANALYTICS.ENGAGEMENT_TRENDS, {
      params: { platforms: platforms.join(','), dateRange }
    }),
    [platforms, dateRange]
  );

  const chartData = data?.data ? formatChartData(data.data, 'engagement_rate', dateRange) : null;

  return {
    data: data?.data || null,
    chartData,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for fetching platform performance data
 */
export const usePlatformPerformance = (dateRange = '30d') => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.get(API_ENDPOINTS.ANALYTICS.PLATFORM_PERFORMANCE, {
      params: { dateRange }
    }),
    [dateRange]
  );

  return {
    data: data?.data || null,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for fetching AI usage analytics
 */
export const useAIAnalytics = (dateRange = '30d') => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.get(API_ENDPOINTS.ANALYTICS.AI_USAGE, {
      params: { dateRange }
    }),
    [dateRange]
  );

  return {
    data: data?.data || null,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for tracking page views automatically
 */
export const usePageTracking = (pageName, additionalData = {}) => {
  useEffect(() => {
    trackPageView(pageName, additionalData);
  }, [pageName, additionalData]);
};

/**
 * Hook for tracking PlatformGrid usage
 */
export const usePlatformGridTracking = () => {
  const trackGridUsage = useCallback((action, data) => {
    trackPlatformGridUsage(action, data);
  }, []);

  const trackSelection = useCallback((platformId, isSelected, context) => {
    trackPlatformSelection(platformId, isSelected, context);
  }, []);

  return {
    trackGridUsage,
    trackSelection
  };
};

/**
 * Hook for real-time analytics updates
 */
export const useRealTimeAnalytics = (refreshInterval = DEFAULTS.ANALYTICS_REFRESH_INTERVAL) => {
  const [isRealTime, setIsRealTime] = useState(false);
  const { data, loading, error, refetch } = useAnalyticsOverview();

  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isRealTime, refreshInterval, refetch]);

  const toggleRealTime = useCallback(() => {
    setIsRealTime(prev => !prev);
  }, []);

  return {
    data,
    loading,
    error,
    isRealTime,
    toggleRealTime,
    refetch
  };
};

/**
 * Hook for analytics export functionality
 */
export const useAnalyticsExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const exportData = useCallback(async (type, dateRange, platforms = []) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const response = await apiClient.post('/api/analytics/export', {
        type,
        dateRange,
        platforms
      });

      // Track export event
      trackUserBehavior('export_analytics', 'export_button', {
        type,
        dateRange,
        platforms
      });

      // Trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_${type}_${dateRange}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      setExportError(error.message);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportData,
    isExporting,
    exportError
  };
};

/**
 * Hook for content performance analytics
 */
export const useContentAnalytics = (postId = null, dateRange = '30d') => {
  const endpoint = postId 
    ? API_ENDPOINTS.ANALYTICS.POST(postId)
    : API_ENDPOINTS.ANALYTICS.CONTENT_PERFORMANCE;

  const { data, loading, error, refetch } = useApi(
    () => apiClient.get(endpoint, {
      params: postId ? {} : { dateRange }
    }),
    [postId, dateRange]
  );

  return {
    data: data?.data || null,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for hashtag performance analytics
 */
export const useHashtagAnalytics = (hashtags = [], dateRange = '30d') => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.get(API_ENDPOINTS.ANALYTICS.HASHTAG_PERFORMANCE, {
      params: { 
        hashtags: hashtags.join(','),
        dateRange 
      }
    }),
    [hashtags, dateRange]
  );

  return {
    data: data?.data || null,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for user behavior analytics
 */
export const useUserBehaviorAnalytics = (dateRange = '30d') => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.get(API_ENDPOINTS.ANALYTICS.USER_BEHAVIOR, {
      params: { dateRange }
    }),
    [dateRange]
  );

  return {
    data: data?.data || null,
    loading,
    error,
    refetch
  };
};
