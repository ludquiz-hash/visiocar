import React from 'react';
import { User, Car, FileText } from 'lucide-react';

export default function StepIdentification({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Client Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-[#007AFF]" />
          <h3 className="text-lg font-semibold text-white">Informations client</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Nom complet *</label>
            <input
              type="text"
              value={data.client_name}
              onChange={(e) => handleChange('client_name', e.target.value)}
              placeholder="Jean Dupont"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <input
              type="email"
              value={data.client_email}
              onChange={(e) => handleChange('client_email', e.target.value)}
              placeholder="client@email.com"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Téléphone</label>
            <input
              type="tel"
              value={data.client_phone}
              onChange={(e) => handleChange('client_phone', e.target.value)}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Adresse</label>
            <input
              type="text"
              value={data.client_address}
              onChange={(e) => handleChange('client_address', e.target.value)}
              placeholder="123 rue de Paris, 75001 Paris"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-[#007AFF]" />
          <h3 className="text-lg font-semibold text-white">Informations véhicule</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Marque *</label>
            <input
              type="text"
              value={data.vehicle_brand}
              onChange={(e) => handleChange('vehicle_brand', e.target.value)}
              placeholder="Renault"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Modèle *</label>
            <input
              type="text"
              value={data.vehicle_model}
              onChange={(e) => handleChange('vehicle_model', e.target.value)}
              placeholder="Clio"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Année</label>
            <input
              type="number"
              value={data.vehicle_year}
              onChange={(e) => handleChange('vehicle_year', e.target.value)}
              placeholder="2020"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Immatriculation</label>
            <input
              type="text"
              value={data.vehicle_license_plate}
              onChange={(e) => handleChange('vehicle_license_plate', e.target.value)}
              placeholder="AB-123-CD"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm text-white/60 mb-2">N° VIN</label>
            <input
              type="text"
              value={data.vehicle_vin}
              onChange={(e) => handleChange('vehicle_vin', e.target.value)}
              placeholder="VF1RFA00812345678"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
        </div>
      </div>

      {/* Insurance Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[#007AFF]" />
          <h3 className="text-lg font-semibold text-white">Assurance</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Compagnie d'assurance</label>
            <input
              type="text"
              value={data.insurance_company}
              onChange={(e) => handleChange('insurance_company', e.target.value)}
              placeholder="AXA"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">N° de police</label>
            <input
              type="text"
              value={data.insurance_policy_number}
              onChange={(e) => handleChange('insurance_policy_number', e.target.value)}
              placeholder="123456789"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm text-white/60 mb-2">N° de sinistre</label>
            <input
              type="text"
              value={data.claim_number}
              onChange={(e) => handleChange('claim_number', e.target.value)}
              placeholder="SIN-2024-001"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#007AFF]/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}