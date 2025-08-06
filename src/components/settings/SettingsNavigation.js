import React from 'react';

const SettingsNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="settings-hub-nav">
      <div className="tabs" role="tablist">
        {tabs.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsNavigation;