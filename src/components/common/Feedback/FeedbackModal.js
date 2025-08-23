import React, { useState, useEffect } from 'react';
import { X, Upload, MessageCircle, ChevronDown, Bug, Lightbulb, Settings, AlertCircle, ThumbsUp, ThumbsDown, Paperclip } from 'lucide-react';
import './FeedbackModal.css';

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'general',
    message: '',
    satisfied: '',
    email: '',
    attachment: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const feedbackTypes = [
    { value: 'general', label: 'General feedback', icon: MessageCircle, color: '#6366f1' },
    { value: 'bug', label: 'Bug report', icon: Bug, color: '#ef4444' },
    { value: 'feature', label: 'Feature request', icon: Lightbulb, color: '#22c55e' },
    { value: 'improvement', label: 'Improvement suggestion', icon: Settings, color: '#f59e0b' },
    { value: 'other', label: 'Other', icon: AlertCircle, color: '#8b5cf6' }
  ];

  const selectedType = feedbackTypes.find(type => type.value === formData.type);
  
  // Check if attachment is required for selected feedback type
  const isAttachmentRequired = formData.type === 'bug' || formData.type === 'improvement';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.custom-select-wrapper')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleTypeSelect = (value) => {
    setFormData(prev => ({ 
      ...prev, 
      type: value,
      // Clear attachment if switching from required to non-required type
      attachment: (value !== 'bug' && value !== 'improvement') ? prev.attachment : prev.attachment
    }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate message
    if (!formData.message.trim()) {
      alert('Please enter your feedback message.');
      return;
    }

    // Validate attachment for bug reports and improvement suggestions
    if (isAttachmentRequired && !formData.attachment) {
      alert('Please upload an image for bug reports and improvement suggestions to help us understand the issue better.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        type: 'general',
        message: '',
        satisfied: '',
        email: '',
        attachment: null
      });
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: 'general',
      message: '',
      satisfied: '',
      email: '',
      attachment: null
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal-overlay" onClick={handleCancel}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="feedback-modal-header">
          <div className="header-icon">
            <MessageCircle size={28} />
          </div>
          <div className="header-content">
            <h2>Feedback for BuzzConnect</h2>
            <p id='hexp'>Help us improve your experience</p>
          </div>
          <button className="close-button" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="feedback-modal-content">
          <div className="welcome-section">
            <p className="feedback-description">
              Thank you for taking time to provide feedback. Your input helps us make BuzzConnect better for everyone.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="feedback-form-layout">
              {/* Custom Dropdown */}
              <div className="form-group full-width">
                <label>Feedback Type</label>
                <div className="custom-select-wrapper">
                  <button
                    type="button"
                    className={`custom-select ${isDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="select-content">
                      <div className="select-icon" style={{ color: selectedType.color }}>
                        <selectedType.icon size={20} />
                      </div>
                      <span>{selectedType.label}</span>
                    </div>
                    <ChevronDown size={16} className="select-arrow" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="custom-dropdown">
                      {feedbackTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            className={`dropdown-option ${formData.type === type.value ? 'selected' : ''}`}
                            onClick={() => handleTypeSelect(type.value)}
                          >
                            <div className="option-icon" style={{ color: type.color }}>
                              <Icon size={18} />
                            </div>
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="form-group full-width">
                <label htmlFor="message">Describe your feedback</label>
                <div className="textarea-wrapper">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your feedback, bug report, or feature request in detail..."
                    className="form-textarea"
                    rows={6}
                    maxLength={1000}
                    required
                  />
                  <div className="textarea-footer">
                    <span className="character-count">
                      {formData.message.length}/1000 characters
                    </span>
                  </div>
                </div>
                <p className="form-hint privacy-note">
                  Please do not include any personal, commercially sensitive, or confidential information.
                </p>
              </div>

              {/* Satisfaction */}
              <div className="form-group">
                <label>Rate your experience</label>
                <div className="satisfaction-group">
                  <label className={`satisfaction-option ${formData.satisfied === 'yes' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="satisfied"
                      value="yes"
                      checked={formData.satisfied === 'yes'}
                      onChange={handleInputChange}
                    />
                    <div className="satisfaction-content">
                      <div className="satisfaction-icon">
                        <ThumbsUp size={24} />
                      </div>
                      <span>Satisfied</span>
                    </div>
                  </label>
                  <label className={`satisfaction-option ${formData.satisfied === 'no' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="satisfied"
                      value="no"
                      checked={formData.satisfied === 'no'}
                      onChange={handleInputChange}
                    />
                    <div className="satisfaction-content">
                      <div className="satisfaction-icon">
                        <ThumbsDown size={24} />
                      </div>
                      <span>Not satisfied</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Contact Information <span className="optional">Optional</span></label>
                <p className="form-hint">We may contact you for follow-up questions.</p>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="form-input"
                  />
                </div>
              </div>

              {/* File Attachment */}
              <div className="form-group full-width">
                <label>
                  Attachments 
                  {isAttachmentRequired ? (
                    <span className="required">Required</span>
                  ) : (
                    <span className="optional">Optional</span>
                  )}
                </label>
                
                <div className={`file-upload-area `}>
                  <input
                    type="file"
                    id="attachment"
                    name="attachment"
                    onChange={handleInputChange}
                    className="file-input"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    required={isAttachmentRequired}
                  />
                  <label htmlFor="attachment" className="file-upload-label">
                    <div className="upload-content">
                      <div className="upload-icon">
                        <Upload size={24} />
                      </div>
                      <div className="upload-text">
                        <p>
                          {isAttachmentRequired ? 'Click to upload (Required)' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="upload-hint">PNG, JPG, PDF, DOC up to 10MB</p>
                      </div>
                    </div>
                  </label>
                  {formData.attachment && (
                    <div className="uploaded-file">
                      <div className="file-info">
                        <div className="file-icon">
                          <Paperclip size={20} />
                        </div>
                        <span className="file-name">{formData.attachment.name}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, attachment: null }))}
                          className="remove-file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {isAttachmentRequired && (
                  <p className="form-hint required-hint">
                    Please upload an image to help us understand the {formData.type === 'bug' ? 'bug' : 'improvement'} better.
                  </p>
                )}
              </div>
              {/* <div className="form-group full-width">
                <div className="privacy-notice">
                  <p>🔒 Your information will be handled according to our Privacy Policy.</p>
                </div>
              </div> */}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                {!isSubmitting && <MessageCircle size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
