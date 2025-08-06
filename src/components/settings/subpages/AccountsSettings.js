import React, { useState } from 'react';
import { Plus, Trash2, Check, Link2, Instagram, Twitter, Facebook, Linkedin, Youtube } from 'lucide-react';
import SettingsCard from '../SettingsCard';

const AccountsSettings = ({ onNotify }) => {
  const [connectedAccounts, setConnectedAccounts] = useState([
    {
      id: 1,
      platform: 'instagram',
      username: '@mybrand',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
      connected: true,
      followers: '12.5K'
    },
    {
      id: 2,
      platform: 'twitter',
      username: '@mybrand_official',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
      connected: true,
      followers: '8.2K'
    }
  ]);

  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube
  };

  const handleDeleteAccount = (accountId) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    onNotify('success', 'Account disconnected successfully');
  };

  const handleConnectAccount = () => {
    onNotify('info', 'Connect account feature coming soon!');
  };

  return (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Social Accounts</h2>
          <p>Manage your connected social media accounts</p>
        </div>

        <SettingsCard
          title="Connected Accounts"
          headerAction={
            <button onClick={handleConnectAccount} className="btn-primary">
              <Plus size={16} />
              Connect New Account
            </button>
          }
        >
          {connectedAccounts.length > 0 ? (
            <div className="accounts-list">
              {connectedAccounts.map(account => {
                const PlatformIcon = platformIcons[account.platform];
                return (
                  <div key={account.id} className="account-item">
                    <div className="account-info">
                      <div className="account-avatar">
                        <img src={account.profilePicture} alt={account.username} />
                        <div className={`platform-badge ${account.platform}`}>
                          <PlatformIcon size={12} />
                        </div>
                      </div>
                      <div className="account-details">
                        <h4>{account.username}</h4>
                        <p className="platform-name">
                          {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                        </p>
                        <span className="followers-count">{account.followers} followers</span>
                      </div>
                    </div>
                    <div className="account-actions">
                      <div className="connection-status connected">
                        <Check size={14} />
                        Connected
                      </div>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="btn-danger-outline"
                      >
                        <Trash2 size={16} />
                        Disconnect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Link2 size={48} />
              <h3>No accounts connected</h3>
              <p>Connect your social media accounts to start posting</p>
              <button onClick={handleConnectAccount} className="btn-primary">
                <Plus size={16} />
                Connect Your First Account
              </button>
            </div>
          )}
        </SettingsCard>
      </div>
    </div>
  );
};

export default AccountsSettings;