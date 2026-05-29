import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ConflictError } from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";
import { getNodesSearchFuzziness } from "./nodes.config";
import type { CreateNodeInput, ListNodesQuery } from "./nodes.schema";
import { resolveNodeCreationDependencies } from "./nodes.domainRules";
import type { node_type } from "../../generated/prisma/enums";

type PrismaErrorWithCode = {
  code?: string;
  meta?: { target?: unknown };
};

type NodeSearchRow = {
  id: string;
  name: string;
  type: node_type;
  parent_id: string | null;
  wikidata_id: string | null;
  created_at: Date | null;
};

type CountRow = {
  count: number;
};

function isUniqueConstraintError(error: unknown): error is PrismaErrorWithCode {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as PrismaErrorWithCode).code === "P2002"
  );
}

function buildWhereClause(query: ListNodesQuery, fuzziness: number): Prisma.Sql {
  const conditions: Prisma.Sql[] = [Prisma.sql`type <> 'ROOT'::node_type`];

  if (query.type) {
    conditions.push(Prisma.sql`type = ${query.type}::node_type`);
  }

  if (query.q) {
    conditions.push(Prisma.sql`similarity(name, ${query.q}) >= ${fuzziness}`);
  }

  return Prisma.join(conditions, " AND ");
}

function buildOrderClause(query: ListNodesQuery): Prisma.Sql {
  if (query.q) {
    return Prisma.sql`similarity(name, ${query.q}) DESC, name ASC`;
  }

  return Prisma.sql`name ASC`;
}

const create = async (input: CreateNodeInput) => {
  logger.debug("Criação de nó: payload recebido", {
    type: input.type,
    name: input.name,
  });

  const data = await resolveNodeCreationDependencies(input);

  try {
    const node = await prisma.nodes.create({
      data: {
        ...data,
        type: data.type as node_type,
      },
      select: {
        id: true,
        name: true,
        type: true,
        parent_id: true,
        wikidata_id: true,
        created_at: true,
      },
    });

    logger.debug("Criação de nó: persistência concluída", {
      nodeId: node.id,
      type: node.type,
    });

    return node;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      logger.warn("Criação de nó rejeitada: conflito de unicidade", {
        type: input.type,
        name: input.name,
      });
      throw new ConflictError("Já existe um nó com os mesmos dados únicos");
    }
    throw error;
  }
};

const search = async (query: ListNodesQuery) => {
  const fuzziness = getNodesSearchFuzziness();
  const offset = (query.page - 1) * query.limit;
  const whereClause = buildWhereClause(query, fuzziness);
  const orderClause = buildOrderClause(query);

  logger.debug("Busca de nós: consulta iniciada", {
    q: query.q,
    type: query.type,
    page: query.page,
    limit: query.limit,
    fuzziness,
  });

  const [countResult, rows] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*)::int AS count
      FROM nodes
      WHERE ${whereClause}
    `,
    prisma.$queryRaw<NodeSearchRow[]>`
      SELECT id, name, type, parent_id, wikidata_id, created_at
      FROM nodes
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT ${query.limit}
      OFFSET ${offset}
    `,
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

  logger.debug("Busca de nós: consulta concluída", {
    q: query.q,
    type: query.type,
    page: query.page,
    limit: query.limit,
    total,
    fuzziness,
  });

  return {
    data: rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
};

export const nodesService = {
  create,
  search,
};
