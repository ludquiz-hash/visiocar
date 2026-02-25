import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { claimsApi } from '../api/index.js';
import { Plus, Search, FileText } from 'lucide-react';

export default function Claims() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: claimsData, isLoading } = useQuery({
    queryKey: ['claims'],
    queryFn: () => claimsApi.getClaims({ limit: 100 }),
  });

  const claims = claimsData?.data || [];

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = !searchTerm || 
      claim.vehicle_data?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.vehicle_data?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.client_data?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: claims.length,
    draft: claims.filter(c => c.status === 'draft').length,
    analyzing: claims.filter(c => c.status === 'analyzing').length,
    completed: claims.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dossiers</h1>
          <p className="text-white/50 mt-1">{stats.total} dossier{stats.total > 1 ? 's' : ''} au total</p>
        </div>
        <Link
          to="/wizard"
          className="inline-flex items-center gap-2 px-4 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#007AFF]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau dossier
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Brouillons', value: stats.draft },
          { label: 'En analyse', value: stats.analyzing },
          { label: 'Terminés', value: stats.completed },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-white/40 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#007AFF]/50"
        >
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillons</option>
          <option value="analyzing">En analyse</option>
          <option value="review">À vérifier</option>
          <option value="completed">Terminés</option>
        </select>
      </div>

      {/* Claims List */}
      <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/50">Chargement...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Aucun dossier trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredClaims.map((claim) => (
              <Link
                key={claim.id}
                to={`/claims/${claim.id}`}
                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-[#007AFF]">
                    {claim.vehicle_data?.brand?.charAt(0) || 'V'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {claim.vehicle_data?.brand} {claim.vehicle_data?.model}
                  </p>
                  <p className="text-sm text-white/50">
                    {claim.client_data?.name || 'Client non défini'} • #{claim.reference}
                  </p>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${claim.status === 'completed' ? 'bg-[#34C759]/10 text-[#34C759]' : 
                    claim.status === 'draft' ? 'bg-white/10 text-white/60' :
                    claim.status === 'analyzing' ? 'bg-[#007AFF]/10 text-[#007AFF]' :
                    'bg-[#FF9F0A]/10 text-[#FF9F0A]'}
                `}>
                  {claim.status === 'completed' ? 'Terminé' :
                   claim.status === 'draft' ? 'Brouillon' :
                   claim.status === 'analyzing' ? 'En analyse' : 'À vérifier'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}