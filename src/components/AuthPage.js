import React, { useState } from 'react';
import Form from './common/form/Form';
import './AuthPage.css';


const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);


  return (
    <div className="auth-split-container">
      <div className="auth-graphics">
        {/* <div className="dashboard-mockup">
          <div className="dashboard-card">
            <span className="icon"></span>
            <h2>$40,832.32</h2>
            <p>New income • Amazon</p>
          </div>
          Add more brand cards here
        </div> */}
      </div>
     
      {/* Right Side: Auth Form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <img src={require("../assets/img/Logo.png")} alt="BuzzConnect Logo" className="logo" />
          {/* Toggle Tabs for Sign In / Sign Up */}
          <div className="auth-tabs">
            <button
              className={`auth-tab${isLogin ? ' active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`auth-tab${!isLogin ? ' active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>


          {/* Form */}
          <Form isLogin={isLogin} setIsLogin={setIsLogin} />
        </div>
      </div>
    </div>
  );
};


export default AuthPage;