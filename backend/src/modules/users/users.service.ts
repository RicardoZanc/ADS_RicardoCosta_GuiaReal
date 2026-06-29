import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../lib/errors/BaseError";
import { isAllowedProfileImageUrl } from "../../lib/supabase";
import type {
  ListUserInteractionsQuery,
  ReplaceMyInterestsInput,
  UpdateUserMeInput,
} from "./users.schema";
import {
  assertValidInterestNodeIds,
  dedupeNodeIds,
} from "./users.interests.domainRules";
import type { node_type } from "../../generated/prisma/enums";

type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

type UserInterest = {
  id: string;
  name: string;
  type: "TIPO" | "CATEGORIA";
  parent_id: string | null;
};

type UserProfile = {
  id: string;
  username: string;
  reputation_score: number;
  avatar_url: string | null;
  created_at: string;
  email?: string | null;
  interests: UserInterest[];
};

type UserInteraction = {
  id: string;
  kind: "opinion" | "thread";
  content: string;
  created_at: string;
  context: {
    kind: "product" | "node";
    id: string;
    name: string;
  };
};

type InteractionRow = {
  id: string;
  kind: string;
  content: string;
  created_at: Date;
  context_kind: string;
  context_id: string;
  context_name: string;
};

type CountRow = {
  count: bigint;
};

function toIsoString(date: Date | null | undefined): string {
  return (date ?? new Date(0)).toISOString();
}

function mapInterestNodes(
  rows: Array<{
    nodes: {
      id: string;
      name: string;
      type: node_type;
      parent_id: string | null;
    };
  }>
): UserInterest[] {
  return rows
    .map((row) => ({
      id: row.nodes.id,
      name: row.nodes.name,
      type: row.nodes.type as "TIPO" | "CATEGORIA",
      parent_id: row.nodes.parent_id,
    }))
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "TIPO" ? -1 : 1;
      }
      return a.name.localeCompare(b.name, "pt-BR");
    });
}

async function fetchInterestsByUserId(userId: string): Promise<UserInterest[]> {
  const rows = await prisma.user_interests.findMany({
    where: { user_id: userId },
    select: {
      nodes: {
        select: {
          id: true,
          name: true,
          type: true,
          parent_id: true,
        },
      },
    },
  });

  return mapInterestNodes(rows);
}

function mapProfile(
  user: {
    id: string;
    username: string;
    email: string | null;
    reputation_score: number | null;
    avatar_url: string | null;
    created_at: Date | null;
  },
  viewerId: string,
  interests: UserInterest[]
): UserProfile {
  const profile: UserProfile = {
    id: user.id,
    username: user.username,
    reputation_score: user.reputation_score ?? 0,
    avatar_url: user.avatar_url,
    created_at: toIsoString(user.created_at),
    interests,
  };

  if (user.id === viewerId) {
    profile.email = user.email;
  }

  return profile;
}

