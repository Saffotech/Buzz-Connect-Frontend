import React from 'react';
import { CreditCard, ExternalLink, Mail } from 'lucide-react';
import SettingsCard from '../SettingsCard';

const BillingSettings = ({ onNotify }) => {
const handleContactSales = () => {
window.open(
  "https://mail.google.com/mail/?view=cm&fs=1&to=mgabuzzconnect@gmail.com",
  "_blank"
);
  };

 const handleGetUpdates = () => {
    onNotify('success', 'You\'ll be notified when billing features are available!');
  };

  return (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Billing & Subscription</h2>
          <p>Manage your subscription and billing information</p>
        </div>

        <SettingsCard>
          <div className="coming-soon-card">
            <CreditCard size={64} />
            <h3>Coming Soon!</h3>
            <p>
              We're working hard to bring you advanced billing and subscription management features. 
              In the meantime, we'd love to hear about your needs.
            </p>
            <div className="coming-soon-actions">
              <button onClick={handleContactSales} className="btn-primary">
                <ExternalLink size={16} />
                Contact Sales
              </button>
              <button onClick={handleGetUpdates} className="btn-secondary">
                <Mail size={16} />
                Get Updates
              </button>
            </div>
            {/* <div className="contact-info">
              <p>Questions about pricing or enterprise features?</p>
              <a href="mailto:sales@buzzconnect.com" className="contact-link">
                sales@buzzconnect.com
              </a>
            </div> */}
          </div>
        </SettingsCard>
      </div>
    </div>
  );
};

export default BillingSettings;