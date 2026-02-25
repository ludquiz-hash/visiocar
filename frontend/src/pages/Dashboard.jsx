import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Plus, FileText, Calendar, Clock, CheckCircle2, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '@/components/ui-custom/GlassCard';
import GlassButton from '@/components/ui-custom/GlassButton';
import StatCard from '@/components/ui-custom/StatCard';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import EmptyState from '@/components/ui-custom/EmptyState';
import Sidebar from '@/components/layout/Sidebar';
import { supabase } from '@/lib/supabase.js';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    monthly: 0,
    completed: 0,
    hoursSaved: 0
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const claimsData = data || [];
      setClaims(claimsData);

      // Calculate stats
      const activeClaims = claimsData.filter(c => ['draft', 'analyzing', 'review'].includes(c.status));
      const completedClaims = claimsData.filter(c => c.status === 'completed');
      const totalHours = completedClaims.reduce((acc, c) => acc + (c.hours_saved || 0), 0);
      
      // Count this month's claims
      const now = new Date();
      const monthlyClaims = claimsData.filter(c => {
        const created = new Date(c.created_at);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      });

      setStats({
        active: activeClaims.length,
        monthly: monthlyClaims.length,
        completed: completedClaims.length,
        hoursSaved: Math.round(totalHours)
      });
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentClaims = claims.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <Sidebar />
      
      <main className="lg:ml-64 min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Bonjour, {profile?.full_name?.split(' ')[0] || 'Bienvenue'} 👋
              </h1>
              <p className="text-white/50 mt-1">
                Voici un aperçu de votre activité
              </p>
            </div>
            <Link to="/wizard">
              <GlassButton icon={Plus}>
                Nouveau dossier
              </GlassButton>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Dossiers en cours"
              value={stats.active}
              icon={FileText}
              color="blue"
              subtitle="À traiter"
            />
            <StatCard
              title="Ce mois"
              value={stats.monthly}
              icon={Calendar}
              color="purple"
              subtitle="Créés"
            />
            <StatCard
              title="Temps estimé gagné"
              value={`${stats.hoursSaved}h`}
              icon={Clock}
              color="green"
              trend="up"
              trendValue="+12%"
            />
            <StatCard
              title="Dossiers terminés"
              value={stats.completed}
              icon={CheckCircle2}
              color="orange"
              subtitle="Total"
            />
          </div>

          {/* Recent Claims */}
          <GlassCard className="overflow-hidden">
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

            {loading ? (
              <div className="p-5 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-white/5 animate-pulse rounded" />
                      <div className="h-3 w-32 bg-white/5 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentClaims.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucun dossier"
                description="Créez votre premier dossier d'expertise pour commencer à utiliser l'analyse automatique."
                action={() => window.location.href = '/wizard'}
                actionLabel="Créer un dossier"
              />
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {recentClaims.map((claim) => (
                  <Link
                    key={claim.id}
                    to={`/claims/${claim.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Vehicle Icon */}
                    <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-[#007AFF]">
                        {claim.vehicle_brand?.charAt(0) || 'V'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">
                          {claim.vehicle_brand || 'Véhicule'} {claim.vehicle_model || ''}
                        </p>
                        {claim.reference && (
                          <span className="text-xs text-white/40">#{claim.reference}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-white/50">
                          {claim.client_name || 'Client non défini'}
                        </span>
                        <span className="text-xs text-white/30">
                          {format(new Date(claim.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <StatusBadge status={claim.status} />

                    <ArrowRight className="w-4 h-4 text-white/20" />
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer" hover>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#007AFF]/10">
                  <Zap className="w-6 h-6 text-[#007AFF]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Analyse rapide</h3>
                  <p className="text-sm text-white/50 mb-4">
                    Téléchargez des photos et obtenez une analyse automatique en quelques secondes
                  </p>
                  <Link to="/wizard">
                    <GlassButton variant="secondary" size="sm">
                      Démarrer
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer" hover>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#34C759]/10">
                  <TrendingUp className="w-6 h-6 text-[#34C759]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Statistiques avancées</h3>
                  <p className="text-sm text-white/50 mb-4">
                    Suivez vos performances et optimisez votre productivité
                  </p>
                  <Link to="/claims">
                    <GlassButton variant="secondary" size="sm">
                      Voir les rapports
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}