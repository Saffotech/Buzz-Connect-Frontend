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
          maxWidth: '600px',
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
        <div style={{ padding: '32px 40px 24px 40px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              border: '2px solid #FECACA'
            }}
          >
            <AlertTriangle size={28} style={{ color: '#EF4444' }} />
          </div>

          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.025em'
            }}
          >
            Disconnect Account
          </h3>

          <div
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '20px',
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Platform Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: platform === 'Instagram' ? '#FDF2F8' : '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${platform === 'Instagram' ? '#FCE7F3' : '#DBEAFE'}`
              }}
            >
              {platform === 'Instagram' ? (
                <Instagram size={24} style={{ color: '#E91E63' }} />
              ) : (
                <Facebook size={24} style={{ color: '#1877F2' }} />
              )}
            </div>

            <div style={{ textAlign: 'left', flex: 1 }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '4px'
                }}
              >
                {accountUsername}
              </div>
              <div style={{ fontSize: '15px', color: '#6B7280' }}>{platform}</div>
            </div>
          </div>

          <p
            style={{
              margin: '0 0 32px 0',
              fontSize: '16px',
              color: '#6B7280',
              lineHeight: '1.6',
              textAlign: 'center'
            }}
          >
            This action cannot be undone. You'll need to reconnect this account to continue using it
            for posting and automation.
          </p>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '0 40px 32px 40px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              border: '1px solid #D1D5DB',
              backgroundColor: 'white',
              color: '#374151',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              minWidth: '180px'
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
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
              minWidth: '180px'
            }}
          >
            <Trash2 size={16} />
            Yes, Disconnect Account
          </button>
        </div>
      </div>
    </div>
  );
};

// Terms & Condition Modal Component
const TermsConditionModal = ({ isOpen, onClose, onConfirm, connectionType }) => {
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
          height: '90vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '1000px',
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

        {/* Content */}
        <div style={{ padding: '32px 40px 24px 40px', textAlign: 'left' }}>
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            Terms and Conditions
          </h1>

          <div
            style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              fontFamily: 'Inter, Arial, sans-serif',
              lineHeight: '1.7',
              fontSize: '16px',
              color: '#374151',
            }}
          >
            <p>
              <strong>Effective Date:</strong> July 14, 2025
            </p>

            <p>
              <strong>MGA Buzz Connect</strong> ("we", "our", or "us") is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our platform to
              manage and schedule content across social media platforms.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              1. Information We Collect
            </h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>
                <strong>Account Information:</strong> Your name, email address, and
                contact details.
              </li>
              <li>
                <strong>Social Media Data:</strong> With your permission, we collect data
                from your connected social media accounts (e.g., Instagram, Facebook)
                such as profile information, posts, analytics, and scheduling data.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our
                platform, including pages visited and actions taken.
              </li>
              <li>
                <strong>Device Data:</strong> IP address, browser type, and operating
                system.
              </li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              2. How We Use Your Information
            </h4>
            <p>We use your data to:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Provide and maintain our service</li>
              <li>Allow you to schedule and manage social media posts</li>
              <li>Send notifications and updates</li>
              <li>Analyze usage to improve our platform</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              3. Sharing Your Information
            </h4>
            <p>
              We do <strong>not</strong> sell or rent your personal data. We only share
              your information with:
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>
                Social media platforms (e.g., Instagram Graph API) to publish and
                retrieve your content
              </li>
              <li>
                Service providers who help operate our platform (e.g., cloud hosting,
                analytics)
              </li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              4. Data Security
            </h4>
            <p>
              We use industry-standard security practices, including encryption and
              access control, to protect your data. However, no method is 100% secure,
              and we cannot guarantee absolute security.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              5. Your Rights
            </h4>
            <p>You may:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Access and update your personal information</li>
              <li>Disconnect your social media accounts at any time</li>
              <li>
                Request deletion of your data by contacting us at{' '}
                <a href="mailto:mgabrandbuzz@gmail.com">mgabrandbuzz@gmail.com</a>
              </li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              6. Cookies
            </h4>
            <p>
              We use cookies and similar technologies to improve your experience. You can
              disable cookies through your browser settings.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              7. Third-Party Links
            </h4>
            <p>
              Our platform may contain links to third-party websites. We are not
              responsible for their privacy practices.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              8. Changes to This Policy
            </h4>
            <p>
              We may update this Privacy Policy periodically. Changes will be posted on
              this page with an updated effective date.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              9. Contact Us
            </h4>
            <p>
              If you have questions about this policy, please contact us at:{' '}
              <a href="mailto:mgabrandbuzz@gmail.com">mgabrandbuzz@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '0.65rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={() => onConfirm(connectionType)}
            style={{
              padding: '12px 24px',
              border: 'none',
              color: 'white',
              background: '#3b82f6',
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
              minWidth: '180px'
            }}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Connection Options Modal Component
