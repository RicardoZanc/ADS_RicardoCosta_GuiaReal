"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useAuthGate } from "@/hooks/useAuthGate";
import {
  createNodeOpinion,
  createOpinionThread,
  createProductOpinion,
  fetchProductDetail,
  fetchProductOpinions,
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
  ProductDetailResponse,
  ProductDiscussionTab,
  ReactionResponse,
  ReplyTarget,
} from "@/lib/types/products";

function getOpinionParams(
  productId: string,
  tab: ProductDiscussionTab | undefined
) {
  if (!tab || tab.scope === "product") {
    return { scope: "product" as const, productId };
  }

  return {
    scope: "node" as const,
    productId,
    nodeId: tab.nodeId,
  };
}

export function useProductDetailController() {
  const params = useParams();
  const { requireAuth } = useAuthGate();
  const productId = typeof params.id === "string" ? params.id : "";

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [opinions, setOpinions] = useState<OpinionListItem[]>([]);
  const [opinionsPage, setOpinionsPage] = useState(1);
  const [opinionsTotalPages, setOpinionsTotalPages] = useState(1);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
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

  const activeTab = product?.discussionTabs[activeTabIndex];

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setNotFound(true);
      setProduct(null);
      setIsLoadingProduct(false);
      return;
    }

    setIsLoadingProduct(true);
    setNotFound(false);

    try {
      const detail = await fetchProductDetail(productId);
      setProduct(detail);
      setActiveTabIndex(0);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        setNotFound(true);
        setProduct(null);
        return;
      }
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsLoadingProduct(false);
    }
  }, [productId]);

  const loadOpinions = useCallback(
    async (targetPage: number, append: boolean) => {
      if (!productId || !product) return;

      const tab = product.discussionTabs[activeTabIndex];
      const opinionParams = getOpinionParams(productId, tab);

      if (append) {
        setIsLoadingMoreOpinions(true);
      } else {
        setIsLoadingOpinions(true);
      }

      try {
        const response = await fetchProductOpinions(productId, {
          scope: opinionParams.scope,
          nodeId:
            opinionParams.scope === "node" ? opinionParams.nodeId : undefined,
          page: targetPage,
        });

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
    [productId, product, activeTabIndex]
  );

  const refreshAfterWrite = useCallback(async () => {
    if (!productId) return;

    const detail = await fetchProductDetail(productId);
    setProduct(detail);

    const response = await fetchProductOpinions(productId, {
      scope:
        detail.discussionTabs[activeTabIndex]?.scope === "node"
          ? "node"
          : "product",
      nodeId:
        detail.discussionTabs[activeTabIndex]?.scope === "node"
          ? detail.discussionTabs[activeTabIndex].nodeId
          : undefined,
      page: 1,
    });

    setOpinions(response.data);
    setOpinionsPage(response.pagination.page);
    setOpinionsTotalPages(response.pagination.totalPages);
  }, [productId, activeTabIndex]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    if (!product) return;
    setReplyTarget(null);
    resetReplyForm({ content: "" });
    void loadOpinions(1, false);
    // Recarrega opiniões ao trocar produto ou aba; refresh pós-escrita atualiza via refreshAfterWrite.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, activeTabIndex, product?.id]);

  function selectTab(index: number) {
    setActiveTabIndex(index);
    setOpinions([]);
    setOpinionsPage(1);
    setReplyTarget(null);
    resetReplyForm({ content: "" });
  }

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
    if (!productId || !activeTab) return;
    if (
      !requireAuth(
        "Crie uma conta para publicar opiniões e participar da comunidade."
      )
    ) {
      return;
    }

    setIsSubmittingOpinion(true);

    try {
      if (activeTab.scope === "product") {
        await createProductOpinion(productId, { content: data.content });
      } else {
        await createNodeOpinion(activeTab.nodeId, { content: data.content });
      }

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
    if (
      !requireAuth(
        "Crie uma conta para responder discussões da comunidade."
      )
    ) {
      return;
    }

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
    if (
      !requireAuth(
        "Crie uma conta para responder discussões da comunidade."
      )
    ) {
      return;
    }

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
    if (
      !requireAuth("Crie uma conta para votar nas opiniões da comunidade.")
    ) {
      return;
    }

    void applyReaction(
      opinionId,
      () => reactToOpinion(opinionId, "like"),
      (reaction) => {
        setOpinions((prev) => patchOpinionVote(prev, opinionId, reaction));
      }
    );
  }

  function onDislikeOpinion(opinionId: string) {
    if (
      !requireAuth("Crie uma conta para votar nas opiniões da comunidade.")
    ) {
      return;
    }

    void applyReaction(
      opinionId,
      () => reactToOpinion(opinionId, "dislike"),
      (reaction) => {
        setOpinions((prev) => patchOpinionVote(prev, opinionId, reaction));
      }
    );
  }

  function onVoteThread(threadId: string) {
    if (
      !requireAuth("Crie uma conta para votar nas respostas da comunidade.")
    ) {
      return;
    }

    void applyReaction(
      threadId,
      () => reactToThread(threadId, "like"),
      (reaction) => {
        setOpinions((prev) => patchThreadVote(prev, threadId, reaction));
      }
    );
  }

  function onDislikeThread(threadId: string) {
    if (
      !requireAuth("Crie uma conta para votar nas respostas da comunidade.")
    ) {
      return;
    }

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
    productId,
    product,
    notFound,
    activeTabIndex,
    activeTab,
    opinions,
    isLoadingProduct,
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
    selectTab,
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
