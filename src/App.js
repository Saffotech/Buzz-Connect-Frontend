import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Loader from './components/common/Loader'
import Layout from './components/Layout';
import AuthPage from './components/AuthPage';
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import Content from './pages/Content';
import Analytics from './pages/Analytics';
import AIAssistant from './pages/AIAssistant';
import SettingsPage from './pages/Settings';
import { trackPageView } from "./utils/analytics-helpers";
import PageNotFound from './components/common/pagenotfound/PageNotFound';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

 if (isLoading) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <Loader />
    </div>
  );
}

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <Loader />
    </div>
  );
}

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
    const location = useLocation();
  // Track page views whenever route changes
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  return (
    <div className="App">
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <Layout>
                <Planner />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/content"
          element={
            <ProtectedRoute>
              <Layout>
                <Content />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <Layout>
                <AIAssistant />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />}
        />
        {/* 404 Route - Must be last */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
