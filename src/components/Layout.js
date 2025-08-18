import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
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
  Sidebar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';
import mgalogo from '../assets/img/mgalogo.png';

const Layout = ({ children }) => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to true for desktop
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuth();
  const [name, setName] = useState('Loading...');
  const [email, setEmail] = useState('Loading...');


  // Check if it's mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // On desktop, always keep sidebar open by default
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // Only close sidebar on mobile
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

    if (token) {
      fetchProfile();
    } else {
      setName('Loading...');
      setEmail('Loading...');
    }
  }, [token]);

  const handleUserProfileClick = () => {
    navigate('/settings?tab=profile');

    // Only close sidebar on mobile
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={handleSidebarToggle}
        >
          <Menu size={24} />
        </button>
        // <div className="app-logo">
        //   <h1>BuzzConnect</h1>
        // </div>
        // <div className="header-user" onClick={handleUserProfileClick}>
        //   <User size={20} />
        // </div>
      </header>

      {/* Sidebar */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}
        onMouseEnter={() => !isMobile && setIsSidebarOpen(true)}
        onMouseLeave={() => !isMobile && setIsSidebarOpen(false)}
      >
        <div className="sidebar-header">
          <div className="app-logo"
            onClick={handleSidebarToggle}
          >
            {isSidebarOpen ? <img src={mgalogo} alt="MGA Logo" className="logo-img" /> : <></>}
          </div>

          <button
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>

          <button
            className='sidebar-toggle'
            onClick={handleSidebarToggle}
          >
            <Sidebar size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                data-tooltip={item.name}
              >
                <div className="nav-item-content">
                  <Icon size={20} />
                  <div className="nav-item-text">
                    <span className="nav-item-name">{item.name}</span>
                    <span className="nav-item-description">{item.description}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div
            className="user-info"
            style={{ cursor: 'pointer' }}
            onClick={handleUserProfileClick}
            title="Click to view profile settings"
          >
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <p className="user-name">{name}</p>
              <p className="user-email">{email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main */}
      <main className="app-main">{children}</main>
    </div>
  );
};

export default Layout;













