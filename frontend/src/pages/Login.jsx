import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signInWithOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const result = await signInWithOtp(email);
    setIsLoading(false);

    if (result.success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#007AFF] mb-2">VisioCar</h1>
            <p className="text-white/50">Expertise automobile intelligente</p>
          </div>

          <div className="bg-[#151921] rounded-2xl p-8 border border-white/[0.06] text-center">
            <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#007AFF]" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Email envoyé !</h2>
            <p className="text-sm text-white/50 mb-4">
              Un lien de connexion a été envoyé à <strong className="text-white">{email}</strong>
            </p>
            <p className="text-xs text-white/30">
              Cliquez sur le lien dans l'email pour vous connecter automatiquement.
            </p>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="w-full mt-6 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              Utiliser un autre email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#007AFF] mb-2">VisioCar</h1>
          <p className="text-white/50">Expertise automobile intelligente</p>
        </div>

        {/* Card */}
        <div className="bg-[#151921] rounded-2xl p-8 border border-white/[0.06]">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Connexion</h2>
            <p className="text-sm text-white/50">
              Entrez votre email pour recevoir un lien de connexion
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50 focus:bg-white/[0.06] transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#007AFF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-white/[0.02] rounded-xl">
            <p className="text-xs text-white/40 text-center">
              💡 Vous recevrez un email avec un lien magique. Cliquez dessus pour vous connecter instantanément.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/30 mt-8">
          En vous connectant, vous acceptez nos{' '}
          <a href="#" className="text-[#007AFF] hover:underline">Conditions d'utilisation</a>
          {' '}et{' '}
          <a href="#" className="text-[#007AFF] hover:underline">Politique de confidentialité</a>
        </p>
      </div>
    </div>
  );
}