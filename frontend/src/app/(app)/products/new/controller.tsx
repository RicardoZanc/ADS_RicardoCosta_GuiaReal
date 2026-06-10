"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiClient } from "@/lib/api";
import { isApiError } from "@/lib/errors";
import { notifyApiError } from "@/lib/notifyApiError";
import { useNodeSearch } from "@/hooks/useNodeSearch";
import {
  STEP_ORDER,
  getStepConfig,
  type WizardStep,
} from "@/lib/productCreate/constants";
import {
  productModelSchema,
  type ProductModelFormData,
} from "@/lib/schemas/productCreate";
import type {
  NodeRecord,
  NodesListResponse,
  SelectedNode,
} from "@/lib/types/nodes";
import type { CreateProductResponse } from "@/lib/types/products";
import type { ReviewItem } from "@/components/product-create/ProductCreateReviewList";

interface DuplicatePrompt {
  name: string;
}

function toSelectedNode(node: NodeRecord): SelectedNode {
  return { id: node.id, name: node.name, type: node.type };
}

export function useProductCreateController() {
  const router = useRouter();

  const [step, setStep] = useState<WizardStep>("tipo");
  const [tipo, setTipo] = useState<SelectedNode | null>(null);
  const [categoria, setCategoria] = useState<SelectedNode | null>(null);
  const [marca, setMarca] = useState<SelectedNode | null>(null);
  const [tecnologias, setTecnologias] = useState<SelectedNode[]>([]);
  const [composicoes, setComposicoes] = useState<SelectedNode[]>([]);
  const [atributos, setAtributos] = useState<SelectedNode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState<DuplicatePrompt | null>(null);

  const modelForm = useForm<ProductModelFormData>({
    resolver: zodResolver(productModelSchema),
    defaultValues: { name: "" },
    mode: "onBlur",
  });

  const modelName = modelForm.watch("name") ?? "";

  const stepConfig = getStepConfig(step);
  const stepIndex = STEP_ORDER.indexOf(step);
  const totalSteps = STEP_ORDER.length;
  const isFirstStep = stepIndex === 0;
  const isReviewStep = stepConfig.kind === "review";

  const activeNodeType = stepConfig.nodeType ?? null;
  const activeTipoId = step === "categoria" ? tipo?.id ?? null : null;

  const search = useNodeSearch({ type: activeNodeType, tipoId: activeTipoId });

  function getSingleValue(target: WizardStep): SelectedNode | null {
    if (target === "tipo") return tipo;
    if (target === "categoria") return categoria;
    if (target === "marca") return marca;
    return null;
  }

  function setSingleValue(target: WizardStep, value: SelectedNode | null) {
    if (target === "tipo") {
      setTipo(value);
      return;
    }
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
      if (step === "tipo" && tipo && tipo.id !== node.id) {
        setCategoria(null);
      }
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
      } else {
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
      const node = await apiClient<NodeRecord>(`/nodes/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: trimmed }),
      });
      setSingleValue(step, toSelectedNode(node));
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  function swapSelected() {
    if (step === "tipo") {
      setCategoria(null);
    }
    setSingleValue(step, null);
    search.reset();
  }

  function removeTag(id: string) {
    const multi = getMultiState(step);
    if (!multi) return;
    multi.set(multi.items.filter((item) => item.id !== id));
  }

  function computeCanProceed(): boolean {
    switch (stepConfig.kind) {
      case "node-single":
        return getSingleValue(step) !== null;
      case "node-multi":
        return true;
      case "model":
        return modelName.trim().length >= 1;
      case "review":
        return Boolean(tipo && categoria && marca && modelName.trim());
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

    const next = STEP_ORDER[stepIndex + 1];
    if (next) {
      search.reset();
      setStep(next);
    }
  }

  function goBack() {
    const previous = STEP_ORDER[stepIndex - 1];
    if (previous) {
      search.reset();
      setStep(previous);
    }
  }

  function goToStep(target: WizardStep) {
    search.reset();
    setStep(target);
  }

  function hasAnyData(): boolean {
    return Boolean(
      tipo ||
        categoria ||
        marca ||
        modelName.trim() ||
        tecnologias.length ||
        composicoes.length ||
        atributos.length
    );
  }

  function cancel() {
    if (hasAnyData()) {
      const confirmed = window.confirm(
        "Descartar o cadastro deste produto? Os dados preenchidos serão perdidos."
      );
      if (!confirmed) return;
    }
    router.push("/feed");
  }

  async function submit() {
    if (!canProceed || !categoria || !marca) return;

    const nodeIds = [
      categoria.id,
      marca.id,
      ...tecnologias.map((node) => node.id),
      ...composicoes.map((node) => node.id),
      ...atributos.map((node) => node.id),
    ];

    setIsSubmitting(true);
    try {
      await apiClient<CreateProductResponse>("/products", {
        method: "POST",
        body: JSON.stringify({ name: modelName.trim(), nodeIds }),
      });

      toast.success("Produto cadastrado com sucesso");
      router.push("/feed");
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
    { step: "tipo", label: "Tipo", values: tipo ? [tipo.name] : [] },
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
    step,
    stepConfig,
    stepIndex,
    totalSteps,
    isFirstStep,
    isReviewStep,
    canProceed,
    isSubmitting,

    currentSingleValue: getSingleValue(step),
    currentMultiItems: getMultiState(step)?.items ?? [],

    tipo,
    categoria,
    marca,
    tecnologias,
    composicoes,
    atributos,

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

    goNext,
    goBack,
    goToStep,
    cancel,
    submit,
  };
}
