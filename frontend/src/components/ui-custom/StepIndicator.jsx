import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === steps.length - 1;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                isCompleted && "bg-[#34C759] text-white",
                isActive && "bg-[#007AFF] text-white",
                !isActive && !isCompleted && "bg-white/[0.06] text-white/40"
              )}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                "text-xs mt-2 hidden sm:block",
                isActive ? "text-white font-medium" : "text-white/40"
              )}>
                {step.title}
              </span>
            </div>
            
            {!isLast && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 sm:mx-4",
                index < currentStep ? "bg-[#34C759]" : "bg-white/[0.06]"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}