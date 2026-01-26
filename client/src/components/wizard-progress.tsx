import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { WIZARD_STEPS_WITH_SOW, WIZARD_STEPS_WITHOUT_SOW } from "@shared/schema";
import { cn } from "@/lib/utils";
import { isSOWEnabled } from "@/components/settings-dialog";

interface WizardProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  const [sowEnabled, setSOWEnabled] = useState(isSOWEnabled());
  
  useEffect(() => {
    const handleSettingsChange = () => {
      setSOWEnabled(isSOWEnabled());
    };
    
    window.addEventListener('featureSettingsChanged', handleSettingsChange);
    return () => window.removeEventListener('featureSettingsChanged', handleSettingsChange);
  }, []);
  
  const steps = sowEnabled ? WIZARD_STEPS_WITH_SOW : WIZARD_STEPS_WITHOUT_SOW;
  
  return (
    <div className="w-full py-6 px-8" data-testid="wizard-progress">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isClickable = step.id <= currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 group",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-not-allowed opacity-50"
                )}
                data-testid={`button-step-${step.id}`}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors border-2",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isActive && "bg-primary border-primary text-primary-foreground",
                    !isCompleted && !isActive && "bg-muted border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      (isActive || isCompleted) ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </div>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
