"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiClient } from "@/lib/api";
import { isApiError } from "@/lib/errors";
import { notifyApiError } from "@/lib/notifyApiError";
import { useNodeSearch } from "@/hooks/useNodeSearch";
import {
  getNodeCreateOption,
  NODE_CREATE_OPTIONS,
} from "@/lib/nodeCreate/constants";
import type {
  NodeRecord,
  NodesListResponse,
  NodeType,
  SelectedNode,
} from "@/lib/types/nodes";

interface DuplicatePrompt {
  name: string;
  target: "tipo" | "node";
}

function toSelectedNode(node: NodeRecord): SelectedNode {
  return { id: node.id, name: node.name, type: node.type };
}

export function useNodeCreateController() {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<NodeType>("TIPO");
  const [selectedTipo, setSelectedTipo] = useState<SelectedNode | null>(null);
  const [nodeName, setNodeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState<DuplicatePrompt | null>(null);

  const typeConfig = getNodeCreateOption(selectedType);
  const isCategoriaFlow = selectedType === "CATEGORIA";

  const tipoSearch = useNodeSearch({ type: isCategoriaFlow ? "TIPO" : null });

  function resetTipoSearch() {
    tipoSearch.reset();
    setDuplicate(null);
  }

  function selectType(type: NodeType) {
    setSelectedType(type);
    setSelectedTipo(null);
    setNodeName("");
    resetTipoSearch();
  }

  function selectTipo(node: NodeRecord) {
    setSelectedTipo(toSelectedNode(node));
    tipoSearch.reset();
    setDuplicate(null);
  }

  function swapTipo() {
    setSelectedTipo(null);
    setNodeName("");
    setDuplicate(null);
  }

  async function createTipo(name: string) {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;

    setIsSubmitting(true);
    try {
      const node = await apiClient<NodeRecord>("/nodes", {
        method: "POST",
        body: JSON.stringify({ name: trimmed, type: "TIPO" }),
      });

      setSelectedTipo(toSelectedNode(node));
      tipoSearch.reset();
      setDuplicate(null);
      toast.success(`Tipo "${node.name}" criado`);
    } catch (error) {
      if (isApiError(error) && error.statusCode === 409) {
        setDuplicate({ name: trimmed, target: "tipo" });
        return;
      }
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function createNode(name?: string) {
    const trimmed = (name ?? nodeName).trim();
    if (trimmed.length === 0) return;

    if (isCategoriaFlow && !selectedTipo) return;

    setIsSubmitting(true);
    try {
      const payload =
        isCategoriaFlow && selectedTipo
          ? { name: trimmed, type: "CATEGORIA", parent_id: selectedTipo.id }
          : { name: trimmed, type: selectedType };

      const node = await apiClient<NodeRecord>("/nodes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success(typeConfig.successToast);
      router.push(`/nodes/${node.id}`);
    } catch (error) {
      if (isApiError(error) && error.statusCode === 409) {
        setDuplicate({ name: trimmed, target: "node" });
        return;
      }
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  function submitCreate() {
    createNode();
  }

  async function useExistingDuplicate() {
    if (!duplicate) return;

    const targetName = duplicate.name.trim();
    setIsSubmitting(true);
    try {
      if (duplicate.target === "tipo") {
        const response = await apiClient<NodesListResponse>("/nodes", {
          params: { q: targetName, type: "TIPO", limit: "20" },
        });
        const lowered = targetName.toLowerCase();
        const match =
          response.data.find((node) => node.name.toLowerCase() === lowered) ??
          response.data[0];

        if (match) {
          selectTipo(match);
        } else {
          setDuplicate(null);
        }
        return;
      }

      const params: Record<string, string> = { q: targetName, limit: "20" };
      if (isCategoriaFlow && selectedTipo) {
        params.tipo_id = selectedTipo.id;
      } else {
        params.type = selectedType;
      }

      const response = await apiClient<NodesListResponse>("/nodes", { params });
      const lowered = targetName.toLowerCase();
      const match =
        response.data.find((node) => node.name.toLowerCase() === lowered) ??
        response.data[0];

      if (match) {
        router.push(`/nodes/${match.id}`);
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

  function hasAnyData(): boolean {
    return Boolean(
      selectedTipo || tipoSearch.query.trim() || nodeName.trim()
    );
  }

  function cancel() {
    if (hasAnyData()) {
      const confirmed = window.confirm(
        "Descartar o cadastro deste tópico? Os dados preenchidos serão perdidos."
      );
      if (!confirmed) return;
    }
    router.push("/create");
  }

  const canSubmitCreate =
    nodeName.trim().length > 0 && (!isCategoriaFlow || selectedTipo !== null);

  return {
    selectedType,
    typeConfig,
    typeOptions: NODE_CREATE_OPTIONS,
    isCategoriaFlow,
    selectedTipo,
    nodeName,
    setNodeName,
    isSubmitting,
    canSubmitCreate,
    duplicate,
    tipoSearch,
    selectType,
    selectTipo,
    swapTipo,
    createTipo,
    submitCreate,
    useExistingDuplicate,
    dismissDuplicate,
    cancel,
  };
}
