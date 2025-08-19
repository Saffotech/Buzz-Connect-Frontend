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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, token } = useAuth();
  const [name, setName] = useState('Loading...');
  const [email, setEmail] = useState('Loading...');

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
  };

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      {isMobile && (
        <header className={`mobile-header ${showMobileHeader ? 'visible' : 'hidden'}`}>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="app-logo"><h1>BuzzConnect</h1></div>
          <div className="header-user" onClick={handleUserProfileClick}>
            <User size={20} />
          </div>
        </header>
      )}

      {/* Sidebar */}
      <aside
        className={`app-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}
        onMouseEnter={() => !isMobile && setIsSidebarOpen(true)}
        onMouseLeave={() => !isMobile && setIsSidebarOpen(false)}
      >
        <div className="sidebar-header">
          {isSidebarOpen && <img src={mgalogo} alt="MGA Logo" className="logo-img" />}
          {isMobile ? (
            <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          ) : (
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Sidebar size={20} />
            </button>
          )}
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
          <div className="user-info" onClick={handleUserProfileClick}>
            <div className="user-avatar"><User size={20} /></div>
            {isSidebarOpen && (
              <div className="user-details">
                <p className="user-name">{name}</p>
                <p className="user-email">{email}</p>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="app-main">{children}</main>
    </div>
  );
};

export default Layout;
