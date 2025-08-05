import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: BarChart3,
      description: 'Overview and quick stats'
    },
    {
      name: 'Planner',
      path: '/planner',
      icon: Calendar,
      description: 'Content calendar and scheduling'
    },
    {
      name: 'Content',
      path: '/content',
      icon: FolderOpen,
      description: 'Posts and media library'
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: TrendingUp,
      description: 'Performance insights'
    },
    {
      name: 'AI Assistant',
      path: '/ai-assistant',
      icon: Sparkles,
      description: 'Content generation tools'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      description: 'Account and preferences'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
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

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="app-logo">
          <h1>BuzzConnect</h1>
        </div>
        <div className="header-user">
          <User size={20} />
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="app-logo">
            <h1>BuzzConnect</h1>
            <p>Social Media Manager</p>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
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
          {/* <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <p className="user-name">{user?.displayName || user?.email || 'User'}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div> */}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
