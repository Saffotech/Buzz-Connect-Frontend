import React, { useState } from 'react';
import Form from '../components/Form'; 
import '../styles/AuthPage.css'; 


const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>BuzzConnect</h1>
          <p>Aapke Brands. Ek Jagah.</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>

          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {/* ✅ Form takes isLogin and setIsLogin as props */}
        <Form isLogin={isLogin} setIsLogin={setIsLogin} />

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?  " : "Already have an account? "}
            <button
              type="button"
              className="auth-switch"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
