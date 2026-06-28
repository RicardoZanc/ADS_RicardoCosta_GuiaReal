import type { AgentProgressStep } from "@/lib/types/chats";

const STEP_LABELS: Record<AgentProgressStep, string> = {
  context: "Contexto",
  collect: "Coleta",
  query: "Consulta",
  hypothesis: "Hipótese",
  validate: "Validação",
  respond: "Resposta",
};

export function getAgentProgressStepLabel(step: AgentProgressStep): string {
  return STEP_LABELS[step];
}
