import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Check, Link2, Instagram, Twitter, Facebook, Linkedin, Youtube, User } from 'lucide-react';
import SettingsCard from '../SettingsCard';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

const AccountsSettings = ({ onNotify }) => {
  const { user, token, isLoading } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube
  };

  const authToken = token || localStorage.getItem("token");

  useEffect(() => {
    if (!authToken || isLoading) return;
    
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/instagram/accounts`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        let accounts = res.data.accounts || [];
        
        // Add linked Facebook account if not already present
        const instaAccount = accounts.find(acc => acc.platform === "instagram");
        if (instaAccount && !accounts.some(acc => acc.platform === "facebook")) {
          const fbPic = instaAccount.fbProfilePicture || instaAccount.profilePicture || null;
          accounts.push({
            _id: `${instaAccount._id}-fb`,
            username: instaAccount.fbUsername || "Facebook (linked via Instagram)",
            platform: "facebook",
            profilePicture: fbPic,
            noProfilePicture: !fbPic,
            followerCount: instaAccount.fbFollowerCount ?? "-"
          });
        }
        
        setConnectedAccounts(accounts);
      } catch (err) {
        console.error("Failed to fetch connected accounts", err);
        toast.error("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, [authToken, isLoading]);

const handleConnectMeta = async () => {
  const storedToken = authToken;
  if (!storedToken) {
    toast.error("User not logged in");
    return;
  }

  try {
    // Fetch fresh user data from API before connecting
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/auth/me`,
      { headers: { Authorization: `Bearer ${storedToken}` } }
    );
    
    if (res.data.success && res.data.data) {
      const freshUser = res.data.data; // Correct path based on your API response
      
      // Now use fresh user ID - this will always work
      // window.location.href = `https://prawn-grand-foal.ngrok-free.app/api/auth/instagram?userId=${freshUser._id}&token=${storedToken}`;

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      window.location.href = `${apiUrl}/api/auth/instagram?token=${storedToken}`;
    } else {
      toast.error("Failed to get user data");
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    if (err.response?.status === 401) {
      toast.error("Session expired, please login again");
      logout(); // Call your logout function to clear state
    } else {
      toast.error("Failed to get user data");
    }
  }
};


  const handleConnectTwitter = () => {
    toast.info("Twitter integration coming soon!");
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      const baseId = accountId.replace('-fb', '');
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/auth/instagram/disconnect/${baseId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setConnectedAccounts(prev =>
        prev.filter(acc => acc._id !== baseId && acc._id !== `${baseId}-fb`)
      );
      
      onNotify('success', 'Account disconnected successfully');
    } catch (err) {
      console.error('Failed to disconnect account', err);
      toast.error('Failed to disconnect account');
    }
  };

  // Check if Meta (Instagram/Facebook) is connected
  const isMetaConnected = connectedAccounts.some(acc => 
    acc.platform === 'instagram' || acc.platform === 'facebook'
  );
  
  // Check if Twitter is connected
  const isTwitterConnected = connectedAccounts.some(acc => acc.platform === 'twitter');

  // Sort accounts: Instagram first, then Facebook, then Twitter
  const sortedAccounts = connectedAccounts.sort((a, b) => {
    const order = { instagram: 1, facebook: 2, twitter: 3 };
    return (order[a.platform] || 999) - (order[b.platform] || 999);
  });

  return (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Social Accounts</h2>
          <p>Manage your connected social media accounts</p>
        </div>

        <SettingsCard title="Connected Accounts"
        connAcc={ <div className="connection-buttons">
                <button
                  onClick={handleConnectMeta}
                  className={`btn-primary ${isMetaConnected ? 'btn-connected' : ''}`}
                  disabled={isMetaConnected}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: isMetaConnected ? '#10b981' : undefined,
                    cursor: isMetaConnected ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Instagram size={16} />
                  <Facebook size={16} />
                  {isMetaConnected ? (
                    <>
                      <Check size={16} />
                      Meta Connected
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Connect with Meta
                    </>
                  )}
                </button>

                <button
                  onClick={handleConnectTwitter}
                  className="btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '2px solid #1da1f2',
                    color: isTwitterConnected ? '#10b981' : '#1da1f2'
                  }}
                >
                  <Twitter size={16} />
                  {isTwitterConnected ? (
                    <>
                      <Check size={16} />
                      Twitter Connected
                    </>
                  ) : (
                    'Connect Twitter (Coming Soon)'
                  )}
                </button>
              </div>}
        >
          {loading ? (
            <p>Loading accounts...</p>
          ) : (
            <>
              {/* Connection Buttons Section */}
             

              {/* Connected Accounts List */}
              {sortedAccounts.length > 0 ? (
                <div className="accounts-list">
                  {sortedAccounts.map((account, index) => {
                    const PlatformIcon = platformIcons[account.platform];
                    return (
                      <div key={index} className="account-item">
                        <div className="account-info">
                          <div className="account-avatar">
                            <img
                              src={account.profilePicture || undefined}
                              alt={account.username}
                              style={{ display: account.profilePicture ? 'block' : 'none' }}
                            />
                            {(!account.profilePicture || account.noProfilePicture) && (
                              <User size={36} strokeWidth={1.5} />
                            )}
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
                            onClick={() => handleDeleteAccount(account._id)}
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
                </div>
              )}
            </>
          )}
        </SettingsCard>
      </div>
    </div>
  );
};

export default AccountsSettings;
