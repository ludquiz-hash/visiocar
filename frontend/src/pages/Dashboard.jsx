import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimsApi, garageApi } from '../api/index.js';
import { 
  Plus, 
  FileText, 
  Clock, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Components
function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colors = {
    blue: 'text-[#007AFF] bg-[#007AFF]/10',
    green: 'text-[#34C759] bg-[#34C759]/10',
    orange: 'text-[#FF9F0A] bg-[#FF9F0A]/10',
    purple: 'text-[#BF5AF2] bg-[#BF5AF2]/10',
  };

  return (
    <div className="bg-white/[0.03] rounded-xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/50">{title}</p>
      {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-white/10 text-white/60',
    analyzing: 'bg-[#007AFF]/10 text-[#007AFF]',
    review: 'bg-[#FF9F0A]/10 text-[#FF9F0A]',
    completed: 'bg-[#34C759]/10 text-[#34C759]',
    archived: 'bg-white/5 text-white/40',
  };

  const labels = {
    draft: 'Brouillon',
    analyzing: 'En analyse',
    review: 'À vérifier',
    completed: 'Terminé',
    archived: 'Archivé',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  
  const { data: claimsData } = useQuery({
    queryKey: ['claims'],
    queryFn: () => claimsApi.getClaims({ limit: 5 }),
  });

  const { data: usageData } = useQuery({
    queryKey: ['usage'],
    queryFn: () => garageApi.getUsage(),
  });

  const { data: garageData } = useQuery({
    queryKey: ['garage'],
    queryFn: () => garageApi.getGarage(),
  });

  const claims = claimsData?.data || [];
  const usage = usageData?.data;
  const garage = garageData?.data;

  const activeClaims = claims.filter(c => ['draft', 'analyzing', 'review'].includes(c.status));
  const completedClaims = claims.filter(c => c.status === 'completed');
  const totalHoursSaved = completedClaims.reduce((acc, c) => {
    const hours = c.ai_report?.total_hours || 0;
    return acc + (hours * 0.3);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Bonjour ! 👋
          </h1>
          <p className="text-white/50 mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>
        <Link
          to="/wizard"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#007AFF]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau dossier
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Dossiers en cours"
          value={activeClaims.length}
          icon={FileText}
          color="blue"
          subtitle="À traiter"
        />
        <StatCard
          title="Ce mois"
          value={usage?.claims_created || 0}
          icon={Calendar}
          color="purple"
          subtitle={garage?.plan_type === 'starter' ? '/ 15 max' : 'Illimité'}
        />
        <StatCard
          title="Temps estimé gagné"
          value={`${Math.round(totalHoursSaved)}h`}
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Dossiers terminés"
          value={completedClaims.length}
          icon={CheckCircle2}
          color="orange"
          subtitle="Total"
        />
      </div>

      {/* Recent Claims */}
      <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Dossiers récents</h2>
          <Link 
            to="/claims"
            className="text-sm text-[#007AFF] hover:text-[#007AFF]/80 flex items-center gap-1 transition-colors"
          >
            Voir tout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {claims.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Aucun dossier</p>
            <Link
              to="/wizard"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-[#007AFF]/90"
            >
              <Plus className="w-4 h-4" />
              Créer un dossier
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {claims.slice(0, 5).map((claim) => (
              <Link
                key={claim.id}
                to={`/claims/${claim.id}`}
                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-[#007AFF]">
                    {claim.vehicle_data?.brand?.charAt(0) || 'V'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">
                      {claim.vehicle_data?.brand || 'Véhicule'} {claim.vehicle_data?.model || ''}
                    </p>
                    {claim.reference && (
                      <span className="text-xs text-white/40">#{claim.reference}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-white/50">
                      {claim.client_data?.name || 'Client non défini'}
                    </span>
                    <span className="text-xs text-white/30">
                      {format(new Date(claim.created_at), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>

                <StatusBadge status={claim.status} />
                <ArrowRight className="w-4 h-4 text-white/20" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}