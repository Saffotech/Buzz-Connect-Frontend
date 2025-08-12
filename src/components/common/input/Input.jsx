// components/Input.jsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  showToggle = false,
  showPassword = false,
  togglePassword,
  minLength
}) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className={`password-input ${showToggle ? 'has-toggle' : ''}`}>
        <input
          type={showToggle ? (showPassword ? 'text' : 'password') : type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
        />
        {showToggle && (
          <button
            type="button"
            className="password-toggle"
            onClick={togglePassword}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
