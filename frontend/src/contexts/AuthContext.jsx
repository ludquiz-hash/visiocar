import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { authApi } from '../api/index.js';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success) {
        setProfile(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.status === 401) {
        // Token expired or invalid
        await signOut();
      }
    }
  };

  const signInWithOtp = async (email) => {
    try {
      const result = await authApi.signInWithOtp(email);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Code de vérification envoyé !');
      return { success: true };
    } catch (error) {
      console.error('OTP error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du code');
      return { success: false, error };
    }
  };

  const verifyOtp = async (email, token, fullName = '') => {
    try {
      const result = await authApi.verifyOtp(email, token, fullName);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Store JWT token
      if (result.data?.token) {
        localStorage.setItem('visiocar_token', result.data.token);
      }
      
      setUser(result.data.user);
      setProfile(result.data.user);
      setIsAuthenticated(true);
      toast.success('Connexion réussie !');
      return { success: true };
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Code invalide');
      return { success: false, error };
    }
  };

  // Handle magic link from URL (for link-based auth)
  const handleMagicLink = async (access_token) => {
    try {
      const { data, error } = await supabase.auth.setSession({ access_token });
      if (error) throw error;
      
      if (data?.user) {
        setUser(data.user);
        await fetchProfile();
        toast.success('Connexion réussie !');
        return { success: true };
      }
    } catch (error) {
      console.error('Magic link error:', error);
      toast.error('Lien de connexion invalide ou expiré');
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('visiocar_token');
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await authApi.updateProfile(updates);
      if (response.success) {
        setProfile(prev => ({ ...prev, ...updates }));
        toast.success('Profil mis à jour');
        return { success: true };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
      return { success: false, error };
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signInWithOtp,
    verifyOtp,
    handleMagicLink,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}