import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, RefreshCw, Calendar, BarChart3, Settings } from 'lucide-react';
import './PageNotFound.css';

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="page-not-found-container">
      <div className="page-not-found-content">
        {/* 404 Animation/Illustration */}
        <div className="page-not-found-illustration">
          <div className="page-not-found-error-code">404</div>
          <div className="page-not-found-error-text">Page Not Found</div>
        </div>

        {/* Error Message */}
        <div className="page-not-found-error-message">
          <h2>Oops! This page doesn't exist</h2>
          <p>
            The page you're looking for might have been moved, deleted, 
            or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="page-not-found-error-actions">
          <button 
            className="page-not-found-btn-primary"
            onClick={handleGoHome}
          >
            <Home size={18} />
            Back to Dashboard
          </button>
          
          <button 
            className="page-not-found-btn-secondary"
            onClick={handleGoBack}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button 
            className="page-not-found-btn-secondary"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} />
            Refresh Page
          </button>
        </div>

        {/* Helpful Links */}
        <div className="page-not-found-helpful-links">
          <h3>Popular Pages:</h3>
          <div className="page-not-found-links-grid">
            <button 
              className="page-not-found-link-item"
              onClick={() => navigate('/dashboard')}
            >
              <Home size={16} />
              Dashboard
            </button>
            <button 
              className="page-not-found-link-item"
              onClick={() => navigate('/planner')}
            >
              <Calendar size={16} />
              Content Planner
            </button>
            <button 
              className="page-not-found-link-item"
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 size={16} />
              Analytics
            </button>
            <button 
              className="page-not-found-link-item"
              onClick={() => navigate('/settings')}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
