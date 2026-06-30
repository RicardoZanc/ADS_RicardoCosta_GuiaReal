"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiClient } from "@/lib/api";
import { fetchMyChangeRequests } from "@/lib/changeRequests";
import { isApiError } from "@/lib/errors";
import { notifyApiError } from "@/lib/notifyApiError";
import { useNodeSearch } from "@/hooks/useNodeSearch";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAuthStore } from "@/store/authStore";
import {
  EDIT_STEP_ORDER,
  getEditStepConfig,
} from "@/lib/productEdit/constants";
import {
  productModelSchema,
  type ProductModelFormData,
} from "@/lib/schemas/productCreate";
import type { ReviewItem } from "@/components/product-create/ProductCreateReviewList";
import { uploadProductImage } from "@/lib/uploads/productImage";
import { fetchProductDetail, updateProduct } from "@/lib/products";
import { updateNode } from "@/lib/nodes";
import type {
  NodeRecord,
  NodesListResponse,
  SelectedNode,
} from "@/lib/types/nodes";
import type { ChangeRequestItem } from "@/lib/types/changeRequests";
import type { ProductDetailResponse } from "@/lib/types/products";
import type { WizardStep } from "@/lib/productCreate/constants";

interface DuplicatePrompt {
  name: string;
}

function toSelectedNode(node: NodeRecord): SelectedNode {
  return { id: node.id, name: node.name, type: node.type };
}

function toSelectedNodeFromRef(
  ref: { id: string; name: string } | null,
  type: SelectedNode["type"]
): SelectedNode | null {
  if (!ref) return null;
  return { id: ref.id, name: ref.name, type };
}

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

