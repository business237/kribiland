'use client';

export interface WizardStepsProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function WizardSteps({ currentStep, totalSteps, labels }: WizardStepsProps) {
  const progress = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 100;

  return (
    <nav aria-label="Progression du formulaire" className="w-full py-3 sm:py-5">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
        <div className="absolute inset-y-0 left-0 rounded-full bg-sun-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <span className="sr-only">Progression {currentStep} sur {totalSteps}</span>
    </nav>
  );
}
