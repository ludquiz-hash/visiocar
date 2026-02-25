import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassButton from '@/components/ui-custom/GlassButton';
import GlassCard from '@/components/ui-custom/GlassCard';
import StepIndicator from '@/components/ui-custom/StepIndicator';
import Sidebar from '@/components/layout/Sidebar';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

// Steps
import StepIdentification from '@/components/wizard/StepIdentification';
import StepPhotos from '@/components/wizard/StepPhotos';
import StepAnalysis from '@/components/wizard/StepAnalysis';
import StepRedaction from '@/components/wizard/StepRedaction';
import StepPDF from '@/components/wizard/StepPDF';

const WIZARD_STEPS = [
  { id: 'identification', title: 'Identification', description: 'Client & véhicule' },
  { id: 'photos', title: 'Photos', description: 'Images du sinistre' },
  { id: 'analysis', title: 'Analyse assistée', description: 'Saisie guidée des dégâts' },
  { id: 'redaction', title: 'Rédaction', description: 'Ajustements' },
  { id: 'pdf', title: 'Finalisation', description: 'Rapport PDF' },
];

export default function ClaimWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [claimId, setClaimId] = useState(null);
  const [claimData, setClaimData] = useState({
    // Client
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    // Vehicle
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_vin: '',
    vehicle_license_plate: '',
    // Insurance
    insurance_company: '',
    insurance_policy_number: '',
    claim_number: '',
    // Photos
    photos: [],
    // Analysis
    damage_description: '',
    damage_areas: [],
    estimated_repair_cost: '',
    // Redaction
    expert_notes: '',
    repair_recommendations: '',
    status: 'draft'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    // Save current step data
    await saveClaim();
    
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveClaim = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      if (claimId) {
        // Update existing
        const { error } = await supabase
          .from('claims')
          .update({
            ...claimData,
            updated_at: new Date().toISOString()
          })
          .eq('id', claimId);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('claims')
          .insert([{
            ...claimData,
            user_id: user.id,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        setClaimId(data.id);
      }
    } catch (error) {
      console.error('Error saving claim:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const updateClaimData = (newData) => {
    setClaimData(prev => ({ ...prev, ...newData }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepIdentification data={claimData} onUpdate={updateClaimData} />;
      case 1:
        return <StepPhotos data={claimData} onUpdate={updateClaimData} claimId={claimId} />;
      case 2:
        return <StepAnalysis data={claimData} onUpdate={updateClaimData} />;
      case 3:
        return <StepRedaction data={claimData} onUpdate={updateClaimData} />;
      case 4:
        return <StepPDF data={claimData} claimId={claimId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <Sidebar />
      
      <main className="lg:ml-64 min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard">
              <GlassButton variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </GlassButton>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Nouveau dossier</h1>
              <p className="text-white/50 text-sm">
                Étape {currentStep + 1} sur {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep].title}
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} />

          {/* Step Content */}
          <GlassCard className="p-6 mb-6">
            {renderStep()}
          </GlassCard>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <GlassButton
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Précédent
            </GlassButton>

            <div className="flex items-center gap-3">
              {isSaving && (
                <span className="text-sm text-white/50 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde...
                </span>
              )}
              
              {currentStep === WIZARD_STEPS.length - 1 ? (
                <GlassButton onClick={() => navigate('/dashboard')}>
                  Terminer
                </GlassButton>
              ) : (
                <GlassButton onClick={handleNext}>
                  Suivant
                </GlassButton>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}