import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthCallback() {
  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AuthCallback] Starting...');
      console.log('[AuthCallback] URL:', window.location.href);
      
      try {
        // Check for errors in URL
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        
        if (error) {
          console.error('[AuthCallback] Error in URL:', error, errorDescription);
          setStatus('error');
          setErrorMessage(decodeURIComponent(errorDescription || 'Authentication failed'));
          return;
        }

        // Exchange the code for a session (OAuth flow)
        const code = params.get('code');
        
        if (code) {
          console.log('[AuthCallback] Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('[AuthCallback] Exchange error:', exchangeError);
            throw exchangeError;
          }
          
          if (data?.session) {
            console.log('[AuthCallback] Session obtained:', data.session.user?.email);
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 1000);
            return;
          }
        }

        // Check if we already have a session (from hash or previous OAuth)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          throw sessionError;
        }
        
        if (session?.user) {
          console.log('[AuthCallback] Existing session found:', session.user.email);
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 1000);
          return;
        }

        // No session found
        console.log('[AuthCallback] No session available');
        setStatus('error');
        setErrorMessage('Session non trouvée. Veuillez réessayer.');
        
      } catch (err) {
        console.error('[AuthCallback] Exception:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Erreur de connexion');
      }
    };

    handleCallback();
  }, [navigate]);

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