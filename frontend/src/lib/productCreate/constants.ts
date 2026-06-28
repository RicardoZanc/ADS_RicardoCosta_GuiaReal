import type { NodeType } from "@/lib/types/nodes";

export type WizardStep =
  | "tipo"
  | "categoria"
  | "marca"
  | "modelo"
  | "imagem"
  | "tecnologia"
  | "composicao"
  | "atributo"
  | "revisao";

export type StepKind = "node-single" | "node-multi" | "model" | "image" | "review";

export interface StepConfig {
  key: WizardStep;
  label: string;
  title: string;
  helperText: string;
  kind: StepKind;
  nodeType?: NodeType;
  searchPlaceholder?: string;
}

export const WIZARD_STEPS: StepConfig[] = [
  {
    key: "tipo",
    label: "Tipo",
    title: "Qual o tipo do produto?",
    helperText:
      "Grande área do mercado (ex.: Instrumentos Musicais, Eletrônicos). Define o contexto da categoria.",
    kind: "node-single",
    nodeType: "TIPO",
    searchPlaceholder: "Busque ou crie um tipo",
  },
  {
    key: "categoria",
    label: "Categoria",
    title: "Em qual categoria ele se encaixa?",
    helperText:
      "O que você está comprando dentro do tipo (ex.: Guitarras, Monitores).",
    kind: "node-single",
    nodeType: "CATEGORIA",
    searchPlaceholder: "Busque ou crie uma categoria",
  },
  {
    key: "marca",
    label: "Marca",
    title: "Qual a marca ou fabricante?",
    helperText:
      "Fabricante ou detentora comercial do produto (ex.: Ibanez, Samsung).",
    kind: "node-single",
    nodeType: "MARCA",
    searchPlaceholder: "Busque ou crie uma marca",
  },
  {
    key: "modelo",
    label: "Modelo",
    title: "Qual o modelo do produto?",
    helperText:
      "Nome comercial específico do produto (ex.: RG450DX).",
    kind: "model",
  },
  {
    key: "imagem",
    label: "Imagem",
    title: "Adicione uma foto do produto",
    helperText:
      "Opcional. Formatos JPEG, PNG, WebP ou GIF. Tamanho máximo de 50 MB.",
    kind: "image",
  },
  {
    key: "tecnologia",
    label: "Tecnologia",
    title: "Tecnologias relevantes",
    helperText:
      "Soluções técnicas relevantes (ex.: Floyd Rose, Painel IPS). Opcional — adicione quantas precisar.",
    kind: "node-multi",
    nodeType: "TECNOLOGIA",
    searchPlaceholder: "Busque ou crie uma tecnologia",
  },
  {
    key: "composicao",
    label: "Composição",
    title: "Materiais e composição",
    helperText:
      "Materiais ou insumos estruturais (ex.: Mogno, Alumínio). Opcional.",
    kind: "node-multi",
    nodeType: "COMPOSICAO",
    searchPlaceholder: "Busque ou crie uma composição",
  },
  {
    key: "atributo",
    label: "Atributo",
    title: "Atributos e características",
    helperText:
      "Características mensuráveis ou funcionais (ex.: 6 Cordas, 144Hz). Opcional.",
    kind: "node-multi",
    nodeType: "ATRIBUTO",
    searchPlaceholder: "Busque ou crie um atributo",
  },
  {
    key: "revisao",
    label: "Revisão",
    title: "Revise antes de cadastrar",
    helperText:
      "Confira os dados. Clique em qualquer item para voltar e ajustar.",
    kind: "review",
  },
];

export const STEP_ORDER: WizardStep[] = WIZARD_STEPS.map((step) => step.key);

export function getStepConfig(step: WizardStep): StepConfig {
  const config = WIZARD_STEPS.find((item) => item.key === step);
  if (!config) {
    throw new Error(`Configuração de passo não encontrada: ${step}`);
  }
  return config;
}
