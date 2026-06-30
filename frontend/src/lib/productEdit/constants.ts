import {
  getStepConfig,
  STEP_ORDER,
  type StepConfig,
  type WizardStep,
} from "@/lib/productCreate/constants";

export const EDIT_STEP_ORDER: WizardStep[] = STEP_ORDER.filter(
  (step) => step !== "tipo"
);

export function getEditStepConfig(step: WizardStep): StepConfig {
  return getStepConfig(step);
}
