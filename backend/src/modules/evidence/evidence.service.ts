import { prisma } from "../../lib/prisma";
import type { EvidenceRef } from "./evidence.schema";

const MAX_SIBLINGS = 5;
const MAX_TOP_LEVEL_REPLIES = 5;

type AuthorPreview = {
  id: string;
  username: string;
  avatar_url: string | null;
  is_admin: boolean;
};

export type ThreadPreviewItem = {
  id: string;
  kind: "opinion" | "thread";
  parent_id: string | null;
  content: string;
  author: AuthorPreview;
  created_at: string;
  depth: number;
  is_evidence: boolean;
};

export type EvidenceContext = {
  type: "product" | "node";
  product_id: string | null;
  node_id: string | null;
  title: string;
  tab_label: string | null;
};

export type RootOpinionPreview = {
  id: string;
  title: string | null;
  content: string;
  author: AuthorPreview;
  created_at: string;
};

export type EvidencePreview = {
  ref: EvidenceRef;
  context: EvidenceContext;
  root_opinion: RootOpinionPreview;
  thread_items: ThreadPreviewItem[];
  highlight_id: string;
  discussion_path: string;
};

const authorSelect = {
  id: true,
  username: true,
  avatar_url: true,
  is_admin: true,
} as const;

function toIsoString(date: Date | null | undefined): string {
  return (date ?? new Date(0)).toISOString();
}

function evidenceKey(item: EvidenceRef): string {
  return `${item.source_type}:${item.source_id}`;
}

function dedupeEvidence(items: EvidenceRef[]): EvidenceRef[] {
  const seen = new Set<string>();
  const unique: EvidenceRef[] = [];

  for (const item of items) {
    const key = evidenceKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique;
}

function mapAuthor(user: {
  id: string;
  username: string;
  avatar_url: string | null;
  is_admin: boolean;
}): AuthorPreview {
  return {
    id: user.id,
    username: user.username,
    avatar_url: user.avatar_url,
    is_admin: user.is_admin,
  };
}

async function resolveContext(
  productId: string | null,
  nodeId: string | null
): Promise<EvidenceContext | null> {
  if (productId) {
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) return null;

    return {
      type: "product",
      product_id: product.id,
      node_id: null,
      title: product.name,
      tab_label: "Produto",
    };
  }

  if (nodeId) {
    const node = await prisma.nodes.findUnique({
      where: { id: nodeId },
      select: { id: true, name: true, type: true },
    });

    if (!node) return null;

    const linkedProduct = await prisma.product_nodes.findFirst({
      where: { node_id: nodeId },
      select: {
        products: { select: { id: true, name: true } },
      },
    });

    if (linkedProduct?.products) {
      return {
        type: "product",
        product_id: linkedProduct.products.id,
        node_id: node.id,
        title: linkedProduct.products.name,
        tab_label: node.name,
      };
    }

    return {
      type: "node",
      product_id: null,
      node_id: node.id,
      title: node.name,
      tab_label: null,
    };
  }

  return null;
}

function buildDiscussionPath(
  context: EvidenceContext,
  highlightType: "opinion" | "thread",
  highlightId: string
): string {
  const highlight = `${highlightType}:${highlightId}`;

  if (context.type === "node" && context.node_id) {
    return `/nodes/${context.node_id}?highlight=${highlight}`;
  }

  if (context.product_id && context.node_id) {
    return `/products/${context.product_id}?node_id=${context.node_id}&highlight=${highlight}`;
  }

  if (context.product_id) {
    return `/products/${context.product_id}?highlight=${highlight}`;
  }

  return `/nodes/${context.node_id}?highlight=${highlight}`;
}

function mapThreadToItem(
  thread: {
    id: string;
    content: string;
    created_at: Date | null;
    users: {
      id: string;
      username: string;
      avatar_url: string | null;
      is_admin: boolean;
    };
  },
  parentId: string | null,
  depth: number,
  isEvidence: boolean
): ThreadPreviewItem {
  return {
    id: thread.id,
    kind: "thread",
    parent_id: parentId,
    content: thread.content,
    author: mapAuthor(thread.users),
    created_at: toIsoString(thread.created_at),
    depth,
    is_evidence: isEvidence,
  };
}

async function resolveOpinionEvidence(
  opinionId: string
): Promise<EvidencePreview | null> {
  const opinion = await prisma.opinions.findUnique({
    where: { id: opinionId },
    select: {
      id: true,
      title: true,
      content: true,
      created_at: true,
      is_hidden: true,
      product_id: true,
      node_id: true,
      users: { select: authorSelect },
    },
  });

  if (!opinion || opinion.is_hidden) return null;

  const context = await resolveContext(opinion.product_id, opinion.node_id);
  if (!context) return null;

  const topLevelThreads = await prisma.discussion_threads.findMany({
    where: {
      opinion_id: opinionId,
      parent_interaction_id: null,
      is_hidden: false,
    },
    orderBy: [{ cached_upvotes: "desc" }, { created_at: "desc" }],
    take: MAX_TOP_LEVEL_REPLIES,
    select: {
      id: true,
      content: true,
      created_at: true,
      users: { select: authorSelect },
    },
  });

  const threadItems: ThreadPreviewItem[] = [
    {
      id: opinion.id,
      kind: "opinion",
      parent_id: null,
      content: opinion.content,
      author: mapAuthor(opinion.users),
      created_at: toIsoString(opinion.created_at),
      depth: 0,
      is_evidence: true,
    },
    ...topLevelThreads.map((thread) =>
      mapThreadToItem(thread, opinion.id, 1, false)
    ),
  ];

  const rootOpinion: RootOpinionPreview = {
    id: opinion.id,
    title: opinion.title,
    content: opinion.content,
    author: mapAuthor(opinion.users),
    created_at: toIsoString(opinion.created_at),
  };

  return {
    ref: { source_type: "opinion", source_id: opinionId },
    context,
    root_opinion: rootOpinion,
    thread_items: threadItems,
    highlight_id: opinionId,
    discussion_path: buildDiscussionPath(context, "opinion", opinionId),
  };
}

