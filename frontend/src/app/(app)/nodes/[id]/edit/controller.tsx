"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { fetchMyChangeRequests } from "@/lib/changeRequests";
import { fetchNodeDetail, updateNode } from "@/lib/nodes";
import { ApiError } from "@/lib/errors";
import { notifyApiError } from "@/lib/notifyApiError";
import { uploadNodeImage } from "@/lib/uploads/nodeImage";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAuthStore } from "@/store/authStore";
import type { NodeDetailResponse } from "@/lib/types/nodes";
import type { ChangeRequestItem } from "@/lib/types/changeRequests";

export function useNodeEditController() {
  const params = useParams();
  const router = useRouter();
  const { requireAuth } = useAuthGate();
  const isAdmin = useAuthStore((state) => state.user?.is_admin ?? false);

  const nodeId = typeof params.id === "string" ? params.id : "";

  const [node, setNode] = useState<NodeDetailResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notAvailable, setNotAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nodeName, setNodeName] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imagePublicUrl, setImagePublicUrl] = useState<string | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<ChangeRequestItem | null>(
    null
  );

  const loadNode = useCallback(async () => {
    if (!nodeId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setNotAvailable(false);

    try {
      const [detail, myRequests] = await Promise.all([
        fetchNodeDetail(nodeId),
        fetchMyChangeRequests({ entity_type: "NODE", entity_id: nodeId }).catch(
          () => ({ requests: [] })
        ),
      ]);

      setNode(detail);
      setNodeName(detail.name);
      setInitialImageUrl(detail.image_url);
      setImagePublicUrl(detail.image_url);
      setImagePreviewUrl(detail.image_url);
      setImageRemoved(false);
      setPendingRequest(
        myRequests.requests.find((request) => request.status === "PENDING") ??
          null
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          setNotFound(true);
          return;
        }
        if (error.statusCode === 400) {
          setNotAvailable(true);
          return;
        }
      }
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    void loadNode();
  }, [loadNode]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function removeImage() {
    setImagePublicUrl(null);
    setImageRemoved(true);
    setImagePreviewUrl((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }

  async function selectImage(file: File) {
    const preview = URL.createObjectURL(file);
    setImagePreviewUrl((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return preview;
    });
    setImagePublicUrl(null);
    setImageRemoved(false);
    setIsUploadingImage(true);

    try {
      const publicUrl = await uploadNodeImage(file);
      setImagePublicUrl(publicUrl);
    } catch (error) {
      removeImage();
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  }

  function buildPayload() {
    const payload: { name?: string; image_url?: string | null } = {};
    const trimmedName = nodeName.trim();

    if (trimmedName.length > 0 && trimmedName !== node?.name) {
      payload.name = trimmedName;
    }

    if (imageRemoved) {
      payload.image_url = null;
    } else if (imagePublicUrl && imagePublicUrl !== initialImageUrl) {
      payload.image_url = imagePublicUrl;
    }

    return payload;
  }

  const canSubmit =
    nodeName.trim().length > 0 &&
    !isSubmitting &&
    !isUploadingImage &&
    Object.keys(buildPayload()).length > 0;

  async function submit() {
    if (!requireAuth()) return;
    if (!node || !canSubmit) return;

    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      toast.error("Nenhuma alteração foi informada");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateNode(node.id, payload);

      if (result.mode === "applied") {
        toast.success("Alterações salvas");
        router.push(`/nodes/${node.id}`);
        return;
      }

      toast.success("Solicitação enviada para revisão");
      router.push(`/nodes/${node.id}`);
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  function cancel() {
    if (!node) {
      router.push("/feed");
      return;
    }
    router.push(`/nodes/${node.id}`);
  }

  return {
    node,
    notFound,
    notAvailable,
    isLoading,
    nodeName,
    setNodeName,
    imagePreviewUrl,
    isUploadingImage,
    isSubmitting,
    canSubmit,
    pendingRequest,
    isAdmin,
    selectImage,
    removeImage,
    submit,
    cancel,
  };
}
