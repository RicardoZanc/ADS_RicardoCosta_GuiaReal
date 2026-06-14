import type { NodeType } from "@/lib/types/nodes";

export interface NodeCreateOption {
  type: NodeType;
  label: string;
  title: string;
  helperText: string;
  namePlaceholder: string;
  successToast: string;
}

export const NODE_CREATE_OPTIONS: NodeCreateOption[] = [
  {
    type: "TIPO",
    label: "Tipo",
    title: "Qual o tipo do mercado?",
    helperText:
      "Grande área do mercado (ex.: Instrumentos Musicais, Eletrônicos).",
    namePlaceholder: "Ex.: Instrumentos Musicais",
    successToast: "Tipo cadastrado com sucesso",
  },
  {
    type: "CATEGORIA",
    label: "Categoria",
    title: "Qual categoria você quer adicionar?",
    helperText:
      "Segmento específico dentro de um tipo (ex.: Guitarras, Monitores). Primeiro selecione ou crie o tipo pai.",
    namePlaceholder: "Ex.: Guitarras",
    successToast: "Categoria cadastrada com sucesso",
  },
  {
    type: "MARCA",
    label: "Marca",
    title: "Qual marca você quer adicionar?",
    helperText:
      "Fabricante ou detentora comercial (ex.: Ibanez, Samsung).",
    namePlaceholder: "Ex.: Ibanez",
    successToast: "Marca cadastrada com sucesso",
  },
  {
    type: "TECNOLOGIA",
    label: "Tecnologia",
    title: "Qual tecnologia você quer adicionar?",
    helperText:
      "Solução técnica ou padrão de engenharia (ex.: Floyd Rose, Painel IPS).",
    namePlaceholder: "Ex.: Floyd Rose",
    successToast: "Tecnologia cadastrada com sucesso",
  },
  {
    type: "COMPOSICAO",
    label: "Composição",
    title: "Qual composição você quer adicionar?",
    helperText:
      "Material ou insumo estrutural (ex.: Mogno, Alumínio).",
    namePlaceholder: "Ex.: Mogno",
    successToast: "Composição cadastrada com sucesso",
  },
  {
    type: "ATRIBUTO",
    label: "Atributo",
    title: "Qual atributo você quer adicionar?",
    helperText:
      "Característica mensurável ou funcional (ex.: 6 Cordas, 144Hz).",
    namePlaceholder: "Ex.: 6 Cordas",
    successToast: "Atributo cadastrado com sucesso",
  },
];

export const TIPO_PARENT_CONFIG = {
  label: "Tipo pai",
  helperText:
    "Selecione o tipo de mercado ao qual esta categoria pertence. Você pode criar um novo tipo se não encontrar.",
  searchPlaceholder: "Busque ou crie um tipo",
};

export function getNodeCreateOption(type: NodeType): NodeCreateOption {
  const option = NODE_CREATE_OPTIONS.find((item) => item.type === type);
  if (!option) {
    throw new Error(`Configuração de criação não encontrada: ${type}`);
  }
  return option;
}
