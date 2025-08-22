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
  MessageCircle
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

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, token } = useAuth();
  const [name, setName] = useState('Loading...');
  const [email, setEmail] = useState('Loading...');

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const {
    user,
  } = useDashboardData();

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

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
          <div className="header-user" onClick={
            () => {
              setShowUserDropdown(!showUserDropdown);
              handleUserProfileClick
            }}>
            <User size={20}
            />
            {showUserDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => navigate('/settings?tab=profile')} className="dropdown-item">
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
        </header>
      )}

      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            {/* <h1>BuzzConnect</h1> */}
            <img src={Logo} alt="BuzzConnect Logo" className='logo-img' onClick={goToDashboard}  style={{ cursor: "pointer" }}/>
          </div>
        </div>
        <div className="header-right">
          <span className="welcome-message">
            Welcome back,
            {user?.displayName || user?.email || 'User'}!
          </span>
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
            <div className="user-info" onClick={handleUserProfileClick}   style={{ cursor: "pointer" }}>
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
    </div>
  );
};

export default Layout;

