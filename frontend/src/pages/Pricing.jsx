import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Building2, ArrowLeft } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 69,
    description: 'Parfait pour les petits garages',
    icon: Zap,
    features: [
      '15 dossiers par mois',
      'Export PDF',
      'Stockage illimité',
      'Support email',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 199,
    description: 'Pour les garages professionnels',
    icon: Building2,
    popular: true,
    features: [
      'Dossiers illimités',
      'Export PDF',
      'Stockage illimité',
      'Support prioritaire',
      'API access',
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-[#007AFF]">VisioCar</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Tarifs simples et transparents</h2>
          <p className="text-xl text-white/50">Choisissez le plan adapté à vos besoins</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`
                  relative p-8 rounded-2xl border transition-colors
                  ${plan.popular 
                    ? 'bg-[#007AFF]/5 border-[#007AFF]/30' 
                    : 'bg-white/[0.03] border-white/[0.06]'}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#007AFF] text-white text-sm font-medium rounded-full">
                    Recommandé
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-[#007AFF]/10">
                    <Icon className="w-8 h-8 text-[#007AFF]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-white/50 text-sm">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}€</span>
                  <span className="text-white/50">/mois</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-white/70">
                      <CheckCircle className="w-5 h-5 text-[#34C759]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  className={`
                    block w-full py-3 text-center rounded-xl font-medium transition-colors
                    ${plan.popular
                      ? 'bg-[#007AFF] text-white hover:bg-[#007AFF]/90'
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}
                  `}
                >
                  Commencer l'essai gratuit
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/40">
            Essai gratuit de 5 jours. Aucune carte de crédit requise.
          </p>
        </div>
      </div>
    </div>
  );
}