const ConnectionOptionsModal = ({ isOpen, onClose, onSelectInstagram, onSelectFacebookInstagram }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
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
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '90%',
        maxWidth: '600px',
        padding: '32px',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}>
          <X size={24} />
        </button>

        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Connect Your Meta Account
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={onSelectInstagram}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#FDF2F8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #FCE7F3'
            }}>
              <Instagram size={24} style={{ color: '#E91E63' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                Instagram Only
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>
                Connect just your Instagram business account
                <span style={{ display: 'block', fontStyle: 'italic', fontSize: '12px', marginTop: '4px' }}>
                  (Note: Requires Facebook login for authentication)
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={onSelectFacebookInstagram}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #DBEAFE',
              position: 'relative'
            }}>
              <Facebook size={20} style={{ color: '#1877F2', position: 'absolute', left: '10px', top: '14px' }} />
              <Instagram size={20} style={{ color: '#E91E63', position: 'absolute', right: '10px', bottom: '14px' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                Instagram + Facebook Pages
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>
                Connect Instagram and Facebook business pages (recommended)
              </div>
            </div>
          </button>
        </div>

        <div style={{ marginTop: '24px', fontSize: '14px', color: '#6B7280', textAlign: 'center' }}>
          Both options require an Instagram Business account linked to a Facebook Page
        </div>
      </div>
    </div>
  );
};

