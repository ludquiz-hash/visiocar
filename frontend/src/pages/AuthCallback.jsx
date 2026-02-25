import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthCallback() {
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('[AuthCallback] Starting callback handling...');
      console.log('[AuthCallback] Current URL:', window.location.href);
      
      try {
        // Check for error in URL
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('[AuthCallback] Error in URL:', error, errorDescription);
          setStatus('error');
          setErrorMessage(decodeURIComponent(errorDescription || 'Authentication failed'));
          return;
        }

        // Check for access_token in URL hash (magic link format: #access_token=...)
        const hash = window.location.hash;
        console.log('[AuthCallback] URL hash:', hash);
        
        if (hash && hash.includes('access_token=')) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          console.log('[AuthCallback] Found access_token in hash');
          
          if (accessToken) {
            const { data, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (setSessionError) {
              console.error('[AuthCallback] setSession error:', setSessionError);
              throw setSessionError;
            }
            
            if (data?.session?.user) {
              console.log('[AuthCallback] Session set successfully for:', data.session.user.email);
              setStatus('success');
              setTimeout(() => navigate('/dashboard'), 1500);
              return;
            }
          }
        }

        // Get the session (Supabase automatically handles the token in the URL)
        console.log('[AuthCallback] Getting session from Supabase...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          throw sessionError;
        }
        
        if (session?.user) {
          console.log('[AuthCallback] Session found, user:', session.user.email);
          setStatus('success');
          
          // Short delay to show success message
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          // Try to exchange the code for a session
          console.log('[AuthCallback] No session, checking for code...');
          const code = searchParams.get('code');
          
          if (code) {
            console.log('[AuthCallback] Exchanging code for session...');
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('[AuthCallback] Code exchange error:', exchangeError);
              throw exchangeError;
            }
            
            // Check session again
            const { data: { session: newSession } } = await supabase.auth.getSession();
            if (newSession?.user) {
              console.log('[AuthCallback] Session obtained after exchange');
              setStatus('success');
              setTimeout(() => navigate('/dashboard'), 1500);
              return;
            }
          }
          
          console.log('[AuthCallback] No session available');
          setStatus('error');
          setErrorMessage('Session non trouvée. Vérifiez que vous utilisez le bon lien et qu\'il n\'a pas expiré.');
        }
      } catch (err) {
        console.error('[AuthCallback] Exception:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Erreur de connexion');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#007AFF] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connexion en cours...</h2>
          <p className="text-white/60">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connexion réussie !</h2>
          <p className="text-white/60">Redirection vers le tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Erreur de connexion</h2>
        <p className="text-white/60 mb-6">{errorMessage}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#007AFF]/90 transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}