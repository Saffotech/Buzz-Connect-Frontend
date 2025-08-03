import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useConnectedPlatforms } from '../hooks/useApi';
import { usePlatformGridTracking } from '../hooks/useAnalytics';
import { getPlatformIcon } from '../utils/platform-helpers';
import './PlatformGrid.css';

/**
 * PlatformButton - Sub-component for individual platform selection
 */
const PlatformButton = ({ 
  platform, 
  isSelected, 
  onSelect, 
  disabled = false,
  showLabel = true 
}) => {
  const Icon = getPlatformIcon(platform.id);
  
  const handleClick = () => {
    if (!disabled && platform.connected) {
      onSelect(platform.id);
    }
  };

  return (
    <button
      className={`platform-btn ${isSelected ? 'selected' : ''} ${
        !platform.connected ? 'disabled' : ''
      } ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled || !platform.connected}
      title={platform.connected ? platform.name : `${platform.name} - Not Connected`}
      style={{
        '--platform-color': platform.color
      }}
    >
      <div className="platform-btn-content">
        <div className="platform-icon">
          {Icon ? <Icon size={20} /> : <span className="platform-emoji">{platform.emoji}</span>}
        </div>
        
        {showLabel && (
          <div className="platform-info">
            <span className="platform-name">{platform.name}</span>
            {platform.username && (
              <span className="platform-username">@{platform.username}</span>
            )}
          </div>
        )}
        
        {!platform.connected && (
          <div className="not-connected-badge">
            <AlertCircle size={12} />
            <span>Not Connected</span>
          </div>
        )}
      </div>
    </button>
  );
};

/**
 * PlatformGridSkeleton - Loading skeleton for the platform grid
 */
const PlatformGridSkeleton = ({ layout, count = 3 }) => {
  return (
    <div className={`platform-grid-skeleton ${layout}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="platform-btn-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-text">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * PlatformGrid - Main component for platform selection
 * 
 * @param {Array} selectedPlatforms - Array of selected platform IDs
 * @param {Function} onPlatformChange - Callback when selection changes
 * @param {string} layout - 'horizontal' or 'vertical' layout
 * @param {boolean} multiSelect - Allow multiple platform selection
 * @param {boolean} showLabels - Show platform names and usernames
 * @param {boolean} showOnlyConnected - Only show connected platforms
 * @param {Array} allowedPlatforms - Restrict to specific platforms
 * @param {boolean} disabled - Disable all interactions
 */
const PlatformGrid = ({
  selectedPlatforms = [],
  onPlatformChange,
  layout = 'horizontal',
  multiSelect = true,
  showLabels = true,
  showOnlyConnected = false,
  allowedPlatforms = null,
  disabled = false,
  context = 'unknown' // For analytics tracking
}) => {
  const { platforms, loading, error } = useConnectedPlatforms();
  const { trackGridUsage, trackSelection } = usePlatformGridTracking();

  // Track grid usage when component mounts
  React.useEffect(() => {
    if (platforms.length > 0) {
      trackGridUsage('viewed', {
        layout,
        multiSelect,
        showLabels,
        connectedPlatforms: platforms.filter(p => p.connected).map(p => p.id),
        selectedPlatforms
      });
    }
  }, [platforms, layout, multiSelect, showLabels, selectedPlatforms, trackGridUsage]);

  const handlePlatformSelect = (platformId) => {
    if (disabled) return;

    const wasSelected = selectedPlatforms.includes(platformId);
    let newSelection;

    if (multiSelect) {
      // Multi-select mode
      newSelection = wasSelected
        ? selectedPlatforms.filter(id => id !== platformId)
        : [...selectedPlatforms, platformId];
    } else {
      // Single-select mode
      newSelection = wasSelected ? [] : [platformId];
    }

    // Track platform selection analytics
    trackSelection(platformId, !wasSelected, context);

    onPlatformChange(newSelection);
  };

  // Filter platforms based on props
  const filteredPlatforms = React.useMemo(() => {
    let filtered = platforms;
    
    // Filter by connection status
    if (showOnlyConnected) {
      filtered = filtered.filter(platform => platform.connected);
    }
    
    // Filter by allowed platforms
    if (allowedPlatforms && Array.isArray(allowedPlatforms)) {
      filtered = filtered.filter(platform => allowedPlatforms.includes(platform.id));
    }
    
    return filtered;
  }, [platforms, showOnlyConnected, allowedPlatforms]);

  // Loading state
  if (loading) {
    return (
      <PlatformGridSkeleton 
        layout={layout} 
        count={allowedPlatforms ? allowedPlatforms.length : 3} 
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="platform-grid-error">
        <AlertCircle size={20} />
        <span>Failed to load platforms</span>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-btn"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (filteredPlatforms.length === 0) {
    return (
      <div className="platform-grid-empty">
        <AlertCircle size={24} />
        <span>
          {showOnlyConnected 
            ? 'No connected platforms found' 
            : 'No platforms available'
          }
        </span>
      </div>
    );
  }

  return (
    <div className={`platform-grid ${layout} ${disabled ? 'disabled' : ''}`}>
      {filteredPlatforms.map(platform => (
        <PlatformButton
          key={platform.id}
          platform={platform}
          isSelected={selectedPlatforms.includes(platform.id)}
          onSelect={handlePlatformSelect}
          disabled={disabled}
          showLabel={showLabels}
        />
      ))}
    </div>
  );
};

export default PlatformGrid;
