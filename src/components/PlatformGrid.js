import React, { memo, useCallback, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConnectedPlatforms } from "../hooks/useApi";
import { usePlatformGridTracking } from "../hooks/useAnalytics";
import { getPlatformIcon } from "../utils/platform-helpers";
import "./PlatformGrid.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';

/**
 * Memoized PlatformButton - Sub-component for individual platform selection
 */
const PlatformButton = memo(({
  platform,
  isSelected,
  onSelect,
  disabled = false,
  showLabel = true,
}) => {
  const Icon = getPlatformIcon(platform.id);
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (!platform.connected) {
      navigate('/settings?tab=accounts');
      return;
    }
    if (!disabled) {
      onSelect(platform.id);
    }
  }, [platform.connected, platform.id, disabled, onSelect, navigate]);

  const title = platform.connected
    ? platform.name
    : `${platform.name} - Not Connected`;

  const buttonClass = `platform-btn ${isSelected ? "selected" : ""} ${!platform.connected ? "not-connected" : ""
    } ${disabled ? "disabled" : ""}`;

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled}
      title={title}
      style={{ "--platform-color": platform.color }}
    >
      <div className="platform-btn-content">
        <div className="platform-icon">
          {platform.id === "twitter" ? (
            <FontAwesomeIcon
              icon={faXTwitter}
              size="lg"
              color={isSelected ? "#ffffff" : "#000000"}   // 👈 change here
            />
          ) : Icon ? (
            <Icon size={20} />
          ) : (
            <span className="platform-emoji">{platform.emoji}</span>
          )}
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
            <span>Connect Now</span>
          </div>
        )}
      </div>
    </button>
  );
});

PlatformButton.displayName = 'PlatformButton';

/**
 * Memoized PlatformGridSkeleton - Loading skeleton for the platform grid
 */
const PlatformGridSkeleton = memo(({ layout, count = 3 }) => {
  const skeletonItems = useMemo(
    () => Array.from({ length: count }, (_, index) => (
      <div key={index} className="platform-btn-skeleton">
        <div className="skeleton-icon"></div>
        <div className="skeleton-text">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    )),
    [count]
  );

  return (
    <div className={`platform-grid-skeleton ${layout}`}>
      {skeletonItems}
    </div>
  );
});

PlatformGridSkeleton.displayName = 'PlatformGridSkeleton';

/**
 * Memoized ErrorState component
 */
const ErrorState = memo(() => (
  <div className="platform-grid-error">
    <AlertCircle size={20} />
    <span>Failed to load platforms</span>
    <button onClick={() => window.location.reload()} className="retry-btn">
      Retry
    </button>
  </div>
));

ErrorState.displayName = 'ErrorState';

/**
 * Memoized EmptyState component
 */
const EmptyState = memo(({ showOnlyConnected }) => (
  <div className="platform-grid-empty">
    <AlertCircle size={24} />
    <span>
      {showOnlyConnected
        ? "No connected platforms found"
        : "No platforms available"}
    </span>
  </div>
));

EmptyState.displayName = 'EmptyState';

/**
 * Hook for platform filtering and sorting logic
 */
const useFilteredPlatforms = (platforms, showOnlyConnected, allowedPlatforms) => {
  return useMemo(() => {
    let filtered = platforms;

    // Filter by connection status
    if (showOnlyConnected) {
      filtered = filtered.filter((platform) => platform.connected);
    }

    // Filter by allowed platforms
    if (allowedPlatforms && Array.isArray(allowedPlatforms)) {
      filtered = filtered.filter((platform) =>
        allowedPlatforms.includes(platform.id)
      );
    }

    // Sort by priority and then alphabetically
    const priorityOrder = ["instagram", "facebook", "twitter"];

    filtered.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.id);
      const bPriority = priorityOrder.indexOf(b.id);

      // Both in priority list → maintain defined order
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }
      // One in priority list → move it first
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;

      // Otherwise alphabetical
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [platforms, showOnlyConnected, allowedPlatforms]);
};

/**
 * Main PlatformGrid component - Optimized and memoized
 */
const PlatformGrid = memo(({
  selectedPlatforms = [],
  onPlatformChange,
  layout = "horizontal",
  multiSelect = true,
  showLabels = true,
  showOnlyConnected = false,
  allowedPlatforms = null,
  disabled = false,
  context = "unknown",
}) => {
  const { platforms, loading, error } = useConnectedPlatforms();
  console.log("All platforms from API:", platforms);
  const { trackGridUsage, trackSelection } = usePlatformGridTracking();

  // Filter and sort platforms
  const filteredPlatforms = useFilteredPlatforms(
    platforms,
    showOnlyConnected,
    allowedPlatforms
  );

  // Track grid usage when component mounts or key props change
  React.useEffect(() => {
    if (platforms.length > 0) {
      trackGridUsage("viewed", {
        layout,
        multiSelect,
        showLabels,
        connectedPlatforms: platforms
          .filter((p) => p.connected)
          .map((p) => p.id),
        selectedPlatforms,
      });
    }
  }, [
    platforms,
    layout,
    multiSelect,
    showLabels,
    selectedPlatforms,
    trackGridUsage,
  ]);

  // Optimized platform selection handler
  const handlePlatformSelect = useCallback((platformId) => {
    if (disabled) return;

    const platformData = platforms.find((p) => p.id === platformId);

    // Early return if platform not connected
    if (!platformData?.connected) {
      return; // Navigation handled in PlatformButton
    }

    const wasSelected = selectedPlatforms.includes(platformId);
    let newSelection;

    if (multiSelect) {
      newSelection = wasSelected
        ? selectedPlatforms.filter((id) => id !== platformId)
        : [...selectedPlatforms, platformId];
    } else {
      newSelection = wasSelected ? [] : [platformId];
    }

    // Track the selection
    trackSelection(platformId, !wasSelected, context);

    // Call the change handler
    onPlatformChange(newSelection);
  }, [
    disabled,
    platforms,
    selectedPlatforms,
    multiSelect,
    trackSelection,
    context,
    onPlatformChange
  ]);

  // Memoize the platform buttons to prevent unnecessary re-renders
  const platformButtons = useMemo(() => {
    return filteredPlatforms.map((platform) => {
      const isSelected = platform.connected && selectedPlatforms.includes(platform.id);

      return (
        <PlatformButton
          key={platform.id}
          platform={platform}
          isSelected={isSelected}
          onSelect={handlePlatformSelect}
          disabled={disabled}
          showLabel={showLabels}
        />
      );
    });
  }, [filteredPlatforms, selectedPlatforms, handlePlatformSelect, disabled, showLabels]);

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
    return <ErrorState />;
  }

  // Empty state
  if (filteredPlatforms.length === 0) {
    return <EmptyState showOnlyConnected={showOnlyConnected} />;
  }

  const gridClass = `platform-grid ${layout} ${disabled ? "disabled" : ""}`;

  return (
    <div className={gridClass}>
      {platformButtons}
    </div>
  );
});

PlatformGrid.displayName = 'PlatformGrid';

export default PlatformGrid;