async function resolveThreadEvidence(
  threadId: string
): Promise<EvidencePreview | null> {
  const evidenceThread = await prisma.discussion_threads.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      opinion_id: true,
      parent_interaction_id: true,
      content: true,
      created_at: true,
      is_hidden: true,
      users: { select: authorSelect },
    },
  });

  if (!evidenceThread || evidenceThread.is_hidden || !evidenceThread.opinion_id) {
    return null;
  }

  const ancestorChain: Array<{
    id: string;
    parent_interaction_id: string | null;
    content: string;
    created_at: Date | null;
    users: {
      id: string;
      username: string;
      avatar_url: string | null;
      is_admin: boolean;
    };
  }> = [];

  let currentParentId = evidenceThread.parent_interaction_id;

  while (currentParentId) {
    const parent = await prisma.discussion_threads.findUnique({
      where: { id: currentParentId },
      select: {
        id: true,
        parent_interaction_id: true,
        content: true,
        created_at: true,
        is_hidden: true,
        users: { select: authorSelect },
      },
    });

    if (!parent || parent.is_hidden) break;

    ancestorChain.unshift(parent);
    currentParentId = parent.parent_interaction_id;
  }

  const opinion = await prisma.opinions.findUnique({
    where: { id: evidenceThread.opinion_id },
    select: {
      id: true,
      title: true,
      content: true,
      created_at: true,
      is_hidden: true,
      product_id: true,
      node_id: true,
      users: { select: authorSelect },
    },
  });

  if (!opinion || opinion.is_hidden) return null;

  const context = await resolveContext(opinion.product_id, opinion.node_id);
  if (!context) return null;

  const chainIds = new Set([
    threadId,
    ...ancestorChain.map((item) => item.id),
  ]);

  const siblings = await prisma.discussion_threads.findMany({
    where: {
      opinion_id: evidenceThread.opinion_id,
      parent_interaction_id: evidenceThread.parent_interaction_id,
      is_hidden: false,
      id: { notIn: [...chainIds] },
    },
    orderBy: [{ cached_upvotes: "desc" }, { created_at: "desc" }],
    take: MAX_SIBLINGS,
    select: {
      id: true,
      content: true,
      created_at: true,
      users: { select: authorSelect },
    },
  });

  const threadItems: ThreadPreviewItem[] = [
    {
      id: opinion.id,
      kind: "opinion",
      parent_id: null,
      content: opinion.content,
      author: mapAuthor(opinion.users),
      created_at: toIsoString(opinion.created_at),
      depth: 0,
      is_evidence: false,
    },
  ];

  let depth = 1;
  let parentId: string = opinion.id;

  for (const ancestor of ancestorChain) {
    threadItems.push(
      mapThreadToItem(ancestor, parentId, depth, false)
    );
    parentId = ancestor.id;
    depth += 1;
  }

  threadItems.push(
    mapThreadToItem(
      evidenceThread,
      evidenceThread.parent_interaction_id ?? opinion.id,
      depth,
      true
    )
  );

  const siblingDepth = depth;
  const siblingParentId =
    evidenceThread.parent_interaction_id ?? opinion.id;

  for (const sibling of siblings) {
    threadItems.push(
      mapThreadToItem(sibling, siblingParentId, siblingDepth, false)
    );
  }

  const rootOpinion: RootOpinionPreview = {
    id: opinion.id,
    title: opinion.title,
    content: opinion.content,
    author: mapAuthor(opinion.users),
    created_at: toIsoString(opinion.created_at),
  };

  return {
    ref: { source_type: "thread", source_id: threadId },
    context,
    root_opinion: rootOpinion,
    thread_items: threadItems,
    highlight_id: threadId,
    discussion_path: buildDiscussionPath(context, "thread", threadId),
  };
}

async function resolveEvidence(ref: EvidenceRef): Promise<EvidencePreview | null> {
  if (ref.source_type === "opinion") {
    return resolveOpinionEvidence(ref.source_id);
  }

  return resolveThreadEvidence(ref.source_id);
}

const preview = async (input: { evidence: EvidenceRef[] }) => {
  const uniqueRefs = dedupeEvidence(input.evidence);
  const results: EvidencePreview[] = [];

  for (const ref of uniqueRefs) {
    const previewItem = await resolveEvidence(ref);
    if (previewItem) {
      results.push(previewItem);
    }
  }

  return { data: results };
};

export const evidenceService = {
  preview,
};
