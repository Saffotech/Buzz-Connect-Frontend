// AccountsSettings.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Check, Link2, Instagram, Twitter, Facebook, Linkedin, Youtube } from 'lucide-react';
import SettingsCard from '../SettingsCard';
import { useAuth } from '../../../hooks/useAuth'; // Adjust path if needed
import toast from 'react-hot-toast';

const AccountsSettings = ({ onNotify }) => {
  const { user, token } = useAuth(); // make sure token is available for auth
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/instagram/accounts`, {

          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setConnectedAccounts(res.data.accounts);
      } catch (err) {
        console.error("Failed to fetch connected accounts", err);
        toast.error("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [token]);

  const handleDeleteAccount = async (accountId) => {
  try {
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/instagram/accounts/${accountId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setConnectedAccounts(prev => prev.filter(acc => acc._id !== accountId));
    onNotify('success', 'Account disconnected successfully');
  } catch (err) {
    console.error("Failed to disconnect account", err);
    toast.error("Failed to disconnect account");
  }
};


  const handleConnectAccount = () => {
    if (!user || !user._id) {
      toast.error("User not logged in");
      return;
    }

    const userId = user._id;
    // Redirect to Instagram OAuth (your backend URL)
    window.location.href = `https://prawn-grand-foal.ngrok-free.app/api/auth/instagram?userId=${userId}`;
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
          {loading ? (
            <p>Loading accounts...</p>
          ) : connectedAccounts.length > 0 ? (
            <div className="accounts-list">
              {connectedAccounts.map((account, index) => {
                const PlatformIcon = platformIcons[account.platform];
                return (
                  <div key={index} className="account-item">
                    <div className="account-info">
                      <div className="account-avatar">
                        <img
                          src={account.profilePicture || "/default-avatar.png"}
                          alt={account.username}
                        />
                        <div className={`platform-badge ${account.platform}`}>
                          <PlatformIcon size={12} />
                        </div>
                      </div>
                      <div className="account-details">
                        <h4>{account.username}</h4>
                        <p className="platform-name">
                          {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                        </p>
                        <span className="followers-count">
{account.followerCount ?? "-"} followers
                        </span>
                      </div>
                    </div>
                    <div className="account-actions">
                      <div className="connection-status connected">
                        <Check size={14} />
                        Connected
                      </div>
                      <button
                        onClick={() => handleDeleteAccount(account._id)} // Adjust if needed
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
