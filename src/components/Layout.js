import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';
import Logo from "../assets/img/Logo.png";
import { useDashboardData } from '../hooks/useApi';
import FeedbackModal from '../components/common/Feedback/FeedbackModal';

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

  // Enhanced load notifications with better debugging
  const loadNotifications = async () => {
    if (!token) {
      console.log('No token available for notifications');
      return;
    }

    setIsLoadingNotifications(true);
    setNotificationsError(null);
    
    try {
      console.log('🔔 Loading notifications...');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📥 Notifications API Response:', response);
      console.log('📥 Response Data:', response.data);
      console.log('📥 Response Status:', response.status);
      
      // Handle different possible response structures
      if (response.data) {
        let notificationsData = [];
        
        // Check multiple possible response structures
        if (response.data.success && response.data.notifications) {
          notificationsData = response.data.notifications;
        } else if (response.data.data) {
          notificationsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          notificationsData = response.data;
        } else if (response.data.notifications) {
          notificationsData = response.data.notifications;
        }
        
        console.log('📋 Processed notifications data:', notificationsData);
        
        setNotifications(notificationsData || []);
        const unread = notificationsData?.filter(n => !n.read)?.length || 0;
        setUnreadCount(unread);
        
        console.log(`✅ Loaded ${notificationsData?.length || 0} notifications, ${unread} unread`);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      setNotificationsError(error.message);
      
      // Add sample notifications for testing (you can remove this later)
      const sampleNotifications = [
        {
          id: 1,
          type: 'success',
          title: 'Post Published Successfully',
          message: 'Your post "Hello World" has been published to Instagram.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
          read: false,
          platform: 'Instagram'
        },
        {
          id: 2,
          type: 'scheduled',
          title: 'Post Scheduled',
          message: 'Your post will be published tomorrow at 10:00 AM.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          platform: 'Facebook'
        },
        {
          id: 3,
          type: 'error',
          title: 'Post Failed',
          message: 'Failed to publish post to YouTube. Please check your connection.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          platform: 'YouTube'
        }
      ];
      
      console.log('🧪 Using sample notifications for testing');
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.read).length);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Function to add new notification (called when post status changes)
  const addNotification = (type, title, message, platform = 'Social Media', postId = null) => {
    const newNotification = {
      id: Date.now(),
      type: type, // 'success', 'error', 'scheduled'
      title: title,
      message: message,
      timestamp: new Date(),
      read: false,
      platform: platform,
      postId: postId
    };

    console.log('➕ Adding new notification:', newNotification);

    // Add to local state immediately for real-time UI update
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Save to backend
    saveNotificationToBackend(newNotification);
  };

  // Enhanced save notification to backend
  const saveNotificationToBackend = async (notification) => {
    try {
      console.log('💾 Saving notification to backend:', notification);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications`, notification, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Notification saved:', response.data);
    } catch (error) {
      console.error('❌ Error saving notification:', error);
      console.error('❌ Error response:', error.response);
    }
  };

  // Enhanced mark as read with better error handling
  const markAsRead = async (id) => {
    try {
      console.log('📖 Marking notification as read:', id);
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      // Still update locally even if API fails
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Enhanced mark all as read
  const markAllAsRead = async () => {
    try {
      console.log('📖 Marking all notifications as read');
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      // Still update locally
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  };

  // Enhanced remove notification
  const removeNotification = async (id) => {
    try {
      console.log('🗑️ Removing notification:', id);
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
      console.log('✅ Notification removed');
    } catch (error) {
      console.error('❌ Error removing notification:', error);
      // Still update locally
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
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
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  // Make addNotification available globally for other components
  useEffect(() => {
    window.addNotification = addNotification;
    return () => {
      delete window.addNotification;
    };
  }, []);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-profile-dropdown')) {
        setShowUserDropdown(false);
      }
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setName(res.data.data.displayName || 'User');
          setEmail(res.data.data.email || 'No Email');
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
        `${process.env.REACT_APP_API_URL}/api/feedback`,
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
          <div className="app-logo"><h1>BuzzConnect</h1></div>
          <div className="header-right">
            {/* Mobile Notification Bell */}
            <div className="notification-dropdown" style={{ marginRight: '10px' }}>
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
                  <button
                    onClick={() => {
                      setShowFeedbackModal(true);
                      setShowUserDropdown(false);
                    }}
                    className="dropdown-item"
                  >
                    <MessageCircle size={16} />
                    Feedback
                  </button>
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
          <div className="notification-dropdown" style={{ position: 'relative' }}>
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

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: '0',
                top: '100%',
                marginTop: '8px',
                width: '320px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                maxHeight: '400px',
                overflow: 'hidden'
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
                    {isLoadingNotifications && <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>Loading...</span>}
                    {notificationsError && <span style={{ fontSize: '12px', color: '#ef4444', marginLeft: '8px' }}>Error!</span>}
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

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                        key={notification.id}
                        style={{
                          padding: '16px',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: !notification.read ? '#f8fafc' : 'white',
                          cursor: 'pointer'
                        }}
                        onClick={() => !notification.read && markAsRead(notification.id)}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#9ca3af',
                                  cursor: 'pointer',
                                  padding: '2px'
                                }}
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
                                fontSize: '12px',
                                color: '#9ca3af'
                              }}>
                                {notification.platform}
                              </span>
                              <span style={{
                                fontSize: '12px',
                                color: '#9ca3af'
                              }}>
                                {formatTimeAgo(notification.timestamp)}
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

                {notifications.length > 0 && (
                  <div style={{
                    padding: '12px',
                    borderTop: '1px solid #e2e8f0',
                    textAlign: 'center'
                  }}>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      View all notifications
                    </button>
                  </div>
                )}
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
                <button
                  onClick={() => {
                    setShowFeedbackModal(true);
                    setShowUserDropdown(false);
                  }}
                  className="dropdown-item"
                >
                  <MessageCircle size={16} />
                  Feedback
                </button>
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
                        href="https://mgabuzzconnect.com/terms-of-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-item"
                      >
                        Terms of Service
                      </a>
                      <a
                        href="https://mgabuzzconnect.com/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-item"
                      >
                        Privacy Policy
                      </a>
                      <a
                        href="https://mgabuzzconnect.com/testing-instructions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-item"
                      >
                        Testing Instructions
                      </a>
                      <a
                        href="https://mgabuzzconnect.com/data-deletion-policy"
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
          {/* <div className="sidebar-header">
          {isSidebarOpen && <img src={mgalogo} alt="MGA Logo" className="logo-img" />}
          {isMobile ? (
            <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          ) : (
            <button  className={`sidebar-toggle ${!isSidebarToggleSelected ? 'sidebar-selected' : '' } `} onClick={() => setIsSidebarToggleSelected(prev => !prev)}>
              {isSidebarToggleSelected ?
              <Sidebar size={20} />
              :
              !isSidebarOpen ?
              <img src={mgalogoNeat} alt="MGA Logo" />
              :
              <Sidebar size={20} />
              }
            </button>
          )}
        </div> */}



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

