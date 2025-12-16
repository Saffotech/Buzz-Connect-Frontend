import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../utils/api';

// Simple cache to prevent duplicate API calls
const apiCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

const getCacheKey = (apiCall) => {
  return apiCall.toString();
};

const isCacheValid = (cacheEntry) => {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
};

// Custom hook for API calls with loading and error states
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cacheKey = getCacheKey(apiCall);
        const cachedData = apiCache.get(cacheKey);

        if (isCacheValid(cachedData)) {
          if (isMounted) {
            setData(cachedData.data);
            setLoading(false);
          }
          return;
        }

        const result = await apiCall();

        // Cache the result
        apiCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache for this API call
      const cacheKey = getCacheKey(apiCall);
      apiCache.delete(cacheKey);

      const result = await apiCall();

      // Cache the new result
      apiCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Custom hook for posts
export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getPosts();
      setPosts(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      const response = await apiClient.createPost(postData);
      setPosts(prev => [response.data, ...prev]);
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to create post');
    }
  };

  const updatePost = async (id, postData) => {
    try {
      const response = await apiClient.updatePost(id, postData);
      setPosts(prev => prev.map(post => 
        post._id === id ? response.data : post
      ));
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to update post');
    }
  };

  const deletePost = async (id) => {
    try {
      await apiClient.deletePost(id);
      setPosts(prev => prev.filter(post => post._id !== id));
    } catch (err) {
      throw new Error(err.message || 'Failed to delete post');
    }
  };

  const publishPost = async (id) => {
    try {
      const response = await apiClient.publishPost(id);
      setPosts(prev => prev.map(post => 
        post._id === id ? { ...post, status: 'published' } : post
      ));
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to publish post');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    refetch: fetchPosts
  };
};

// Custom hook for media
export const useMedia = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMedia();
      // Handle the nested data structure: { data: { media: [...] } }
      const mediaData = response.data?.media || [];
      setMedia(mediaData);
    } catch (err) {
      setError(err.message || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadMedia = async (files) => {
    try {
      const response = await apiClient.uploadMedia(files);
      // Handle single media upload response
      const newMedia = response.data ? [response.data] : [];
      setMedia(prev => [...newMedia, ...prev]);
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to upload media');
    }
  };

  const deleteMedia = async (id) => {
    try {
      await apiClient.deleteMedia(id);
      setMedia(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      throw new Error(err.message || 'Failed to delete media');
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return {
    media,
    loading,
    error,
    uploadMedia,
    deleteMedia,
    refetch: fetchMedia
  };
};

// Custom hook for user data
export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getCurrentUser();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err) {
      setError(err.message || 'Failed to fetch user data');
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser
  };
};

// Custom hook for analytics
export const useAnalytics = () => {
  const { data, loading, error, refetch } = useApi(() => apiClient.getAnalyticsOverview());
  
  return {
    analytics: data?.data || null,
    loading,
    error,
    refetch
  };
};

// Custom hook for Instagram connection status
export const useInstagramStatus = () => {
  const { data, loading, error, refetch } = useApi(() => apiClient.getInstagramConnectionStatus());

  const connectInstagram = async () => {
    try {
      const response = await apiClient.connectInstagram();
      if (response.data?.authUrl) {
        window.open(response.data.authUrl, '_blank');
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to connect Instagram');
    }
  };

  const disconnectInstagram = async (accountId) => {
    try {
      if (!accountId) {
        throw new Error('Account ID is required to disconnect Instagram');
      }
      const response = await apiClient.disconnectInstagramAccount(accountId);
      refetch(); // Refresh status
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to disconnect Instagram');
    }
  };

  return {
    status: data?.data || null,
    loading,
    error,
    connectInstagram,
    disconnectInstagram,
    refetch
  };
};

// Optimized dashboard hook that fetches all data concurrently
export const useDashboardData = () => {
  const [data, setData] = useState({
    user: null,
    posts: [],
    analytics: null,
    instagramStatus: null,
    media: [],
    stats: null,          
    upcomingPosts: []      
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = 'dashboard-data';
      const cachedData = apiCache.get(cacheKey);

      if (isCacheValid(cachedData)) {
        setData(cachedData.data);
        setLoading(false);
        return;
      }

      // ✅ Fetch dashboard data as primary source
      const [dashboardRes, userRes, postsRes, analyticsRes, statusRes, mediaRes] = await Promise.allSettled([
        apiClient.getDashboard(),    // ✅ Primary dashboard data
        apiClient.getCurrentUser(),
        apiClient.getPosts(),
        apiClient.getAnalyticsOverview(),
        apiClient.getInstagramConnectionStatus(),
        apiClient.getMedia()
      ]);

      const dashboardApiData = dashboardRes.status === 'fulfilled' ? dashboardRes.value?.data : null;

      const dashboardData = {
        user: userRes.status === 'fulfilled' ? userRes.value?.data : null,
        posts: postsRes.status === 'fulfilled' ?
          (Array.isArray(postsRes.value?.data) ? postsRes.value.data : []) : [],
        analytics: analyticsRes.status === 'fulfilled' ? analyticsRes.value?.data : null,
        instagramStatus: statusRes.status === 'fulfilled' ? statusRes.value?.data : null,
        media: mediaRes.status === 'fulfilled' ?
          (Array.isArray(mediaRes.value?.data) ? mediaRes.value.data : []) : [],
        
        // ✅ Use dashboard API data
        stats: dashboardApiData?.stats || null,
        upcomingPosts: dashboardApiData?.upcomingPosts || [],
        analyticsOverview: dashboardApiData?.analyticsOverview || null
      };

      // Cache the result
      apiCache.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now()
      });

      setData(dashboardData);

      // Check for any errors
      const errors = [dashboardRes, userRes, postsRes, analyticsRes, statusRes, mediaRes]
        .filter(res => res.status === 'rejected')
        .map(res => res.reason?.message || 'Unknown error');

      if (errors.length > 0) {
        console.warn('Some dashboard data failed to load:', errors);
      }

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Individual action methods for backward compatibility
  const createPost = async (postData) => {
    try {
      const response = await apiClient.createPost(postData);
      setData(prev => ({
        ...prev,
        posts: [response.data, ...prev.posts]
      }));
      // Clear cache to force refresh on next load
      apiCache.delete('dashboard-data');
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to create post');
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await apiClient.deletePost(postId);
      setData(prev => ({
        ...prev,
        posts: prev.posts.filter(post => post._id !== postId)
      }));
      // Clear cache to force refresh on next load
      apiCache.delete('dashboard-data');
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to delete post');
    }
  };

  const connectInstagram = async (connectionType = 'standard') => {
    try {
      const response = await apiClient.connectInstagram(connectionType);
      if (response.data?.authUrl) {
        window.open(response.data.authUrl, '_blank');
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to connect Instagram');
    }
  };

  const disconnectInstagram = async (accountId) => {
    try {
      const response = await apiClient.disconnectInstagramAccount(accountId);
      // Refresh Instagram status
      const statusRes = await apiClient.getInstagramConnectionStatus();
      setData(prev => ({
        ...prev,
        instagramStatus: statusRes.data
      }));
      return response;
    } catch (err) {
      throw new Error(err.message || 'Failed to disconnect Instagram');
    }
  };

  return {
    // Data
    user: data.user,
    posts: data.posts,
    analytics: data.analytics,
    instagramStatus: data.instagramStatus,
    media: data.media,
    data: data, // ✅ Return complete data object for easy access

    // States
    loading,
    error,

    // Actions
    createPost,
    deletePost,
    connectInstagram,
    disconnectInstagram,
    refetch: fetchDashboardData
  };
};

// Custom hook for connected platforms
export const useConnectedPlatforms = () => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.getCurrentUser(),
    []
  );

  const platforms = useMemo(() => {
    // Get connected accounts from user data
    let connectedAccounts = data?.data?.connectedAccounts || [];

    // Import platform constants and helpers
    const { PLATFORMS, PLATFORM_CONFIGS } = require('../utils/constants');

    // Enrich static config with dynamic connection status from the API
    return Object.values(PLATFORMS).map(platformId => {
      const config = PLATFORM_CONFIGS[platformId];
      const account = connectedAccounts.find(acc => acc.platform === platformId);

      return {
        id: platformId,
        name: config.name,
        color: config.color,
        emoji: config.emoji,
        description: config.description,
        connected: !!account, // Is there a connected account for this platform?
        username: account?.username || null,
        connectedAt: account?.connectedAt || null,
        ...config // Include all other platform config properties
      };
    });
  }, [data]);

  return {
    platforms,
    loading,
    error,
    refetch,
    // Helper methods
    getConnectedPlatforms: () => platforms.filter(p => p.connected),
    getDisconnectedPlatforms: () => platforms.filter(p => !p.connected),
    isPlatformConnected: (platformId) => platforms.find(p => p.id === platformId)?.connected || false
  };
};

// Enhanced Media Exploration Hooks

// Hook for media by folder
export const useMediaByFolder = (folder, params = {}) => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.getMediaByFolder(folder, params),
    [folder, JSON.stringify(params)]
  );

  return {
    media: data?.data?.media || [],
    pagination: data?.data?.pagination || {},
    loading,
    error,
    refetch
  };
};

