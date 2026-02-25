import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      console.log('[Auth] Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Profile fetch error:', error);
        // Don't block auth if profile fetch fails
        setProfile(null);
      } else {
        console.log('[Auth] Profile fetched:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('[Auth] Profile fetch exception:', error);
      setProfile(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('[Auth] Initializing...');
      
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Auth] Session error:', sessionError);
        }

        if (!mounted) return;

        if (session?.user) {
          console.log('[Auth] Session found:', session.user.email);
          setUser(session.user);
          setIsAuthenticated(true);
          await fetchProfile(session.user.id);
        } else {
          console.log('[Auth] No session found');
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setAuthInitialized(true);
          console.log('[Auth] Initialization complete');
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Event:', event, 'Session:', session ? 'present' : 'null');
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      } else if (event === 'USER_UPDATED') {
        if (session?.user) {
          setUser(session.user);
        }
      }
      
      if (event === 'INITIAL_SESSION') {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithOtp = async (email) => {
    try {
      console.log('[Auth] Sending OTP to:', email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('[Auth] SignIn error:', error);
        throw error;
      }
      
      toast.success('Email envoyé ! Vérifiez votre boîte de réception.');
      return { success: true };
    } catch (error) {
      console.error('[Auth] SignIn exception:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = async (email, token) => {
    try {
      console.log('[Auth] Verifying OTP for:', email);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        console.error('[Auth] Verify error:', error);
        throw error;
      }

      console.log('[Auth] OTP verified, user:', data?.user?.email);
      toast.success('Connexion réussie !');
      return { success: true, data };
    } catch (error) {
      console.error('[Auth] Verify exception:', error);
      toast.error(error.message || 'Code invalide');
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      console.log('[Auth] Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('[Auth] SignOut error:', error);
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    authInitialized,
    signInWithOtp,
    verifyOtp,
    signOut,
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