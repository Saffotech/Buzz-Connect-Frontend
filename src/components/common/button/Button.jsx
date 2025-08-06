// components/Button.jsx
import React from 'react';

const Button = ({ type = 'button', onClick, disabled, children, className }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`auth-submit ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
