import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  useSignUpEmailPassword,
  useSignInEmailPassword,
  useProviderLink,
  useSendVerificationEmail
} from '@nhost/react';
import toast from 'react-hot-toast';
import './AuthPage.css';
import { clearAllTokens } from '../utils/clearTokens';
import TokenDebug from './TokenDebug';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);

  const { signUpEmailPassword, isLoading: isSignUpLoading, error: signUpError } = useSignUpEmailPassword();
  const { signInEmailPassword, isLoading: isSignInLoading, error: signInError } = useSignInEmailPassword();
  const { sendVerificationEmail, isLoading: isResendLoading } = useSendVerificationEmail();
  const { twitter } = useProviderLink();

  const isLoading = isSignUpLoading || isSignInLoading || isResendLoading;
  const error = signUpError || signInError;

  // Handle errors from hooks
  useEffect(() => {
    if (error) {
      console.error('Auth hook error:', error);

      // Handle token-related errors
      if (error.message?.includes('invalid') || error.message?.includes('token')) {
        console.log('Token error detected, clearing tokens...');
        clearAllTokens();
        toast.error('Session expired. Please try again.');
        return;
      }

      if (error.error === 'unverified-user') {
        toast.error('Email verify nahi kiya hai! Please check your email aur verify karein.', {
          duration: 6000,
        });
        setShowResendVerification(true);
      } else if (error.error === 'invalid-email-password') {
        toast.error('Galat email ya password. Phir se try karein.');
      } else {
        toast.error(`Error: ${error.message || 'Kuch galat hua. Phir se try karein.'}`);
      }
    }
  }, [error]);

  // Handle Instagram OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const instagramConnected = urlParams.get('instagram_connected');
    const error = urlParams.get('error');

    if (token && instagramConnected) {
      // Store the token in localStorage for Nhost
      localStorage.setItem('nhostRefreshToken', token);
      toast.success('Instagram login successful! 🎉 Redirecting...');

      // Clean up URL parameters and redirect to dashboard
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else if (error) {
      const errorMessages = {
        'access_denied': 'Instagram access denied. Please try again.',
        'invalid_request': 'Invalid Instagram request. Please try again.',
        'server_error': 'Server error during Instagram login. Please try again.',
        'no_instagram_business': 'No Instagram Business Account found. Please connect a business account.',
        'instagram_auth_failed': 'Instagram authentication failed. Please try again.',
        'auth_init_failed': 'Failed to start Instagram authentication. Please try again.'
      };
      toast.error(errorMessages[error] || 'Instagram login failed. Please try again.');
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      if (isLogin) {
        const result = await signInEmailPassword(email, password);
        if (result.error) {
          // Handle specific error types
          if (result.error.error === 'unverified-user') {
            toast.error('Email verify nahi kiya hai! Please check your email aur verify karein.', {
              duration: 6000,
            });
            setShowResendVerification(true);
          } else if (result.error.error === 'invalid-email-password') {
            toast.error('Galat email ya password. Phir se try karein.');
          } else if (result.error.message.includes('Invalid email or password')) {
            toast.error('Galat email ya password. Phir se try karein.');
          } else {
            toast.error(`Login error: ${result.error.message || 'Phir se try karein.'}`);
          }
        } else {
          toast.success('Login successful! Welcome back!');
        }
      } else {
        const result = await signUpEmailPassword(email, password);
        if (result.error) {
          if (result.error.message.includes('already exists') || result.error.error === 'email-already-in-use') {
            toast.error('Ye email pehle se registered hai. Login karein.');
          } else {
            toast.error(`Signup error: ${result.error.message || 'Account nahi ban saka. Phir se try karein.'}`);
          }
        } else {
          toast.success('Account ban gaya! Please check your email to verify.', {
            duration: 6000,
          });
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      toast.error('Kuch galat hua. Phir se try karein.');
    }
  };

  const handleTwitterLogin = () => {
    if (twitter) {
      window.location.href = twitter;
    } else {
      toast.error('Twitter login configure nahi kiya hai.');
    }
  };

  const handleInstagramLogin = () => {
    toast('Redirecting to Instagram login...', {
      icon: '📸',
      duration: 2000,
    });

    // For Instagram as primary authentication method
    // We'll use a special endpoint that handles both login and signup
    const instagramAuthUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/instagram/login`;
    window.location.href = instagramAuthUrl;
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      const result = await sendVerificationEmail(email);
      if (result.error) {
        toast.error('Verification email nahi bhej saka. Phir se try karein.');
      } else {
        toast.success('Verification email bhej diya! Please check your inbox.');
        setShowResendVerification(false);
      }
    } catch (err) {
      toast.error('Verification email nahi bhej saka. Phir se try karein.');
    }
  };

  return (
    <div className="auth-container">
      <TokenDebug />
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="logo">
            <h1>BuzzConnect</h1>
          </div>
          <p className="tagline">Aapke Brands. Ek Jagah.</p>
        </div>

        {/* Toggle */}
        <div className="auth-toggle">
          <button
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
          <button
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Naya Account
          </button>
        </div>

        {/* Social Logins */}
        <div className="social-section">
          <p className="social-label">Social Login</p>
          <div className="social-icons">
            <button
              className="social-icon-btn twitter-btn"
              onClick={handleTwitterLogin}
              disabled={isLoading}
              title="Login with Twitter"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            <button
              className="social-icon-btn instagram-btn"
              onClick={handleInstagramLogin}
              disabled={isLoading}
              title="Login with Instagram"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
                <defs>
                  <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#833ab4"/>
                    <stop offset="50%" stopColor="#fd1d1d"/>
                    <stop offset="100%" stopColor="#fcb045"/>
                  </linearGradient>
                </defs>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="separator">
          <span>ya</span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="aapka.email@example.com"
              className={emailError ? 'error' : ''}
              required
            />
            {emailError && <span className="error-text">{emailError}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <button 
            type="submit" 
            className="primary-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              isLogin ? 'Log In' : 'Account Banayein'
            )}
          </button>
        </form>

        {/* Helper Text */}
        <div className="helper-text">
          {isLogin && !showResendVerification && (
            <a href="#" className="forgot-password">Password Bhool Gaye?</a>
          )}
          {showResendVerification && (
            <div className="resend-verification">
              <p className="verification-text">Email verify nahi kiya hai?</p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isLoading}
                className="resend-btn"
              >
                {isResendLoading ? 'Sending...' : 'Verification Email Bhejiye'}
              </button>
            </div>
          )}
          {!isLogin && !showResendVerification && (
            <p className="terms">
              By signing up, you agree to our{' '}
              <a href="#" className="link">Terms of Service</a> and{' '}
              <a href="#" className="link">Privacy Policy</a>.
            </p>
          )}
        </div>

        {/* Development: Quick Dashboard Access */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f0f9ff',
          border: '1px solid #e0f2fe',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.875rem',
            color: '#0369a1',
            fontWeight: '600'
          }}>
            🚀 Development Mode
          </p>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('mockAuthenticated', 'true');
              window.location.href = '/dashboard';
            }}
            style={{
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#0284c7'}
            onMouseOut={(e) => e.target.style.background = '#0ea5e9'}
          >
            Skip to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
