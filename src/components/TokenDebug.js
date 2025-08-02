import React, { useState, useEffect } from 'react';
import { clearAllTokens, checkTokenStatus } from '../utils/clearTokens';

const TokenDebug = () => {
  const [tokens, setTokens] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check tokens on mount
    setTokens(checkTokenStatus());
    
    // Update tokens every 5 seconds
    const interval = setInterval(() => {
      setTokens(checkTokenStatus());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClearTokens = () => {
    clearAllTokens();
    setTokens({});
    window.location.reload();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        Debug Tokens
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 1000,
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{ margin: 0, fontSize: '14px' }}>Token Status</h4>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Stored Tokens:</strong>
        {Object.keys(tokens).length === 0 ? (
          <div style={{ color: '#10b981', marginTop: '4px' }}>
            ✅ No tokens found (clean state)
          </div>
        ) : (
          <div style={{ marginTop: '4px' }}>
            {Object.entries(tokens).map(([key, value]) => (
              <div key={key} style={{ 
                marginBottom: '4px',
                fontSize: '10px',
                wordBreak: 'break-all'
              }}>
                <strong>{key}:</strong> {value?.substring(0, 50)}...
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={handleClearTokens}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Clear All Tokens
        </button>
        <button
          onClick={() => setTokens(checkTokenStatus())}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        fontSize: '10px', 
        opacity: 0.7,
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        paddingTop: '8px'
      }}>
        Use browser console: clearAllTokens() or checkTokenStatus()
      </div>
    </div>
  );
};

export default TokenDebug;
