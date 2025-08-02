import { NhostClient } from '@nhost/nhost-js';

// Clear any existing invalid tokens on app start
const clearInvalidTokens = () => {
  try {
    // Clear all Nhost-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('nhost') || key.includes('nhostRefreshToken') || key.includes('nhostSession'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('Cleared old Nhost tokens');
  } catch (error) {
    console.warn('Could not clear localStorage:', error);
  }
};

// Clear tokens on initialization
clearInvalidTokens();

export const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN || 'local',
  region: process.env.REACT_APP_NHOST_REGION || 'localhost',
});
