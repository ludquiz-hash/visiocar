import React from 'react';
import { AlertTriangle, Wrench, DollarSign } from 'lucide-react';

const DAMAGE_AREAS = [
  'Avant', 'Arrière', 'Côté gauche', 'Côté droit', 
  'Toit', 'Capot', 'Coffre', 'Portes', 'Pare-brise'
];

export default function StepAnalysis({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const toggleDamageArea = (area) => {
    const current = data.damage_areas || [];
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    onUpdate({ damage_areas: updated });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Analyse des dommages</h3>
        <p className="text-white/50 text-sm">
          Décrivez les dommages observés sur le véhicule.
        </p>
      </div>

      {/* Damage Areas */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#FF9F0A]" />
          <h4 className="text-sm font-medium text-white">Zones endommagées</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAMAGE_AREAS.map((area) => (
            <button
              key={area}
              onClick={() => toggleDamageArea(area)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                (data.damage_areas || []).includes(area)
                  ? 'bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30'
                  : 'bg-white/[0.04] text-white/60 border border-white/[0.08] hover:bg-white/[0.08]'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Damage Description */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#007AFF]" />
          <h4 className="text-sm font-medium text-white">Description des dommages</h4>
        </div>
        <textarea
          value={data.damage_description || ''}
          onChange={(e) => handleChange('damage_description', e.target.value)}
          placeholder="Décrivez en détail les dommages observés..."
          rows={5}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50 resize-none"
        />
      </div>

      {/* Repair Estimate */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-[#34C759]" />
          <h4 className="text-sm font-medium text-white">Estimation des réparations</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Coût estimé (€)</label>
            <input
              type="number"
              value={data.estimated_repair_cost || ''}
              onChange={(e) => handleChange('estimated_repair_cost', e.target.value)}
              placeholder="2500"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Heures de main d'œuvre estimées</label>
            <input
              type="number"
              value={data.estimated_labor_hours || ''}
              onChange={(e) => handleChange('estimated_labor_hours', e.target.value)}
              placeholder="8"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
        </div>
      </div>

      {/* AI Analysis Note */}
      <div className="bg-[#007AFF]/10 rounded-xl p-4 border border-[#007AFF]/20">
        <div className="flex items-start gap-3">
          <Wrench className="w-5 h-5 text-[#007AFF] mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Analyse assistée par IA</h4>
            <p className="text-sm text-white/60">
              Notre système d'analyse automatique peut aider à identifier les dommages à partir des photos uploadées. 
              Cette fonctionnalité sera disponible prochainement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}