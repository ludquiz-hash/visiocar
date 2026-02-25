import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassCard({ children, className, hover = false }) {
  return (
    <div
      className={cn(
        "bg-[#151921] rounded-2xl border border-white/[0.06]",
        hover && "hover:bg-white/[0.02] transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}