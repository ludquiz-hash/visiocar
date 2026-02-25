import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import GlassButton from '@/components/ui-custom/GlassButton';

const plans = [
  {
    name: 'Starter',
    price: '69',
    description: 'Parfait pour débuter',
    features: [
      '15 dossiers par mois',
      'Rapports PDF',
      'Stockage photos 5GB',
      'Support email',
    ],
    cta: 'Commencer',
    highlighted: false,
  },
  {
    name: 'Business',
    price: '199',
    description: 'Pour les experts actifs',
    features: [
      'Dossiers illimités',
      'Rapports PDF avancés',
      'Stockage photos illimité',
      'Support prioritaire',
      'API d\'intégration',
    ],
    cta: 'Choisir Business',
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Tarifs simples et transparents
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. 
            Essai gratuit de 14 jours sans engagement.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-[#007AFF]/20 to-transparent border-2 border-[#007AFF]/50'
                  : 'bg-[#151921] border border-white/[0.06]'
              }`}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/50">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold text-white">{plan.price}€</span>
                <span className="text-white/50">/mois</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#34C759]" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <GlassButton 
                  variant={plan.highlighted ? 'primary' : 'secondary'}
                  className="w-full justify-center"
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </Link>
            </div>
          ))}
        </div>

        {/* Back */}
        <div className="text-center mt-12">
          <Link to="/" className="text-white/50 hover:text-white">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}