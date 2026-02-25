import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { toast } from 'sonner';

const AuthContext = createContext();

// Debug helper
const debugAuth = (label, data) => {
  console.log(`[Auth Debug] ${label}:`, data);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Log config on init
  useEffect(() => {
    debugAuth('Supabase URL', import.meta.env.VITE_SUPABASE_URL);
    debugAuth('Anon Key (last 6)', import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(-6));
  }, []);

  // Get app URL from env
  const getAppUrl = () => {
    return import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;
  };

  // Create or update user profile
  const ensureProfile = async (userId, email, fullName = '') => {
    try {
      debugAuth('Ensuring profile for', userId);
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        debugAuth('Profile fetch error', fetchError);
      }

      if (existingProfile) {
        debugAuth('Profile exists', existingProfile);
        setProfile(existingProfile);
        return existingProfile;
      }

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: email,
          full_name: fullName || email.split('@')[0],
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (insertError) {
        debugAuth('Profile creation error', insertError);
        throw insertError;
      }

      debugAuth('Profile created', newProfile);
      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      debugAuth('Ensure profile error', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      debugAuth('Initializing...', null);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          debugAuth('Session error', error);
        }

        if (session?.user) {
          debugAuth('Session found', session.user.email);
          setUser(session.user);
          setIsAuthenticated(true);
          await ensureProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        } else {
          debugAuth('No session', null);
        }
      } catch (error) {
        debugAuth('Init error', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugAuth('Event', event);
      
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
      debugAuth('Signing up', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      debugAuth('SignUp response', { data, error });

      if (error) {
        // Handle specific errors
        if (error.message?.includes('rate limit')) {
          throw new Error('Trop de tentatives. Veuillez patienter quelques minutes.');
        }
        if (error.message?.includes('already registered')) {
          throw new Error('Cet email est déjà utilisé. Essayez de vous connecter.');
        }
        throw error;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities?.length === 0) {
          toast.success('Un email de confirmation vous a été envoyé. Vérifiez votre boîte de réception.');
          return { 
            success: true, 
            message: 'Email de confirmation envoyé',
            needsConfirmation: true 
          };
        }
        
        await ensureProfile(data.user.id, email, fullName);
        toast.success('Compte créé avec succès !');
        return { success: true };
      }

      return { success: false, error: 'Erreur lors de la création du compte' };
    } catch (error) {
      debugAuth('Sign up error', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
      return { success: false, error: error.message };
    }
  };

  // Sign in with email/password
  const signInWithEmail = async (email, password) => {
    try {
      debugAuth('Signing in', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      debugAuth('SignIn response', { 
        user: data?.user?.email, 
        error: error?.message,
        errorCode: error?.code 
      });

      if (error) {
        // Provide specific error messages
        if (error.message === 'Invalid login credentials') {
          throw new Error('Email ou mot de passe incorrect. Vérifiez vos informations ou créez un compte.');
        }
        if (error.message?.includes('Email not confirmed')) {
          throw new Error('Votre email n\'a pas été confirmé. Vérifiez votre boîte de réception.');
        }
        if (error.message?.includes('rate limit')) {
          throw new Error('Trop de tentatives. Veuillez patienter quelques minutes.');
        }
        throw error;
      }

      if (data.user) {
        toast.success('Connexion réussie !');
        return { success: true };
      }

      return { success: false, error: 'Erreur de connexion' };
    } catch (error) {
      debugAuth('Sign in error', error);
      toast.error(error.message || 'Erreur de connexion');
      return { success: false, error: error.message };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      debugAuth('Starting Google OAuth', null);
      
      const redirectUrl = `${getAppUrl()}/auth/callback`;
      debugAuth('Redirect URL', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      }

      return { success: false, error: 'Erreur OAuth' };
    } catch (error) {
      debugAuth('Google sign in error', error);
      toast.error(error.message || 'Erreur de connexion avec Google');
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
      debugAuth('Sign out error', error);
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