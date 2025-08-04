import React, { useState } from 'react';
import { UserPlus, Trash2, Crown, Shield, User, Mail, X } from 'lucide-react';
import SettingsCard from '../SettingsCard';

const MembersSettings = ({ onNotify, onShowModal, onHideModal }) => {
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

  const [inviteEmail, setInviteEmail] = useState('');

  const roleIcons = {
    owner: Crown,
    admin: Shield,
    member: User
  };

  const handleRemoveMember = (memberId) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
    onNotify('success', 'Member removed successfully');
  };

  const handleInviteMember = () => {
    if (inviteEmail.trim()) {
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
      onHideModal();
      onNotify('success', 'Invitation sent successfully');
    }
  };

  const showInviteModal = () => {
    onShowModal({
      title: 'Invite Team Member',
      children: (
        <div>
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
      ),
      actions: (
        <>
          <button onClick={onHideModal} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleInviteMember} className="btn-primary">
            <Mail size={16} />
            Send Invitation
          </button>
        </>
      )
    });
  };

  return (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Team Members</h2>
          <p>Manage who has access to your workspace</p>
        </div>

        <SettingsCard
          title="Workspace Members"
          headerAction={
            <button onClick={showInviteModal} className="btn-primary">
              <UserPlus size={16} />
              Invite Member
            </button>
          }
        >
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
        </SettingsCard>
      </div>
    </div>
  );
};

export default MembersSettings;