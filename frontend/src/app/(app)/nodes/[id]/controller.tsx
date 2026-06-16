"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { fetchNodeDetail, fetchNodeOpinions } from "@/lib/nodes";
import {
  createNodeOpinion,
  createOpinionThread,
  reactToOpinion,
  reactToThread,
} from "@/lib/products";
import { ApiError } from "@/lib/errors";
import { notifyApiError } from "@/lib/notifyApiError";
import { patchOpinionVote, patchThreadVote } from "@/lib/opinionVotes";
import {
  createOpinionSchema,
  createReplySchema,
  type CreateOpinionFormData,
  type CreateReplyFormData,
} from "@/lib/schemas/productDetail";
import type {
  OpinionListItem,
  ReactionResponse,
  ReplyTarget,
} from "@/lib/types/products";
import type { NodeDetailResponse } from "@/lib/types/nodes";

export function useNodeDetailController() {
  const params = useParams();
  const nodeId = typeof params.id === "string" ? params.id : "";

  const [node, setNode] = useState<NodeDetailResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notAvailable, setNotAvailable] = useState(false);
  const [opinions, setOpinions] = useState<OpinionListItem[]>([]);
  const [opinionsPage, setOpinionsPage] = useState(1);
  const [opinionsTotalPages, setOpinionsTotalPages] = useState(1);
  const [isLoadingNode, setIsLoadingNode] = useState(true);
  const [isLoadingOpinions, setIsLoadingOpinions] = useState(false);
  const [isLoadingMoreOpinions, setIsLoadingMoreOpinions] = useState(false);
  const [isSubmittingOpinion, setIsSubmittingOpinion] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [votingTargetId, setVotingTargetId] = useState<string | null>(null);

  const {
    register: opinionRegister,
    handleSubmit: handleOpinionSubmit,
    reset: resetOpinionForm,
    formState: { errors: opinionErrors },
  } = useForm<CreateOpinionFormData>({
    resolver: zodResolver(createOpinionSchema),
    defaultValues: { content: "" },
  });

  const {
    register: replyRegister,
    handleSubmit: handleReplySubmit,
    reset: resetReplyForm,
    formState: { errors: replyErrors },
  } = useForm<CreateReplyFormData>({
    resolver: zodResolver(createReplySchema),
    defaultValues: { content: "" },
  });

  const loadNode = useCallback(async () => {
    if (!nodeId) {
      setNotFound(true);
      setNotAvailable(false);
      setNode(null);
      setIsLoadingNode(false);
      return;
    }

    setIsLoadingNode(true);
    setNotFound(false);
    setNotAvailable(false);

    try {
      const detail = await fetchNodeDetail(nodeId);
      setNode(detail);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        setNotFound(true);
        setNode(null);
        return;
      }
      if (error instanceof ApiError && error.statusCode === 400) {
        setNotAvailable(true);
        setNode(null);
        return;
      }
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsLoadingNode(false);
    }
  }, [nodeId]);

  const loadOpinions = useCallback(
    async (targetPage: number, append: boolean) => {
      if (!nodeId || !node) return;

      if (append) {
        setIsLoadingMoreOpinions(true);
      } else {
        setIsLoadingOpinions(true);
      }

      try {
        const response = await fetchNodeOpinions(nodeId, { page: targetPage });

        setOpinions((prev) =>
          append ? [...prev, ...response.data] : response.data
        );
        setOpinionsPage(response.pagination.page);
        setOpinionsTotalPages(response.pagination.totalPages);
      } catch (error) {
        if (notifyApiError(error)) return;
        throw error;
      } finally {
        if (append) {
          setIsLoadingMoreOpinions(false);
        } else {
          setIsLoadingOpinions(false);
        }
      }
    },
    [nodeId, node]
  );

  const refreshAfterWrite = useCallback(async () => {
    if (!nodeId) return;

    const [detail, opinionsResponse] = await Promise.all([
      fetchNodeDetail(nodeId),
      fetchNodeOpinions(nodeId, { page: 1 }),
    ]);

    setNode(detail);
    setOpinions(opinionsResponse.data);
    setOpinionsPage(opinionsResponse.pagination.page);
    setOpinionsTotalPages(opinionsResponse.pagination.totalPages);
  }, [nodeId]);

  useEffect(() => {
    void loadNode();
  }, [loadNode]);

  useEffect(() => {
    if (!node) return;
    setReplyTarget(null);
    resetReplyForm({ content: "" });
    void loadOpinions(1, false);
    // Recarrega opiniões ao trocar nó; refresh pós-escrita atualiza via refreshAfterWrite.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, node?.id]);

  function loadMoreOpinions() {
    if (
      isLoadingOpinions ||
      isLoadingMoreOpinions ||
      opinionsPage >= opinionsTotalPages
    ) {
      return;
    }

    void loadOpinions(opinionsPage + 1, true);
  }

  const onSubmitOpinion = handleOpinionSubmit(async (data) => {
    if (!nodeId) return;

    setIsSubmittingOpinion(true);

    try {
      await createNodeOpinion(nodeId, { content: data.content });
      resetOpinionForm({ content: "" });
      await refreshAfterWrite();
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmittingOpinion(false);
    }
  });

  function startReply(opinionId: string, parentInteractionId?: string) {
    setReplyTarget({
      opinionId,
      ...(parentInteractionId ? { parentInteractionId } : {}),
    });
    resetReplyForm({ content: "" });
  }

  function cancelReply() {
    setReplyTarget(null);
    resetReplyForm({ content: "" });
  }

  const onSubmitReply = handleReplySubmit(async (data) => {
    if (!replyTarget) return;

    setIsSubmittingReply(true);

    try {
      await createOpinionThread(
        replyTarget.opinionId,
        data.content,
        replyTarget.parentInteractionId
      );
      setReplyTarget(null);
      resetReplyForm({ content: "" });
      await refreshAfterWrite();
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmittingReply(false);
    }
  });

  async function applyReaction(
    targetId: string,
    request: () => Promise<ReactionResponse>,
    patch: (reaction: ReactionResponse) => void
  ) {
    setVotingTargetId(targetId);

    try {
      const reaction = await request();
      patch(reaction);
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setVotingTargetId(null);
    }
  }

  function onVoteOpinion(opinionId: string) {
    void applyReaction(
      opinionId,
      () => reactToOpinion(opinionId, "like"),
      (reaction) => {
        setOpinions((prev) => patchOpinionVote(prev, opinionId, reaction));
      }
    );
  }

  function onDislikeOpinion(opinionId: string) {
    void applyReaction(
      opinionId,
      () => reactToOpinion(opinionId, "dislike"),
      (reaction) => {
        setOpinions((prev) => patchOpinionVote(prev, opinionId, reaction));
      }
    );
  }

  function onVoteThread(threadId: string) {
    void applyReaction(
      threadId,
      () => reactToThread(threadId, "like"),
      (reaction) => {
        setOpinions((prev) => patchThreadVote(prev, threadId, reaction));
      }
    );
  }

  function onDislikeThread(threadId: string) {
    void applyReaction(
      threadId,
      () => reactToThread(threadId, "dislike"),
      (reaction) => {
        setOpinions((prev) => patchThreadVote(prev, threadId, reaction));
      }
    );
  }

  const hasMoreOpinions = opinionsPage < opinionsTotalPages;

  return {
    nodeId,
    node,
    notFound,
    notAvailable,
    opinions,
    isLoadingNode,
    isLoadingOpinions,
    isLoadingMoreOpinions,
    hasMoreOpinions,
    isSubmittingOpinion,
    replyTarget,
    isSubmittingReply,
    votingTargetId,
    opinionRegister,
    opinionErrors,
    onSubmitOpinion,
    replyRegister,
    replyErrors,
    loadMoreOpinions,
    startReply,
    cancelReply,
    onSubmitReply,
    onVoteOpinion,
    onDislikeOpinion,
    onVoteThread,
    onDislikeThread,
  };
}
