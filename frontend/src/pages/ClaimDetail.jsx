import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimsApi } from '../api/index.js';
import { ArrowLeft, Download, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: claimData, isLoading } = useQuery({
    queryKey: ['claim', id],
    queryFn: () => claimsApi.getClaim(id),
  });

  const generatePDFMutation = useMutation({
    mutationFn: () => claimsApi.generatePDF(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim', id] });
      toast.success('PDF généré avec succès !');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la génération du PDF');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => claimsApi.deleteClaim(id),
    onSuccess: () => {
      toast.success('Dossier supprimé');
      navigate('/claims');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  const claim = claimData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">Dossier introuvable</p>
        <Link to="/claims" className="text-[#007AFF] hover:underline mt-2 inline-block">
          Retour aux dossiers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/claims" className="p-2 rounded-lg hover:bg-white/10 text-white/60">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">
            {claim.vehicle_data?.brand} {claim.vehicle_data?.model}
          </h1>
          <p className="text-white/50">#{claim.reference}</p>
        </div>
        <div className="flex gap-2">
          {claim.pdf_url ? (
            <a
              href={claim.pdf_url}
              download
              className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#007AFF]/90"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </a>
          ) : (
            <button
              onClick={() => generatePDFMutation.mutate()}
              disabled={generatePDFMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#007AFF]/90 disabled:opacity-50"
            >
              {generatePDFMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Générer PDF
            </button>
          )}
          {claim.status === 'draft' && (
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-medium hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vehicle Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white mb-4">Véhicule</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Marque', value: claim.vehicle_data?.brand },
                { label: 'Modèle', value: claim.vehicle_data?.model },
                { label: 'Année', value: claim.vehicle_data?.year },
                { label: 'Plaque', value: claim.vehicle_data?.plate },
                { label: 'VIN', value: claim.vehicle_data?.vin },
                { label: 'Couleur', value: claim.vehicle_data?.color },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-white/40 mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-white">{item.value || '-'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Damages */}
          {claim.ai_report?.damages?.length > 0 && (
            <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white mb-4">
                Dommages ({claim.ai_report.damages.length})
              </h2>
              <div className="space-y-3">
                {claim.ai_report.damages.map((damage, idx) => (
                  <div key={idx} className="p-4 bg-white/[0.02] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{damage.zone}</span>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${damage.severity === 'importante' ? 'bg-red-500/10 text-red-500' :
                          damage.severity === 'legere' ? 'bg-green-500/10 text-green-500' :
                          'bg-yellow-500/10 text-yellow-500'}
                      `}>
                        {damage.severity}
                      </span>
                    </div>
                    <p className="text-sm text-white/60">{damage.description}</p>
                    <p className="text-sm text-[#007AFF] mt-1">{damage.estimated_hours}h estimées</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {claim.images?.length > 0 && (
            <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {claim.images.map((image, idx) => (
                  <a
                    key={idx}
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video rounded-lg overflow-hidden bg-white/[0.04] hover:opacity-80 transition-opacity"
                  >
                    <img src={image.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client */}
          <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white mb-4">Client</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/40 mb-1">Nom</p>
                <p className="text-sm font-medium text-white">{claim.client_data?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Email</p>
                <p className="text-sm text-white/70">{claim.client_data?.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Téléphone</p>
                <p className="text-sm text-white/70">{claim.client_data?.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Insurance */}
          {claim.insurance_details?.company && (
            <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white mb-4">Assurance</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/40 mb-1">Compagnie</p>
                  <p className="text-sm font-medium text-white">{claim.insurance_details.company}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">N° sinistre</p>
                  <p className="text-sm text-white/70">{claim.insurance_details.claim_number || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}