export function useProductEditController() {
  const params = useParams();
  const router = useRouter();
  const { requireAuth } = useAuthGate();
  const isAdmin = useAuthStore((state) => state.user?.is_admin ?? false);

  const productId = typeof params.id === "string" ? params.id : "";

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<WizardStep>("categoria");
  const [tipo, setTipo] = useState<SelectedNode | null>(null);
  const [categoria, setCategoria] = useState<SelectedNode | null>(null);
  const [marca, setMarca] = useState<SelectedNode | null>(null);
  const [tecnologias, setTecnologias] = useState<SelectedNode[]>([]);
  const [composicoes, setComposicoes] = useState<SelectedNode[]>([]);
  const [atributos, setAtributos] = useState<SelectedNode[]>([]);
  const [initialName, setInitialName] = useState("");
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [initialNodeIds, setInitialNodeIds] = useState<string[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imagePublicUrl, setImagePublicUrl] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState<DuplicatePrompt | null>(null);
  const [pendingRequest, setPendingRequest] = useState<ChangeRequestItem | null>(
    null
  );

  const modelForm = useForm<ProductModelFormData>({
    resolver: zodResolver(productModelSchema),
    defaultValues: { name: "" },
    mode: "onBlur",
  });

  const modelName = modelForm.watch("name") ?? "";

  const stepConfig = getEditStepConfig(step);
  const stepIndex = EDIT_STEP_ORDER.indexOf(step);
  const totalSteps = EDIT_STEP_ORDER.length;
  const isFirstStep = stepIndex === 0;
  const isReviewStep = stepConfig.kind === "review";

  const activeNodeType = stepConfig.nodeType ?? null;
  const activeTipoId = step === "categoria" ? tipo?.id ?? null : null;

  const search = useNodeSearch({ type: activeNodeType, tipoId: activeTipoId });

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setNotFound(false);

    try {
      const [detail, myRequests] = await Promise.all([
        fetchProductDetail(productId),
        fetchMyChangeRequests({
          entity_type: "PRODUCT",
          entity_id: productId,
        }).catch(() => ({ requests: [] })),
      ]);

      const taxonomy = detail.taxonomy;
      const nextCategoria = toSelectedNodeFromRef(
        taxonomy.categoria,
        "CATEGORIA"
      );
      const nextMarca = toSelectedNodeFromRef(taxonomy.marca, "MARCA");
      const nextTipo = toSelectedNodeFromRef(taxonomy.tipo, "TIPO");

      const nodeIds = [
        ...(nextCategoria ? [nextCategoria.id] : []),
        ...(nextMarca ? [nextMarca.id] : []),
        ...taxonomy.tecnologias.map((node) => node.id),
        ...taxonomy.composicoes.map((node) => node.id),
        ...taxonomy.atributos.map((node) => node.id),
      ];

      setProduct(detail);
      setTipo(nextTipo);
      setCategoria(nextCategoria);
      setMarca(nextMarca);
      setTecnologias(
        taxonomy.tecnologias.map((node) =>
          toSelectedNodeFromRef(node, "TECNOLOGIA")!
        )
      );
      setComposicoes(
        taxonomy.composicoes.map((node) =>
          toSelectedNodeFromRef(node, "COMPOSICAO")!
        )
      );
      setAtributos(
        taxonomy.atributos.map((node) =>
          toSelectedNodeFromRef(node, "ATRIBUTO")!
        )
      );
      setInitialName(detail.name);
      setInitialImageUrl(detail.image_url);
      setImagePublicUrl(detail.image_url);
      setImagePreviewUrl(detail.image_url);
      setImageRemoved(false);
      setInitialNodeIds(nodeIds);
      modelForm.reset({ name: detail.name });
      setPendingRequest(
        myRequests.requests.find((request) => request.status === "PENDING") ??
          null
      );
    } catch (error) {
      if (isApiError(error) && error.statusCode === 404) {
        setNotFound(true);
        return;
      }
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [modelForm, productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function getSingleValue(target: WizardStep): SelectedNode | null {
    if (target === "categoria") return categoria;
    if (target === "marca") return marca;
    return null;
  }

  function setSingleValue(target: WizardStep, value: SelectedNode | null) {
    if (target === "categoria") {
      setCategoria(value);
      return;
    }
    if (target === "marca") {
      setMarca(value);
    }
  }

  function getMultiState(target: WizardStep): {
    items: SelectedNode[];
    set: (items: SelectedNode[]) => void;
  } | null {
    if (target === "tecnologia") return { items: tecnologias, set: setTecnologias };
    if (target === "composicao") return { items: composicoes, set: setComposicoes };
    if (target === "atributo") return { items: atributos, set: setAtributos };
    return null;
  }

  function applySelection(node: SelectedNode) {
    if (stepConfig.kind === "node-single") {
      setSingleValue(step, node);
    } else if (stepConfig.kind === "node-multi") {
      const multi = getMultiState(step);
      if (multi && !multi.items.some((item) => item.id === node.id)) {
        multi.set([...multi.items, node]);
      }
    }
    search.reset();
    setDuplicate(null);
  }

  function selectNode(node: NodeRecord) {
    applySelection(toSelectedNode(node));
  }

  async function createNode(name: string) {
    if (!activeNodeType) return;

    const trimmed = name.trim();
    if (trimmed.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload =
        activeNodeType === "CATEGORIA"
          ? { name: trimmed, type: "CATEGORIA", parent_id: tipo?.id }
          : { name: trimmed, type: activeNodeType };

      const node = await apiClient<NodeRecord>("/nodes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      applySelection(toSelectedNode(node));
    } catch (error) {
      if (isApiError(error) && error.statusCode === 409) {
        setDuplicate({ name: trimmed });
        return;
      }
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function useExistingDuplicate() {
    if (!duplicate || !activeNodeType) return;

    const targetName = duplicate.name.trim();
    setIsSubmitting(true);
    try {
      const params: Record<string, string> = { q: targetName, limit: "20" };
      if (activeNodeType === "CATEGORIA" && tipo) {
        params.tipo_id = tipo.id;
      } else if (activeNodeType) {
        params.type = activeNodeType;
      }

      const response = await apiClient<NodesListResponse>("/nodes", { params });
      const lowered = targetName.toLowerCase();
      const match =
        response.data.find((node) => node.name.toLowerCase() === lowered) ??
        response.data[0];

      if (match) {
        applySelection(toSelectedNode(match));
      } else {
        setDuplicate(null);
      }
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  function dismissDuplicate() {
    setDuplicate(null);
  }

  async function renameSelected(newName: string) {
    const current = getSingleValue(step);
    if (!current) return;

    const trimmed = newName.trim();
    if (trimmed.length === 0 || trimmed === current.name) return;

    setIsSubmitting(true);
    try {
      const result = await updateNode(current.id, { name: trimmed });
      const nextName =
        result.mode === "applied" ? result.data.name : trimmed;
      setSingleValue(step, { ...current, name: nextName });

      if (result.mode === "pending") {
        toast.success("Renomeação do nó enviada para revisão");
      }
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  function swapSelected() {
    setSingleValue(step, null);
    search.reset();
  }

  function removeTag(id: string) {
    const multi = getMultiState(step);
    if (!multi) return;
    multi.set(multi.items.filter((item) => item.id !== id));
  }

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
      const publicUrl = await uploadProductImage(file);
      setImagePublicUrl(publicUrl);
    } catch (error) {
      removeImage();
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  }

  function computeCanProceed(): boolean {
    switch (stepConfig.kind) {
      case "node-single":
        return getSingleValue(step) !== null;
      case "node-multi":
        return true;
      case "model":
        return modelName.trim().length >= 1;
      case "image":
        return true;
      case "review":
        return Boolean(categoria && marca && modelName.trim());
      default:
        return false;
    }
  }

  const canProceed = computeCanProceed();

  async function goNext() {
    if (stepConfig.kind === "model") {
      const valid = await modelForm.trigger("name");
      if (!valid) return;
    }
    if (!canProceed) return;

    const next = EDIT_STEP_ORDER[stepIndex + 1];
    if (next) {
      search.reset();
      setStep(next);
    }
  }

  function goBack() {
    const previous = EDIT_STEP_ORDER[stepIndex - 1];
    if (previous) {
      search.reset();
      setStep(previous);
    }
  }

  function goToStep(target: WizardStep) {
    search.reset();
    setStep(target);
  }

  function buildPayload() {
    const payload: {
      name?: string;
      image_url?: string | null;
      nodeIds?: string[];
    } = {};

    const trimmedName = modelName.trim();
    if (trimmedName.length > 0 && trimmedName !== initialName) {
      payload.name = trimmedName;
    }

    if (imageRemoved) {
      payload.image_url = null;
    } else if (imagePublicUrl && imagePublicUrl !== initialImageUrl) {
      payload.image_url = imagePublicUrl;
    }

    if (categoria && marca) {
      const nodeIds = [
        categoria.id,
        marca.id,
        ...tecnologias.map((node) => node.id),
        ...composicoes.map((node) => node.id),
        ...atributos.map((node) => node.id),
      ];

      if (!arraysEqual(nodeIds, initialNodeIds)) {
        payload.nodeIds = nodeIds;
      }
    }

    return payload;
  }

  function cancel() {
    router.push(product ? `/products/${product.id}` : "/feed");
  }

  async function submit() {
    if (!requireAuth()) return;
    if (!product || !canProceed || !categoria || !marca) return;

    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      toast.error("Nenhuma alteração foi informada");
      goToStep("revisao");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProduct(product.id, payload);

      if (result.mode === "applied") {
        toast.success("Alterações salvas");
        router.push(`/products/${product.id}`);
        return;
      }

      toast.success("Solicitação enviada para revisão");
      router.push(`/products/${product.id}`);
    } catch (error) {
      if (isApiError(error) && error.statusCode === 409) {
        notifyApiError(error);
        goToStep("modelo");
        return;
      }
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  const reviewItems: ReviewItem[] = [
    {
      step: "categoria",
      label: "Categoria",
      values: categoria ? [categoria.name] : [],
    },
    { step: "marca", label: "Marca", values: marca ? [marca.name] : [] },
    {
      step: "modelo",
      label: "Modelo",
      values: modelName.trim() ? [modelName.trim()] : [],
    },
    {
      step: "imagem",
      label: "Imagem",
      values: imagePublicUrl ? ["Imagem selecionada"] : [],
      emptyHint: "Nenhuma (opcional)",
      imagePreviewUrl,
    },
    {
      step: "tecnologia",
      label: "Tecnologia",
      values: tecnologias.map((node) => node.name),
      emptyHint: "Nenhuma (opcional)",
    },
    {
      step: "composicao",
      label: "Composição",
      values: composicoes.map((node) => node.name),
      emptyHint: "Nenhuma (opcional)",
    },
    {
      step: "atributo",
      label: "Atributo",
      values: atributos.map((node) => node.name),
      emptyHint: "Nenhum (opcional)",
    },
  ];

  return {
    product,
    notFound,
    isLoading,
    step,
    stepConfig,
    stepIndex,
    totalSteps,
    isFirstStep,
    isReviewStep,
    canProceed,
    isSubmitting,
    isUploadingImage,
    imagePreviewUrl,
    pendingRequest,
    isAdmin,
    currentSingleValue: getSingleValue(step),
    currentMultiItems: getMultiState(step)?.items ?? [],
    modelRegister: modelForm.register,
    modelError: modelForm.formState.errors.name,
    search,
    duplicate,
    reviewItems,
    selectNode,
    createNode,
    useExistingDuplicate,
    dismissDuplicate,
    renameSelected,
    swapSelected,
    removeTag,
    selectImage,
    removeImage,
    goNext,
    goBack,
    goToStep,
    cancel,
    submit,
  };
}
