// AccountsSettings.jsx
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
    if (!authToken || isLoading) return; // Wait until token is ready

    const fetchAccounts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/instagram/accounts`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        let accounts = res.data.accounts || [];

        // ✅ Add linked Facebook account if not already present
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

  const handleConnectAccount = () => {
    const storedToken = authToken; // ✅ Use the same fallback

    if (!storedToken) {
      toast.error("User not logged in");
      console.log("User Not", storedToken);
      return;
    }

    if (!user?._id) {
      toast.error("User ID not found");
      console.error("Missing user ID for account connection");
      return;
    }

    // ✅ Redirect with token and userId
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    window.location.href = `${apiUrl}/api/auth/instagram?userId=${user._id}&token=${storedToken}`;
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      // Extract base id (for insta-linked fb accounts, strip "-fb")
      const baseId = accountId.replace('-fb', '');

      // Always send the request to delete Instagram from backend
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/auth/instagram/accounts/${baseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove both insta + fb from local state
      setConnectedAccounts(prev =>
        prev.filter(acc => acc._id !== baseId && acc._id !== `${baseId}-fb`)
      );

      onNotify('success', 'Account disconnected successfully');
    } catch (err) {
      console.error('Failed to disconnect account', err);
      toast.error('Failed to disconnect account');
    }
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
            <button
              onClick={handleConnectAccount}
              className="btn-primary"
              disabled={connectedAccounts.length > 0} // ✅ Disable if there's at least 1 account
            >
              <Plus size={16} />
              {connectedAccounts.length > 0 ? "Account Connected" : "Connect New Account"}
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