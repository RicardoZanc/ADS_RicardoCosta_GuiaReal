import { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";

type CountRow = {
  count: number;
};

type OpinionPageRow = {
  id: string;
  title: string | null;
  content: string;
  created_at: Date | null;
  score: number;
  author_id: string;
  username: string;
};

export type OpinionReply = {
  id: string;
  content: string;
  created_at: string;
  author: { id: string; username: string };
  cached_upvotes: number;
};

export type OpinionListItem = {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  author: { id: string; username: string };
  score: number;
  replies: OpinionReply[];
};

export type OpinionListPageResult = {
  data: OpinionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function toIsoString(date: Date | null | undefined): string {
  return (date ?? new Date(0)).toISOString();
}

export async function listOpinionsPage({
  whereClause,
  page,
  limit,
}: {
  whereClause: Prisma.Sql;
  page: number;
  limit: number;
}): Promise<OpinionListPageResult> {
  const offset = (page - 1) * limit;

  const [countResult, opinionRows] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*)::int AS count
      FROM opinions o
      WHERE ${whereClause}
    `,
    prisma.$queryRaw<OpinionPageRow[]>`
      SELECT
        o.id,
        o.title,
        o.content,
        o.created_at,
        u.id AS author_id,
        u.username,
        COALESCE(SUM(dt.cached_upvotes), 0)::int AS score,
        EXISTS (
          SELECT 1
          FROM discussion_threads dt2
          WHERE dt2.opinion_id = o.id
            AND dt2.parent_interaction_id IS NULL
        ) AS has_replies
      FROM opinions o
      INNER JOIN users u ON u.id = o.user_id
      LEFT JOIN discussion_threads dt
        ON dt.opinion_id = o.id
        AND dt.parent_interaction_id IS NULL
      WHERE ${whereClause}
      GROUP BY o.id, u.id, u.username
      ORDER BY
        has_replies DESC,
        score DESC,
        o.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const opinionIds = opinionRows.map((row) => row.id);

  const threads =
    opinionIds.length > 0
      ? await prisma.discussion_threads.findMany({
          where: {
            opinion_id: { in: opinionIds },
            parent_interaction_id: null,
          },
          select: {
            id: true,
            opinion_id: true,
            content: true,
            created_at: true,
            cached_upvotes: true,
            users: { select: { id: true, username: true } },
          },
          orderBy: [{ cached_upvotes: "desc" }, { created_at: "desc" }],
        })
      : [];

  const repliesByOpinionId = new Map<string, OpinionReply[]>();
  for (const thread of threads) {
    if (!thread.opinion_id) {
      continue;
    }

    const replies = repliesByOpinionId.get(thread.opinion_id) ?? [];
    replies.push({
      id: thread.id,
      content: thread.content,
      created_at: toIsoString(thread.created_at),
      author: {
        id: thread.users.id,
        username: thread.users.username,
      },
      cached_upvotes: thread.cached_upvotes ?? 0,
    });
    repliesByOpinionId.set(thread.opinion_id, replies);
  }

  const data: OpinionListItem[] = opinionRows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: toIsoString(row.created_at),
    author: { id: row.author_id, username: row.username },
    score: row.score,
    replies: repliesByOpinionId.get(row.id) ?? [],
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
