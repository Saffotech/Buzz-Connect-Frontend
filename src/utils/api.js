// API Configuration and Client
// Normalize base URL once (remove trailing slashes)
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://mgabuzzconnect.com').replace(
  /\/+$/,
  ''
);

// Log API configuration on load
console.log('API Configuration:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_BASE_URL: API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('ApiClient initialized with baseURL:', this.baseURL);
  }

  // Helper to safely build full URL without double /api or extra slashes
  buildUrl(endpoint = '') {
    const base = this.baseURL.replace(/\/+$/, '');
    let normalizedEndpoint = endpoint || '';

    // Ensure endpoint has a single leading slash
    if (!normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = `/${normalizedEndpoint}`;
    }

    // Prevent /api duplication: if base already ends with /api and endpoint starts with /api/
    if (base.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
      normalizedEndpoint = normalizedEndpoint.replace(/^\/api/, '');
    }

    return `${base}${normalizedEndpoint}`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    // Log request for debugging
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: config.headers
    });

    try {
      const response = await fetch(url, config);

      console.log('API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      // Handle 304 Not Modified responses
      if (response.status === 304) {
        return { data: { media: [] } }; // Return empty media array for 304 responses
      }

      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }

      let data;
      try {
        data = await response.json();
        console.log('API Response data:', data);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        // If JSON parsing fails, create a generic error response
        const text = await response.text();
        console.error('Response text:', text);
        data = {
          success: false,
          message: `HTTP error! status: ${response.status}`,
          error: `HTTP error! status: ${response.status}`
        };
      }

      if (!response.ok) {
        let errorMessage =
          data.message || data.error || data.detail || `HTTP error! status: ${response.status}`;

        // ✅ Better error messages for 401 (authentication) errors
        if (response.status === 401) {
          if (errorMessage.includes('token') || errorMessage.includes('authorization')) {
            // Check if it's Instagram-specific
            if (endpoint.includes('instagram') || endpoint.includes('post')) {
              errorMessage =
                'Instagram account authentication failed. Please reconnect your Instagram account in Settings → Accounts.';
            } else {
              errorMessage = 'Authentication failed. Please log in again.';
            }
          }
        }

        // ✅ Better error messages for Instagram posting errors
        if (data.error && typeof data.error === 'string') {
          if (
            data.error.includes('Missing Instagram') ||
            data.error.includes('Instagram account is missing')
          ) {
            errorMessage =
              'Instagram account is missing access token. Please reconnect your Instagram account in Settings → Accounts. ' +
              'Make sure your Instagram Business account is linked to your Facebook Page.';
          }
        }

        console.error('API Error:', {
          status: response.status,
          message: errorMessage,
          data: data
        });
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', {
        url,
        error: error.message,
        stack: error.stack,
        name: error.name
      });

      // Handle network errors (CORS, connection refused, etc.)
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(
          'Unable to connect to server. Please check if the backend is running on http://localhost:5000'
        );
      }

      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async getUserProfile() {
    return this.request('/api/users/profile');
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST'
    });
  }

  // Posts endpoints
  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/posts${queryString ? `?${queryString}` : ''}`);
  }

  async createPost(postData) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async getPost(id) {
    return this.request(`/api/posts/${id}`);
  }

  async updatePost(id, postData) {
    return this.request(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    });
  }

  async deletePost(id) {
    return this.request(`/api/posts/${id}`, {
      method: 'DELETE'
    });
  }

  async publishPost(id) {
    return this.request(`/api/posts/${id}/publish`, {
      method: 'POST'
    });
  }

  // Media endpoints
  async uploadMedia(files) {
    const formData = new FormData();
    
    // Handle multiple files
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }

    const token = this.getAuthToken();
    const url = this.buildUrl('/api/media/upload');
    return fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      return response.json();
    });
  }

  async getMedia(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/media${queryString ? `?${queryString}` : ''}`);
  }

  async deleteMedia(id) {
    return this.request(`/api/media/${id}`, {
      method: 'DELETE'
    });
  }

  // Enhanced media exploration endpoints
  async getMediaByFolder(folder, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/media/folders/${folder}${queryString ? `?${queryString}` : ''}`);
  }

  async searchMedia(query, params = {}) {
    const searchParams = new URLSearchParams({ q: query, ...params }).toString();
    return this.request(`/api/media/search?${searchParams}`);
  }

  async getMediaStats() {
    return this.request('/api/media/stats');
  }

  async getRecentMedia(limit = 10) {
    return this.request(`/api/media/recent?limit=${limit}`);
  }

  async getMediaFolders() {
    return this.request('/api/media/folders');
  }

  // Analytics endpoints
  async getAnalyticsOverview() {
    return this.request('/api/analytics/overview');
  }

  async getPostAnalytics(id) {
    return this.request(`/api/analytics/posts/${id}`);
  }

  // Scheduler endpoints
  async getSchedulerStatus() {
    return this.request('/api/scheduler/status');
  }

  async triggerScheduler() {
    return this.request('/api/scheduler/trigger', {
      method: 'POST'
    });
  }

  async getUpcomingPosts() {
    return this.request('/api/scheduler/upcoming');
  }

  // Instagram OAuth endpoints
  async connectInstagram(connectionType = 'standard') {
    return this.request('/api/auth/instagram/connect', {
      method: 'POST',
      body: JSON.stringify({ connectionType })
    });
  }

  async getInstagramAccounts() {
    return this.request('/api/auth/instagram/accounts');
  }

  async getInstagramConnectionStatus() {
    return this.request('/api/auth/instagram/connection-status');
  }

  async disconnectInstagramAccount(accountId) {
    return this.request(`/api/auth/instagram/accounts/${accountId}`, {
      method: 'DELETE'
    });
  }

  // AI Content endpoints
  async generateContent(options = {}) {
    return this.request('/api/ai/generate-content', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }

  async suggestHashtags(options = {}) {
    return this.request('/api/ai/suggest-hashtags', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }
  async suggestMentions(options = {}) {
    return this.request('/api/ai/suggest-mentions', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }
  async optimizeContent(options = {}) {
    return this.request('/api/ai/optimize-content', {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }
  

  async analyzeContent(options = {}) {
    const {
      content,
      platform = 'instagram'
    } = options;

    return this.request('/api/ai/analyze-content', {
      method: 'POST',
      body: JSON.stringify({
        content,
        platform
      })
    });
  }

  async testAIConnection() {
    return this.request('/api/ai/test-connection');
  }

  async getAIInfo() {
    return this.request('/api/ai/info');
  }

  async getAIHealth() {
    return this.request('/api/ai/health');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  async getDashboard() {
  return this.request('/api/dashboard');
}
async validateImageDimensions(file, platform, type) {
  const formData = new FormData();
  formData.append('media', file);
  formData.append('platform', platform);
  formData.append('type', type);

  const token = this.getAuthToken();
  const url = this.buildUrl('/api/media/validate-dimensions');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Validation failed: ${response.status}`);
  }
  
  return response.json();
}

async uploadAndResize(file, platform, type) {
  const formData = new FormData();
  formData.append('media', file);
  formData.append('platform', platform);
  formData.append('type', type);

  const token = this.getAuthToken();
  const url = this.buildUrl('/api/media/upload/resize');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload and resize failed: ${response.status}`);
  }
  
  return response.json();
}

}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export individual methods for convenience
export const {
  register,
  login,
  getCurrentUser,
  getUserProfile,
  logout,
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  publishPost,
  uploadMedia,
  getMedia,
  deleteMedia,
  getMediaByFolder,
  searchMedia,
  getMediaStats,
  getRecentMedia,
  getMediaFolders,
  getAnalyticsOverview,
  getPostAnalytics,
  getSchedulerStatus,
  triggerScheduler,
  getUpcomingPosts,
  connectInstagram,
  getInstagramAccounts,
  getInstagramConnectionStatus,
  disconnectInstagramAccount,
  generateContent,
  suggestHashtags,
  analyzeContent,
  testAIConnection,
  getAIInfo,
  getAIHealth,
  healthCheck,
  validateImageDimensions,
  uploadAndResize
} = apiClient;
