// components/Form.jsx
import React, { useState } from 'react';
import Input from '../input/Input';
import Button from '../common/button/Button';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Form = ({ isLogin, setIsLogin }) => {
  const { login, register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let result;
      if (isLogin) {
        result = await login({ email: formData.email, password: formData.password });
      } else {
        result = await register({
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success) {
        setFormData({
          displayName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
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
        type="password"
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
          type="password"
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

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default Form;
