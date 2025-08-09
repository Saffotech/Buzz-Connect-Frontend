// src/components/settings/subpages/ProfileSettings.jsx
import React, { useState, useEffect } from 'react';
import SettingsCard from '../SettingsCard';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';

const ProfileSettings = ({ onNotify }) => {
  const { user, token } = useAuth();
  const [name, setName] = useState('Loading...');
  const [email, setEmail] = useState('Loading...');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Replace with your real profile endpoint
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setName(res.data.name || 'John Doe');
        setEmail(res.data.email || 'john@example.com');
      } catch (err) {
        console.error(err);
        setName('John Doe');
        setEmail('john@example.com');
      }
    };
    fetchProfile();
  }, [token]);

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // Replace with your real password update endpoint
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/update-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password updated successfully');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="settings-subpage">
      <div className="settings-content">
        <SettingsCard title="Profile Information">
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} readOnly />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} readOnly />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Password"
          headerAction={
            !showPasswordForm && (
              <button className="btn-primary" onClick={() => setShowPasswordForm(true)}>
                Update Password
              </button>
            )
          }
        >
          {showPasswordForm && (
            <>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={handlePasswordUpdate}>
                Save Password
              </button>
              <button className="btn-secondary" onClick={() => setShowPasswordForm(false)}>
                Cancel
              </button>
            </>
          )}
        </SettingsCard>
      </div>
    </div>
  );
};

export default ProfileSettings;
