# API — Nodes (Tools)

Endpoint interno para o agente de chat consultar a taxonomia por nome.

**Base URL:** `http://localhost:3000/tool`

**Autenticação:** header `X-Tool-Api-Key` com valor de `TOOL_API_KEY` (`.env`).

---

## `GET /nodes/search`

Busca nós da taxonomia por similaridade de nome (pg_trgm).

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Query

| Parâmetro | Tipo | Obrigatório |
|-----------|------|-------------|
| `q` | string | sim |
| `type` | `TIPO` · `CATEGORIA` · `MARCA` · `TECNOLOGIA` · `COMPOSICAO` · `ATRIBUTO` | não |
| `page` | int ≥ 1 | não (default `1`) |
| `limit` | int 1–100 | não (default `20`) |

### Resposta

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Floyd Rose",
      "type": "TECNOLOGIA",
      "parent_id": "uuid",
      "wikidata_id": null,
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `422` | Payload inválido (`q` ausente) |
