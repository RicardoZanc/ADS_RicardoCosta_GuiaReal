# API — Search

Busca global unificada para o modal de pesquisa da plataforma.

**Escopo deste arquivo:** rota em `/api/search`.

**Fora do escopo:** busca escopada de produtos ([products.md](products.md)), busca de nós isolada ([nodes.md](nodes.md)).

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Autenticação | Opcional (JWT Bearer) |

---

## `GET /search`

Retorna nodes e produtos relevantes para um termo de busca.

| Item | Valor |
|------|-------|
| Autenticação | Opcional |
| Sucesso | `200 OK` |

### Query

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `q` | string | — | Termo de busca (obrigatório, trim, min 1) |
| `limit_nodes` | int | `20` | Máximo de nodes retornados (1–100) |
| `limit_products` | int | `10` | Máximo de produtos retornados (1–50) |

### Regras de relevância

1. **Nodes** — mesma lógica de `GET /nodes` com `q` (similaridade `pg_trgm`, threshold `PRODUCTS_SEARCH_FUZZINESS` / `NODES_SEARCH_FUZZINESS`, padrão `0.3`).
2. **Node âncora** — primeiro node retornado (maior similaridade com `q`).
3. **Produtos** — incluídos se:
   - `similarity(p.name, q)` atinge o threshold, **ou**
   - o produto está vinculado ao node âncora via `product_nodes`.
4. **Ordenação de produtos** — `similarity(p.name, q) DESC`, depois `p.name ASC`.

### Resposta

```json
{
  "nodes": {
    "data": [
      {
        "id": "uuid",
        "name": "Guitarras",
        "type": "CATEGORIA",
        "parent_id": "uuid",
        "wikidata_id": null,
        "image_url": null,
        "created_at": "2026-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  },
  "products": {
    "data": [
      {
        "id": "uuid",
        "name": "Ibanez RG550",
        "brand_name": "Ibanez",
        "image_url": null,
        "created_at": "2026-01-01T00:00:00.000Z",
        "categoria": { "id": "uuid", "name": "Guitarras" },
        "marca": { "id": "uuid", "name": "Ibanez" }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `422` | `Dados inválidos` |