// Hook for media search
export const useMediaSearch = (query, params = {}) => {
  const { data, loading, error, refetch } = useApi(
    () => query && query.trim().length >= 2 ? apiClient.searchMedia(query, params) : Promise.resolve({ data: { media: [] } }),
    [query, JSON.stringify(params)]
  );

  return {
    media: data?.data?.media || [],
    pagination: data?.data?.pagination || {},
    query: data?.data?.query || '',
    loading,
    error,
    refetch
  };
};

// Hook for media statistics
export const useMediaStats = () => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.getMediaStats(),
    []
  );

  return {
    stats: data?.data || {},
    loading,
    error,
    refetch
  };
};

// Hook for recent media
export const useRecentMedia = (limit = 10) => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.getRecentMedia(limit),
    [limit]
  );

  return {
    media: data?.data?.media || [],
    period: data?.data?.period || '',
    loading,
    error,
    refetch
  };
};

// Hook for media folders
export const useMediaFolders = () => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.getMediaFolders(),
    []
  );

  return {
    folders: data?.data?.folders || [],
    stats: data?.data?.stats || {},
    loading,
    error,
    refetch
  };
};

// Enhanced media hook with advanced filtering
export const useMediaEnhanced = (filters = {}) => {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.getMedia(filters),
    [JSON.stringify(filters)]
  );

  return {
    media: data?.data?.media || [],
    pagination: data?.data?.pagination || {},
    stats: data?.data?.stats || {},
    loading,
    error,
    refetch,
    // Helper methods
    hasMore: () => {
      const pagination = data?.data?.pagination || {};
      return pagination.page < pagination.pages;
    },
    isEmpty: () => (data?.data?.media || []).length === 0,
    getTotalCount: () => data?.data?.pagination?.total || 0
  };
};
