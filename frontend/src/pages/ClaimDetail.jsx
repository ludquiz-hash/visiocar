import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '@/components/ui-custom/GlassCard';
import GlassButton from '@/components/ui-custom/GlassButton';
import StatusBadge from '@/components/ui-custom/StatusBadge';
import Sidebar from '@/components/layout/Sidebar';
import { supabase } from '@/lib/supabase.js';
import { toast } from 'sonner';

export default function ClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const fetchClaim = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setClaim(data);
    } catch (error) {
      console.error('Error fetching claim:', error);
      toast.error('Dossier non trouvé');
      navigate('/claims');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) return;

    try {
      const { error } = await supabase
        .from('claims')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Dossier supprimé');
      navigate('/claims');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!claim) return null;

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <Sidebar />
      
      <main className="lg:ml-64 min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/claims">
              <GlassButton variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </GlassButton>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {claim.vehicle_brand} {claim.vehicle_model}
              </h1>
              <p className="text-white/50 text-sm">
                Dossier #{claim.reference || claim.id.slice(0, 8)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/wizard?edit=${claim.id}`}>
                <GlassButton variant="secondary" size="sm" icon={Edit}>
                  Modifier
                </GlassButton>
              </Link>
              <GlassButton variant="ghost" size="sm" icon={Trash2} onClick={handleDelete}>
                Supprimer
              </GlassButton>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <StatusBadge status={claim.status} />
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Client Info */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Informations client</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/50">Nom:</span>
                  <p className="text-white">{claim.client_name || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-white/50">Email:</span>
                  <p className="text-white">{claim.client_email || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-white/50">Téléphone:</span>
                  <p className="text-white">{claim.client_phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-white/50">Adresse:</span>
                  <p className="text-white">{claim.client_address || 'Non renseigné'}</p>
                </div>
              </div>
            </GlassCard>

            {/* Vehicle Info */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Véhicule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/50">Marque:</span>
                  <p className="text-white">{claim.vehicle_brand || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-white/50">Modèle:</span>
                  <p className="text-white">{claim.vehicle_model || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-white/50">Année:</span>
                  <p className="text-white">{claim.vehicle_year || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-white/50">Immatriculation:</span>
                  <p className="text-white">{claim.vehicle_license_plate || 'Non renseigné'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-white/50">VIN:</span>
                  <p className="text-white">{claim.vehicle_vin || 'Non renseigné'}</p>
                </div>
              </div>
            </GlassCard>

            {/* Photos */}
            {claim.photos && claim.photos.length > 0 && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Photos ({claim.photos.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {claim.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Analysis */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Analyse</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-white/50">Zones endommagées:</span>
                  <p className="text-white">{(claim.damage_areas || []).join(', ') || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-white/50">Description:</span>
                  <p className="text-white">{claim.damage_description || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-white/50">Coût estimé:</span>
                  <p className="text-white">{claim.estimated_repair_cost ? `${claim.estimated_repair_cost} €` : 'Non estimé'}</p>
                </div>
              </div>
            </GlassCard>

            {/* Expert Notes */}
            {(claim.expert_notes || claim.repair_recommendations) && (
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Notes de l'expert</h2>
                <div className="space-y-4 text-sm">
                  {claim.expert_notes && (
                    <div>
                      <span className="text-white/50">Observations:</span>
                      <p className="text-white">{claim.expert_notes}</p>
                    </div>
                  )}
                  {claim.repair_recommendations && (
                    <div>
                      <span className="text-white/50">Recommandations:</span>
                      <p className="text-white">{claim.repair_recommendations}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}