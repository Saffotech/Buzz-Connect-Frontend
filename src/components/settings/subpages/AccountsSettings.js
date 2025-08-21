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
            followerCount: instaAccount.fbFollowerCount ?? "-",
            accountName: instaAccount.accountName || instaAccount.username
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

  // Group accounts by account name/owner
  const groupAccountsByName = (accounts) => {
    const grouped = {};
    
    accounts.forEach(account => {
      const accountName = account.accountName || 
                         account.username.split('.')[0] || 
                         account.username.split('_')[0] ||
                         account.username.toLowerCase();
      
      if (!grouped[accountName]) {
        grouped[accountName] = [];
      }
      grouped[accountName].push(account);
    });
    
    return grouped;
  };

  const sortAccountsInGroup = (accounts) => {
    return accounts.sort((a, b) => {
      const order = { instagram: 1, facebook: 2, twitter: 3, linkedin: 4, youtube: 5 };
      return (order[a.platform] || 999) - (order[b.platform] || 999);
    });
  };

  const handleConnectMeta = async () => {
    const storedToken = authToken;
    if (!storedToken) {
      toast.error("User not logged in");
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      
      if (res.data.success && res.data.data) {
        const freshUser = res.data.data;
        // window.location.href = `https://prawn-grand-foal.ngrok-free.app/api/auth/instagram?userId=${freshUser._id}&token=${storedToken}`;
        
       
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      window.location.href = `${apiUrl}/api/auth/instagram?userId=${freshUser._id}&token=${storedToken}`;

      } else {
        toast.error("Failed to get user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired, please login again");
      } else {
        toast.error("Failed to get user data");
      }
    }
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

  const isMetaConnected = connectedAccounts.some(acc => 
    acc.platform === 'instagram' || acc.platform === 'facebook'
  );

  // Group and organize accounts
  const groupedAccounts = groupAccountsByName(connectedAccounts);
  const accountGroups = Object.entries(groupedAccounts).map(([name, accounts]) => ({
    name,
    accounts: sortAccountsInGroup(accounts)
  }));

  return (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Social Accounts</h2>
          <p>Manage your connected social media accounts</p>
        </div>

        <SettingsCard 
          title="Connected Accounts"
          connAcc={
            <div className="connection-buttons">
              <button
                onClick={handleConnectMeta}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Instagram size={16} />
                <Facebook size={16} />
                <Plus size={16} />
                {isMetaConnected ? 'Add Another Meta Account' : 'Connect with Meta'}
              </button>

                {/* <button
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
                </button> */}
              </div>}
        >
          {loading ? (
            <div className="loading-state">
              <p>Loading accounts...</p>
            </div>
          ) : (
            <>
              {accountGroups.length > 0 ? (
                <div className="accounts-container">
                  {accountGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="account-group">
                      <div className="account-group-header">
                        <h3 className="account-group-title">
                          {group.name.charAt(0).toUpperCase() + group.name.slice(1)} Account
                        </h3>
                        <span className="account-count">
                          {group.accounts.length} platform{group.accounts.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="accounts-grid">
                        {group.accounts.map((account, index) => {
                          const PlatformIcon = platformIcons[account.platform];
                          return (
                            <div key={index} className="account-card">
                              <div className="account-card-header">
                                <div className="account-avatar">
                                  {account.profilePicture ? (
                                    <img
                                      src={account.profilePicture}
                                      alt={account.username}
                                      className="avatar-img"
                                    />
                                  ) : (
                                    <User size={32} strokeWidth={1.5} />
                                  )}
                                  <div className={`platform-badge platform-${account.platform}`}>
                                    <PlatformIcon size={12} />
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleDeleteAccount(account._id)}
                                  className="account-delete-btn"
                                  title="Disconnect account"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              
                              <div className="account-card-content">
                                <h4 className="account-username">{account.username}</h4>
                                <p className="platform-name">
                                  {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                                </p>
                                <span className="followers-count">
                                  {account.followerCount ?? "-"} followers
                                </span>
                                
                                <div className="connection-status connection-connected">
                                  <Check size={12} />
                                  Connected
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
