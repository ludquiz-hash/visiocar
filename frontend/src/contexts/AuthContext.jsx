import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get app URL from env
  const getAppUrl = () => {
    return import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;
  };

  // Create or update user profile
  const ensureProfile = async (userId, email, fullName = '') => {
    try {
      console.log('[Auth] Ensuring profile for:', userId);
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[Auth] Profile fetch error:', fetchError);
      }

      if (existingProfile) {
        console.log('[Auth] Profile exists:', existingProfile);
        setProfile(existingProfile);
        return existingProfile;
      }

      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email,
            full_name: fullName || email.split('@')[0],
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('[Auth] Profile creation error:', insertError);
        throw insertError;
      }

      console.log('[Auth] Profile created:', newProfile);
      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('[Auth] Ensure profile error:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('[Auth] Initializing...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('[Auth] Session error:', error);
        }

        if (session?.user) {
          console.log('[Auth] Session found:', session.user.email);
          setUser(session.user);
          setIsAuthenticated(true);
          await ensureProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        } else {
          console.log('[Auth] No session');
        }
      } catch (error) {
        console.error('[Auth] Init error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Event:', event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await ensureProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email/password
  const signUpWithEmail = async (email, password, fullName) => {
    try {
      console.log('[Auth] Signing up:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile immediately
        await ensureProfile(data.user.id, email, fullName);
        toast.success('Compte créé avec succès !');
        return { success: true };
      }

      return { success: false, error: 'Erreur lors de la création du compte' };
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
      return { success: false, error: error.message };
    }
  };

  // Sign in with email/password
  const signInWithEmail = async (email, password) => {
    try {
      console.log('[Auth] Signing in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Connexion réussie !');
        return { success: true };
      }

      return { success: false, error: 'Email ou mot de passe incorrect' };
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      toast.error(error.message || 'Erreur de connexion');
      return { success: false, error: error.message };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      console.log('[Auth] Starting Google OAuth...');
      
      const redirectUrl = `${getAppUrl()}/auth/callback`;
      console.log('[Auth] Google redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.url) {
        // Redirect to Google
        window.location.href = data.url;
        return { success: true };
      }

      return { success: false, error: 'Erreur OAuth' };
    } catch (error) {
      console.error('[Auth] Google sign in error:', error);
      toast.error(error.message || 'Erreur de connexion avec Google');
      return { success: false, error: error.message };
    }
  };

  // Sign in with Apple (optional)
  const signInWithApple = async () => {
    try {
      console.log('[Auth] Starting Apple OAuth...');
      
      const redirectUrl = `${getAppUrl()}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      }

      return { success: false, error: 'Erreur OAuth' };
    } catch (error) {
      console.error('[Auth] Apple sign in error:', error);
      toast.error(error.message || 'Erreur de connexion avec Apple');
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
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