import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

export default function StepRedaction({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Rédaction du rapport</h3>
        <p className="text-white/50 text-sm">
          Ajoutez vos notes et recommandations d'expert.
        </p>
      </div>

      {/* Expert Notes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[#007AFF]" />
          <h4 className="text-sm font-medium text-white">Notes de l'expert</h4>
        </div>
        <textarea
          value={data.expert_notes || ''}
          onChange={(e) => handleChange('expert_notes', e.target.value)}
          placeholder="Notes et observations de l'expert..."
          rows={6}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50 resize-none"
        />
      </div>

      {/* Repair Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-[#34C759]" />
          <h4 className="text-sm font-medium text-white">Recommandations de réparation</h4>
        </div>
        <textarea
          value={data.repair_recommendations || ''}
          onChange={(e) => handleChange('repair_recommendations', e.target.value)}
          placeholder="Recommandations pour les réparations..."
          rows={4}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50 resize-none"
        />
      </div>

      {/* Summary */}
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
        <h4 className="text-sm font-medium text-white mb-3">Résumé du dossier</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Client:</span>
            <span className="text-white">{data.client_name || 'Non renseigné'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Véhicule:</span>
            <span className="text-white">{data.vehicle_brand} {data.vehicle_model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Zones endommagées:</span>
            <span className="text-white">{(data.damage_areas || []).join(', ') || 'Aucune'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Coût estimé:</span>
            <span className="text-white">{data.estimated_repair_cost ? `${data.estimated_repair_cost} €` : 'Non estimé'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Photos:</span>
            <span className="text-white">{(data.photos || []).length} photo(s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}