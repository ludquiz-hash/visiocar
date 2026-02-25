import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '@/components/ui-custom/GlassCard';
import GlassButton from '@/components/ui-custom/GlassButton';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import Sidebar from '@/components/layout/Sidebar';
import { supabase } from '@/lib/supabase.js';

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim =>
    claim.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    claim.vehicle_brand?.toLowerCase().includes(search.toLowerCase()) ||
    claim.vehicle_model?.toLowerCase().includes(search.toLowerCase()) ||
    claim.reference?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <Sidebar />
      
      <main className="lg:ml-64 min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Dossiers</h1>
              <p className="text-white/50 mt-1">
                {claims.length} dossier{claims.length > 1 ? 's' : ''} au total
              </p>
            </div>
            <Link to="/wizard">
              <GlassButton icon={Plus}>
                Nouveau dossier
              </GlassButton>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un dossier..."
                className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
              />
            </div>
          </div>

          {/* Claims List */}
          <GlassCard className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/50">Chargement...</p>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Aucun dossier</h3>
                <p className="text-white/50 mb-4">Commencez par créer un nouveau dossier</p>
                <Link to="/wizard">
                  <GlassButton icon={Plus}>
                    Créer un dossier
                  </GlassButton>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {filteredClaims.map((claim) => (
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
        </div>
      </main>
    </div>
  );
}