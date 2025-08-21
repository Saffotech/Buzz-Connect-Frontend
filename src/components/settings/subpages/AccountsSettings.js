import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Check, Link2, Instagram, Twitter, Facebook, Linkedin, Youtube, User, X, AlertTriangle } from 'lucide-react';
import SettingsCard from '../SettingsCard';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, accountUsername, platform }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '600px', // Increased from 440px to 600px
          width: '90%',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: '#6B7280',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6B7280';
          }}
        >
          <X size={30} />
        </button>
        
        {/* Header with Icon */}
        <div style={{ 
          padding: '32px 40px 24px 40px', // Increased horizontal padding
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            border: '2px solid #FECACA'
          }}>
            <AlertTriangle size={28} style={{ color: '#EF4444' }} />
          </div>
          
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            letterSpacing: '-0.025em'
          }}>
            Disconnect Account
          </h3>
          
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '20px', // Increased padding
            margin: '20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px' // Increased gap
          }}>
            {/* Platform Icon */}
            <div style={{
              width: '48px', // Increased size
              height: '48px',
              borderRadius: '10px',
              backgroundColor: platform === 'Instagram' ? '#FDF2F8' : '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${platform === 'Instagram' ? '#FCE7F3' : '#DBEAFE'}`
            }}>
              {platform === 'Instagram' ? 
                <Instagram size={24} style={{ color: '#E91E63' }} /> : 
                <Facebook size={24} style={{ color: '#1877F2' }} />
              }
            </div>
            
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{
                fontSize: '18px', // Increased font size
                fontWeight: '600',
                color: '#111827',
                marginBottom: '4px'
              }}>
                {accountUsername}
              </div>
              <div style={{
                fontSize: '15px', // Increased font size
                color: '#6B7280'
              }}>
                {platform}
              </div>
            </div>
          </div>
          
          <p style={{ 
            margin: '0 0 32px 0', 
            fontSize: '16px',
            color: '#6B7280',
            lineHeight: '1.6',
            textAlign: 'center'
          }}>
            This action cannot be undone. You'll need to reconnect this account to continue using it for posting and automation.
          </p>
        </div>
        
        {/* Footer Buttons - Now in one line */}
        <div style={{ 
          padding: '0 40px 32px 40px', // Increased horizontal padding
          display: 'flex', 
          flexDirection: 'row', // Changed from 'column' to 'row'
          justifyContent: 'space-between' // Align buttons to the right
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px', // Adjusted padding for horizontal layout
              border: '1px solid #D1D5DB',
              backgroundColor: 'white',
              color: '#374151',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              minWidth: '180px' // Ensure minimum width
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#F9FAFB';
              e.target.style.borderColor = '#9CA3AF';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#D1D5DB';
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px', // Adjusted padding for horizontal layout
              border: 'none',
              backgroundColor: '#EF4444',
              color: 'white',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              minWidth: '180px' // Ensure minimum width for primary button
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#DC2626';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px 0 rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#EF4444';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }}
          >
            <Trash2 size={16} />
            Yes, Disconnect Account
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1); 
          }
        }

        @media (max-width: 640px) {
          .modal-content {
            margin: 16px !important;
            width: calc(100% - 32px) !important;
            max-width: none !important;
          }
          
          /* Stack buttons vertically on mobile */
          .modal-content div:last-child {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>

  );
};

const AccountsSettings = ({ onNotify }) => {
  const { user, token, isLoading } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    accountId: null,
    accountUsername: '',
    platform: ''
  });
  
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
        window.location.href = `https://prawn-grand-foal.ngrok-free.app/api/auth/instagram?userId=${freshUser._id}&token=${storedToken}`;

        // const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        // window.location.href = `${apiUrl}/api/auth/instagram?userId=${freshUser._id}&token=${storedToken}`;
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

  const handleDisconnectClick = (account) => {
    setConfirmationModal({
      isOpen: true,
      accountId: account._id,
      accountUsername: account.username,
      platform: account.platform.charAt(0).toUpperCase() + account.platform.slice(1)
    });
  };

  const handleConfirmDisconnect = async () => {
    try {
      const { accountId } = confirmationModal;
      const baseId = accountId.replace('-fb', '');
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/auth/instagram/disconnect/${baseId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setConnectedAccounts(prev =>
        prev.filter(acc => acc._id !== baseId && acc._id !== `${baseId}-fb`)
      );
      
      onNotify('success', 'Account disconnected successfully');
      
      // Close the modal
      setConfirmationModal({
        isOpen: false,
        accountId: null,
        accountUsername: '',
        platform: ''
      });
      
    } catch (err) {
      console.error('Failed to disconnect account', err);
      toast.error('Failed to disconnect account');
    }
  };

  const handleCancelDisconnect = () => {
    setConfirmationModal({
      isOpen: false,
      accountId: null,
      accountUsername: '',
      platform: ''
    });
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
                            onClick={() => handleDisconnectClick(account)}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelDisconnect}
        onConfirm={handleConfirmDisconnect}
        accountUsername={confirmationModal.accountUsername}
        platform={confirmationModal.platform}
      />
    </div>
  );
};

export default AccountsSettings;