async function findActiveUserByUsername(username: string) {
  const user = await prisma.users.findFirst({
    where: {
      username,
      deleted_at: null,
      is_banned: { not: true },
    },
    select: {
      id: true,
      username: true,
      email: true,
      reputation_score: true,
      avatar_url: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Usuário não encontrado");
  }

  return user;
}

const applyReputationDelta = async (
  userId: string,
  delta: number,
  tx: TransactionClient
): Promise<void> => {
  if (delta === 0) {
    return;
  }

  await tx.users.update({
    where: { id: userId },
    data: { reputation_score: { increment: delta } },
  });
};

const getByUsername = async (
  username: string,
  viewerId: string
): Promise<UserProfile> => {
  const user = await findActiveUserByUsername(username);
  const interests = await fetchInterestsByUserId(user.id);
  return mapProfile(user, viewerId, interests);
};

const getMyInterests = async (userId: string): Promise<UserInterest[]> => {
  return fetchInterestsByUserId(userId);
};

const replaceMyInterests = async (
  userId: string,
  input: ReplaceMyInterestsInput
): Promise<UserInterest[]> => {
  const nodeIds = dedupeNodeIds(input.node_ids);
  await assertValidInterestNodeIds(nodeIds);

  await prisma.$transaction(async (tx) => {
    await tx.user_interests.deleteMany({ where: { user_id: userId } });

    if (nodeIds.length > 0) {
      await tx.user_interests.createMany({
        data: nodeIds.map((nodeId) => ({
          user_id: userId,
          node_id: nodeId,
        })),
      });
    }
  });

  return fetchInterestsByUserId(userId);
};

const listInteractions = async (
  username: string,
  query: ListUserInteractionsQuery
) => {
  const user = await findActiveUserByUsername(username);
  const offset = (query.page - 1) * query.limit;

  const [rows, countResult] = await Promise.all([
    prisma.$queryRaw<InteractionRow[]>`
      SELECT * FROM (
        SELECT
          o.id,
          'opinion'::text AS kind,
          o.content,
          o.created_at,
          CASE WHEN o.product_id IS NOT NULL THEN 'product' ELSE 'node' END AS context_kind,
          COALESCE(o.product_id, o.node_id) AS context_id,
          COALESCE(p.name, n.name) AS context_name
        FROM opinions o
        LEFT JOIN products p ON p.id = o.product_id
        LEFT JOIN nodes n ON n.id = o.node_id
        WHERE o.user_id = ${user.id}::uuid
          AND (o.product_id IS NOT NULL OR o.node_id IS NOT NULL)
        UNION ALL
        SELECT
          dt.id,
          'thread'::text AS kind,
          dt.content,
          dt.created_at,
          CASE WHEN o.product_id IS NOT NULL THEN 'product' ELSE 'node' END AS context_kind,
          COALESCE(o.product_id, o.node_id) AS context_id,
          COALESCE(p.name, n.name) AS context_name
        FROM discussion_threads dt
        INNER JOIN opinions o ON o.id = dt.opinion_id
        LEFT JOIN products p ON p.id = o.product_id
        LEFT JOIN nodes n ON n.id = o.node_id
        WHERE dt.user_id = ${user.id}::uuid
          AND (o.product_id IS NOT NULL OR o.node_id IS NOT NULL)
      ) merged
      ORDER BY created_at DESC
      LIMIT ${query.limit}
      OFFSET ${offset}
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*)::bigint AS count FROM (
        SELECT o.id
        FROM opinions o
        WHERE o.user_id = ${user.id}::uuid
          AND (o.product_id IS NOT NULL OR o.node_id IS NOT NULL)
        UNION ALL
        SELECT dt.id
        FROM discussion_threads dt
        INNER JOIN opinions o ON o.id = dt.opinion_id
        WHERE dt.user_id = ${user.id}::uuid
          AND (o.product_id IS NOT NULL OR o.node_id IS NOT NULL)
      ) merged
    `,
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = total === 0 ? 1 : Math.ceil(total / query.limit);

  const data: UserInteraction[] = rows.map((row) => ({
    id: row.id,
    kind: row.kind as "opinion" | "thread",
    content: row.content,
    created_at: toIsoString(row.created_at),
    context: {
      kind: row.context_kind as "product" | "node",
      id: row.context_id,
      name: row.context_name,
    },
  }));

  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
};

const updateMe = async (
  userId: string,
  input: UpdateUserMeInput
): Promise<UserProfile> => {
  if (input.avatar_url !== null && !isAllowedProfileImageUrl(input.avatar_url)) {
    throw new BadRequestError(
      "URL da imagem deve ser do bucket de perfis do Supabase"
    );
  }

  const user = await prisma.users.update({
    where: { id: userId },
    data: { avatar_url: input.avatar_url },
    select: {
      id: true,
      username: true,
      email: true,
      reputation_score: true,
      avatar_url: true,
      created_at: true,
    },
  });

  const interests = await fetchInterestsByUserId(userId);
  return mapProfile(user, userId, interests);
};

export const usersService = {
  applyReputationDelta,
  getByUsername,
  getMyInterests,
  listInteractions,
  replaceMyInterests,
  updateMe,
};
