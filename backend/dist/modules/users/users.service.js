import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../lib/errors/BaseError";
import { isAllowedProfileImageUrl } from "../../lib/supabase";
function toIsoString(date) {
    return (date ?? new Date(0)).toISOString();
}
function mapProfile(user, viewerId) {
    const profile = {
        id: user.id,
        username: user.username,
        reputation_score: user.reputation_score ?? 0,
        avatar_url: user.avatar_url,
        created_at: toIsoString(user.created_at),
    };
    if (user.id === viewerId) {
        profile.email = user.email;
    }
    return profile;
}
async function findActiveUserByUsername(username) {
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
const applyReputationDelta = async (userId, delta, tx) => {
    if (delta === 0) {
        return;
    }
    await tx.users.update({
        where: { id: userId },
        data: { reputation_score: { increment: delta } },
    });
};
const getByUsername = async (username, viewerId) => {
    const user = await findActiveUserByUsername(username);
    return mapProfile(user, viewerId);
};
const listInteractions = async (username, query) => {
    const user = await findActiveUserByUsername(username);
    const offset = (query.page - 1) * query.limit;
    const [rows, countResult] = await Promise.all([
        prisma.$queryRaw `
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
        prisma.$queryRaw `
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
    const data = rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        content: row.content,
        created_at: toIsoString(row.created_at),
        context: {
            kind: row.context_kind,
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
const updateMe = async (userId, input) => {
    if (input.avatar_url !== null && !isAllowedProfileImageUrl(input.avatar_url)) {
        throw new BadRequestError("URL da imagem deve ser do bucket de perfis do Supabase");
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
    return mapProfile(user, userId);
};
export const usersService = {
    applyReputationDelta,
    getByUsername,
    listInteractions,
    updateMe,
};
