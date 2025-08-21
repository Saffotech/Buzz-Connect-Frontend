// API Configuration and Client
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
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
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);

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
      } catch (jsonError) {
        // If JSON parsing fails, create a generic error response
        data = { message: `HTTP error! status: ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
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
    return fetch(`${this.baseURL}/api/media/upload`, {
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
  async connectInstagram() {
    return this.request('/api/auth/instagram/connect', {
      method: 'POST'
    });
  }

  async disconnectInstagram() {
    return this.request('/api/auth/instagram/disconnect', {
      method: 'POST'
    });
  }

  async getInstagramStatus() {
    return this.request('/api/auth/instagram/status');
  }

  // AI Content endpoints
  async generateContent(options = {}) {
    const {
      prompt,
      platforms = ['instagram'],
      tone = 'casual',
      includeHashtags = true,
      includeEmojis = true
    } = options;

    return this.request('/api/ai/generate-content', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        platforms,
        tone,
        includeHashtags,
        includeEmojis
      })
    });
  }

  async suggestHashtags(options = {}) {
    const {
      content,
      platform = 'instagram',
      count = 10
    } = options;

    return this.request('/api/ai/suggest-hashtags', {
      method: 'POST',
      body: JSON.stringify({
        content,
        platform,
        count
      })
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

}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export individual methods for convenience
export const {
  register,
  login,
  getCurrentUser,
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
  disconnectInstagram,
  getInstagramStatus,
  generateContent,
  suggestHashtags,
  analyzeContent,
  testAIConnection,
  getAIInfo,
  getAIHealth,
  healthCheck
} = apiClient;
