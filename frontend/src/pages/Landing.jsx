import React from 'react';
import { Link } from 'react-router-dom';
import { Car, FileText, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import GlassButton from '@/components/ui-custom/GlassButton';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#0056CC] flex items-center justify-center shadow-lg shadow-[#007AFF]/20">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">VisiWebCar</h1>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Expertise automobile<br />
              <span className="text-[#007AFF]">intelligente</span>
            </h2>
            
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Créez des rapports d'expertise professionnels en quelques minutes. 
              Gérez vos dossiers sinistres avec efficacité.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <GlassButton size="lg">
                  Essai gratuit
                  <ArrowRight className="w-5 h-5" />
                </GlassButton>
              </Link>
              <Link to="/login">
                <GlassButton variant="secondary" size="lg">
                  Se connecter
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#151921] rounded-2xl p-6 border border-white/[0.06]">
            <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#007AFF]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Rapports PDF</h3>
            <p className="text-white/50">
              Générez des rapports professionnels en un clic
            </p>
          </div>

          <div className="bg-[#151921] rounded-2xl p-6 border border-white/[0.06]">
            <div className="w-12 h-12 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#34C759]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Gestion d'équipe</h3>
            <p className="text-white/50">
              Collaborez avec votre équipe efficacement
            </p>
          </div>

          <div className="bg-[#151921] rounded-2xl p-6 border border-white/[0.06]">
            <div className="w-12 h-12 rounded-xl bg-[#FF9F0A]/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-[#FF9F0A]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Stockage cloud</h3>
            <p className="text-white/50">
              Toutes vos photos et documents sécurisés
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-[#007AFF]/20 to-[#BF5AF2]/20 rounded-3xl p-12 text-center border border-white/[0.06]">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Rejoignez des experts automobile qui gagnent du temps chaque jour.
          </p>
          <Link to="/register">
            <GlassButton size="lg">
              Créer un compte gratuit
              <ArrowRight className="w-5 h-5" />
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © 2024 VisiWebCar. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/pricing" className="text-white/40 hover:text-white text-sm">
                Tarifs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}