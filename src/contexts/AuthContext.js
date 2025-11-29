import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {  
        try {
          // Verify token and get user data
          const response = await apiClient.getCurrentUser();
          console.log('getCurrentUser response:', response);
          
          // Handle different response structures
          if (response && response.success) {
            // Backend returns: { success: true, message: "...", data: user }
            // Some endpoints return: { success: true, data: { user: ... } }
            let userData = null;
            
            if (response.data) {
              // Check if data is the user object directly or wrapped
              if (response.data.user) {
                userData = response.data.user;
              } else if (response.data.id || response.data.email) {
                // Data is the user object directly
                userData = response.data;
              }
            }
            
            if (userData && (userData.id || userData._id)) {
              // Normalize user ID
              if (userData._id && !userData.id) {
                userData.id = userData._id;
              }
              
              setUser(userData);
              setIsAuthenticated(true);
              setToken(storedToken);
              console.log("User authenticated:", userData.email || userData.displayName);
            } else {
              console.warn("Invalid user data in response, clearing auth", response);
              clearAuth();
            }
          } else {
            // Token is invalid, clear it silently
            console.log("Token verification failed, clearing auth");
            clearAuth();
          }
        } catch (error) {
          // Silently handle errors (user doesn't exist, token invalid, etc.)
          console.log('Token verification failed (user may not exist):', error.message);
          clearAuth();
        }
      } else {
        // No token, make sure auth is cleared
        clearAuth();
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
  };

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', { email: credentials.email });
      const response = await apiClient.login(credentials);
      console.log('Login response:', response);
      
      if (response && response.success) {
        const { token: newToken, user: userData } = response.data;
        
        if (!newToken || !userData) {
          console.error('Missing token or user data in response:', response);
          toast.error('Invalid response from server');
          return { success: false, message: 'Invalid response from server' };
        }
        
        // Store token and user data
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        const displayName = userData.displayName || userData.name || userData.email;
        toast.success(`Welcome back, ${displayName}! 🎉`);
        return { success: true };
      } else {
        const errorMsg = response?.message || response?.error || 'Login failed';
        console.error('Login failed:', response);
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      const message = error.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      console.log('Attempting registration with:', { email: userData.email, displayName: userData.displayName });
      const response = await apiClient.register(userData);
      console.log('Registration response:', response);
      
      if (response && response.success) {
        const { token: newToken, user: newUser } = response.data;
        
        if (!newToken || !newUser) {
          console.error('Missing token or user data in response:', response);
          toast.error('Invalid response from server');
          return { success: false, message: 'Invalid response from server' };
        }
        
        // Store token and user data
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
        
        const displayName = newUser.displayName || newUser.name || newUser.email;
        toast.success(`Welcome to BuzzConnect, ${displayName}! 🎉`);
        return { success: true };
      } else {
        const errorMsg = response?.message || response?.error || 'Registration failed';
        console.error('Registration failed:', response);
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      const message = error.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if server call fails
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Check if token is expired (basic check)
  const isTokenExpired = () => {
    if (!token) return true;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Token parsing error:', error);
      return true;
    }
  };

  // Refresh token if needed
  const refreshTokenIfNeeded = async () => {
    if (isTokenExpired()) {
      console.log('Token expired, logging out...');
      await logout();
      return false;
    }
    return true;
  };

  // Auto-refresh token check
  useEffect(() => {
    if (isAuthenticated && token) {
      const interval = setInterval(() => {
        refreshTokenIfNeeded();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    register,
    logout,
    updateUser,
    clearAuth,
    refreshTokenIfNeeded
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
