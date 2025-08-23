// src/components/settings/subpages/ProfileSettings.jsx
import React, { useState, useEffect } from 'react';
import SettingsCard from '../SettingsCard';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

const ProfileSettings = ({ onNotify }) => {
  const { user, token } = useAuth();
  const [name, setName] = useState('Loading...');
  const [email, setEmail] = useState('Loading...');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load profile data from the correct API endpoint
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setName(res.data.data.displayName || 'N/A');
          setEmail(res.data.data.email || 'N/A');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        toast.error('Failed to load profile data');
        setName('Error loading');
        setEmail('Error loading');
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Verify current password
  const verifyCurrentPassword = async () => {
    if (!currentPassword.trim()) {
      toast.error('Please enter your current password');
      return;
    }

    setVerifyingPassword(true);
    try {
      // Call API to verify current password
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/verify-password`,
        { currentPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCurrentPasswordVerified(true);
        toast.success('Password verified! You can now set a new password.');
      } else {
        toast.error('Current password is incorrect');
        setCurrentPasswordVerified(false);
      }
    } catch (err) {
      console.error('Password verification error:', err);
      toast.error(err.response?.data?.message || 'Failed to verify password');
      setCurrentPasswordVerified(false);
    } finally {
      setVerifyingPassword(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/update-password`,
        {
          currentPassword,
          newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Password updated successfully');
        // Reset form
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPasswordVerified(false);
        // Reset password visibility states
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        if (onNotify) {
          onNotify('Password updated successfully');
        }
      }
    } catch (err) {
      console.error('Password update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Reset password form when cancelled
  const handleCancelPasswordUpdate = () => {
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPasswordVerified(false);
    // Reset password visibility states
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle current password input change
  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
    // Reset verification when password changes
    if (currentPasswordVerified) {
      setCurrentPasswordVerified(false);
    }
  };

  return (
    <div className="settings-subpage">
      <div className="settings-content">
        <SettingsCard title="Profile Information">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              readOnly
              className="readonly-input"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="readonly-input"
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Password"
          headerAction={
            !showPasswordForm && (
              <button
                className="btn-primary"
                onClick={() => setShowPasswordForm(true)}
              >
                Update Password
              </button>
            )
          }
        >
          {showPasswordForm && (
            <>
              <div className="form-group">
                <label>Current Password *</label>
                <div className="password-verify-group">
                  <div className="password-input has-toggle">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={handleCurrentPasswordChange}
                      placeholder="Enter your current password"
                      disabled={currentPasswordVerified}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {!currentPasswordVerified && (
                    <button
                      className="btn-secondary verify-btn"
                      onClick={verifyCurrentPassword}
                      disabled={!currentPassword.trim() || verifyingPassword}
                    >
                      {verifyingPassword ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                  {currentPasswordVerified && (
                    <span className="verification-success">✓ Verified</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input has-toggle">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    disabled={!currentPasswordVerified}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    title="Copy Paste is not permitted"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input has-toggle">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    disabled={!currentPasswordVerified}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    title="Copy Paste is not permitted"

                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="button-group">
                <button
                  className="btn-primary"
                  onClick={handlePasswordUpdate}
                  disabled={!currentPasswordVerified || updatingPassword || !newPassword || !confirmPassword}
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleCancelPasswordUpdate}
                  disabled={updatingPassword}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </SettingsCard>
      </div>
    </div>
  );
};

export default ProfileSettings;
