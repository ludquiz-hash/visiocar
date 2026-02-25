import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimsApi, storageApi } from '../api/index.js';
import { ArrowRight, ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const carBrands = [
  'Audi', 'BMW', 'Citroën', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai',
  'Kia', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault',
  'Seat', 'Škoda', 'Toyota', 'Volkswagen', 'Volvo', 'Autre'
];

const insurers = [
  'AXA', 'Allianz', 'Ethias', 'AG Insurance', 'Belfius', 'Groupama',
  'Swiss Life', 'Zurich', 'Autre'
];

export default function ClaimWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_plate: '',
    vehicle_vin: '',
    vehicle_color: '',
    insurance_company: '',
    insurance_claim: '',
    accident_date: '',
    images: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => claimsApi.createClaim(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success('Dossier créé avec succès !');
      navigate(`/claims/${response.data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la création');
      setIsSubmitting(false);
    },
  });

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      submitClaim();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const submitClaim = () => {
    setIsSubmitting(true);
    
    const claimData = {
      client_data: {
        name: formData.client_name,
        email: formData.client_email,
        phone: formData.client_phone,
      },
      vehicle_data: {
        brand: formData.vehicle_brand,
        model: formData.vehicle_model,
        year: formData.vehicle_year ? parseInt(formData.vehicle_year) : null,
        plate: formData.vehicle_plate,
        vin: formData.vehicle_vin,
        color: formData.vehicle_color,
      },
      insurance_details: {
        company: formData.insurance_company,
        claim_number: formData.insurance_claim,
        accident_date: formData.accident_date,
      },
      images: formData.images,
    };

    createMutation.mutate(claimData);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const uploadPromises = files.map(async (file) => {
      try {
        const path = `claims/${Date.now()}-${file.name}`;
        const url = await storageApi.uploadFile('claim-photos', path, file);
        return { url, name: file.name };
      } catch (error) {
        toast.error(`Erreur upload ${file.name}`);
        return null;
      }
    });

    const uploaded = (await Promise.all(uploadPromises)).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploaded].slice(0, 6),
    }));
  };

  const removeImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const steps = ['Identification', 'Photos', 'Récapitulatif'];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {id ? 'Modifier le dossier' : 'Nouveau dossier'}
        </h1>
        <p className="text-white/50 mt-1">
          Créez un rapport d'expertise en quelques étapes
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${i === step ? 'bg-[#007AFF] text-white' :
                i < step ? 'bg-[#34C759] text-white' :
                'bg-white/10 text-white/40'}
            `}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'text-white' : 'text-white/40'}`}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-white/10 mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Steps */}
      <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]">
        {step === 0 && (
          <div className="space-y-6">
            {/* Client Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Informations client</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Nom complet *</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                    placeholder="jean@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                    placeholder="+32 470 12 34 56"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Véhicule</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Marque *</label>
                  <select
                    value={formData.vehicle_brand}
                    onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#007AFF]/50"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {carBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Modèle *</label>
                  <input
                    type="text"
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                    placeholder="Golf"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Année</label>
                  <input
                    type="number"
                    value={formData.vehicle_year}
                    onChange={(e) => setFormData({ ...formData, vehicle_year: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                    placeholder="2022"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Plaque</label>
                  <input
                    type="text"
                    value={formData.vehicle_plate}
                    onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                    placeholder="1-ABC-123"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">VIN</label>
                  <input
                    type="text"
                    value={formData.vehicle_vin}
                    onChange={(e) => setFormData({ ...formData, vehicle_vin: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                    placeholder="WVWZZZ..."
                    maxLength={17}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Couleur</label>
                  <input
                    type="text"
                    value={formData.vehicle_color}
                    onChange={(e) => setFormData({ ...formData, vehicle_color: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                    placeholder="Noir"
                  />
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Assurance</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Compagnie</label>
                  <select
                    value={formData.insurance_company}
                    onChange={(e) => setFormData({ ...formData, insurance_company: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#007AFF]/50"
                  >
                    <option value="">Sélectionner...</option>
                    {insurers.map(insurer => (
                      <option key={insurer} value={insurer}>{insurer}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">N° sinistre</label>
                  <input
                    type="text"
                    value={formData.insurance_claim}
                    onChange={(e) => setFormData({ ...formData, insurance_claim: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
                    placeholder="SIN-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Date du sinistre</label>
                  <input
                    type="date"
                    value={formData.accident_date}
                    onChange={(e) => setFormData({ ...formData, accident_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#007AFF]/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Photos du véhicule</h3>
            
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#007AFF]/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-white/40 mb-4" />
                <p className="text-white font-medium">Cliquez pour ajouter des photos</p>
                <p className="text-sm text-white/40 mt-1">Maximum 6 photos</p>
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-white/[0.04]">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded text-white hover:bg-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Récapitulatif</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] rounded-lg">
                <p className="text-sm text-white/40 mb-1">Client</p>
                <p className="text-white font-medium">{formData.client_name || 'Non renseigné'}</p>
                <p className="text-sm text-white/60">{formData.client_email}</p>
              </div>
              
              <div className="p-4 bg-white/[0.02] rounded-lg">
                <p className="text-sm text-white/40 mb-1">Véhicule</p>
                <p className="text-white font-medium">
                  {formData.vehicle_brand} {formData.vehicle_model}
                </p>
                <p className="text-sm text-white/60">
                  {formData.vehicle_year} • {formData.vehicle_plate}
                </p>
              </div>
              
              <div className="p-4 bg-white/[0.02] rounded-lg">
                <p className="text-sm text-white/40 mb-1">Photos</p>
                <p className="text-white">{formData.images.length} photo{formData.images.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.06]">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <button
            onClick={handleNext}
            disabled={isSubmitting || (step === 0 && !formData.client_name)}
            className="flex items-center gap-2 px-6 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#007AFF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : step === 2 ? (
              'Créer le dossier'
            ) : (
              <>
                Continuer
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}