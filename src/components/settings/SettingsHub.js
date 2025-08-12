import React from 'react';
import { Users, CreditCard, Link2 } from 'lucide-react';
import SettingsNavigation from './SettingsNavigation';
import SettingsCard from './SettingsCard';
import Notification from './Notification';
import Modal from './Modal';
import AccountsSettings from './subpages/AccountsSettings';
import BillingSettings from './subpages/BillingSettings';
import ProfileSettings from './subpages/ProfileSettings';
import { useSettings } from '../../hooks/useSettings';
import { useLocation } from 'react-router-dom';

const SettingsHub = ({
  title = "Settings",
  description = "Manage your profile, connected accounts, and billing preferences",
  availableTabs = ['profile', 'accounts', 'billing'],
  initialTab = 'profile',
  onSettingsChange
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');

  const {
    activeTab,
    setActiveTab,
    notification,
    showNotification,
    clearNotification,
    modal,
    showModal,
    hideModal
  } = useSettings(tabFromUrl || initialTab, onSettingsChange);

  // ✅ New ordered tabs
  const tabItems = [
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'accounts', label: 'Social Accounts', icon: Link2 },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ].filter(tab => availableTabs.includes(tab.id));

  const renderTabContent = () => {
    const commonProps = {
      onNotify: showNotification,
      onShowModal: showModal,
      onHideModal: hideModal
    };

    switch (activeTab) {
      case 'profile':
        return <ProfileSettings {...commonProps} />;
      case 'accounts':
        return <AccountsSettings {...commonProps} />;
      case 'billing':
        return <BillingSettings {...commonProps} />;
      default:
        return <ProfileSettings {...commonProps} />;
    }
  };

  return (
    <div className="settings-hub">
      <Notification notification={notification} onClose={clearNotification} />

      <div className="page-header">
        <div className="header-content header-content-left">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <SettingsNavigation
        tabs={tabItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="settings-hub-main">{renderTabContent()}</div>

      {modal && <Modal {...modal} onClose={hideModal} />}
    </div>
  );
};

export default SettingsHub;