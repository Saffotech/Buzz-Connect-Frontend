// ConnectedAccountItem.jsx
import React from 'react';
import { Instagram, Twitter } from 'lucide-react';

export function ConnectedAccountItem({
  platform,
  username,
  connected,
  profilePicture,
}) {
  return (
    <div className={`account-item ${platform}`}>
      <div className="account-icon">
        {platform === 'instagram' && <Instagram size={20} />}
        {platform === 'twitter' && <Twitter size={20} />}
      </div>
      <div className="account-details">
        <span className="platform-name">{platform}</span>
        <span className="username">@{username}</span>
      </div>
      {profilePicture && (
        <div className="profile-pic">
          <img
            src={profilePicture}
            alt={`${username} profile`}
            className="w-6 h-6 rounded-full"
          />
        </div>
      )}
      <div
        className={`connection-status ${
          connected ? 'connected' : 'disconnected'
        }`}
      >
        <div className="status-dot" />
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
}
