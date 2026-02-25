import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Loader2 } from 'lucide-react';
import GlassButton from '@/components/ui-custom/GlassButton';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase.js';

export default function StepPDF({ data, claimId }) {
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const generatePDF = async () => {
    if (!claimId) {
      toast.error('Dossier non sauvegardé');
      return;
    }

    setGenerating(true);
    
    try {
      // Update claim status to completed
      const { error } = await supabase
        .from('claims')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', claimId);

      if (error) throw error;

      // Simulate PDF generation (in real app, call backend)
      setTimeout(() => {
        setPdfUrl(`data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjcyIDcyMCBUZAooUmFwcG9ydCBWaXNpbyBDYXIpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDE1NSAwMDAwMCBuIAowMDAwMDAwMzEwIDAwMDAwIG4gCjAwMDAwMDAzODkgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0NjYKJUlFT0Y=`);
        setGenerating(false);
        toast.success('PDF généré avec succès !');
      }, 2000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `rapport-${data.claim_number || claimId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Téléchargement démarré');
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Finalisation</h3>
        <p className="text-white/50 text-sm">
          Générez le rapport PDF final du dossier.
        </p>
      </div>

      {/* PDF Preview Card */}
      <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.06] text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-[#007AFF]" />
        </div>
        
        <h4 className="text-lg font-semibold text-white mb-2">
          Rapport d'expertise
        </h4>
        
        <p className="text-white/50 text-sm mb-6">
          {data.vehicle_brand} {data.vehicle_model} - {data.client_name}
        </p>

        {pdfUrl ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-[#34C759]">
              <CheckCircle className="w-5 h-5" />
              <span>PDF généré avec succès</span>
            </div>
            <GlassButton onClick={downloadPDF} icon={Download}>
              Télécharger le PDF
            </GlassButton>
          </div>
        ) : (
          <GlassButton 
            onClick={generatePDF} 
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Générer le PDF
              </>
            )}
          </GlassButton>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
        <h4 className="text-sm font-medium text-white mb-3">Contenu du rapport</h4>
        <ul className="text-sm text-white/50 space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#34C759]" />
            Informations client et véhicule
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#34C759]" />
            Photos du sinistre ({(data.photos || []).length})
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#34C759]" />
            Analyse des dommages
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#34C759]" />
            Notes et recommandations de l'expert
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#34C759]" />
            Estimation des réparations
          </li>
        </ul>
      </div>
    </div>
  );
}