import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart3,
  Calendar,
  FolderOpen,
  TrendingUp,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Sidebar,
  MessageCircle,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';
import Logo from "../assets/img/Logo.png";
import { useDashboardData } from '../hooks/useApi';
import FeedbackModal from '../components/common/Feedback/FeedbackModal';
import apiClient from '../utils/api';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(!window.innerWidth > 768);
  const [insideSidebar, setInsideSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLegalDropdown, setShowLegalDropdown] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsError, setNotificationsError] = useState(null);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Ref for notification dropdown
  const notificationDropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, token } = useAuth();
  const [name, setName] = useState('Loading...');
  const [email, setEmail] = useState('Loading...');

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const { user } = useDashboardData();

  // Initialize notifications on component mount
  useEffect(() => {
    loadNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Enhanced load notifications with better error handling
  const loadNotifications = async () => {
    if (!token) {
      console.log('No token available for notifications');
      return;
    }

    setIsLoadingNotifications(true);
    setNotificationsError(null);

    try {
      const response = await apiClient.getNotifications();

      if (response && response.success) {
        const notificationsData = response.data.notifications || [];

        // Process notifications
        setNotifications(notificationsData);

        // Get unread count from API response or calculate it
        const unreadCount = response.data.unreadCount !== undefined
          ? response.data.unreadCount
          : notificationsData.filter(n => !n.read).length;

        setUnreadCount(unreadCount);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotificationsError(error.message);

      // Clear notifications on error rather than showing sample data
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoadingNotifications(false);
    }
  };



  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await apiClient.markNotificationAsRead(id);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);

      // Still update UI locally if API fails
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);

      // Still update UI locally if API fails
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  };

  // Delete a notification
  const removeNotification = async (id, event) => {
    if (event) {
      event.stopPropagation(); // Prevent triggering parent click events
    }

    try {
      await apiClient.deleteNotification(id);

      // Check if notification was unread and update count if needed
      const notification = notifications.find(n => n._id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Remove from local state
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error removing notification:', error);

      // Still update UI locally if API fails
      const notification = notifications.find(n => n._id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n._id !== id));
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'scheduled':
        return <Clock size={20} className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get platform icon based on platform name
  const getPlatformIcon = (platform) => {
    if (!platform) return <Globe className="w-3 h-3 text-gray-400" />;

    const platformLower = platform.toLowerCase();

    if (platformLower.includes('instagram')) {
      return <Instagram size={20} className="w-3 h-3 text-purple-500" />;
    } else if (platformLower.includes('facebook')) {
      return <Facebook size={20} className="w-3 h-3 text-blue-600" />;
    } else if (platformLower.includes('twitter') || platformLower.includes('x.com')) {
      return <Twitter size={20} className="w-3 h-3 text-blue-400" />;
    } else if (platformLower.includes('linkedin')) {
      return <Linkedin size={20} className="w-3 h-3 text-blue-700" />;
    } else if (platformLower.includes('youtube')) {
      return <Youtube size={20} className="w-3 h-3 text-red-600" />;
    } else if (platformLower.includes('tiktok')) {
      return <Tiktok size={20} className="w-3 h-3 text-black" />;
    } else if (platformLower.includes('pinterest')) {
      return <Pinterest size={20} className="w-3 h-3 text-red-500" />;
    } else {
      return <Globe className="w-3 h-3 text-gray-400" />;
    }
  };

  // Generate platform icons for a platform string
  const renderPlatformIcons = (platformString) => {
    if (!platformString) return <Globe className="w-3 h-3 text-gray-400" />;

    // If it contains "Published to X/Y accounts", extract just the accounts part
    const publishPattern = /published to \d+\/\d+ accounts/i;
    if (publishPattern.test(platformString.toLowerCase())) {
      return <Globe className="w-3 h-3 text-gray-400" />;
    }

    // Split the platform string and render icon for each platform
    const platforms = platformString.split(',').map(p => p.trim());

    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {platforms.map((platform, index) => (
          <span key={index}>{getPlatformIcon(platform)}</span>
        ))}
      </div>
    );
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';

    try {
      const now = new Date();
      const date = new Date(timestamp);

      if (isNaN(date.getTime())) {
        return '';
      }

      const diff = now - date;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) {
        return 'Just now';
      } else if (minutes < 60) {
        return `${minutes}m ago`;
      } else if (hours < 24) {
        return `${hours}h ago`;
      } else {
        return `${days}d ago`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
        setShowMobileHeader(true); // always show header on desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll behavior (only mobile)
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // scrolling down → hide header
        setShowMobileHeader(false);
      } else {
        // scrolling up → show header
        setShowMobileHeader(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, lastScrollY]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-profile-dropdown')) {
        setShowUserDropdown(false);
      }
      if (showNotifications &&
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown, showNotifications]);

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3, description: 'Overview and quick stats' },
    { name: 'Planner', path: '/planner', icon: Calendar, description: 'Content calendar and scheduling' },
    { name: 'Content', path: '/content', icon: FolderOpen, description: 'Posts and media library' },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp, description: 'Performance insights' },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, description: 'Content generation tools' },
    { name: 'Settings', path: '/settings', icon: Settings, description: 'Account and preferences' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.getUserProfile();
        if (res.success) {
          setName(res.data.displayName || 'User');
          setEmail(res.data.email || 'No Email');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setName('User');
        setEmail('No Email');
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleUserProfileClick = () => {
    navigate('/settings?tab=profile');
    if (isMobile) setIsSidebarOpen(false);
    setShowUserDropdown(false);
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      // Create FormData for file upload support
      const formData = new FormData();
      formData.append('type', feedbackData.type);
      formData.append('message', feedbackData.message);
      formData.append('satisfied', feedbackData.satisfied);
      formData.append('email', feedbackData.email);
      if (feedbackData.attachment) {
        formData.append('attachment', feedbackData.attachment);
      }

      const response = await axios.post(
        '/api/feedback',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        alert('Thank you for your feedback! We appreciate your input.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // For now, show success even if API fails (you can change this behavior)
      alert('Thank you for your feedback! We appreciate your input.');
      throw error;
    }
  };

  const enterSidebar = (bool) => !isMobile && setIsSidebarOpen(bool);

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      {isMobile && (
        <header className={`mobile-header ${showMobileHeader ? 'visible' : 'hidden'}`}>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(prev => !prev)}>
            {isSidebarOpen ?
              <X size={24} /> :
              <Menu size={24} />
            }
          </button>
          <div className="app-logo">
            <h1>
              <a href="/dashboard" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none' }}>
                BuzzConnect
              </a>
            </h1>
          </div>
          <div className="header-right">
            {/* Mobile Notification Bell */}
            <div
              className="notification-dropdown"
              style={{ marginRight: '10px' }}
              ref={notificationDropdownRef}
            >
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: 'relative',
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Mobile Notification Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '100%',
                  marginTop: '8px',
                  width: '300px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  zIndex: 1000,
                  maxHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    padding: '12px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                      Notifications
                      {isLoadingNotifications && (
                        <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                          Loading...
                        </span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Mobile Notification List with dynamic height */}
                  <div style={{
                    overflowY: 'auto',
                    flex: '1 1 auto',
                    maxHeight: '350px'
                  }}>
                    {isLoadingNotifications ? (
                      <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        <Bell size={24} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ margin: 0, fontSize: '14px' }}>Loading notifications...</p>
                      </div>
                    ) : notificationsError ? (
                      <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#ef4444'
                      }}>
                        <XCircle size={24} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ margin: 0, fontSize: '14px' }}>Error loading notifications</p>
                        <button
                          onClick={loadNotifications}
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        <Bell size={24} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: !notification.read ? '#f8fafc' : 'white',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          onClick={() => !notification.read && markAsRead(notification._id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            {getNotificationIcon(notification.type)}
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <h4 style={{
                                  margin: 0,
                                  fontSize: '13px',
                                  fontWeight: notification.read ? '500' : '600',
                                  color: notification.read ? '#6b7280' : '#111827'
                                }}>
                                  {notification.title}
                                </h4>
                                <button
                                  onClick={(e) => removeNotification(notification._id, e)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    zIndex: 10
                                  }}
                                  aria-label="Delete notification"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <p style={{
                                margin: '3px 0',
                                fontSize: '12px',
                                color: '#6b7280',
                                lineHeight: '1.3'
                              }}>
                                {notification.message}
                              </p>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '6px'
                              }}>
                                <span style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  color: '#9ca3af'
                                }}>
                                  {renderPlatformIcons(notification.platform)}
                                </span>
                                <span style={{
                                  fontSize: '11px',
                                  color: '#9ca3af'
                                }}>
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            {!notification.read && (
                              <div style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#3b82f6',
                                borderRadius: '50%',
                                marginTop: '4px'
                              }} />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile-dropdown">
              <button
                className="user-avatar-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <div className="user-avatar">
                  {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              </button>
              {showUserDropdown && (
                <div className="dropdown-menu">
                  {/* <button
                    onClick={() => {
                      setShowFeedbackModal(true);
                      setShowUserDropdown(false);
                    }}
                    className="dropdown-item"
                  >
                    <MessageCircle size={16} />
                    Feedback
                  </button> */}
                  <button onClick={handleUserProfileClick} className="dropdown-item">
                    <Settings size={16} />
                    Settings
                  </button>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            {/* <h1>BuzzConnect</h1> */}
            <img src={Logo} alt="BuzzConnect Logo" className='logo-img' onClick={goToDashboard} style={{ cursor: "pointer" }} />
          </div>
        </div>
        <div className="header-right">
          <span className="welcome-message">
            Welcome back,
            {user?.displayName || user?.email || 'User'}!
          </span>
          {/* Desktop Notification Bell */}
          <div
            className="notification-dropdown"
            style={{ position: 'relative' }}
            ref={notificationDropdownRef}
          >
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: 'relative',
                padding: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f8fafc'}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Desktop Notification Dropdown Panel */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: '0',
                top: '100%',
                marginTop: '8px',
                width: (notifications.length === 0 ? 20 : 40) + 'vw',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                maxHeight: '500px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    Notifications
                    {isLoadingNotifications && (
                      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                        Loading...
                      </span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3b82f6',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Desktop Notification List with dynamic height */}
                <div style={{
                  overflowY: 'auto',
                  flex: '1 1 auto',
                  maxHeight: notifications.length > 3 ? '350px' : 'auto'
                }}>
                  {isLoadingNotifications ? (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#6b7280'
                    }}>
                      <Bell size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p style={{ margin: 0 }}>Loading notifications...</p>
                    </div>
                  ) : notificationsError ? (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#ef4444'
                    }}>
                      <XCircle size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p style={{ margin: 0 }}>Error loading notifications</p>
                      <button
                        onClick={loadNotifications}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#6b7280'
                    }}>
                      <Bell size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p style={{ margin: 0 }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        style={{
                          padding: '16px',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: !notification.read ? '#f8fafc' : 'white',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                        onClick={() => !notification.read && markAsRead(notification._id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          {getNotificationIcon(notification.type)}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start'
                            }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '14px',
                                fontWeight: notification.read ? '500' : '600',
                                color: notification.read ? '#6b7280' : '#111827'
                              }}>
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => removeNotification(notification._id, e)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#9ca3af',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  zIndex: 10
                                }}
                                aria-label="Delete notification"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p style={{
                              margin: '4px 0',
                              fontSize: '13px',
                              color: '#6b7280',
                              lineHeight: '1.4'
                            }}>
                              {notification.message}
                            </p>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '8px'
                            }}>
                              <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '12px',
                                color: '#9ca3af'
                              }}>
                                {renderPlatformIcons(notification.platform)}
                              </span>
                              <span style={{
                                fontSize: '12px',
                                color: '#9ca3af'
                              }}>
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          {!notification.read && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#3b82f6',
                              borderRadius: '50%',
                              marginTop: '4px'
                            }} />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="user-profile-dropdown">
            <button
              className="user-avatar-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="user-avatar">
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={16} />
            </button>
            {showUserDropdown && (
              <div className="dropdown-menu">
                {/* <button
                  onClick={() => {
                    setShowFeedbackModal(true);
                    setShowUserDropdown(false);
                  }}
                  className="dropdown-item"
                >
                  <MessageCircle size={16} />
                  Feedback
                </button> */}
                <button onClick={handleUserProfileClick} className="dropdown-item">
                  <Settings size={16} />
                  Settings
                </button>
                {/* --- Legal Pages Dropdown --- */}
                <div className="dropdown-item nested-dropdown">
                  <button
                    className="nested-toggle"
                    onClick={() => setShowLegalDropdown(!showLegalDropdown)}
                  >
                    <FileText size={16} style={{ marginRight: "8px" }} />
                    Legal Pages
                  </button>
                  {showLegalDropdown && (
                    <div className="nested-menu">
                      <a
                        href="terms-of-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-item"
                      >
                        Terms of Service
                      </a>
                      <a
                        href="privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-item"
                      >
                        Privacy Policy
                      </a>
                      <a
                        href="testing-instructions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-item"
                      >
                        Testing Instructions
                      </a>
                      <a
                        href="data-deletion-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-item"
                      >
                        Data Deletion Policy
                      </a>
                    </div>
                  )}
                </div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className='bxd'>
        <aside
          className={`app-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}
          onMouseEnter={() => enterSidebar(true)}
          onMouseLeave={() => enterSidebar(false)}
        >
          <nav className="sidebar-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  data-tooltip={!isSidebarOpen && !isMobile ? item.name : ''}
                >
                  <div className="nav-item-content">
                    <Icon size={20} />
                    {isSidebarOpen && (
                      <div className="nav-item-text">
                        <span className="nav-item-name">{item.name}</span>
                        <span className="nav-item-description">{item.description}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="user-info" onClick={handleUserProfileClick} style={{ cursor: "pointer" }}>
              <div className="user-avatar"><User size={20} /></div>
              {isSidebarOpen && (
                <div className="user-details">
                  <p className="user-name">{name}</p>
                  <p className="user-email">{email}</p>
                </div>
              )}
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
        {/* Main */}
        <main className={`app-main `}>{children}</main>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
      />
      {/* Footer */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()}, MGA Buzz Connect.</p>
        <div className="footer-links">
          <a
            href="https://mgabuzzconnect.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy
          </a>
          <a
            href="https://mgabuzzconnect.com/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
