// components/Form.jsx
import React, { useState } from 'react';
import Input from '../input/Input';
import Button from '../button/Button';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import './Form.module.css';

const Form = ({ isLogin, setIsLogin }) => {
  const { login, register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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


  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Name for Signup */}
        {!isLogin && (
          <Input
            label="Full Name"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        )}


        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          required
        />


        <Input
          label="Password"
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          required
          minLength={6}
          showToggle
          showPassword={showPassword}
          togglePassword={() => setShowPassword(!showPassword)}
        />


        {!isLogin && (
          <Input
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
            minLength={6}
            showToggle
            showPassword={showConfirmPassword}
            togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />
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
              I accept the <a href="#" target="_blank" style={{
                textDecoration: 'none',
                color: '#3b82f6'
              }}>Terms and Conditions</a>
            </label>
          </div>
        )}


        {/* Remember Me & Forgot password for Login */}
        {isLogin && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5em', fontSize: '0.95em', color: '#374151' }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                style={{ accentColor: "#3b82f6" }}
              />
              Remember me
            </label>
            <a href="#" className="forgot-password" tabIndex={0}>Forgot Password?</a>
          </div>
        )}


        <Button type="submit" disabled={isLoading} className="primary-btn auth-submit">
          {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>


      {/* Separator and social section
      <div className="separator"><span>Or continue with</span></div>
      <div className="social-section">
        <div className="social-icons">
          Add your logic if you want actual sign in / connect - here just UI
          <button type="button" className="social-icon-btn twitter-btn" disabled={isLoading}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#1DA1F2" d="M24 4.557a9.902 9.902 0 0 1-2.828.775A4.932 4.932 0 0 0 23.337 3.1a9.868 9.868 0 0 1-3.127 1.195 4.924 4.924 0 0 0-8.397 4.49A13.978 13.978 0 0 1 1.671 3.149a4.822 4.822 0 0 0-.666 2.475c0 1.708.87 3.215 2.188 4.099A4.904 4.904 0 0 1 .96 8.208v.061a4.927 4.927 0 0 0 3.95 4.827c-.423.115-.87.176-1.329.176-.324 0-.637-.03-.945-.086.637 1.984 2.487 3.429 4.682 3.467A9.869 9.869 0 0 1 0 21.543a13.95 13.95 0 0 0 7.548 2.211c9.051 0 14.002-7.496 14.002-13.986 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"></path></svg>
          </button>
          <button type="button" className="social-icon-btn instagram-btn" disabled={isLoading}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><radialGradient id="IG" cx="1" cy="1" r="1.5" gradientTransform="scale(1.5 1)"> <stop stopColor="#E4405F" /> <stop offset=".35" stopColor="#FDCB5D" /> <stop offset="1" stopColor="#833AB4" /></radialGradient><rect width="24" height="24" rx="4" fill="url(#IG)"/><path fill="#FFF" d="M12 15.655a3.655 3.655 0 1 1 0-7.31 3.655 3.655 0 0 1 0 7.31Zm0-6A2.345 2.345 0 1 0 12 14a2.345 2.345 0 0 0 0-4.691Zm5.5-.236a1.054 1.054 0 1 1-2.108 0 1.054 1.054 0 0 1 2.108 0Z"/><circle cx="12" cy="12" r="4.8" stroke="#fff" strokeWidth="2"/></svg>
          </button>
        </div>
      </div> */}


      {/* Footer Switch between Login/Signup */}
      <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
        }}>
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
           
        </p>
        <button
          type="button"
          className="auth-switch"
          onClick={() => setIsLogin(!isLogin)}
          disabled={isLoading}
        >
          {isLogin ? "Sign Up now" : "Sign In"}
        </button>
      </div>
    </>
  );
};


export default Form;