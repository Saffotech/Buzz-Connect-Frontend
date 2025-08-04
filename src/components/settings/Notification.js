import React from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  const icons = {
    success: Check,
    error: AlertCircle,
    warning: AlertCircle,
    info: AlertCircle
  };

  const Icon = icons[notification.type] || AlertCircle;

  return (
    <div className={`notification ${notification.type}`}>
      <Icon size={16} />
      <span>{notification.message}</span>
      <button onClick={onClose} className="notification-close">
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;