import React from 'react'; 
import SettingsHub from '../components/settings/SettingsHub';
import '../assets/styles/settings.css';

const SettingsPage = () => {
  return (
    <SettingsHub
      title="Settings"
      availableTabs={['profile', 'accounts', 'billing']} // ✅ Only the required tabs
      initialTab="profile" // ✅ Start with Profile
    />
  );
};

export default SettingsPage;