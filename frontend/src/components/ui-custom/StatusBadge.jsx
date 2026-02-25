import React from 'react';
import { cn } from '@/lib/utils';

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-white/10 text-white/60' },
  analyzing: { label: 'En analyse', color: 'bg-[#007AFF]/15 text-[#007AFF]' },
  review: { label: 'En révision', color: 'bg-[#FF9F0A]/15 text-[#FF9F0A]' },
  completed: { label: 'Terminé', color: 'bg-[#34C759]/15 text-[#34C759]' },
  archived: { label: 'Archivé', color: 'bg-white/10 text-white/40' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
      config.color
    )}>
      {config.label}
    </span>
  );
}