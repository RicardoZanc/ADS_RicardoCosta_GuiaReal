"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { notifyApiError } from "@/lib/notifyApiError";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  fetchProductSearch,
  PRODUCT_SEARCH_PAGE_LIMIT,
} from "@/lib/search";
import type { FeedPagination } from "@/lib/types/feed";
import type {
  NodeDetailResponse,
  NodeRecord,
  NodesListResponse,
  SelectedNode,
} from "@/lib/types/nodes";
import type {
  FacetType,
  ProductSearchItem,
  SelectedFacetMeta,
} from "@/lib/types/search";

const FACET_TYPES = new Set<FacetType>([
  "TECNOLOGIA",
  "COMPOSICAO",
  "ATRIBUTO",
]);

function isFacetType(type: string): type is FacetType {
  return FACET_TYPES.has(type as FacetType);
}

function toSelectedNode(node: NodeRecord | NodeDetailResponse): SelectedNode {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
  };
}

function parseNodeIds(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildUrlQuery(input: {
  tipo: SelectedNode | null;
  categoria: SelectedNode | null;
  selectedNodeIds: Set<string>;
  productQuery: string;
  page: number;
}): string {
  const params = new URLSearchParams();

  if (input.categoria) {
    params.set("categoria_id", input.categoria.id);
  } else if (input.tipo) {
    params.set("tipo_id", input.tipo.id);
  }

  if (input.selectedNodeIds.size > 0) {
    params.set("node_ids", [...input.selectedNodeIds].join(","));
  }

  const trimmedQuery = input.productQuery.trim();
  if (trimmedQuery) {
    params.set("q", trimmedQuery);
  }

  if (input.page > 1) {
    params.set("page", String(input.page));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

async function resolveTipoFromUrl(tipoId: string): Promise<SelectedNode | null> {
  const response = await apiClient<NodesListResponse>("/nodes", {
    params: { type: "TIPO", limit: "100" },
  });

  const found = response.data.find((node) => node.id === tipoId);
  return found ? toSelectedNode(found) : null;
}

async function resolveCategoriaFromUrl(
  categoriaId: string
): Promise<{ categoria: SelectedNode; tipo: SelectedNode | null } | null> {
  const node = await apiClient<NodeDetailResponse>(`/nodes/${categoriaId}`);

  if (node.type !== "CATEGORIA") {
    return null;
  }

  const categoria = toSelectedNode(node);
  const tipo = node.context.parentTipo
    ? {
        id: node.context.parentTipo.id,
        name: node.context.parentTipo.name,
        type: "TIPO" as const,
      }
    : null;

  return { categoria, tipo };
}

async function resolveSelectedFacetMeta(
  nodeIds: string[]
): Promise<Map<string, SelectedFacetMeta>> {
  if (nodeIds.length === 0) {
    return new Map();
  }

  const results = await Promise.allSettled(
    nodeIds.map((id) => apiClient<NodeDetailResponse>(`/nodes/${id}`))
  );

  const meta = new Map<string, SelectedFacetMeta>();

  for (const result of results) {
    if (result.status === "fulfilled" && isFacetType(result.value.type)) {
      meta.set(result.value.id, {
        id: result.value.id,
        name: result.value.name,
        type: result.value.type,
      });
    }
  }

  return meta;
}

export function useBuscaController() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tipo, setTipo] = useState<SelectedNode | null>(null);
  const [categoria, setCategoria] = useState<SelectedNode | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(
    () => new Set(parseNodeIds(searchParams.get("node_ids")))
  );
  const [selectedFacetMeta, setSelectedFacetMeta] = useState<
    Map<string, SelectedFacetMeta>
  >(new Map());
  const [productQuery, setProductQuery] = useState(
    () => searchParams.get("q") ?? ""
  );
  const [page, setPage] = useState(() => {
    const parsed = Number.parseInt(searchParams.get("page") ?? "1", 10);
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  });
  const [facetResetKey, setFacetResetKey] = useState(0);
  const [products, setProducts] = useState<ProductSearchItem[]>([]);
  const [pagination, setPagination] = useState<FeedPagination | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const debouncedQuery = useDebouncedValue(productQuery, 300);
  const hasHydratedRef = useRef(false);
  const skipUrlSyncRef = useRef(true);

  const scopeParams = useMemo(() => {
    if (categoria) {
      return { categoria_id: categoria.id };
    }

    if (tipo) {
      return { tipo_id: tipo.id };
    }

    return null;
  }, [categoria, tipo]);

  const hasScope = scopeParams !== null;

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }

    let active = true;

    async function hydrateFromUrl() {
      setIsHydrating(true);

      try {
        const categoriaId = searchParams.get("categoria_id");
        const tipoId = searchParams.get("tipo_id");
        const nodeIds = parseNodeIds(searchParams.get("node_ids"));

        if (categoriaId) {
          const resolved = await resolveCategoriaFromUrl(categoriaId);
          if (active && resolved) {
            setCategoria(resolved.categoria);
            setTipo(resolved.tipo);
          }
        } else if (tipoId) {
          const resolvedTipo = await resolveTipoFromUrl(tipoId);
          if (active && resolvedTipo) {
            setTipo(resolvedTipo);
            setCategoria(null);
          }
        }

        if (active && nodeIds.length > 0) {
          const meta = await resolveSelectedFacetMeta(nodeIds);
          if (active) {
            setSelectedFacetMeta(meta);
          }
        }
      } catch (error) {
        if (active) {
          notifyApiError(error);
        }
      } finally {
        if (active) {
          hasHydratedRef.current = true;
          skipUrlSyncRef.current = false;
          setIsHydrating(false);
        }
      }
    }

    void hydrateFromUrl();

    return () => {
      active = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!hasHydratedRef.current || skipUrlSyncRef.current) {
      return;
    }

    const nextQuery = buildUrlQuery({
      tipo,
      categoria,
      selectedNodeIds,
      productQuery: debouncedQuery,
      page,
    });

    router.replace(`/busca${nextQuery}`, { scroll: false });
  }, [tipo, categoria, selectedNodeIds, debouncedQuery, page, router]);

  useEffect(() => {
    if (!scopeParams) {
      setProducts([]);
      setPagination(null);
      return;
    }

    let active = true;
    setIsLoadingProducts(true);

    fetchProductSearch({
      ...scopeParams,
      node_ids: [...selectedNodeIds],
      q: debouncedQuery.trim() || undefined,
      page,
      limit: PRODUCT_SEARCH_PAGE_LIMIT,
    })
      .then((response) => {
        if (active) {
          setProducts(response.data);
          setPagination(response.pagination);
        }
      })
      .catch((error) => {
        if (active) {
          notifyApiError(error);
          setProducts([]);
          setPagination(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingProducts(false);
        }
      });

    return () => {
      active = false;
    };
  }, [scopeParams, selectedNodeIds, debouncedQuery, page]);

  const bumpFacetReset = useCallback(() => {
    setFacetResetKey((current) => current + 1);
  }, []);

  const handleSelectTipo = useCallback(
    (node: NodeRecord) => {
      setTipo(toSelectedNode(node));
      setCategoria(null);
      setSelectedNodeIds(new Set());
      setSelectedFacetMeta(new Map());
      setPage(1);
      bumpFacetReset();
    },
    [bumpFacetReset]
  );

  const handleSelectCategoria = useCallback(
    (node: NodeRecord) => {
      setCategoria(toSelectedNode(node));
      setSelectedNodeIds(new Set());
      setSelectedFacetMeta(new Map());
      setPage(1);
      bumpFacetReset();
    },
    [bumpFacetReset]
  );

  const handleClearScope = useCallback(() => {
    setTipo(null);
    setCategoria(null);
    setSelectedNodeIds(new Set());
    setSelectedFacetMeta(new Map());
    setProductQuery("");
    setPage(1);
    setProducts([]);
    setPagination(null);
    bumpFacetReset();
  }, [bumpFacetReset]);

  const toggleFacet = useCallback(
    (nodeId: string, meta?: SelectedFacetMeta) => {
      setSelectedNodeIds((current) => {
        const next = new Set(current);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });

      setSelectedFacetMeta((current) => {
        const next = new Map(current);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else if (meta) {
          next.set(nodeId, meta);
        }
        return next;
      });

      setPage(1);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setSelectedNodeIds(new Set());
    setSelectedFacetMeta(new Map());
    setProductQuery("");
    setPage(1);
    bumpFacetReset();
  }, [bumpFacetReset]);

  const goToPreviousPage = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  const hasActiveFilters =
    selectedNodeIds.size > 0 || productQuery.trim().length > 0;

  const emptyProductsMessage =
    selectedNodeIds.size > 0 || debouncedQuery.trim()
      ? "Nenhum produto com esses filtros."
      : "Nenhum produto encontrado neste escopo.";

  return {
    tipo,
    categoria,
    scopeParams,
    selectedNodeIds,
    selectedFacetMeta,
    facetResetKey,
    productQuery,
    setProductQuery,
    products,
    pagination,
    hasScope,
    isLoading: isHydrating,
    isLoadingProducts,
    hasActiveFilters,
    emptyProductsMessage,
    handleSelectTipo,
    handleSelectCategoria,
    handleClearScope,
    toggleFacet,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  };
}
