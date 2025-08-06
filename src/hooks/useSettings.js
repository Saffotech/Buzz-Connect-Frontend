import { useState, useCallback } from 'react';

export const useSettings = (initialTab = 'workspace', onSettingsChange) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [notification, setNotification] = useState(null);
  const [modal, setModal] = useState(null);

  const showNotification = useCallback((type, message, duration = 3000) => {
    setNotification({ type, message });
    if (duration > 0) {
      setTimeout(() => setNotification(null), duration);
    }
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const showModal = useCallback((modalProps) => {
    setModal(modalProps);
  }, []);

  const hideModal = useCallback(() => {
    setModal(null);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    if (onSettingsChange) {
      onSettingsChange({ activeTab: tabId });
    }
  }, [onSettingsChange]);

  return {
    activeTab,
    setActiveTab: handleTabChange,
    notification,
    showNotification,
    clearNotification,
    modal,
    showModal,
    hideModal
  };
};