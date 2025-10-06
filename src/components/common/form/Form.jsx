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
            href="/privacy-policy" target="_blank" rel="noopener noreferrer"     
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
    </>
  );
};


export default Form;
