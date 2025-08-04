import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  CreditCard,
  Link2,
  Trash2,
  Plus,
  Mail,
  Edit2,
  Save,
  X,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  UserPlus,
  Crown,
  Shield,
  User,
  ArrowLeft,
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react';
import './Settings.css'; // Assuming you have a CSS file for styling
import './Content.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('workspace');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('My Workspace');
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
  const [tempWorkspaceName, setTempWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [notification, setNotification] = useState(null);

  // Mock data - replace with actual API calls
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

  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john@company.com',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      joinedDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c7c0?w=40&h=40&fit=crop&crop=face',
      joinedDate: '2024-02-20'
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@company.com',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      joinedDate: '2024-03-10'
    }
  ]);

  const tabItems = [
    { id: 'workspace', label: 'Workspace', icon: Settings },
    { id: 'accounts', label: 'Social Accounts', icon: Link2 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube
  };

  const roleIcons = {
    owner: Crown,
    admin: Shield,
    member: User
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveWorkspace = () => {
    if (tempWorkspaceName.trim()) {
      setWorkspaceName(tempWorkspaceName.trim());
      setIsEditingWorkspace(false);
      showNotification('success', 'Workspace name updated successfully');
    }
  };

  const handleDeleteAccount = (accountId) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    showNotification('success', 'Account disconnected successfully');
  };

  const handleInviteMember = () => {
    if (inviteEmail.trim()) {
      // Mock adding new member
      const newMember = {
        id: Date.now(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: 'member',
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face`,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      setShowInviteModal(false);
      showNotification('success', 'Invitation sent successfully');
    }
  };

  const handleRemoveMember = (memberId) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
    showNotification('success', 'Member removed successfully');
  };

  // Sub-page components
  const WorkspaceSubPage = () => (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Workspace Settings</h2>
          <p>Manage your workspace name and general settings</p>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <h3>Workspace Name</h3>
            <p>This is the name of your workspace that appears throughout the app</p>
          </div>
          <div className="card-content">
            {isEditingWorkspace ? (
              <div className="edit-workspace">
                <input
                  type="text"
                  value={tempWorkspaceName}
                  onChange={(e) => setTempWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name"
                  className="workspace-input"
                  autoFocus
                />
                <div className="edit-actions">
                  <button onClick={handleSaveWorkspace} className="btn-primary">
                    <Save size={16} />
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingWorkspace(false);
                      setTempWorkspaceName('');
                    }} 
                    className="btn-secondary"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="workspace-display">
                <span className="workspace-name">{workspaceName}</span>
                <button
                  onClick={() => {
                    setTempWorkspaceName(workspaceName);
                    setIsEditingWorkspace(true);
                  }}
                  className="btn-secondary"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const AccountsSubPage = () => (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Social Accounts</h2>
          <p>Manage your connected social media accounts</p>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <h3>Connected Accounts</h3>
            <button className="btn-primary">
              <Plus size={16} />
              Connect New Account
            </button>
          </div>
          <div className="card-content">
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
                <button className="btn-primary">
                  <Plus size={16} />
                  Connect Your First Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const MembersSubPage = () => (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Team Members</h2>
          <p>Manage who has access to your workspace</p>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <h3>Workspace Members</h3>
            <button onClick={() => setShowInviteModal(true)} className="btn-primary">
              <UserPlus size={16} />
              Invite Member
            </button>
          </div>
          <div className="card-content">
            <div className="members-list">
              {members.map(member => {
                const RoleIcon = roleIcons[member.role];
                return (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <div className="member-avatar">
                        <img src={member.avatar} alt={member.name} />
                      </div>
                      <div className="member-details">
                        <h4>{member.name}</h4>
                        <p className="member-email">{member.email}</p>
                        <span className="join-date">
                          Joined {new Date(member.joinedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="member-actions">
                      <div className={`role-badge ${member.role}`}>
                        <RoleIcon size={14} />
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </div>
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="btn-danger-outline"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BillingSubPage = () => (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Billing & Subscription</h2>
          <p>Manage your subscription and billing information</p>
        </div>

        <div className="settings-card">
          <div className="coming-soon-card">
            <CreditCard size={64} />
            <h3>Coming Soon!</h3>
            <p>
              We're working hard to bring you advanced billing and subscription management features. 
              In the meantime, we'd love to hear about your needs.
            </p>
            <div className="coming-soon-actions">
              <button className="btn-primary">
                <ExternalLink size={16} />
                Contact Sales
              </button>
              <button className="btn-secondary">
                <Mail size={16} />
                Get Updates
              </button>
            </div>
            <div className="contact-info">
              <p>Questions about pricing or enterprise features?</p>
              <a href="mailto:sales@buzzconnect.com" className="contact-link">
                sales@buzzconnect.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workspace':
        return <WorkspaceSubPage />;
      case 'accounts':
        return <AccountsSubPage />;
      case 'members':
        return <MembersSubPage />;
      case 'billing':
        return <BillingSubPage />;
      default:
        return <WorkspaceSubPage />;
    }
  };

  return (
    <div className="settings-hub">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p>Manage your workspace, accounts, team members, and billing preferences</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
     <div className="settings-hub-nav">
  <div className="tabs" role="tablist">
    {tabItems.map(item => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          role="tab"
          aria-selected={isActive}
          className={`nav-tab ${isActive ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{item.label}</span>
        </button>
      );
    })}
  </div>
</div>


      {/* Main Content Area */}
      <div className="settings-hub-main">
        {renderTabContent()}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>Send an invitation to join your workspace</p>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowInviteModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleInviteMember} className="btn-primary">
                <Mail size={16} />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;