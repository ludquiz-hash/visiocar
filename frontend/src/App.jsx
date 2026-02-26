import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Loading Screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/50">Chargement...</p>
      </div>
    </div>
  );
}

// Inner app with auth
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/claims" element={isAuthenticated ? <Claims /> : <Navigate to="/login" />} />
      <Route path="/claims/:id" element={isAuthenticated ? <ClaimDetail /> : <Navigate to="/login" />} />
      <Route path="/wizard" element={isAuthenticated ? <ClaimWizard /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;