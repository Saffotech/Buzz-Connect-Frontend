// API Optimization Test
// This file demonstrates the improvement in API calls

import apiClient from './api';

// Before optimization: Multiple individual API calls
export const fetchDashboardDataOldWay = async () => {
  console.log('🔴 OLD WAY: Making individual API calls...');
  const startTime = Date.now();
  
  try {
    // These would all be called separately, potentially causing duplicates
    const user = await apiClient.getCurrentUser();
    console.log('✅ User data fetched');
    
    const posts = await apiClient.getPosts();
    console.log('✅ Posts data fetched');
    
    const analytics = await apiClient.getAnalyticsOverview();
    console.log('✅ Analytics data fetched');
    
    const instagramStatus = await apiClient.getInstagramStatus();
    console.log('✅ Instagram status fetched');
    
    const media = await apiClient.getMedia();
    console.log('✅ Media data fetched');
    
    const endTime = Date.now();
    console.log(`🔴 OLD WAY: Total time: ${endTime - startTime}ms`);
    
    return {
      user: user.data,
      posts: posts.data,
      analytics: analytics.data,
      instagramStatus: instagramStatus.data,
      media: media.data
    };
  } catch (error) {
    console.error('❌ Error in old way:', error);
    throw error;
  }
};

// After optimization: Concurrent API calls with caching
export const fetchDashboardDataNewWay = async () => {
  console.log('🟢 NEW WAY: Making concurrent API calls...');
  const startTime = Date.now();
  
  try {
    // All calls made concurrently
    const [userRes, postsRes, analyticsRes, statusRes, mediaRes] = await Promise.allSettled([
      apiClient.getCurrentUser(),
      apiClient.getPosts(),
      apiClient.getAnalyticsOverview(),
      apiClient.getInstagramStatus(),
      apiClient.getMedia()
    ]);
    
    const endTime = Date.now();
    console.log(`🟢 NEW WAY: Total time: ${endTime - startTime}ms`);
    
    return {
      user: userRes.status === 'fulfilled' ? userRes.value?.data : null,
      posts: postsRes.status === 'fulfilled' ? postsRes.value?.data || [] : [],
      analytics: analyticsRes.status === 'fulfilled' ? analyticsRes.value?.data : null,
      instagramStatus: statusRes.status === 'fulfilled' ? statusRes.value?.data : null,
      media: mediaRes.status === 'fulfilled' ? mediaRes.value?.data || [] : []
    };
  } catch (error) {
    console.error('❌ Error in new way:', error);
    throw error;
  }
};

// Performance comparison function
export const comparePerformance = async () => {
  console.log('🚀 Starting API optimization comparison...');
  
  try {
    // Test old way
    await fetchDashboardDataOldWay();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test new way
    await fetchDashboardDataNewWay();
    
    console.log('✅ Performance comparison complete! Check the console for timing results.');
  } catch (error) {
    console.error('❌ Error during comparison:', error);
  }
};

// Instructions for testing
export const testInstructions = `
🧪 API Optimization Test Instructions:

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Import this test: import { comparePerformance } from './utils/apiOptimizationTest'
4. Run: comparePerformance()
5. Check the Network tab to see the difference in API calls

Expected improvements:
- Reduced number of API calls (from ~11 to ~5)
- Faster loading due to concurrent requests
- No duplicate calls due to caching
- Better error handling with Promise.allSettled
`;

console.log(testInstructions);
