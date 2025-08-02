// Utility to clear all Nhost tokens and reset authentication state

export const clearAllTokens = () => {
  try {
    console.log('Clearing all authentication tokens...');
    
    // Clear localStorage
    const localStorageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageKeys.push(key);
      }
    }
    
    // Remove all keys (safer than localStorage.clear() which might affect other apps)
    localStorageKeys.forEach(key => {
      if (key.includes('nhost') || 
          key.includes('auth') || 
          key.includes('token') || 
          key.includes('session') ||
          key.includes('refresh')) {
        localStorage.removeItem(key);
        console.log(`Removed: ${key}`);
      }
    });
    
    // Clear sessionStorage as well
    const sessionStorageKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        sessionStorageKeys.push(key);
      }
    }
    
    sessionStorageKeys.forEach(key => {
      if (key.includes('nhost') || 
          key.includes('auth') || 
          key.includes('token') || 
          key.includes('session') ||
          key.includes('refresh')) {
        sessionStorage.removeItem(key);
        console.log(`Removed from session: ${key}`);
      }
    });
    
    console.log('Token cleanup completed');
    return true;
  } catch (error) {
    console.error('Error clearing tokens:', error);
    return false;
  }
};

// Function to check current token status
export const checkTokenStatus = () => {
  const tokens = {};
  
  // Check localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('nhost') || key.includes('auth') || key.includes('token'))) {
      tokens[key] = localStorage.getItem(key);
    }
  }
  
  console.log('Current tokens in storage:', tokens);
  return tokens;
};

// Add to window for debugging
if (typeof window !== 'undefined') {
  window.clearAllTokens = clearAllTokens;
  window.checkTokenStatus = checkTokenStatus;
}
