import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Info, AlertCircle, Plus, Trash2, Check, Link2, Instagram, Twitter, Facebook, Linkedin, Youtube, User, X, AlertTriangle, Building, Briefcase } from 'lucide-react';
import SettingsCard from '../SettingsCard';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareXTwitter } from '@fortawesome/free-brands-svg-icons';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, accountUsername, platform }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '600px',
          width: '90%',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: '#6B7280',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6B7280';
          }}
        >
          <X size={30} />
        </button>

        {/* Header with Icon */}
        <div style={{ padding: '32px 40px 24px 40px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              border: '2px solid #FECACA'
            }}
          >
            <AlertTriangle size={28} style={{ color: '#EF4444' }} />
          </div>

          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.025em'
            }}
          >
            Disconnect Account
          </h3>

          <div
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '20px',
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Platform Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: platform === 'Instagram' ? '#FDF2F8' :
                  platform === 'LinkedIn' ? '#EEF2FF' :
                    platform === 'YouTube' ? '#FEF2F2' : '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${platform === 'Instagram' ? '#FCE7F3' :
                  platform === 'LinkedIn' ? '#E0E7FF' :
                    platform === 'YouTube' ? '#FEE2E2' : '#DBEAFE'}`
              }}
            >
              {platform === 'Instagram' ? (
                <Instagram size={24} style={{ color: '#E91E63' }} />
              ) : platform === 'LinkedIn' ? (
                <Linkedin size={24} style={{ color: '#0A66C2' }} />
              ) : platform === 'YouTube' ? (
                <Youtube size={24} style={{ color: '#FF0000' }} />
              ) : (
                <Facebook size={24} style={{ color: '#1877F2' }} />
              )}
            </div>

            <div style={{ textAlign: 'left', flex: 1 }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '4px'
                }}
              >
                {accountUsername}
              </div>
              <div style={{ fontSize: '15px', color: '#6B7280' }}>{platform}</div>
            </div>
          </div>

          <p
            style={{
              margin: '0 0 32px 0',
              fontSize: '16px',
              color: '#6B7280',
              lineHeight: '1.6',
              textAlign: 'center'
            }}
          >
            This action cannot be undone. You'll need to reconnect this account to continue using it
            for posting and automation.
          </p>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '0 40px 32px 40px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              border: '1px solid #D1D5DB',
              backgroundColor: 'white',
              color: '#374151',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              minWidth: '180px'
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: '#EF4444',
              color: 'white',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              minWidth: '180px'
            }}
          >
            <Trash2 size={16} />
            Yes, Disconnect Account
          </button>
        </div>
      </div>
    </div>
  );
};

// Terms & Condition Modal Component
const TermsConditionModal = ({ isOpen, onClose, onConfirm, connectionType }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: '90vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '1000px',
          width: '90%',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: '#6B7280',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6B7280';
          }}
        >
          <X size={30} />
        </button>

        {/* Content */}
        <div style={{ padding: '32px 40px 24px 40px', textAlign: 'left' }}>
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            Terms and Conditions
          </h1>

          <div
            style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              fontFamily: 'Inter, Arial, sans-serif',
              lineHeight: '1.7',
              fontSize: '16px',
              color: '#374151',
            }}
          >
            <p>
              Welcome to <strong>MGA Buzz Connect</strong> , a subscription-based social media scheduling and publishing platform operated by <strong>MGA Buzz Connect, Mumbai, Maharashtra, India.</strong>
            </p>

            <p>
              By using our services, you agree to these Terms of Service. If you do not agree, you may not use the platform.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              1. Services
            </h4>
            <p>MGA Buzz Connect allows users to schedule, publish, and manage content across social media platforms (Instagram, Facebook, LinkedIn, Twitter/X, YouTube).</p>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>
                The exact features available depend on your subscription plan.
              </li>
              <li>
                Services are provided through official APIs (Meta, LinkedIn, Twitter/X, YouTube).
              </li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              2. Eligibility
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>You must be at least 18 years old to use our services.</li>
              <li>You are responsible for ensuring that your use of the platform complies with the terms and policies of each connected social media platform.</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              3. Accounts
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>
                You must provide accurate registration details.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your account credentials.
              </li>
              <li>
                You must notify us immediately if you suspect unauthorized use of your account.
              </li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              4. Subscriptions & Payments
            </h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Our services are billed on a recurring subscription basis.</li>
              <li>Fees are due in advance and are non-refundable unless required by law.</li>
              <li> We may suspend or terminate service for non-payment.</li>
              <li> We may change pricing with prior notice.</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              5. Use of APIs and Credentials
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>We use secure tokens to connect with third-party platforms.</li>
              <li>You grant us permission to publish and manage content on your behalf.</li>
              <li>If you revoke access or if a platform limits your account, our service may not function properly.</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              6. Acceptable Use
            </h4>
            <p>
              You agree not to:
            </p>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Post unlawful, harmful, or misleading content.</li>
              <li>Use the service to spam or harass others.</li>
              <li>Attempt to bypass or misuse our systems.</li>
              <li>Violate the terms of Instagram, Facebook, LinkedIn, Twitter/X, or YouTube.</li>
            </ul>

            <p>We may suspend or terminate your account if you breach these rules.</p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              7. Intellectual Property
            </h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>All rights in the MGA Buzz Connect platform (software, design, branding) belong to MGA Buzz Connect.</li>
              <li>You retain rights to the content you upload but grant us a license to process, store, and publish it on your behalf.</li>

            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              8. Disclaimers
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Our services are provided <strong>as available.</strong></li>
              <li>We do not guarantee uninterrupted or error-free operation.</li>
              <li>Social media platforms may change their APIs or policies, which may affect service availability.</li>

            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              9. Limitation of Liability
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>MGA Buzz Connect is not liable for loss of data, account suspensions, or actions taken by social media platforms.</li>
              <li>Our total liability under these Terms is limited to the fees you paid in the last 30 days.</li>

            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              10. Termination
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>You may cancel your subscription at any time via your account dashboard.</li>
              <li>We may terminate or suspend accounts that violate these Terms or for non-payment.</li>
              <li>Upon termination, we will delete your stored credentials and content in accordance with our Data Deletion Policy.</li>

            </ul>


            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              11.  Governing Law & Dispute Resolution
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>These Terms are governed by the laws of India.</li>
              <li>Courts in Mumbai, Maharashtra shall have exclusive jurisdiction over disputes.</li>

            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              12. Contact
            </h4>
            <p>
              For questions, please contact us at: {' '}
              <a href="mailto:mgabrandbuzz@gmail.com">mgabrandbuzz@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '0.65rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={() => onConfirm(connectionType)}
            style={{
              padding: '12px 24px',
              border: 'none',
              color: 'white',
              background: '#3b82f6',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              minWidth: '180px'
            }}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Connection Options Modal Component
const ConnectionOptionsModal = ({ isOpen, onClose, onSelectFacebookInstagram, onSelectLinkedInPersonal, onSelectLinkedInBusiness, onSelectYouTube, onSelectTwitter }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '90%',
        maxWidth: '600px',
        padding: '32px',
        height: '90vh',
        overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}>
          <X size={24} />
        </button>

        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Connect Your Social Account
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={onSelectFacebookInstagram}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #DBEAFE',
              position: 'relative'
            }}>
              <Instagram size={20} style={{ color: '#E91E63', position: 'absolute', right: '3px', top: '15px' }} />
              <Facebook size={20} style={{ color: '#1877F2', position: 'absolute', left: '0', top: '15px' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                Instagram + Facebook Pages
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>
                Connect Instagram and Facebook business pages (recommended)
              </div>
            </div>
          </button>

          {/* LinkedIn Personal Profile Connection Option */}
          <button
            onClick={onSelectLinkedInPersonal}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E0E7FF'
            }}>
              <User size={24} style={{ color: '#0A66C2' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                LinkedIn Personal Profile
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>
                Connect your personal LinkedIn profile
              </div>
            </div>
          </button>

          {/* LinkedIn Business Profile Connection Option */}
          <button
            onClick={onSelectLinkedInBusiness}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E0E7FF'
            }}>
              <Building size={24} style={{ color: '#0A66C2' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                LinkedIn Business/Company Page
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>
                Connect your LinkedIn business or company page
              </div>
            </div>
          </button>

          <button
            onClick={onSelectTwitter}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#E8F5FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #BCE0F5',
              }}
            >

              <FontAwesomeIcon icon={faSquareXTwitter} size="xl" color="#000000" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                Twitter
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>
                Connect your Twitter (X) account
              </div>
            </div>
          </button>


          {/* YouTube Connection Option */}
          <button
            onClick={onSelectYouTube}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #FEE2E2'
            }}>
              <Youtube size={24} style={{ color: '#FF0000' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                YouTube
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>
                Connect your YouTube channel for video publishing
              </div>
            </div>
          </button>
        </div>

        <div style={{ marginTop: '24px', fontSize: '14px', color: '#6B7280', textAlign: 'center' }}>
          Connect your social accounts to start scheduling and publishing content
        </div>
      </div>
    </div>
  );
};

// LinkedIn Personal Terms Modal Component
const LinkedInPersonalTermsModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: '90vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '1000px',
          width: '90%',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: '#6B7280',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <X size={30} />
        </button>

        {/* Content */}
        <div style={{ padding: '32px 40px 24px 40px', textAlign: 'left' }}>
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            LinkedIn Personal Profile Terms
          </h1>


          <h4
            style={{
              marginTop: '24px',
              marginBottom: '12px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
            }}
          >
            9. Limitation of Liability
          </h4>


          <p>
            By connecting your LinkedIn personal profile to <strong>MGA Buzz Connect</strong>, you authorize our platform to:
          </p>

          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Access your basic profile information</li>
            <li>Post content on your behalf to your personal profile</li>
            <li>Schedule and publish content to your LinkedIn profile</li>



          </ul>

          <h4
            style={{
              marginTop: '24px',
              marginBottom: '12px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
            }}
          >
            10. Termination
          </h4>

          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>You may cancel your subscription at any time via your account dashboard.</li>
            <li>We may terminate or suspend accounts that violate these Terms or for non-payment.</li>
            <li>Upon termination, we will delete your stored credentials and content in accordance with our Data Deletion Policy.</li>

          </ul>


          <h4
            style={{
              marginTop: '24px',
              marginBottom: '12px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
            }}
          >
            11.  Governing Law & Dispute Resolution
          </h4>

          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>These Terms are governed by the laws of India.</li>
            <li>Courts in Mumbai, Maharashtra shall have exclusive jurisdiction over disputes.</li>

          </ul>

          <h4
            style={{
              marginTop: '24px',
              marginBottom: '12px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
            }}
          >
            12. Contact
          </h4>
          <p>
            For questions, please contact us at: {' '}
            <a href="mailto:mgabrandbuzz@gmail.com">mgabrandbuzz@gmail.com</a>
          </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div
        style={{
          padding: '0.65rem',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}
      >
        <button
          onClick={onConfirm}
          style={{
            padding: '12px 24px',
            border: 'none',
            color: 'white',
            background: '#000',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            minWidth: '180px'
          }}
        >
          <User size={16} />
          Connect Personal Profile
        </button>
      </div>
    </div>
  );
};

// LinkedIn Business Terms Modal Component
const LinkedInBusinessTermsModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: '90vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '1000px',
          width: '90%',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
                  }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: '#6B7280',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <X size={30} />
        </button>

        {/* Content */}
        <div style={{ padding: '32px 40px 24px 40px', textAlign: 'left' }}>
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            LinkedIn Business/Company Page Terms
          </h1>

          <div
            style={{
              maxHeight: '58vh',
              overflowY: 'auto',
              fontFamily: 'Inter, Arial, sans-serif',
              lineHeight: '1.7',
              fontSize: '16px',
              color: '#374151',
            }}
          >
            <p>
              <strong>LinkedIn Business Integration Terms:</strong> July 14, 2025
            </p>

            <p>
              By connecting your LinkedIn business/company page to <strong>MGA Buzz Connect</strong>, you authorize our platform to:
            </p>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Access your LinkedIn organization information</li>
              <li>Post content on behalf of your business/company page</li>
              <li>Schedule and publish content to your LinkedIn organization</li>
              <li>View analytics and engagement metrics for your posts</li>
            </ul>

            <p>
              We prioritize your privacy and data security. Your authorization helps us provide seamless LinkedIn business publishing
              and analytics services. You can revoke this access at any time by disconnecting your LinkedIn business account from
              our platform.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              Permission Scope
            </h4>
            <p>We request the following permissions:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li><strong>r_organization_social</strong>: To access your organization's social media assets</li>
              <li><strong>w_organization_social</strong>: To post and manage content on behalf of your organization</li>
              <li><strong>r_liteprofile</strong>: To verify your admin status for the organization</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              Data Storage
            </h4>
            <p>
              We securely store your LinkedIn business access tokens to facilitate content publishing.
              Your tokens are encrypted and never shared with third parties.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '0.65rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              border: 'none',
              color: 'white',
              background: '#0A66C2',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              minWidth: '180px'
            }}
          >
            <Building size={16} />
            Connect Business Page
          </button>
        </div>
      </div>
    </div>
  );
};

// YouTube Terms Modal Component
const YouTubeTermsModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: '90vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '1000px',
          width: '90%',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: '#6B7280',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <X size={30} />
        </button>

        {/* Content */}
        <div style={{ padding: '32px 40px 24px 40px', textAlign: 'left' }}>
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            Terms and Conditions
          </h1>

          <div
            style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              fontFamily: 'Inter, Arial, sans-serif',
              lineHeight: '1.7',
              fontSize: '16px',
              color: '#374151',
            }}
          >
            <p>
              Welcome to <strong>MGA Buzz Connect</strong> , a subscription-based social media scheduling and publishing platform operated by <strong>MGA Buzz Connect, Mumbai, Maharashtra, India.</strong>
            </p>

            <p>
              By using our services, you agree to these Terms of Service. If you do not agree, you may not use the platform.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              1. Services
            </h4>
            <p>MGA Buzz Connect allows users to schedule, publish, and manage content across social media platforms (Instagram, Facebook, LinkedIn, Twitter/X, YouTube).</p>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>
                The exact features available depend on your subscription plan.
              </li>
              <li>
                Services are provided through official APIs (Meta, LinkedIn, Twitter/X, YouTube).
              </li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              2. Eligibility
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>You must be at least 18 years old to use our services.</li>
              <li>You are responsible for ensuring that your use of the platform complies with the terms and policies of each connected social media platform.</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              3. Accounts
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>
                You must provide accurate registration details.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your account credentials.
              </li>
              <li>
                You must notify us immediately if you suspect unauthorized use of your account.
              </li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              4. Subscriptions & Payments
            </h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Our services are billed on a recurring subscription basis.</li>
              <li>Fees are due in advance and are non-refundable unless required by law.</li>
              <li> We may suspend or terminate service for non-payment.</li>
              <li> We may change pricing with prior notice.</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              5. Use of APIs and Credentials
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>We use secure tokens to connect with third-party platforms.</li>
              <li>You grant us permission to publish and manage content on your behalf.</li>
              <li>If you revoke access or if a platform limits your account, our service may not function properly.</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              6. Acceptable Use
            </h4>
            <p>
              You agree not to:
            </p>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Post unlawful, harmful, or misleading content.</li>
              <li>Use the service to spam or harass others.</li>
              <li>Attempt to bypass or misuse our systems.</li>
              <li>Violate the terms of Instagram, Facebook, LinkedIn, Twitter/X, or YouTube.</li>
            </ul>

            <p>We may suspend or terminate your account if you breach these rules.</p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              7. Intellectual Property
            </h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>All rights in the MGA Buzz Connect platform (software, design, branding) belong to MGA Buzz Connect.</li>
              <li>You retain rights to the content you upload but grant us a license to process, store, and publish it on your behalf.</li>

            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              8. Disclaimers
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Our services are provided <strong>as available.</strong></li>
              <li>We do not guarantee uninterrupted or error-free operation.</li>
              <li>Social media platforms may change their APIs or policies, which may affect service availability.</li>

            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              9. Limitation of Liability
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>MGA Buzz Connect is not liable for loss of data, account suspensions, or actions taken by social media platforms.</li>
              <li>Our total liability under these Terms is limited to the fees you paid in the last 30 days.</li>

            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              10. Termination
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>You may cancel your subscription at any time via your account dashboard.</li>
              <li>We may terminate or suspend accounts that violate these Terms or for non-payment.</li>
              <li>Upon termination, we will delete your stored credentials and content in accordance with our Data Deletion Policy.</li>

            </ul>


            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              11.  Governing Law & Dispute Resolution
            </h4>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>These Terms are governed by the laws of India.</li>
              <li>Courts in Mumbai, Maharashtra shall have exclusive jurisdiction over disputes.</li>

            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              12. Contact
            </h4>
            <p>
              For questions, please contact us at: {' '}
              <a href="mailto:mgabrandbuzz@gmail.com">mgabrandbuzz@gmail.com</a>
            </p>
          </div>
        </div>
        {/* Footer Buttons */}
        <div
          style={{
            padding: '0.65rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              border: 'none',
              color: 'white',
              background: '#FF0000',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              minWidth: '180px'
            }}
          >
            <Youtube size={16} />
            Connect with YouTube
          </button>
        </div>
      </div>
    </div>
  );
};

const TwitterTermsModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: '90vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxWidth: '1000px',
          width: '90%',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: '#6B7280',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <X size={30} />
        </button>

        {/* Content */}
        <div style={{ padding: '32px 40px 24px 40px', textAlign: 'left' }}>
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            Twitter Integration Terms
          </h1>

          <div
            style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              fontFamily: 'Inter, Arial, sans-serif',
              lineHeight: '1.7',
              fontSize: '16px',
              color: '#374151',
            }}
          >
            <p>
              By connecting your Twitter account to <strong>MGA Buzz Connect</strong>, you authorize our platform to:
            </p>

            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Access your Twitter profile information</li>
              <li>Post tweets on your behalf</li>
              <li>Schedule and publish content to your Twitter account</li>
              <li>View your timeline, followers, and engagement metrics</li>
            </ul>

            <p>
              We prioritize your privacy and data security. Your authorization helps us provide seamless Twitter publishing
              and analytics services. You can revoke this access at any time by disconnecting your Twitter account from
              our platform.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              Permission Scope
            </h4>
            <p>We request the following permissions:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li><strong>Read and Write</strong>: To read your profile information and post tweets</li>
              <li><strong>Read followers</strong>: To provide analytics about your audience</li>
            </ul>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              Data Storage
            </h4>
            <p>
              We securely store your Twitter access tokens to facilitate content publishing.
              Your tokens are encrypted and never shared with third parties.
            </p>
            
            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              Twitter Platform Guidelines
            </h4>
            <p>
              We comply with all Twitter Developer Policies and ensure our integration follows 
              Twitter's terms of service. Our platform is designed to enhance your Twitter 
              experience while respecting platform guidelines.
            </p>

            <h4
              style={{
                marginTop: '24px',
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              Contact
            </h4>
            <p>
              For questions, please contact us at: {' '}
              <a href="mailto:mgabrandbuzz@gmail.com">mgabrandbuzz@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '0.65rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              border: 'none',
              color: 'white',
              background: '#000000',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              minWidth: '180px'
            }}
          >
            <FontAwesomeIcon icon={faSquareXTwitter} size="lg" style={{ marginRight: '5px' }} />
            Connect with Twitter
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountsSettings = ({ onNotify }) => {
  const { user, token, isLoading } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectionOptions, setShowConnectionOptions] = useState(false);

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    accountId: null,
    accountUsername: '',
    platform: ''
  });

  const [termsConditionModal, setTermsConditionModal] = useState({
    isOpen: false,
    connectionType: null
  });

  const [linkedInPersonalTermsModal, setLinkedInPersonalTermsModal] = useState({
    isOpen: false
  });

  const [linkedInBusinessTermsModal, setLinkedInBusinessTermsModal] = useState({
    isOpen: false
  });

  const [twitterTermsModal, setTwitterTermsModal] = useState({
    isOpen: false
  });

  const [youtubeTermsModal, setYoutubeTermsModal] = useState({
    isOpen: false
  });

  const [connectionOptionsModal, setConnectionOptionsModal] = useState({
    isOpen: false
  });

  const handleCloseTerms = () => {
    setTermsConditionModal({
      isOpen: false,
      connectionType: null
    });
  };

  const handleCloseLinkedInPersonalTerms = () => {
    setLinkedInPersonalTermsModal({
      isOpen: false
    });
  };

  const handleCloseLinkedInBusinessTerms = () => {
    setLinkedInBusinessTermsModal({
      isOpen: false
    });
  };

  const handleCloseTwitterTerms = () => {
    setTwitterTermsModal({
      isOpen: false
    });
  };

  const handleCloseYouTubeTerms = () => {
    setYoutubeTermsModal({
      isOpen: false
    });
  };

  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube
  };

  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    if (!authToken || isLoading) return;

    const fetchAccounts = async () => {
      try {
        setLoading(true);

        // First, get the current user profile which contains all connected accounts
        const userRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (userRes.data.success && userRes.data.data) {
          // Extract all connected accounts from the user profile
          const allAccounts = userRes.data.data.connectedAccounts || [];
          setConnectedAccounts(allAccounts);
        } else {
          // Fallback to the existing approach if /api/auth/me doesn't return accounts
          const instaRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/instagram/accounts`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });

          let accounts = instaRes.data.accounts || [];

          // Fetch LinkedIn accounts
          try {
            const linkedInRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/linkedin/status`, {
              headers: { Authorization: `Bearer ${authToken}` }
            });

            if (linkedInRes.data.connected && linkedInRes.data.accounts) {
              accounts = [...accounts, ...linkedInRes.data.accounts];
            }
          } catch (linkedInErr) {
            console.error('Error fetching LinkedIn accounts:', linkedInErr);
          }

          // Fetch LinkedIn Business accounts
          try {
            const linkedInBusinessRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/linkedin-business/status`, {
              headers: { Authorization: `Bearer ${authToken}` }
            });

            if (linkedInBusinessRes.data.connected && linkedInBusinessRes.data.accounts) {
              accounts = [...accounts, ...linkedInBusinessRes.data.accounts];
            }
          } catch (linkedInBusinessErr) {
            console.error('Error fetching LinkedIn Business accounts:', linkedInBusinessErr);
          }

          // Fetch YouTube accounts
          try {
            const youtubeRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/youtube/status`, {
              headers: { Authorization: `Bearer ${authToken}` }
            });

            if (youtubeRes.data.connected) {
              const channelRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/youtube/channel`, {
                headers: { Authorization: `Bearer ${authToken}` }
              });

              if (channelRes.data.success && channelRes.data.data) {
                const ytData = channelRes.data.data;

                if (!accounts.some(acc => acc.platform === 'youtube' && acc.platformUserId === ytData.id)) {
                  accounts.push({
                    _id: `youtube-${ytData.id}`,
                    platform: 'youtube',
                    username: ytData.title,
                    platformUserId: ytData.id,
                    profilePicture: ytData.thumbnails?.default?.url || ytData.thumbnails?.medium?.url,
                    followerCount: parseInt(ytData.statistics?.subscriberCount || 0),
                    metadata: {
                      description: ytData.description,
                      videoCount: ytData.statistics?.videoCount,
                      viewCount: ytData.statistics?.viewCount,
                      publishedAt: ytData.publishedAt,
                      uploadsPlaylistId: ytData.uploadsPlaylistId
                    }
                  });
                }
              }
            }
          } catch (ytErr) {
            console.error('Error fetching YouTube account:', ytErr);
          }

          setConnectedAccounts(accounts);
        }
      } catch (err) {
        console.error('Failed to fetch connected accounts', err);
        toast.error('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [authToken, isLoading]);


  // Updated grouping logic based on shared access tokens
  const groupAccountsByOwner = (accounts) => {
    const groups = [];
    const processedAccounts = new Set();

    // Helper function to find all accounts that should be grouped together
    const findRelatedAccounts = (startAccount, allAccounts) => {
      const related = new Set([startAccount._id]);
      const toProcess = [startAccount];

      while (toProcess.length > 0) {
        const current = toProcess.shift();

        allAccounts.forEach(account => {
          if (related.has(account._id)) return;

          if (shouldBeGrouped(current, account)) {
            related.add(account._id);
            toProcess.push(account);
          }
        });
      }

      return allAccounts.filter(acc => related.has(acc._id));
    };

    // Updated grouping logic - prioritize access token matching
    const shouldBeGrouped = (account1, account2) => {
      // Same account
      if (account1._id === account2._id) return false;

      // Don't group same platform accounts
      if (account1.platform === account2.platform) return false;

      // Method 1: Same access token (HIGHEST PRIORITY for Meta accounts)
      if (account1.accessToken && account2.accessToken &&
        account1.accessToken === account2.accessToken) {
        return true;
      }

      // Method 2: Check for direct Meta connections
      if (areDirectlyConnected(account1, account2)) {
        return true;
      }

      // Method 3: Name similarity (for business pages under same user)
      if (haveRelatedNames(account1, account2)) {
        return true;
      }

      return false;
    };

    // Check for direct connections
    const areDirectlyConnected = (acc1, acc2) => {
      // Check ID patterns
      const baseId1 = acc1?._id ? acc1._id.replace('-fb', '') : '';
      const baseId2 = acc2?._id ? acc2._id.replace('-fb', '') : '';
      if (baseId1 === baseId2) return true;

      // Check explicit connection fields
      if (acc1.connectedTo === acc2._id || acc2.connectedTo === acc1._id) return true;

      // Check Facebook user ID
      if (acc1.fbUserId && acc2.fbUserId && acc1.fbUserId === acc2.fbUserId) return true;

      // Check source account reference
      if (acc1.metadata?.sourceAccountId === acc2._id || acc2.metadata?.sourceAccountId === acc1._id) return true;

      return false;
    };

    // Enhanced name matching for business relationships
    const haveRelatedNames = (acc1, acc2) => {
      const name1 = (acc1.accountName || acc1.username || '').toLowerCase();
      const name2 = (acc2.accountName || acc2.username || '').toLowerCase();

      if (!name1 || !name2) return false;

      // Only apply name matching for Meta platforms
      const metaPlatforms = ['instagram', 'facebook'];
      if (!metaPlatforms.includes(acc1.platform) || !metaPlatforms.includes(acc2.platform)) {
        return false;
      }

      // Check for personal name to business page relationships
      const personalNamePattern = /^[a-z]+ [a-z]+$/;
      const businessKeywords = ['developer', 'dev', 'design', 'designer', 'studio', 'agency', 'company'];

      // Case: Personal name (e.g., "neal kumar") + Business page (e.g., "frontend developer")
      if (personalNamePattern.test(name1)) {
        const [firstName, lastName] = name1.split(' ');
        const hasBusinessKeyword = businessKeywords.some(
          keyword => (name2 || '').includes(keyword)
        );

        if (
          hasBusinessKeyword &&
          ((name2 || '').includes(firstName) || (name2 || '').includes(lastName))
        ) {
          return true;
        }
      }

      if (personalNamePattern.test(name2)) {
        const [firstName, lastName] = name2.split(' ');
        const hasBusinessKeyword = businessKeywords.some(
          keyword => (name1 || '').includes(keyword)
        );

        if (
          hasBusinessKeyword &&
          ((name1 || '').includes(firstName) || (name1 || '').includes(lastName))
        ) {
          return true;
        }
      }

      // Check for similar base names (removing business keywords)
      const cleanName = (name) => {
        return name
          .replace(/\b(developer|dev|design|designer|studio|agency|page|official|business)\b/g, '')
          .replace(/[._\s-]+/g, '')
          .trim();
      };

      const clean1 = cleanName(name1);
      const clean2 = cleanName(name2);

      if ((clean1?.length ?? 0) >= 3 && (clean2?.length ?? 0) >= 3) {
        if ((clean1 || '').includes(clean2) || (clean2 || '').includes(clean1)) {
          return true;
        }
      }

      return false;
    };

    // Build groups
    accounts.forEach(account => {
      if (processedAccounts.has(account._id)) return;

      const relatedAccounts = findRelatedAccounts(account, accounts);

      // Mark all related accounts as processed
      relatedAccounts.forEach(acc => processedAccounts.add(acc._id));

      // Sort accounts by platform priority (Instagram first, then Facebook)
      const sortedAccounts = relatedAccounts.sort((a, b) => {
        const platformOrder = { instagram: 1, facebook: 2, linkedin: 3, twitter: 4, youtube: 5 };
        return (platformOrder[a.platform] || 999) - (platformOrder[b.platform] || 999);
      });

      // Choose the best group name - prefer personal names over business pages
      const groupName = sortedAccounts.reduce((best, current) => {
        const currentName = current.accountName || current.username;
        const bestName = best;

        // Skip generic names
        if ((currentName || '').includes('linked via') || (currentName || '').includes('(')) {
          return bestName;
        }

        // Prefer personal names (First Last format) over business pages
        const personalNamePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
        const isCurrentPersonal = personalNamePattern.test(currentName);
        const isBestPersonal = personalNamePattern.test(bestName);

        if (isCurrentPersonal && !isBestPersonal) return currentName;
        if (isBestPersonal && !isCurrentPersonal) return bestName;

        // If both are personal or both are business, prefer the first one (Instagram account usually comes first)
        return bestName;
      }, sortedAccounts[0].accountName || sortedAccounts[0].username);

      groups.push({
        id: `group-${account._id}`,
        name: groupName,
        accounts: sortedAccounts
      });
    });

    return groups;
  };

  const sortAccountsInGroup = (accounts) => {
    return accounts.sort((a, b) => {
      const order = { instagram: 1, facebook: 2, linkedin: 3, twitter: 4, youtube: 5 };
      return (order[a.platform] || 999) - (order[b.platform] || 999);
    });
  };

  // Open connection options modal
  const handleConnectSocial = () => {
    setConnectionOptionsModal({ isOpen: true });
  };

  // Connect with Facebook (Instagram + Facebook pages)
  const handleConnectMetaWithFacebook = async () => {
    setConnectionOptionsModal({ isOpen: false });
    setTermsConditionModal({
      isOpen: true,
      connectionType: 'standard'
    });
  };

  // Connect LinkedIn Personal Profile
  const handleConnectLinkedInPersonal = async () => {
    setConnectionOptionsModal({ isOpen: false });
    setLinkedInPersonalTermsModal({
      isOpen: true
    });
  };

  // Connect LinkedIn Business Profile
  const handleConnectLinkedInBusiness = async () => {
    setConnectionOptionsModal({ isOpen: false });
    setLinkedInBusinessTermsModal({
      isOpen: true
    });
  };

  // Connect Twitter
  const handleConnectTwitter = async () => {
    setConnectionOptionsModal({ isOpen: false });
    setTwitterTermsModal({
      isOpen: true
    });
  };

  // Handle LinkedIn Personal Terms acceptance
  const handleLinkedInPersonalTermsConfirm = async () => {
    const storedToken = authToken;
    if (!storedToken) {
      toast.error('User not logged in');
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (res.data.success && res.data.data) {
        const freshUser = res.data.data;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        // Construct the LinkedIn Personal auth URL
        const linkedInAuthUrl = `${apiUrl}/api/auth/linkedin?userId=${freshUser._id}&token=${storedToken}`;

        console.log('Redirecting to LinkedIn Personal auth:', linkedInAuthUrl);
                // Open in the same window
        window.location.href = linkedInAuthUrl;
      } else {
        toast.error('Failed to get user data');
      }
    } catch (err) {
      toast.error('Failed to start LinkedIn Personal authentication');
    }

    // Close the modal
    setLinkedInPersonalTermsModal({ isOpen: false });
  };

  // Handle Twitter Terms acceptance
  const handleTwitterTermsConfirm = async () => {
    const storedToken = authToken;
    if (!storedToken) {
      toast.error('User not logged in');
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (res.data.success && res.data.data) {
        const freshUser = res.data.data;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        // Construct the Twitter auth URL
        const twitterAuthUrl = `${apiUrl}/api/auth/x?userId=${freshUser._id}&token=${storedToken}`;

        console.log('Redirecting to Twitter auth:', twitterAuthUrl);

        // Open in the same window
        window.location.href = twitterAuthUrl;
      } else {
        toast.error('Failed to get user data');
      }
    } catch (err) {
      console.error('Error starting Twitter auth:', err);
      toast.error('Failed to start Twitter authentication');
    }

    // Close the modal
    setTwitterTermsModal({ isOpen: false });
  };

  // Handle LinkedIn Business Terms acceptance
  const handleLinkedInBusinessTermsConfirm = async () => {
    const storedToken = authToken;
    if (!storedToken) {
      toast.error('User not logged in');
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (res.data.success && res.data.data) {
        const freshUser = res.data.data;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        // Construct the LinkedIn Business auth URL
        const linkedInBusinessAuthUrl = `${apiUrl}/api/auth/linkedin-business?userId=${freshUser._id}&token=${storedToken}`;

        console.log('Redirecting to LinkedIn Business auth:', linkedInBusinessAuthUrl);

        // Open in the same window
        window.location.href = linkedInBusinessAuthUrl;
      } else {
        toast.error('Failed to get user data');
      }
    } catch (err) {
      console.error('Error starting LinkedIn Business auth:', err);
      toast.error('Failed to start LinkedIn Business authentication');
    }

    // Close the modal
    setLinkedInBusinessTermsModal({ isOpen: false });
  };

  // Connect YouTube
  const handleConnectYouTube = async () => {
    setConnectionOptionsModal({ isOpen: false });
    setYoutubeTermsModal({
      isOpen: true
    });
  };

  // Handle YouTube Terms acceptance
  const handleYouTubeTermsConfirm = async () => {
    const storedToken = authToken;
    if (!storedToken) {
      toast.error('User not logged in');
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (res.data.success && res.data.data) {
        const freshUser = res.data.data;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        // Construct the YouTube auth URL
        const youtubeAuthUrl = `${apiUrl}/api/auth/youtube?userId=${freshUser._id}&token=${storedToken}`;

        console.log('Redirecting to YouTube auth:', youtubeAuthUrl);

        // Open in the same window
        window.location.href = youtubeAuthUrl;
      } else {
        toast.error('Failed to get user data');
      }
    } catch (err) {
      console.error('Error starting YouTube auth:', err);
      toast.error('Failed to start YouTube authentication');
    }

    // Close the modal
    setYoutubeTermsModal({ isOpen: false });
  };

  // Handle Terms & Conditions acceptance
  const handleTermsConfirm = async (connectionType) => {
    const storedToken = authToken;
    if (!storedToken) {
      toast.error('User not logged in');
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (res.data.success && res.data.data) {
        const freshUser = res.data.data;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        // Standard Instagram+Facebook connection
        window.location.href = `${apiUrl}/api/auth/instagram?userId=${freshUser._id}&token=${storedToken}`;
      } else {
        toast.error('Failed to get user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired, please login again');
      } else {
        toast.error('Failed to get user data');
      }
    }

    // Close the modal
    setTermsConditionModal({ isOpen: false, connectionType: null });
  };

  const handleDisconnectClick = (account) => {
    // Determine if this is a view-only Facebook account linked to Instagram
    let displayAccount = account;
    let actualAccountId = account._id;

    if (account.platform === 'facebook' &&
      (account.metadata?.viewOnly ||
        account.metadata?.linkedViaInstagram ||
        account.username.includes('linked via Instagram'))) {
      // Find the associated Instagram account
      const sourceId = account.metadata?.sourceAccountId || account._id.replace('-fb', '');
      const sourceAccount = connectedAccounts.find(acc => acc._id === sourceId);

      if (sourceAccount) {
        // Set a more descriptive username for the confirmation modal
        displayAccount = {
          ...account,
          username: `${account.username} (via ${sourceAccount.username})`,
        };
        actualAccountId = sourceId; // We'll disconnect the source Instagram account
      }
    }

    setConfirmationModal({
      isOpen: true,
      accountId: actualAccountId,
      accountUsername: displayAccount.username,
      platform: account?.platform
        ? account.platform.charAt(0).toUpperCase() + account.platform.slice(1)
        : ''
    });
  };

  const handleConfirmDisconnect = async () => {
    try {
      const { accountId } = confirmationModal;
      const baseId = accountId.replace('-fb', '');

      // Determine the API endpoint based on the account platform
      const platform = connectedAccounts.find(acc => acc._id === baseId)?.platform || 'instagram';
      const accountType = connectedAccounts.find(acc => acc._id === baseId)?.accountType || 'personal';

      let endpoint = `${process.env.REACT_APP_API_URL}/api/auth/instagram/disconnect/${baseId}`;

      if (platform === 'linkedin') {
        if (accountType === 'business') {
          endpoint = `${process.env.REACT_APP_API_URL}/api/auth/linkedin-business/accounts/${baseId}`;
        } else {
          endpoint = `${process.env.REACT_APP_API_URL}/api/auth/linkedin/accounts/${baseId}`;
        }
      } else if (platform === 'youtube') {
        endpoint = `${process.env.REACT_APP_API_URL}/api/auth/youtube/disconnect/${baseId}`;
      }

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Remove the account from state
      setConnectedAccounts(prev => {
        // Handle both direct removal and related FB account removal
        const updatedAccounts = prev.filter(acc => {
          const isMainAccount = acc._id !== baseId;
          const isRelatedFBAccount = !(acc.platform === 'facebook' &&
            (acc._id === `${baseId}-fb` ||
              acc.metadata?.sourceAccountId === baseId));
          return isMainAccount && isRelatedFBAccount;
        });

        return updatedAccounts;
      });

      toast.success('Account disconnected successfully');

      // Close the modal
      setConfirmationModal({ isOpen: false, accountId: null, accountUsername: '', platform: '' });

    } catch (err) {
      console.error('Failed to disconnect account', err);
      toast.error('Failed to disconnect account');
    }
  };

  const handleCancelDisconnect = () => {
    setConfirmationModal({ isOpen: false, accountId: null, accountUsername: '', platform: '' });
  };

  const isMetaConnected = connectedAccounts.some(
    (acc) => acc.platform === 'instagram' || acc.platform === 'facebook'
  );

  const isLinkedInConnected = connectedAccounts.some(
    (acc) => acc.platform === 'linkedin'
  );

  const isYouTubeConnected = connectedAccounts.some(
    (acc) => acc.platform === 'youtube'
  );

  // Group and sort accounts
  const accountGroups = groupAccountsByOwner(connectedAccounts).map(group => ({
    ...group,
    accounts: sortAccountsInGroup(group.accounts)
  }));

  return (
    <div className="settings-subpage">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Social Accounts</h2>
          <p>Manage your connected social media accounts</p>
        </div>

        <SettingsCard
          title="Connected Accounts"
          connAcc={
            <div className="connection-buttons">
              <button
                onClick={handleConnectSocial}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                {isMetaConnected ? 'Add Another Social Account' : 'Connect Social Account'}
              </button>
            </div>
          }
        >
          {loading ? (
            <div className="loading-state">
              <p>Loading accounts...</p>
            </div>
          ) : (
            <>
              {accountGroups.length > 0 ? (
                <div className="accounts-container">
                  {accountGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="account-group">
                      <div className="accounts-grid">
                        {group.accounts.map((account, index) => {
                          const PlatformIcon = platformIcons[account.platform];
                          // Determine connection type from metadata and connection properties
                          const isDirectConnection =
                            account.connectionType === 'direct' ||
                            account.metadata?.connectionType === 'direct' ||
                            account.metadata?.directConnection === true ||
                            account.metadata?.instagramOnly === true;

                          const isFullAccess =
                            account.connectionType === 'standard' ||
                            account.metadata?.connectionType === 'standard' ||
                            account.metadata?.fullAccess === true;

                          const isViewOnlyFacebook =
                            account.platform === 'facebook' &&
                            (account.metadata?.viewOnly === true ||
                              account.metadata?.linkedViaInstagram === true ||
                              account.username.includes('linked via Instagram'));

                          const isLinkedInPersonal =
                            account.platform === 'linkedin' &&
                            (account.accountType === 'personal' ||
                              account.metadata?.accountType === 'personal');

                          const isLinkedInBusiness =
                            account.platform === 'linkedin' &&
                            (account.accountType === 'business' ||
                              account.metadata?.accountType === 'business');

                          // Skip Facebook accounts that should be hidden
                          if (account.platform === 'facebook' &&
                            account.metadata?.hideFacebookLink === true) {
                            return null;
                          }

                          return (
                            <div
                              key={index}
                              className={`account-card ${isDirectConnection ? 'instagram-only' : isFullAccess ? 'full-access' : ''} ${isViewOnlyFacebook ? 'view-only' : ''} ${account.platform === 'youtube' ? 'youtube-channel' : ''} ${isLinkedInBusiness ? 'linkedin-business' : isLinkedInPersonal ? 'linkedin-personal' : ''}`}
                              style={{
                                position: 'relative',
                                border: isDirectConnection && account.platform === 'instagram'
                                  ? '1px solid rgba(219, 39, 119, 0.3)'
                                  : isFullAccess && account.platform === 'instagram'
                                    ? '1px solid rgba(37, 99, 235, 0.3)'
                                    : isViewOnlyFacebook
                                      ? '1px dashed rgba(100, 116, 139, 0.5)'
                                      : isLinkedInPersonal
                                        ? '1px solid rgba(10, 102, 194, 0.3)'
                                        : isLinkedInBusiness
                                          ? '1px solid rgba(10, 102, 194, 0.5)'
                                          : account.platform === 'youtube'
                                            ? '1px solid rgba(255, 0, 0, 0.3)'
                                            : '1px solid #e5e7eb',
                                opacity: isViewOnlyFacebook ? 0.85 : 1
                              }}
                            >
                              <div className="account-card-header">
                                <div className="account-avatar">
                                  {account.profilePicture ? (
                                    <img
                                      src={account.profilePicture}
                                      alt={account.username}
                                      className="avatar-img"
                                    />
                                  ) : (
                                    <div className="avatar-fallback">
                                      {(account.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                  )}

                                  <div className={`platform-badge platform-${account.platform}`}>
                                    {PlatformIcon ? <PlatformIcon size={12} /> : null}
                                  </div>
                                </div>

                                {/* Show delete button for ALL accounts, including view-only */}
                                <button
                                  onClick={() => handleDisconnectClick(account)}
                                  className="account-delete-btn"
                                  title="Disconnect account"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className="account-card-content">
                                <h4 className="account-username">{account.username}</h4>
                                <p className="platform-name">
                                  {account?.platform
                                    ? account.platform.charAt(0).toUpperCase() + account.platform.slice(1)
                                    : ''}
                                  {/* {account.platform === 'instagram' && (
                                    isDirectConnection ? (
                                      <span className="connection-badge" style={{ color: '#db2777' }}> • Instagram Only</span>
                                    ) : (
                                      <span className="connection-badge" style={{ color: '#2563eb' }}> • Full Access</span>
                                    )
                                  )} */}
                                  {/* {account.platform === 'facebook' && (
                                    isViewOnlyFacebook ? (
                                      <span className="connection-badge" style={{ color: '#64748b' }}> • View Only</span>
                                    ) : (
                                      <span className="connection-badge"> • Business Page</span>
                                    )
                                  )} */}
                                  {account.platform === 'linkedin' && (
                                    isLinkedInBusiness ? (
                                      <span className="connection-badge" style={{ color: '#0A66C2' }}> • Business Page</span>
                                    ) : (
                                      <span className="connection-badge" style={{ color: '#0A66C2' }}> • Personal Profile</span>
                                    )
                                  )}
                                  {/* {account.platform === 'youtube' && (
                                    <span className="connection-badge" style={{ color: '#FF0000' }}> • Channel</span>
                                  )} */}
                                </p>
                                <span className="followers-count">
                                  {account.platform === 'youtube'
                                    ? `${account.followerCount || 0} subscribers`
                                    : account.followerCount
                                      ? `${account.followerCount} followers`
                                      : '-'}
                                </span>
                              </div>

                              <div className="account-actions">
                                <div className={`connection-status ${isViewOnlyFacebook ? 'view-only' : 'connected'}`}
                                  style={{
                                    backgroundColor: isViewOnlyFacebook ? '#f1f5f9' :
                                      isLinkedInPersonal ? '#EEF2FF' :
                                        isLinkedInBusiness ? '#DBEAFE' :
                                          account.platform === 'youtube' ? '#FEF2F2' : '',
                                    color: isViewOnlyFacebook ? '#64748b' :
                                      isLinkedInPersonal ? '#0A66C2' :
                                        isLinkedInBusiness ? '#0A66C2' :
                                          account.platform === 'youtube' ? '#FF0000' : ''
                                  }}
                                >
                                  <Check size={14} />
                                  {isViewOnlyFacebook ? 'View Only' : 'Connected'}
                                </div>
                              </div>

                              {/* Connection type badge */}
                              {/* {account.platform === 'instagram' && (
                                <div
                                  className={`connection-type-badge ${isDirectConnection ? 'instagram-only' : 'full-access'}`}
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '40px',
                                    background: isDirectConnection
                                      ? 'linear-gradient(to right, #e11d48, #db2777)'
                                      : 'linear-gradient(to right, #1d4ed8, #2563eb)',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '500'
                                  }}
                                >
                                  {isDirectConnection ? 'Instagram Only' : 'Full Access'}
                                </div>
                              )} */}

                              {/* LinkedIn badge */}
                              {/* {account.platform === 'linkedin' && (
                                <div
                                  className="linkedin-badge"
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '40px',
                                    background: isLinkedInBusiness
                                      ? 'linear-gradient(to right, #1E40AF, #2563EB)'
                                      : 'linear-gradient(to right, #0A66C2, #0077B5)',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '500'
                                  }}
                                >
                                  {isLinkedInBusiness ? 'Business Page' : 'Personal Profile'}
                                </div>
                              )} */}

                              {/* View-only badge for Facebook accounts */}
                              {isViewOnlyFacebook && (
                                <div
                                  className="view-only-badge"
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '40px',
                                    background: 'linear-gradient(to right, #64748b, #94a3b8)',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '500'
                                  }}
                                >
                                  View Only
                                </div>
                              )}
                              {/* YouTube badge */}
                              {/* {account.platform === 'youtube' && (
                                <div
                                  className="youtube-badge"
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '40px',
                                    background: 'linear-gradient(to right, #FF0000, #FF5252)',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '500'
                                  }}
                                >
                                  Channel
                                </div>
                              )} */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Link2 size={48} />
                  <h3>No accounts connected</h3>
                  <p>Connect your social media accounts to start posting</p>
                </div>
              )}
            </>
          )}
        </SettingsCard>
      </div>

      {/* Connection Options Modal */}
      <ConnectionOptionsModal
        isOpen={connectionOptionsModal.isOpen}
        onClose={() => setConnectionOptionsModal({ isOpen: false })}
        onSelectFacebookInstagram={handleConnectMetaWithFacebook}
        onSelectLinkedInPersonal={handleConnectLinkedInPersonal}
        onSelectLinkedInBusiness={handleConnectLinkedInBusiness}
        onSelectYouTube={handleConnectYouTube}
        onSelectTwitter={handleConnectTwitter}
      />

      {/* Disconnect Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelDisconnect}
        onConfirm={handleConfirmDisconnect}
        accountUsername={confirmationModal.accountUsername}
        platform={confirmationModal.platform}
      />

      {/* Terms & Conditions Modal */}
      <TermsConditionModal
        isOpen={termsConditionModal.isOpen}
        onClose={handleCloseTerms}
        onConfirm={handleTermsConfirm}
        connectionType={termsConditionModal.connectionType}
      />

      {/* LinkedIn Personal Terms Modal */}
      <LinkedInPersonalTermsModal
        isOpen={linkedInPersonalTermsModal.isOpen}
        onClose={handleCloseLinkedInPersonalTerms}
        onConfirm={handleLinkedInPersonalTermsConfirm}
      />

      {/* LinkedIn Business Terms Modal */}
      <LinkedInBusinessTermsModal
        isOpen={linkedInBusinessTermsModal.isOpen}
        onClose={handleCloseLinkedInBusinessTerms}
        onConfirm={handleLinkedInBusinessTermsConfirm}
      />

      <TwitterTermsModal
        isOpen={twitterTermsModal.isOpen}
        onClose={handleCloseTwitterTerms}
        onConfirm={handleTwitterTermsConfirm}
      />

      {/* YouTube Terms Modal */}
      <YouTubeTermsModal
        isOpen={youtubeTermsModal.isOpen}
        onClose={handleCloseYouTubeTerms}
        onConfirm={handleYouTubeTermsConfirm}
      />
    </div>
  );
};

export default AccountsSettings;



