import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Claims from './pages/Claims.jsx';
import ClaimDetail from './pages/ClaimDetail.jsx';
import ClaimWizard from './pages/ClaimWizard.jsx';
import Team from './pages/Team.jsx';
import Billing from './pages/Billing.jsx';
import GarageSettings from './pages/GarageSettings.jsx';
import Login from './pages/Login.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Pricing from './pages/Pricing.jsx';
import Landing from './pages/Landing.jsx';
import Layout from './components/Layout.jsx';

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route component (redirects to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/claims" element={
        <ProtectedRoute>
          <Layout>
            <Claims />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/claims/:id" element={
        <ProtectedRoute>
          <Layout>
            <ClaimDetail />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/wizard" element={
        <ProtectedRoute>
          <Layout>
            <ClaimWizard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/wizard/:id" element={
        <ProtectedRoute>
          <Layout>
            <ClaimWizard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/team" element={
        <ProtectedRoute>
          <Layout>
            <Team />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/billing" element={
        <ProtectedRoute>
          <Layout>
            <Billing />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <GarageSettings />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#151921',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;