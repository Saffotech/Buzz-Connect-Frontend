// components/Form.jsx
import React, { useState, useEffect } from 'react';
import Input from '../input/Input';
import Button from '../button/Button';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, X } from 'lucide-react';
import './Form.module.css';

const Form = ({ isLogin, setIsLogin, formMode, setFormMode }) => {
const { login, register, isLoading } = useAuth();


  const [termsConditionModal, setTermsConditionModal] = useState({
    isOpen: false,
  });

  // ✅ Add this here
  const handleCloseTerms = () => {
    setTermsConditionModal({
      isOpen: false,
    });
  };
  

  useEffect(() => {
  const blockEvents = (e) => e.preventDefault();

  const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
  inputs.forEach(input => {
    input.addEventListener('copy', blockEvents);
    input.addEventListener('cut', blockEvents);
    input.addEventListener('paste', blockEvents);
    input.addEventListener('contextmenu', blockEvents);
  });
 
  return () => {
    inputs.forEach(input => {
      input.removeEventListener('copy', blockEvents);
      input.removeEventListener('cut', blockEvents);
      input.removeEventListener('paste', blockEvents);
      input.removeEventListener('contextmenu', blockEvents);
    });
  };
}, []);
  
  // Form modes: 'auth', 'forgot', 'otp', 'reset'
  const [otpVerified, setOtpVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    acceptTerms: false,
    otp: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // API call functions
  const sendOTP = async (email) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  };

  const updatePassword = async (email, newPassword) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, message: 'Failed to update password' };
    }
  };

  const validateForm = () => {
    const { displayName, email, password, confirmPassword } = formData;
    
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    
    if (!isLogin) {
      if (!displayName) {
        toast.error('Please enter your name');
        return false;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }
    
    if (!isLogin && !formData.acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return false;
    }
    
    return true;
  };

  const validateEmail = () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateOTP = () => {
    if (!formData.otp || formData.otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return false;
    }
    return true;
  };

  const validateResetPassword = () => {
    const { newPassword, confirmNewPassword } = formData;
    
    if (!newPassword || !confirmNewPassword) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let result;
      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await register({
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password
        });
      }

      if (result?.success) {
        setFormData({
          displayName: '',
          email: '',
          password: '',
          confirmPassword: '',
          rememberMe: false,
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
    }
  };

  // Step 1: Send OTP to email
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;

    setApiLoading(true);
    try {
      const result = await sendOTP(formData.email);
      if (result?.success) {
        toast.success('OTP sent to your email!');
        setFormMode('otp');
      } else {
        toast.error(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOTPVerification = async (e) => {
    e.preventDefault();
    
    if (!validateOTP()) return;

    setApiLoading(true);
    try {
      const result = await verifyOTP(formData.email, formData.otp);
      if (result?.success) {
        toast.success('OTP verified successfully!');
        setOtpVerified(true);
        setFormMode('reset');
      } else {
        toast.error(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateResetPassword()) return;
    if (!otpVerified) {
      toast.error('Please verify OTP first');
      return;
    }

    // Debug: Check if email is available
    console.log('Email for password reset:', formData.email);
    
    if (!formData.email) {
      toast.error('Email is missing. Please start over.');
      handleBackToLogin();
      return;
    }

    setApiLoading(true);
    try {
      const result = await updatePassword(formData.email, formData.newPassword);
      if (result?.success) {
        toast.success('Password reset successfully!');
        
        // Reset form and redirect to dashboard
        setFormMode('auth');
        setOtpVerified(false);
        setFormData({
          displayName: '',
          email: '',
          password: '',
          confirmPassword: '',
          rememberMe: false,
          acceptTerms: false,
          otp: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        
        // Reset password visibility states
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = 'http://localhost:3000/dashboard';
        }, 1500);
      } else {
        toast.error(result.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setFormMode('auth');
    setOtpVerified(false);
    setFormData({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      acceptTerms: false,
      otp: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    // Reset password visibility states
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const handleResendOTP = async () => {
    setApiLoading(true);
    try {
      const result = await sendOTP(formData.email);
      if (result?.success) {
        toast.success('OTP resent to your email!');
      } else {
        toast.error(result.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  // Render different forms based on mode
  const renderAuthForm = () => (
    <form className="auth-form" onSubmit={handleSubmit}>
      {!isLogin && (
        <div className="form-group">
          <label>Full Name</label>
          <Input
            type="text"
            name="displayName"
            placeholder="Enter your full name"
            value={formData.displayName}
            onChange={handleInputChange}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label>Email</label>
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <div className="password-input has-toggle">
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            title="Copy Paste is not permitted"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {!isLogin && (
        <div className="form-group">
          <label>Confirm Password</label>
          <div className="password-input has-toggle">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              title="Copy Paste is not permitted"

              required
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
      )}

      {isLogin && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          {/* <label style={{ display: 'flex', alignItems: 'center', gap: '0.5em', fontSize: '0.95em', color: '#374151' }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              style={{ accentColor: "#3b82f6" }}
            />
            Remember me
          </label> */}
          <a
          style={{cursor: 'pointer'}}
            className="forgot-password"
            onClick={() => setFormMode('forgot')}
          >
            Forgot Password?
          </a>
        </div>
      )}

      {!isLogin && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em',
          fontSize: '0.95em',
          color: '#374151',
          marginBottom: '1rem'
        }}>
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleInputChange}
          />
          <label htmlFor="acceptTerms" style={{
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            I accept the <a style={{
              textDecoration: 'none',
              color: '#3b82f6'
            }}
            onClick={()=>setTermsConditionModal({isOpen:true})}
            
            >Terms and Conditions</a>
          </label>
        </div>
      )}

      <Button
        type="submit"
        className="primary-btn auth-submit"
        disabled={isLoading}
      >
        {isLoading && <div className="spinner" />}
        {isLogin ? 'Sign In' : 'Create Account'}
      </Button>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form className="auth-form" onSubmit={handleForgotPassword}>
      <div className="form-header">
        <h3>Forgot Password</h3>
        <p>Enter your email address to receive an OTP</p>
        <br />
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <Input
          type="email"
          name="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <Button
        type="submit"
        className="primary-btn auth-submit"
        disabled={apiLoading}
      >
        {apiLoading && <div className="spinner" />}
        Send OTP
      </Button>

      <div className="auth-footer">
        <button
          type="button"
          className="auth-switch"
          onClick={handleBackToLogin}
        >
          Back to Login
        </button>
      </div>
    </form>
  );

  const renderOTPForm = () => (
    <form className="auth-form" onSubmit={handleOTPVerification}>
      <div className="form-header">
        <h3>Verify OTP</h3>
        <div className="verification-text">
          We've sent a verification code to {formData.email}
        </div>
      </div>

      <div className="form-group">
        <label>Enter OTP</label>
        <Input
          type="text"
          name="otp"
          placeholder="Enter 6-digit OTP"
          value={formData.otp}
          onChange={handleInputChange}
          maxLength="6"
          required
        />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <button
          type="button"
          className="resend-btn"
          onClick={handleResendOTP}
          disabled={apiLoading}
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {apiLoading ? 'Resending...' : 'Resend OTP'}
        </button>

        <Button
          type="submit"
          className="primary-btn auth-submit"
          disabled={apiLoading}
        >
          {apiLoading && <div className="spinner" />}
          Verify OTP
        </Button>
      </div>

      <div className="auth-footer">
        <button
          type="button"
          className="auth-switch"
          onClick={handleBackToLogin}
        >
          Back to Login
        </button>
      </div>
    </form>
  );

 const renderResetPasswordForm = () => (
  <form className="auth-form" onSubmit={handleResetPassword}>
    <div className="form-header">
      <h3>Reset Password</h3>
      <p>Create a new password</p>
    </div>

    <div className="form-group">
      <label>New Password</label>
      <div className="password-input has-toggle">
        <Input
          type={showNewPassword ? 'text' : 'password'}
          name="newPassword"
          placeholder="Enter new password"
          value={formData.newPassword}
          onChange={handleInputChange}
          required
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
        <Input
          type={showConfirmNewPassword ? 'text' : 'password'}
          name="confirmNewPassword"
          placeholder="Confirm new password"
          value={formData.confirmNewPassword}
          onChange={handleInputChange}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
        >
          {showConfirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>

    <Button type="submit" className="primary-btn auth-submit" disabled={apiLoading}>
      {apiLoading && <div className="spinner" />}
      Reset Password
    </Button>
  </form>
);

  return (
    <>
      {/* Conditional form rendering */}
      {formMode === 'auth' && renderAuthForm()}
      {formMode === 'forgot' && renderForgotPasswordForm()}
      {formMode === 'otp' && renderOTPForm()}
      {formMode === 'reset' && renderResetPasswordForm()}

      {/* Footer - only show in auth mode */}
      {formMode === 'auth' && (
        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?  " : "Already have an account?  "}
            <button
              type="button"
              className="auth-switch"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      )}
        {/* Confirmation Modal Terms & Conditions */}
      <TermsConditionModal
        isOpen={termsConditionModal.isOpen}
        onClose={handleCloseTerms}
        onConfirm={handleCloseTerms}
      />
    </>
  );
};


const TermsConditionModal = ({ isOpen, onClose, onConfirm }) => {
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

        {/* Header with Icon */}
        <div style={{ textAlign: 'left' }}>


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
              padding: '32px 40px 24px 40px',
              textAlign: 'left',
              maxHeight: '70vh',
              overflowY: 'auto',
              fontFamily: 'Inter, Arial, sans-serif',
              lineHeight: '1.7',
              fontSize: '16px',
              color: '#374151',
            }}
          >
            {/* <h3
              style={{
                margin: '0 0 20px 0',
                fontSize: '28px',
                fontWeight: '700',
                color: '#111827',
                letterSpacing: '-0.02em',
                textAlign: 'center',
              }}
            >
              Privacy Policy
            </h3> */}

            <p>
              <strong>Effective Date:</strong> July 14, 2025
            </p>

            <p>
              <strong>MGA Buzz Connect</strong> ("we", "our", or "us") is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our platform to
              manage and schedule content across social media platforms.
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
              1. Information We Collect
            </h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>
                <strong>Account Information:</strong> Your name, email address, and
                contact details.
              </li>
              <li>
                <strong>Social Media Data:</strong> With your permission, we collect data
                from your connected social media accounts (e.g., Instagram, Facebook)
                such as profile information, posts, analytics, and scheduling data.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our
                platform, including pages visited and actions taken.
              </li>
              <li>
                <strong>Device Data:</strong> IP address, browser type, and operating
                system.
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
              2. How We Use Your Information
            </h4>
            <p>We use your data to:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Provide and maintain our service</li>
              <li>Allow you to schedule and manage social media posts</li>
              <li>Send notifications and updates</li>
              <li>Analyze usage to improve our platform</li>
              <li>Comply with legal obligations</li>
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
              3. Sharing Your Information
            </h4>
            <p>
              We do <strong>not</strong> sell or rent your personal data. We only share
              your information with:
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>
                Social media platforms (e.g., Instagram Graph API) to publish and
                retrieve your content
              </li>
              <li>
                Service providers who help operate our platform (e.g., cloud hosting,
                analytics)
              </li>
              <li>Legal authorities when required by law</li>
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
              4. Data Security
            </h4>
            <p>
              We use industry-standard security practices, including encryption and
              access control, to protect your data. However, no method is 100% secure,
              and we cannot guarantee absolute security.
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
              5. Your Rights
            </h4>
            <p>You may:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Access and update your personal information</li>
              <li>Disconnect your social media accounts at any time</li>
              <li>
                Request deletion of your data by contacting us at{' '}
                <a href="mailto:mgabrandbuzz@gmail.com">mgabrandbuzz@gmail.com</a>
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
              6. Cookies
            </h4>
            <p>
              We use cookies and similar technologies to improve your experience. You can
              disable cookies through your browser settings.
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
              7. Third-Party Links
            </h4>
            <p>
              Our platform may contain links to third-party websites. We are not
              responsible for their privacy practices.
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
              8. Changes to This Policy
            </h4>
            <p>
              We may update this Privacy Policy periodically. Changes will be posted on
              this page with an updated effective date.
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
              9. Contact Us
            </h4>
            <p>
              If you have questions about this policy, please contact us at:{' '}
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
            justifyContent: 'space-between',
            justifyContent: 'flex-end'
          }}
        >
          {/* <button
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
            Accept
          </button> */}

          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              border: 'none',
              color: 'white',
              background: '#3b82f6',
              // background: 'linear-gradient(to right, hsla(276, 76%, 47%, 1), hsla(311, 91%, 54%, 1), hsla(221, 83%, 60%, 1))',
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
    </div >
  );
};

export default Form;
