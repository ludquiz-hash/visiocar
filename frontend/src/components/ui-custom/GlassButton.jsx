import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function GlassButton({ 
  children, 
  icon: Icon, 
  variant = 'primary', 
  size = 'default',
  className,
  disabled,
  onClick,
  type = 'button'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl font-medium transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        
        // Variants
        variant === 'primary' && [
          "bg-[#007AFF] text-white",
          "hover:bg-[#007AFF]/90",
          "shadow-lg shadow-[#007AFF]/20"
        ],
        variant === 'secondary' && [
          "bg-white/[0.06] text-white",
          "hover:bg-white/[0.08]",
          "border border-white/[0.06]"
        ],
        variant === 'ghost' && [
          "text-white/60 hover:text-white hover:bg-white/[0.06]"
        ],
        
        // Sizes
        size === 'default' && "px-4 py-2.5 text-sm",
        size === 'sm' && "px-3 py-2 text-sm",
        size === 'lg' && "px-6 py-3 text-base",
        
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}