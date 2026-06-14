export const NODE_TYPE_LABELS: Record<string, string> = {
  TIPO: "Tipo",
  CATEGORIA: "Categoria",
  MARCA: "Marca",
  TECNOLOGIA: "Tecnologia",
  COMPOSICAO: "Composição",
  ATRIBUTO: "Atributo",
};

export function getNodeTypeLabel(type: string): string {
  return NODE_TYPE_LABELS[type] ?? type;
}
