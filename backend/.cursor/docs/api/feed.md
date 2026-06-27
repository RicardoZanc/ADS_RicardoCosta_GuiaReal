# API — Feed

Documentação de referência para clientes (humanos e LLM) da API REST do GuiaReal.

**Escopo deste arquivo:** rotas em `/api/feed`.

**Fora do escopo:** autenticação ([auth.md](auth.md)), CRUD de produtos/nós, criação de opiniões.

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Autenticação | JWT Bearer em todas as rotas deste módulo |

---

## `GET /feed`

Feed paginado de produtos e nós com atividade de discussão.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Query

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | int | `1` | Página (mín. 1) |
| `limit` | int | `20` | Itens por página (1–100) |

### Composição do feed

O feed une:

- **Todos os produtos** (`kind: "product"`).
- **Nós** dos tipos `COMPOSICAO`, `TECNOLOGIA`, `MARCA`, `ATRIBUTO` (`kind: "node"`).

Itens ordenados por `last_activity_at` (última opinião ou thread), depois por `created_at`.

Cada item inclui até **3 previews** de discussão (`discussionPreviews`), priorizando threads raiz mais recentes e, em seguida, opiniões.

### Resposta

```json
{
  "data": [
    {
      "kind": "product",
      "id": "uuid",
      "name": "Ibanez RG550",
      "brand_name": "Ibanez",
      "image_url": "https://example.com/img.jpg",
      "created_at": "2026-01-01T00:00:00.000Z",
      "nodes": [
        {
          "id": "uuid",
          "name": "Ibanez",
          "type": "MARCA"
        },
        {
          "id": "uuid",
          "name": "Floyd Rose",
          "type": "TECNOLOGIA"
        }
      ],
      "discussionPreviews": [
        {
          "id": "uuid",
          "content": "Excelente para shred.",
          "created_at": "2026-01-01T12:00:00.000Z",
          "author": { "id": "uuid", "username": "usuario" }
        }
      ]
    },
    {
      "kind": "node",
      "id": "uuid",
      "name": "Floyd Rose",
      "brand_name": null,
      "image_url": null,
      "created_at": "2026-01-01T00:00:00.000Z",
      "nodes": [
        {
          "id": "uuid",
          "name": "Floyd Rose",
          "type": "TECNOLOGIA"
        }
      ],
      "discussionPreviews": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### Campos do item

| Campo | Descrição |
|-------|-----------|
| `kind` | `"product"` ou `"node"` |
| `brand_name` | Nome da marca vinculada (produtos); `null` para nós |
| `image_url` | URL da imagem (produtos); `null` para nós |
| `nodes` | Nós de contexto (`COMPOSICAO`, `TECNOLOGIA`, `MARCA`, `ATRIBUTO`) resolvidos subindo a árvore |
| `discussionPreviews` | Até 3 trechos recentes de opiniões ou threads |

### Erros

| Status | `message` típico |
|--------|------------------|
| `401` | Token ausente ou inválido |
| `422` | `Dados inválidos` |
