import React, { useState } from "react";
import Form from "./common/form/Form";
import "./AuthPage.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  // const [isForgot, setIsForgot] = useState(true);
  const [formMode, setFormMode] = useState("auth"); // ⬅️ moved here

  return (
    <div>
      <div className="auth-split-container">
        <div className="auth-graphics"></div>

        {/* Right Side: Auth Form */}
        <div className="auth-form-side">
          <div className="auth-card">
            <img
              src={require("../assets/img/Logo.png")}
              alt="BuzzConnect Logo"
              className="logo"
            />
            {/* Toggle Tabs for Sign In / Sign Up */}
            {formMode === "auth" && (
              <div className="auth-tabs">
                <button
                  className={`auth-tab${isLogin ? " active" : ""}`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab${!isLogin ? " active" : ""}`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Form */}
            <Form
              isLogin={isLogin}
              setIsLogin={setIsLogin}
              formMode={formMode}
              setFormMode={setFormMode}
              // onModeChange={(mode) => mode == 'forgot' ? setIsForgot(true) : setIsForgot(false)}
            />
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()}, MGA Buzz Connect.</p>
        <div className="footer-links">
          <a
            href="https://mgabuzzconnect.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy
          </a>
          <a
            href="https://mgabuzzconnect.com/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
