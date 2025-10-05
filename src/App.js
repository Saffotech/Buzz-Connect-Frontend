import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Loader from './components/common/Loader';
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
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsOfService from "./pages/Legal/TermsOfService";
import DataDeletionPolicy from "./pages/Legal/DataDeletionPolicy";
import TestingInstructions from "./pages/Legal/TestingInstructions";

// Import your homepage component
import MGABuzzConnect from './pages/Home/Home';

// Meta tags configuration for different routes
const getMetaTags = (pathname) => {
  switch (pathname) {
    case '/':
    case '/home':
      return {
        title: "MGA Buzz Connect — Multi-Platform Social Media Scheduler with AI",
        description: "Schedule posts, reels and video across multiple platforms, plan up to 1 year ahead, and create better content faster with AI content generation, hashtag & mention suggestions, and content optimization.",
        keywords: "social media scheduler, AI content generation, multi-platform posting, Instagram scheduler, Facebook scheduler, LinkedIn scheduler, Twitter scheduler, TikTok scheduler, social media management, content planning, hashtag suggestions, social media analytics",
        ogTitle: "MGA Buzz Connect — Multi-Platform Social Media Scheduler with AI",
        ogDescription: "Schedule once. Be everywhere. Manage, schedule, and optimize posts across all major platforms with built-in AI assistance.",
        ogUrl: "https://mgabuzzconnect.com/",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image-home.jpg"
      };
    case '/auth':
      return {
        title: "Login & Sign Up | MGA Buzz Connect",
        description: "Log in or create a new account with MGA Buzz Connect - the AI-powered social media management tool for businesses and agencies.",
        keywords: "MGA Buzz Connect login, MGA Buzz Connect sign up, social media tool login, create MGA Buzz Connect account, marketing software signup",
        ogTitle: "MGA Buzz Connect - Login & Sign Up",
        ogDescription: "Access MGA Buzz Connect to manage, schedule, and analyze your social media from one place. Log in or sign up to get started.",
        ogUrl: "https://mgabuzzconnect.com/auth",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image.jpg"
      };
    case '/dashboard':
      return {
        title: "Dashboard | MGA Buzz Connect",
        description: "Manage your social media accounts, view analytics, and schedule posts from your MGA Buzz Connect dashboard.",
        keywords: "social media dashboard, analytics, post scheduling",
        ogTitle: "Dashboard - MGA Buzz Connect",
        ogDescription: "Manage your social media accounts from one centralized dashboard.",
        ogUrl: "https://mgabuzzconnect.com/dashboard",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image.jpg"
      };
    case '/planner':
      return {
        title: "Content Planner | MGA Buzz Connect",
        description: "Plan and schedule your social media content with MGA Buzz Connect's intelligent content planner.",
        keywords: "content planning, social media scheduler, content calendar",
        ogTitle: "Content Planner - MGA Buzz Connect",
        ogDescription: "Plan and schedule your social media content efficiently.",
        ogUrl: "https://mgabuzzconnect.com/planner",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image.jpg"
      };
    case '/analytics':
      return {
        title: "Analytics | MGA Buzz Connect",
        description: "View detailed analytics and insights for your social media performance with MGA Buzz Connect.",
        keywords: "social media analytics, performance metrics, insights",
        ogTitle: "Analytics - MGA Buzz Connect",
        ogDescription: "Get detailed insights into your social media performance.",
        ogUrl: "https://mgabuzzconnect.com/analytics",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image.jpg"
      };
    case '/ai-assistant':
      return {
        title: "AI Assistant | MGA Buzz Connect",
        description: "Get AI-powered assistance for your social media content creation and strategy.",
        keywords: "AI assistant, content creation, social media AI",
        ogTitle: "AI Assistant - MGA Buzz Connect",
        ogDescription: "AI-powered assistance for social media management.",
        ogUrl: "https://mgabuzzconnect.com/ai-assistant",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image.jpg"
      };
    case '/content':
      return {
        title: "Content Management | MGA Buzz Connect",
        description: "Plan, create, and organize all your social media posts and media assets in one place. Access your content drafts and media library.",
        keywords: "social media content, content planner, media library, content management, social media posts",
        ogTitle: "Content Management - MGA Buzz Connect",
        ogDescription: "Plan, create, and organize your social media posts and media assets.",
        ogUrl: "https://mgabuzzconnect.com/content",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image-content.jpg"
      };
    case '/settings':
      return {
        title: "Account Settings | MGA Buzz Connect",
        description: "Manage your MGA Buzz Connect account settings, connected social profiles, team members, and subscription details.",
        keywords: "account settings, social media profiles, manage subscription, team management",
        ogTitle: "Account Settings - MGA Buzz Connect",
        ogDescription: "Manage your account, profiles, and subscription settings.",
        ogUrl: "https://mgabuzzconnect.com/settings",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image-settings.jpg"
      };
    case '/privacy-policy':
      return {
        title: "Privacy Policy | MGA Buzz Connect",
        description: "Learn how MGA Buzz Connect collects, uses, and protects your data while managing your social media accounts.",
        keywords: "privacy policy, MGA Buzz Connect, data protection, social media data",
        ogTitle: "Privacy Policy - MGA Buzz Connect",
        ogDescription: "Read the Privacy Policy of MGA Buzz Connect.",
        ogUrl: "https://mgabuzzconnect.com/privacy-policy",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image.jpg"
      };
    case '/terms-of-service':
      return {
        title: "Terms of Service | MGA Buzz Connect",
        description: "Read the Terms of Service for MGA Buzz Connect social media management platform.",
        keywords: "terms of service, MGA Buzz Connect, user agreement, terms and conditions",
        ogTitle: "Terms of Service - MGA Buzz Connect",
        ogDescription: "Terms of Service for MGA Buzz Connect platform.",
        ogUrl: "https://mgabuzzconnect.com/terms-of-service",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image.jpg"
      };
    case '/data-deletion-policy':
      return {
        title: "Data Deletion Policy | MGA Buzz Connect",
        description: "Learn about MGA Buzz Connect's data deletion policies and how to request data removal.",
        keywords: "data deletion, GDPR compliance, data removal, MGA Buzz Connect",
        ogTitle: "Data Deletion Policy - MGA Buzz Connect",
        ogDescription: "Data deletion and privacy policies for MGA Buzz Connect.",
        ogUrl: "https://mgabuzzconnect.com/data-deletion-policy",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image.jpg"
      };
    default:
      return {
        title: "MGA Buzz Connect - AI-Powered Social Media Management",
        description: "Manage, schedule, and analyze your social media from one place with MGA Buzz Connect.",
        keywords: "social media management, AI tools, content scheduling",
        ogTitle: "MGA Buzz Connect",
        ogDescription: "AI-powered social media management platform.",
        ogUrl: "https://mgabuzzconnect.com",
        ogImage: "https://mgabuzzconnect.com/assets/img/og-image.jpg"
      };
  }
};

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

