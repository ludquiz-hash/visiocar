import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';

// Pages
import Dashboard from '@/pages/Dashboard.jsx';
import Claims from '@/pages/Claims.jsx';
import ClaimDetail from '@/pages/ClaimDetail.jsx';
import ClaimWizard from '@/pages/ClaimWizard.jsx';
import Login from '@/pages/Login.jsx';
import Register from '@/pages/Register.jsx';
import AuthCallback from '@/pages/AuthCallback.jsx';
import Landing from '@/pages/Landing.jsx';
import Pricing from '@/pages/Pricing.jsx';

// Protected Route
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

// Public Route
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
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/claims" element={
        <ProtectedRoute>
          <Claims />
        </ProtectedRoute>
      } />
      <Route path="/claims/:id" element={
        <ProtectedRoute>
          <ClaimDetail />
        </ProtectedRoute>
      } />
      <Route path="/wizard" element={
        <ProtectedRoute>
          <ClaimWizard />
        </ProtectedRoute>
      } />
      <Route path="/wizard/:id" element={
        <ProtectedRoute>
          <ClaimWizard />
        </ProtectedRoute>
      } />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;