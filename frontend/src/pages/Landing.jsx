import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#007AFF]">VisioCar</h1>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#007AFF]/90 transition-colors"
          >
            Connexion
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Expertise automobile
          <span className="text-[#007AFF]"> intelligente</span>
        </h2>
        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10">
          Créez des rapports d'expertise professionnels en quelques minutes. 
          Gérez vos dossiers sinistres avec efficacité.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-4 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#007AFF]/90 transition-colors"
          >
            Essai gratuit
          </Link>
          <Link
            to="/pricing"
            className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Rapports PDF',
              description: 'Générez des rapports professionnels en un clic',
              icon: '📄',
            },
            {
              title: 'Gestion d\'équipe',
              description: 'Collaborez avec votre équipe efficacement',
              icon: '👥',
            },
            {
              title: 'Stockage cloud',
              description: 'Toutes vos photos et documents sécurisés',
              icon: '☁️',
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/50">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}