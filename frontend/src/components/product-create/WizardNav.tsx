"use client";

import { Button } from "@/components/ui/button";

interface WizardNavProps {
  isFirstStep: boolean;
  isReviewStep: boolean;
  canProceed: boolean;
  isBusy: boolean;
  submitLabel?: string;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function WizardNav({
  isFirstStep,
  isReviewStep,
  canProceed,
  isBusy,
  submitLabel = "Cadastrar produto",
  onBack,
  onNext,
  onSubmit,
}: WizardNavProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <Button
        type="button"
        variant="ghost"
        disabled={isFirstStep || isBusy}
        onClick={onBack}
      >
        Voltar
      </Button>

      {isReviewStep ? (
        <Button
          type="button"
          loading={isBusy}
          disabled={!canProceed}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      ) : (
        <Button
          type="button"
          disabled={!canProceed || isBusy}
          onClick={onNext}
        >
          Próximo
        </Button>
      )}
    </div>
  );
}
