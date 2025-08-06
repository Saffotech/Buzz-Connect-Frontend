import React from 'react';

const SettingsCard = ({ 
  title, 
  description, 
  children, 
  headerAction,
  className = '' 
}) => {
  return (
    <div className={`settings-card ${className}`}>
      {(title || description || headerAction) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
          </div>
          {headerAction && (
            <div className="card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default SettingsCard;