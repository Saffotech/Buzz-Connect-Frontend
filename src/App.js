import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticationStatus, useNhostClient } from '@nhost/react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import toast from 'react-hot-toast';

function App() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const nhost = useNhostClient();

  // For development: assume logged in for a few sessions
  const [mockAuthenticated, setMockAuthenticated] = React.useState(() => {
    const mockAuth = localStorage.getItem('mockAuthenticated');
    // Default to true for development, or use stored value, or use real auth
    return mockAuth !== 'false' && (mockAuth === 'true' || isAuthenticated || true);
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      setMockAuthenticated(true);
      localStorage.setItem('mockAuthenticated', 'true');
    }
    // Set mock auth to true by default for development
    if (!localStorage.getItem('mockAuthenticated')) {
      localStorage.setItem('mockAuthenticated', 'true');
      setMockAuthenticated(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Handle authentication errors
    const handleAuthError = (error) => {
      console.warn('Authentication error:', error);
      if (error?.message?.includes('invalid') || error?.message?.includes('expired')) {
        // Clear invalid tokens and reload
        localStorage.clear();
        window.location.reload();
      }
    };

    // Listen for auth errors (if available in your Nhost version)
    if (nhost?.auth?.onAuthStateChanged) {
      const unsubscribe = nhost.auth.onAuthStateChanged((event, session) => {
        if (event === 'SIGNED_OUT' && session?.error) {
          handleAuthError(session.error);
        }
      });
      return unsubscribe;
    }
  }, [nhost]);

  // Debug logging
  console.log('App render - isAuthenticated:', isAuthenticated, 'mockAuthenticated:', mockAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          mockAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          mockAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}

export default App;
