import { prisma } from "./prisma";
function toIsoString(date) {
    return (date ?? new Date(0)).toISOString();
}
function toUserVote(voteType) {
    if (voteType === 1 || voteType === -1)
        return voteType;
    return null;
}
function mapThreadToReply(thread) {
    return {
        id: thread.id,
        content: thread.content,
        created_at: toIsoString(thread.created_at),
        author: {
            id: thread.users.id,
            username: thread.users.username,
        },
        cached_upvotes: thread.cached_upvotes ?? 0,
        user_vote: null,
        reports_locked: thread.reports_locked,
        replies: [],
    };
}
function sortNestedChronologically(replies) {
    replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (const reply of replies) {
        if (reply.replies.length > 0) {
            sortNestedChronologically(reply.replies);
        }
    }
}
function buildThreadTree(threads) {
    const nodesById = new Map();
    const rootsByOpinionId = new Map();
    for (const thread of threads) {
        if (!thread.opinion_id) {
            continue;
        }
        nodesById.set(thread.id, mapThreadToReply(thread));
    }
    for (const thread of threads) {
        if (!thread.opinion_id) {
            continue;
        }
        const node = nodesById.get(thread.id);
        if (!node) {
            continue;
        }
        if (thread.parent_interaction_id) {
            const parent = nodesById.get(thread.parent_interaction_id);
            if (parent) {
                parent.replies.push(node);
            }
            continue;
        }
        const roots = rootsByOpinionId.get(thread.opinion_id) ?? [];
        roots.push(node);
        rootsByOpinionId.set(thread.opinion_id, roots);
    }
    for (const roots of rootsByOpinionId.values()) {
        roots.sort((a, b) => {
            const voteDiff = b.cached_upvotes - a.cached_upvotes;
            if (voteDiff !== 0) {
                return voteDiff;
            }
            return (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        });
        for (const root of roots) {
            sortNestedChronologically(root.replies);
        }
    }
    return rootsByOpinionId;
}
function applyUserVotesToReplies(replies, votesByThreadId) {
    for (const reply of replies) {
        reply.user_vote = votesByThreadId.get(reply.id) ?? null;
        applyUserVotesToReplies(reply.replies, votesByThreadId);
    }
}
export async function listOpinionsPage({ whereClause, page, limit, userId, }) {
    const offset = (page - 1) * limit;
    const [countResult, opinionRows] = await Promise.all([
        prisma.$queryRaw `
      SELECT COUNT(*)::int AS count
      FROM opinions o
      WHERE ${whereClause} AND o.is_hidden = false
    `,
        prisma.$queryRaw `
      SELECT
        o.id,
        o.title,
        o.content,
        o.created_at,
        u.id AS author_id,
        u.username,
        COALESCE(o.cached_upvotes, 0)::int AS cached_upvotes,
        o.reports_locked,
        (
          COALESCE(o.cached_upvotes, 0) + COALESCE(SUM(dt.cached_upvotes), 0)
        )::int AS score,
        EXISTS (
          SELECT 1
          FROM discussion_threads dt2
          WHERE dt2.opinion_id = o.id
            AND dt2.is_hidden = false
        ) AS has_replies
      FROM opinions o
      INNER JOIN users u ON u.id = o.user_id
      LEFT JOIN discussion_threads dt ON dt.opinion_id = o.id AND dt.is_hidden = false
      WHERE ${whereClause} AND o.is_hidden = false
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
    const threads = opinionIds.length > 0
        ? await prisma.discussion_threads.findMany({
            where: {
                opinion_id: { in: opinionIds },
                is_hidden: false,
            },
            select: {
                id: true,
                opinion_id: true,
                parent_interaction_id: true,
                content: true,
                created_at: true,
                cached_upvotes: true,
                reports_locked: true,
                users: { select: { id: true, username: true } },
            },
        })
        : [];
    const threadIds = threads.map((thread) => thread.id);
    const repliesByOpinionId = buildThreadTree(threads);
    const votesByOpinionId = new Map();
    const votesByThreadId = new Map();
    if (userId && (opinionIds.length > 0 || threadIds.length > 0)) {
        const userVotes = await prisma.reaction_votes.findMany({
            where: {
                user_id: userId,
                OR: [
                    ...(opinionIds.length > 0
                        ? [{ opinion_id: { in: opinionIds } }]
                        : []),
                    ...(threadIds.length > 0
                        ? [{ interaction_id: { in: threadIds } }]
                        : []),
                ],
            },
            select: {
                opinion_id: true,
                interaction_id: true,
                vote_type: true,
            },
        });
        for (const vote of userVotes) {
            const userVote = toUserVote(vote.vote_type);
            if (vote.opinion_id) {
                votesByOpinionId.set(vote.opinion_id, userVote);
            }
            if (vote.interaction_id) {
                votesByThreadId.set(vote.interaction_id, userVote);
            }
        }
    }
    const data = opinionRows.map((row) => {
        const replies = repliesByOpinionId.get(row.id) ?? [];
        applyUserVotesToReplies(replies, votesByThreadId);
        return {
            id: row.id,
            title: row.title,
            content: row.content,
            created_at: toIsoString(row.created_at),
            author: { id: row.author_id, username: row.username },
            cached_upvotes: row.cached_upvotes,
            user_vote: votesByOpinionId.get(row.id) ?? null,
            score: row.score,
            reports_locked: row.reports_locked,
            replies,
        };
    });
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
