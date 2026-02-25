import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { garageApi } from '../api/index.js';
import { Building2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GarageSettings() {
  const queryClient = useQueryClient();
  
  const { data: garageData, isLoading } = useQuery({
    queryKey: ['garage'],
    queryFn: () => garageApi.getGarage(),
  });

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    company_phone: '',
    company_email: '',
  });

  React.useEffect(() => {
    if (garageData?.data) {
      setFormData({
        name: garageData.data.name || '',
        company_name: garageData.data.company_name || '',
        company_phone: garageData.data.company_phone || '',
        company_email: garageData.data.company_email || '',
      });
    }
  }, [garageData]);

  const updateMutation = useMutation({
    mutationFn: (data) => garageApi.updateGarage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garage'] });
      toast.success('Paramètres mis à jour');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Paramètres</h1>
        <p className="text-white/50 mt-1">Configurez votre garage</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06] space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-[#007AFF]/10">
            <Building2 className="w-6 h-6 text-[#007AFF]" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Informations du garage</h2>
            <p className="text-sm text-white/50">Ces informations apparaîtront sur vos rapports PDF</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-white/60 mb-2">Nom du garage *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Nom de l'entreprise</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Téléphone</label>
            <input
              type="tel"
              value={formData.company_phone}
              onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <input
              type="email"
              value={formData.company_email}
              onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/[0.06]">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#007AFF]/90 disabled:opacity-50 transition-colors"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}