import React, { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase.js';
import { toast } from 'sonner';

export default function StepPhotos({ data, onUpdate, claimId }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    if (!claimId) {
      toast.error('Veuillez d\'abord remplir les informations client et véhicule');
      return;
    }

    setUploading(true);
    
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${claimId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('claim-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('claim-photos')
          .getPublicUrl(fileName);

        // Add to claim data
        const newPhoto = {
          url: publicUrl,
          name: file.name,
          uploaded_at: new Date().toISOString()
        };
        
        onUpdate({ 
          photos: [...(data.photos || []), newPhoto] 
        });

        toast.success(`Photo ${file.name} uploadée`);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Erreur lors de l'upload de ${file.name}`);
      }
    }
    
    setUploading(false);
  };

  const removePhoto = async (index) => {
    const photo = data.photos[index];
    
    try {
      // Extract filename from URL
      const fileName = photo.url.split('/').pop();
      
      // Delete from storage
      await supabase.storage
        .from('claim-photos')
        .remove([`${claimId}/${fileName}`]);

      // Update local state
      const newPhotos = [...data.photos];
      newPhotos.splice(index, 1);
      onUpdate({ photos: newPhotos });
      
      toast.success('Photo supprimée');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Photos du sinistre</h3>
        <p className="text-white/50 text-sm mb-4">
          Ajoutez des photos du véhicule et des dommages. Formats acceptés: JPG, PNG.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="relative">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center hover:border-[#007AFF]/50 hover:bg-[#007AFF]/5 transition-colors">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin mb-2" />
              <p className="text-white/60">Upload en cours...</p>
            </div>
          ) : (
            <>
              <Camera className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">Cliquez ou glissez des photos ici</p>
              <p className="text-white/40 text-sm">JPG, PNG jusqu'à 10MB</p>
            </>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      {data.photos && data.photos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-3">
            {data.photos.length} photo{data.photos.length > 1 ? 's' : ''} uploadée{data.photos.length > 1 ? 's' : ''}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-xl bg-white/5"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
        <h4 className="text-sm font-medium text-white mb-2">Conseils pour de bonnes photos</h4>
        <ul className="text-sm text-white/50 space-y-1">
          <li>• Photographiez le véhicule sous plusieurs angles</li>
          <li>• Prenez des photos rapprochées des dommages</li>
          <li>• Assurez un bon éclairage</li>
          <li>• Évitez les reflets et les zones d'ombre</li>
        </ul>
      </div>
    </div>
  );
}