// Public Route Component (Updated to allow homepage access)
const PublicRoute = ({ children, redirectIfAuthenticated = true }) => {
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

  // If redirectIfAuthenticated is false, always show the component
  if (!redirectIfAuthenticated) {
    return children;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Home Route Component (can be accessed by anyone)
const HomeRoute = ({ children }) => {
  return <PublicRoute redirectIfAuthenticated={false}>{children}</PublicRoute>;
};

// Dynamic Meta Tags Component
const DynamicMetaTags = () => {
  const location = useLocation();
  const metaTags = getMetaTags(location.pathname);

  return (
    <Helmet>
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="MGA Buzz Connect" />
      
      {/* Open Graph */}
      <meta property="og:title" content={metaTags.ogTitle} />
      <meta property="og:description" content={metaTags.ogDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={metaTags.ogUrl} />
      <meta property="og:image" content={metaTags.ogImage} />
      <meta property="og:site_name" content="MGA Buzz Connect" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTags.ogTitle} />
      <meta name="twitter:description" content={metaTags.ogDescription} />
      <meta name="twitter:image" content={metaTags.ogImage} />
      <meta name="twitter:site" content="@MGABuzzConnect" />
      
      {/* Additional SEO tags */}
      <link rel="canonical" href={metaTags.ogUrl} />
      <meta name="theme-color" content="#2563eb" />
    </Helmet>
  );
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
      {/* Add Dynamic Meta Tags */}
      <DynamicMetaTags />
      
      <Routes>
        {/* Homepage Route - accessible to everyone */}
        <Route
          path="/"
          element={
            <HomeRoute>
              <MGABuzzConnect />
            </HomeRoute>
          }
        />
        
        {/* Alternative homepage route */}
        <Route
          path="/home"
          element={
            <HomeRoute>
              <MGABuzzConnect />
            </HomeRoute>
          }
        />

        {/* Auth Route - redirects to dashboard if already authenticated */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes - require authentication */}
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

        {/* Public Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/data-deletion-policy" element={<DataDeletionPolicy />} />
        <Route path="/testing-instructions" element={<TestingInstructions />} />

        {/* 404 Page */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <HelmetProvider>
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
    </HelmetProvider>
  );
}

export default App;