const AccountsSettings = ({ onNotify }) => {
  const { user, token, isLoading } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectionOptions, setShowConnectionOptions] = useState(false);

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    accountId: null,
    accountUsername: '',
    platform: ''
  });

  const [termsConditionModal, setTermsConditionModal] = useState({
    isOpen: false,
    connectionType: null
  });

  const [connectionOptionsModal, setConnectionOptionsModal] = useState({
    isOpen: false
  });

  const handleCloseTerms = () => {
    setTermsConditionModal({
      isOpen: false,
      connectionType: null
    });
  };

  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube
  };

  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    if (!authToken || isLoading) return;

    const fetchAccounts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/instagram/accounts`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        let accounts = res.data.accounts || [];

        // Debug: Log raw account data
        console.log('Raw account data:', res.data.accounts);

        // Add linked Facebook account if not already present
        const instaAccount = accounts.find((acc) => acc.platform === 'instagram');
        if (instaAccount && !accounts.some((acc) => acc.platform === 'facebook')) {
          const fbPic = instaAccount.fbProfilePicture || instaAccount.profilePicture || null;
          accounts.push({
            _id: `${instaAccount._id}-fb`,
            username: instaAccount.fbUsername || 'Facebook (linked via Instagram)',
            platform: 'facebook',
            profilePicture: fbPic,
            noProfilePicture: !fbPic,
            followerCount: instaAccount.fbFollowerCount ?? '-',
            accountName: instaAccount.accountName || instaAccount.username,
            metadata: {
              viewOnly: true,
              linkedViaInstagram: true,
              sourceAccountId: instaAccount._id
            }
          });
        }

        // Debug: Log processed accounts
        console.log('Processed accounts:', accounts);

        setConnectedAccounts(accounts);
      } catch (err) {
        console.error('Failed to fetch connected accounts', err);
        toast.error('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [authToken, isLoading]);

  // Updated grouping logic based on shared access tokens
  const groupAccountsByOwner = (accounts) => {
    const groups = [];
    const processedAccounts = new Set();

    // Debug: Log all accounts to understand the data structure
    console.log('All accounts:', accounts.map(acc => ({
      id: acc._id,
      username: acc.username,
      platform: acc.platform,
      accessToken: acc.accessToken ? acc.accessToken.substring(0, 20) + '...' : 'none' // Only show first 20 chars for privacy
    })));

    // Helper function to find all accounts that should be grouped together
    const findRelatedAccounts = (startAccount, allAccounts) => {
      const related = new Set([startAccount._id]);
      const toProcess = [startAccount];

      while (toProcess.length > 0) {
        const current = toProcess.shift();

        allAccounts.forEach(account => {
          if (related.has(account._id)) return;

          if (shouldBeGrouped(current, account)) {
            related.add(account._id);
            toProcess.push(account);
          }
        });
      }

      return allAccounts.filter(acc => related.has(acc._id));
    };

    // Updated grouping logic - prioritize access token matching
    const shouldBeGrouped = (account1, account2) => {
      // Same account
      if (account1._id === account2._id) return false;

      // Don't group same platform accounts
      if (account1.platform === account2.platform) return false;

      // Method 1: Same access token (HIGHEST PRIORITY for Meta accounts)
      if (account1.accessToken && account2.accessToken &&
        account1.accessToken === account2.accessToken) {
        console.log(`Access token match found: ${account1.username} <-> ${account2.username}`);
        return true;
      }

      // Method 2: Check for direct Meta connections
      if (areDirectlyConnected(account1, account2)) {
        console.log(`Direct connection found: ${account1.username} <-> ${account2.username}`);
        return true;
      }

      // Method 3: Name similarity (for business pages under same user)
      if (haveRelatedNames(account1, account2)) {
        console.log(`Name similarity found: ${account1.username} <-> ${account2.username}`);
        return true;
      }

      return false;
    };

    // Check for direct connections
    const areDirectlyConnected = (acc1, acc2) => {
      // Check ID patterns
      const baseId1 = acc1._id.replace('-fb', '');
      const baseId2 = acc2._id.replace('-fb', '');
      if (baseId1 === baseId2) return true;

      // Check explicit connection fields
      if (acc1.connectedTo === acc2._id || acc2.connectedTo === acc1._id) return true;

      // Check Facebook user ID
      if (acc1.fbUserId && acc2.fbUserId && acc1.fbUserId === acc2.fbUserId) return true;

      // Check source account reference
      if (acc1.metadata?.sourceAccountId === acc2._id || acc2.metadata?.sourceAccountId === acc1._id) return true;

      return false;
    };

    // Enhanced name matching for business relationships
    const haveRelatedNames = (acc1, acc2) => {
      const name1 = (acc1.accountName || acc1.username || '').toLowerCase();
      const name2 = (acc2.accountName || acc2.username || '').toLowerCase();

      if (!name1 || !name2) return false;

      // Only apply name matching for Meta platforms
      const metaPlatforms = ['instagram', 'facebook'];
      if (!metaPlatforms.includes(acc1.platform) || !metaPlatforms.includes(acc2.platform)) {
        return false;
      }

      // Check for personal name to business page relationships
      const personalNamePattern = /^[a-z]+ [a-z]+$/;
      const businessKeywords = ['developer', 'dev', 'design', 'designer', 'studio', 'agency', 'company'];

      // Case: Personal name (e.g., "neal kumar") + Business page (e.g., "frontend developer")
      if (personalNamePattern.test(name1)) {
        const [firstName, lastName] = name1.split(' ');
        const hasBusinessKeyword = businessKeywords.some(keyword => name2.includes(keyword));

        if (hasBusinessKeyword && (name2.includes(firstName) || name2.includes(lastName))) {
          return true;
        }
      }

      if (personalNamePattern.test(name2)) {
        const [firstName, lastName] = name2.split(' ');
        const hasBusinessKeyword = businessKeywords.some(keyword => name1.includes(keyword));

        if (hasBusinessKeyword && (name1.includes(firstName) || name1.includes(lastName))) {
          return true;
        }
      }

      // Check for similar base names (removing business keywords)
      const cleanName = (name) => {
        return name
          .replace(/\b(developer|dev|design|designer|studio|agency|page|official|business)\b/g, '')
          .replace(/[._\s-]+/g, '')
          .trim();
      };

      const clean1 = cleanName(name1);
      const clean2 = cleanName(name2);

      if (clean1.length >= 3 && clean2.length >= 3) {
        if (clean1.includes(clean2) || clean2.includes(clean1)) {
          return true;
        }
      }

      return false;
    };

    // Build groups
    accounts.forEach(account => {
      if (processedAccounts.has(account._id)) return;

      const relatedAccounts = findRelatedAccounts(account, accounts);

      // Mark all related accounts as processed
      relatedAccounts.forEach(acc => processedAccounts.add(acc._id));

      // Sort accounts by platform priority (Instagram first, then Facebook)
      const sortedAccounts = relatedAccounts.sort((a, b) => {
        const platformOrder = { instagram: 1, facebook: 2, twitter: 3, linkedin: 4, youtube: 5 };
        return (platformOrder[a.platform] || 999) - (platformOrder[b.platform] || 999);
      });

      // Choose the best group name - prefer personal names over business pages
      const groupName = sortedAccounts.reduce((best, current) => {
        const currentName = current.accountName || current.username;
        const bestName = best;

        // Skip generic names
        if (currentName.includes('linked via') || currentName.includes('(')) {
          return bestName;
        }

        // Prefer personal names (First Last format) over business pages
        const personalNamePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
        const isCurrentPersonal = personalNamePattern.test(currentName);
        const isBestPersonal = personalNamePattern.test(bestName);

        if (isCurrentPersonal && !isBestPersonal) return currentName;
        if (isBestPersonal && !isCurrentPersonal) return bestName;

        // If both are personal or both are business, prefer the first one (Instagram account usually comes first)
        return bestName;
      }, sortedAccounts[0].accountName || sortedAccounts[0].username);

      groups.push({
        id: `group-${account._id}`,
        name: groupName,
        accounts: sortedAccounts
      });
    });

    console.log('Final groups:', groups.map(g => ({
      name: g.name,
      accounts: g.accounts.map(a => `${a.username} (${a.platform})`)
    })));

    return groups;
  };

  // Add fallback grouping for ungrouped Meta accounts
  const addFallbackGrouping = (groups, accounts) => {
    // Find any ungrouped Meta accounts
    const groupedAccountIds = new Set(groups.flatMap(g => g.accounts.map(a => a._id)));
    const ungroupedMetaAccounts = accounts.filter(acc =>
      !groupedAccountIds.has(acc._id) &&
      (acc.platform === 'instagram' || acc.platform === 'facebook')
    );

    if (ungroupedMetaAccounts.length > 1) {
      // Group all ungrouped Meta accounts together
      const fallbackGroup = {
        id: 'fallback-meta-group',
        name: 'Connected Meta Accounts',
        accounts: ungroupedMetaAccounts.sort((a, b) => {
          const order = { instagram: 1, facebook: 2 };
          return (order[a.platform] || 999) - (order[b.platform] || 999);
        })
      };

      groups.push(fallbackGroup);
    }

    return groups;
  };

  const sortAccountsInGroup = (accounts) => {
    return accounts.sort((a, b) => {
      const order = { instagram: 1, facebook: 2, twitter: 3, linkedin: 4, youtube: 5 };
      return (order[a.platform] || 999) - (order[b.platform] || 999);
    });
  };

  // Open connection options modal
  const handleConnectMeta = () => {
    setConnectionOptionsModal({ isOpen: true });
  };

  // Connect with Facebook (Instagram + Facebook pages)
  const handleConnectMetaWithFacebook = async () => {
    setConnectionOptionsModal({ isOpen: false });
    setTermsConditionModal({
      isOpen: true,
      connectionType: 'standard'
    });
  };

  // Connect Instagram directly
  const handleConnectInstagramDirect = async () => {
    setConnectionOptionsModal({ isOpen: false });
    setTermsConditionModal({
      isOpen: true,
      connectionType: 'direct'
    });
  };

  // Handle Terms & Conditions acceptance
  const handleTermsConfirm = async (connectionType) => {
    const storedToken = authToken;
    if (!storedToken) {
      toast.error('User not logged in');
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (res.data.success && res.data.data) {
        const freshUser = res.data.data;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        // Check which connection flow to use
        if (connectionType === 'direct') {
          // Instagram-only connection
          window.location.href = `${apiUrl}/api/auth/instagram/instagram-only?userId=${freshUser._id}&token=${storedToken}`;
        } else {
          // Standard Instagram+Facebook connection
          window.location.href = `${apiUrl}/api/auth/instagram?userId=${freshUser._id}&token=${storedToken}`;
        }
      } else {
        toast.error('Failed to get user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired, please login again');
      } else {
        toast.error('Failed to get user data');
      }
    }

    // Close the modal
    setTermsConditionModal({ isOpen: false, connectionType: null });
  };

  const handleDisconnectClick = (account) => {
    // Determine if this is a view-only Facebook account linked to Instagram
    let displayAccount = account;
    let actualAccountId = account._id;
    
    if (account.platform === 'facebook' && 
        (account.metadata?.viewOnly || 
         account.metadata?.linkedViaInstagram || 
         account.username.includes('linked via Instagram'))) {
      // Find the associated Instagram account
      const sourceId = account.metadata?.sourceAccountId || account._id.replace('-fb', '');
      const sourceAccount = connectedAccounts.find(acc => acc._id === sourceId);
      
      if (sourceAccount) {
        // Set a more descriptive username for the confirmation modal
        displayAccount = {
          ...account,
          username: `${account.username} (via ${sourceAccount.username})`,
        };
        actualAccountId = sourceId; // We'll disconnect the source Instagram account
      }
    }
    
    setConfirmationModal({
      isOpen: true,
      accountId: actualAccountId,
      accountUsername: displayAccount.username,
      platform: account.platform.charAt(0).toUpperCase() + account.platform.slice(1)
    });
  };

  const handleConfirmDisconnect = async () => {
    try {
      const { accountId } = confirmationModal;
      const baseId = accountId.replace('-fb', '');

      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/instagram/disconnect/${baseId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Remove both the main account and any linked view-only accounts
      setConnectedAccounts((prev) => 
        prev.filter((acc) => {
          // Remove the account with this ID
          if (acc._id === baseId || acc._id === `${baseId}-fb`) {
            return false;
          }
          
          // Also remove any account that references this account as its source
          if (acc.metadata?.linkedViaInstagram && 
              (acc.metadata.sourceAccountId === baseId || 
               acc.connectedTo === baseId)) {
            return false;
          }
          
          // If it's a Facebook account with the username indicating it's linked
          if (acc.platform === 'facebook' && 
              (acc.username.includes('linked via Instagram') || 
               acc.username.includes('Facebook (linked'))) {
            // Check if this might be linked to the account we're deleting
            const linkedInstagram = prev.find(
              insta => insta.platform === 'instagram' && 
                      insta._id === baseId
            );
            
            // If we found the Instagram account and there's a username match
            if (linkedInstagram && 
                acc.username.includes(linkedInstagram.username)) {
              return false;
            }
          }
          
          return true;
        })
      );

      onNotify('success', 'Account disconnected successfully');

      setConfirmationModal({ isOpen: false, accountId: null, accountUsername: '', platform: '' });
    } catch (err) {
      console.error('Failed to disconnect account', err);
      toast.error('Failed to disconnect account');
    }
  };

  const handleCancelDisconnect = () => {
    setConfirmationModal({ isOpen: false, accountId: null, accountUsername: '', platform: '' });
  };

  const isMetaConnected = connectedAccounts.some(
    (acc) => acc.platform === 'instagram' || acc.platform === 'facebook'
  );

  // Group and sort accounts
  const accountGroups = groupAccountsByOwner(connectedAccounts).map(group => ({
    ...group,
    accounts: sortAccountsInGroup(group.accounts)
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
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Instagram size={16} />
                <Facebook size={16} />
                <Plus size={16} />
                {isMetaConnected ? 'Add Another Meta Account' : 'Connect with Meta'}
              </button>
            </div>
          }
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
                      <div className="accounts-grid">
                        {group.accounts.map((account, index) => {
                          const PlatformIcon = platformIcons[account.platform];

                          // Determine connection type from metadata and connection properties
                          const isDirectConnection =
                            account.connectionType === 'direct' ||
                            account.metadata?.connectionType === 'direct' ||
                            account.metadata?.directConnection === true ||
                            account.metadata?.instagramOnly === true;

                          const isFullAccess =
                            account.connectionType === 'standard' ||
                            account.metadata?.connectionType === 'standard' ||
                            account.metadata?.fullAccess === true;

                          const isViewOnlyFacebook =
                            account.platform === 'facebook' &&
                            (account.metadata?.viewOnly === true ||
                              account.metadata?.linkedViaInstagram === true ||
                              account.username.includes('linked via Instagram'));

                          // Skip Facebook accounts that should be hidden
                          if (account.platform === 'facebook' &&
                            account.metadata?.hideFacebookLink === true) {
                            return null;
                          }

                          return (
                            <div
                              key={index}
                              className={`account-card ${isDirectConnection ? 'instagram-only' : isFullAccess ? 'full-access' : ''} ${isViewOnlyFacebook ? 'view-only' : ''}`}
                              style={{
                                position: 'relative',
                                border: isDirectConnection && account.platform === 'instagram'
                                  ? '1px solid rgba(219, 39, 119, 0.3)'
                                  : isFullAccess && account.platform === 'instagram'
                                    ? '1px solid rgba(37, 99, 235, 0.3)'
                                    : isViewOnlyFacebook
                                      ? '1px dashed rgba(100, 116, 139, 0.5)'
                                      : '1px solid #e5e7eb',
                                opacity: isViewOnlyFacebook ? 0.85 : 1
                              }}
                            >
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

                                {/* Show delete button for ALL accounts, including view-only */}
                                <button
                                  onClick={() => handleDisconnectClick(account)}
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
                                  {account.platform === 'instagram' && (
                                    isDirectConnection ? (
                                      <span className="connection-badge" style={{ color: '#db2777' }}> • Instagram Only</span>
                                    ) : (
                                      <span className="connection-badge" style={{ color: '#2563eb' }}> • Full Access</span>
                                    )
                                  )}
                                  {account.platform === 'facebook' && (
                                    isViewOnlyFacebook ? (
                                      <span className="connection-badge" style={{ color: '#64748b' }}> • View Only</span>
                                    ) : (
                                      <span className="connection-badge"> • Business Page</span>
                                    )
                                  )}
                                </p>
                                <span className="followers-count">
                                  {account.followerCount ? `${account.followerCount} followers` : '-'}
                                </span>
                              </div>

                              <div className="account-actions">
                                <div className={`connection-status ${isViewOnlyFacebook ? 'view-only' : 'connected'}`}
                                  style={{
                                    backgroundColor: isViewOnlyFacebook ? '#f1f5f9' : '',
                                    color: isViewOnlyFacebook ? '#64748b' : ''
                                  }}
                                >
                                  <Check size={14} />
                                  {isViewOnlyFacebook ? 'View Only' : 'Connected'}
                                </div>
                              </div>

                              {/* Connection type badge */}
                              {account.platform === 'instagram' && (
                                <div
                                  className={`connection-type-badge ${isDirectConnection ? 'instagram-only' : 'full-access'}`}
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '40px',
                                    background: isDirectConnection
                                      ? 'linear-gradient(to right, #e11d48, #db2777)'
                                      : 'linear-gradient(to right, #1d4ed8, #2563eb)',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '500'
                                  }}
                                >
                                  {isDirectConnection ? 'Instagram Only' : 'Full Access'}
                                </div>
                              )}

                              {/* View-only badge for Facebook accounts */}
                              {isViewOnlyFacebook && (
                                <div
                                  className="view-only-badge"
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '40px',
                                    background: 'linear-gradient(to right, #64748b, #94a3b8)',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '500'
                                  }}
                                >
                                  View Only
                                </div>
                              )}
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

      {/* Connection Options Modal */}
      <ConnectionOptionsModal
        isOpen={connectionOptionsModal.isOpen}
        onClose={() => setConnectionOptionsModal({ isOpen: false })}
        onSelectInstagram={handleConnectInstagramDirect}
        onSelectFacebookInstagram={handleConnectMetaWithFacebook}
      />

      {/* Disconnect Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelDisconnect}
        onConfirm={handleConfirmDisconnect}
        accountUsername={confirmationModal.accountUsername}
        platform={confirmationModal.platform}
      />

      {/* Terms & Conditions Modal */}
      <TermsConditionModal
        isOpen={termsConditionModal.isOpen}
        onClose={handleCloseTerms}
        onConfirm={handleTermsConfirm}
        connectionType={termsConditionModal.connectionType}
      />
    </div>
  );
};

export default AccountsSettings;
