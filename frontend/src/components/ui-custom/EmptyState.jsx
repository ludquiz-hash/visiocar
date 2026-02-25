import React from 'react';
import GlassButton from './GlassButton';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-white/30" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 max-w-sm mb-6">{description}</p>
      {action && actionLabel && (
        <GlassButton onClick={action}>
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
}