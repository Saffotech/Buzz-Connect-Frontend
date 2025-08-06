import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const InviteMemberModal = ({ onInvite, onCancel }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleInvite = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before proceeding.');
      return;
    }

    // If valid, proceed
    onInvite(email);
  };

  return (
    <div>
      <p className="mb-2 text-sm text-gray-600">Send an invitation to join your workspace</p>

      <div className="form-group">
        {/* <label className="form-label">Email Address</label> */}
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors({});
          }}
          placeholder="Enter email address"
          className={`form-input ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="modal-actions mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button onClick={handleInvite} className="btn-primary">
          <Mail size={16} className="mr-1" />
          Send Invitation
        </button>
      </div>
    </div>
  );
};

export default InviteMemberModal;
