import React from 'react';
import { cn } from '@/lib/utils';

const colorVariants = {
  blue: { bg: 'bg-[#007AFF]/10', text: 'text-[#007AFF]' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  green: { bg: 'bg-[#34C759]/10', text: 'text-[#34C759]' },
  orange: { bg: 'bg-[#FF9F0A]/10', text: 'text-[#FF9F0A]' },
  red: { bg: 'bg-[#FF3B30]/10', text: 'text-[#FF3B30]' },
};

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  subtitle,
  trend,
  trendValue 
}) {
  const colors = colorVariants[color] || colorVariants.blue;
  
  return (
    <div className="bg-[#151921] rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/40 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend === 'up' ? 'text-[#34C759]' : 'text-[#FF3B30]'
              )}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.text)} />
        </div>
      </div>
    </div>
  );
}