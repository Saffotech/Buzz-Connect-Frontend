import React, { useState } from 'react';
import { Settings, Users, CreditCard, Link2 } from 'lucide-react';
import SettingsNavigation from './SettingsNavigation';
import SettingsCard from './SettingsCard';
import Notification from './Notification';
import Modal from './Modal';
import WorkspaceSettings from './subpages/WorkspaceSettings';
import AccountsSettings from './subpages/AccountsSettings';
import MembersSettings from './subpages/MembersSettings';
import BillingSettings from './subpages/BillingSettings';
import ProfileSettings from './subpages/ProfileSettings';
import { useSettings } from '../../hooks/useSettings';
import { useLocation } from 'react-router-dom';


const SettingsHub = ({
  title = "Settings",
  description = "Manage your workspace, accounts, team members, and billing preferences",
  availableTabs = ['workspace', 'accounts', 'members', 'billing'],
  initialTab = 'workspace',
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

const tabItems = [
  { id: 'workspace', label: 'Workspace', icon: Settings },
  { id: 'accounts', label: 'Social Accounts', icon: Link2 },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'profile', label: 'Profile', icon: Users } // <-- New tab
].filter(tab => availableTabs.includes(tab.id));

 const renderTabContent = () => {
  const commonProps = {
    onNotify: showNotification,
    onShowModal: showModal,
    onHideModal: hideModal
  };

  switch (activeTab) {
    case 'workspace':
      return <WorkspaceSettings {...commonProps} />;
    case 'accounts':
      return <AccountsSettings {...commonProps} />;
    case 'members':
      return <MembersSettings {...commonProps} />;
    case 'billing':
      return <BillingSettings {...commonProps} />;
    case 'profile':
      return <ProfileSettings {...commonProps} />;
    default:
      return <WorkspaceSettings {...commonProps} />;
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