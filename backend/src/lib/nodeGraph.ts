import { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";
import type { node_type } from "../generated/prisma/enums";

export type NodeGraphRow = {
  id: string;
  name: string;
  type: node_type;
  parent_id: string | null;
};

export async function fetchNodeGraph(
  nodeIds: string[]
): Promise<Map<string, NodeGraphRow>> {
  if (nodeIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.$queryRaw<NodeGraphRow[]>`
    WITH RECURSIVE node_tree AS (
      SELECT id, name, type, parent_id
      FROM nodes
      WHERE id IN (${Prisma.join(nodeIds)})
      UNION
      SELECT n.id, n.name, n.type, n.parent_id
      FROM nodes n
      INNER JOIN node_tree nt ON n.id = nt.parent_id
    )
    SELECT DISTINCT id, name, type, parent_id
    FROM node_tree
  `;

  return new Map(rows.map((row) => [row.id, row]));
}
