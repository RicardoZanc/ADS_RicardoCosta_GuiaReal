# API — Evidence

Documentação de referência para preview de evidências da comunidade (fontes citadas no chat).

**Escopo:** `POST /api/evidence/preview`

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Content-Type | `application/json` |
| Autenticação | JWT Bearer |

---

## `POST /evidence/preview`

Resolve referências de evidência (`opinion` ou `thread`) em conteúdo legível com contexto de produto/nó e thread ao redor.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `evidence` | array | sim | 1–50 itens `{ source_type, source_id }` |

```json
{
  "evidence": [
    { "source_type": "opinion", "source_id": "uuid" },
    { "source_type": "thread", "source_id": "uuid" }
  ]
}
```

### Resposta

```json
{
  "data": [
    {
      "ref": { "source_type": "thread", "source_id": "uuid" },
      "context": {
        "type": "product",
        "product_id": "uuid",
        "node_id": "uuid",
        "title": "Nome do Produto",
        "tab_label": "Bluetooth"
      },
      "root_opinion": {
        "id": "uuid",
        "title": null,
        "content": "Texto da opinião raiz",
        "author": {
          "id": "uuid",
          "username": "usuario",
          "avatar_url": null,
          "is_admin": false
        },
        "created_at": "2026-01-01T00:00:00.000Z"
      },
      "thread_items": [
        {
          "id": "uuid",
          "kind": "opinion",
          "parent_id": null,
          "content": "Texto",
          "author": { "id": "uuid", "username": "usuario", "avatar_url": null, "is_admin": false },
          "created_at": "2026-01-01T00:00:00.000Z",
          "depth": 0,
          "is_evidence": false
        }
      ],
      "highlight_id": "uuid",
      "discussion_path": "/products/uuid?node_id=uuid&highlight=thread:uuid"
    }
  ]
}
```

### Regras

- Evidências ocultas (`is_hidden`) são omitidas do array `data`.
- Refs duplicadas são deduplicadas antes da resolução.
- `discussion_path` é relativo ao frontend (sem domínio).

### `discussion_path`

| Contexto | Formato |
|----------|---------|
| Produto (escopo produto) | `/products/{productId}?highlight=opinion:{id}` ou `?highlight=thread:{id}` |
| Produto (aba de nó) | `/products/{productId}?node_id={nodeId}&highlight=thread:{id}` |
| Página de nó | `/nodes/{nodeId}?highlight=thread:{id}` |
