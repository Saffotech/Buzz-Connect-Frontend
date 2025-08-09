import React from 'react';
import SettingsHub from '../components/settings/SettingsHub';
import '../assets/styles/settings.css';

const SettingsPage = () => {
  const handleSettingsChange = (changes) => {
    console.log('Settings changed:', changes);
    // Handle settings changes (e.g., save to API, update global state)
  };

  return (
    <SettingsHub
      title="Settings"
    //   description="Manage your workspace, accounts, team members, and billing preferences"
      availableTabs={['workspace', 'accounts', 'members', 'billing', 'profile']} // ✅ Added 'profile'
      initialTab="workspace"
      onSettingsChange={handleSettingsChange}
    />
  );
};

export default SettingsPage;