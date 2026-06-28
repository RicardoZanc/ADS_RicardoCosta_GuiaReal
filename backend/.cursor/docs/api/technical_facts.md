# API — Technical Facts (Tools)

Endpoints internos para o pipeline de consolidação de fatos técnicos via n8n/IA.

**Base URL:** `http://localhost:3000/tool`

**Autenticação:** header `X-Tool-Api-Key` com valor de `TOOL_API_KEY` (`.env`).

---

## `GET /technical-facts/pending-interactions`

Lista threads de discussão com `status: PENDING` e peso de evidência calculado.

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Query

| Parâmetro | Tipo | Default |
|-----------|------|---------|
| `page` | int ≥ 1 | `1` |
| `limit` | int 1–100 | `20` |

### Resposta

```json
{
  "data": [
    {
      "thread_id": "uuid",
      "content": "Ponte fixa mantém melhor afinação.",
      "opinion_id": "uuid",
      "node_id": "uuid",
      "product_id": null,
      "evidence_weight": 12.5,
      "cached_upvotes": 5,
      "author": {
        "reputation_score": 10,
        "is_banned": false
      }
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

---

## `POST /technical-facts`

Cria um fato técnico consolidado, vincula evidências e marca threads como `PROCESSED`.

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `201 Created` |

### Body

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `node_id` | uuid | sim |
| `fact_label` | string | sim |
| `fact_description` | string | não |
| `consensus_score` | number | não |
| `status` | `HYPOTHESIS` · `VERIFIED` · `DISPUTED` | não |
| `evidence_thread_ids` | uuid[] (min 1) | sim |

### Resposta

```json
{
  "id": "uuid",
  "node_id": "uuid",
  "fact_label": "Ponte fixa mantém melhor afinação",
  "fact_description": null,
  "consensus_score": 0,
  "status": "HYPOTHESIS",
  "last_updated": "2026-01-01T00:00:00.000Z",
  "evidence_thread_ids": ["uuid"]
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | Threads de evidência devem estar PENDING |
| `404` | Nó ou thread não encontrada |
| `422` | Payload inválido |

---

## `PATCH /technical-facts/interactions/:thread_id/processed`

Marca uma thread como `PROCESSED` sem criar fato (descarte pelo pipeline).

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Resposta

```json
{
  "id": "uuid",
  "status": "PROCESSED"
}
```

---

## `GET /technical-facts`

Lista fatos consolidados de um nó (consulta RAG).

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Query

| Parâmetro | Tipo | Obrigatório |
|-----------|------|-------------|
| `node_id` | uuid | sim |

### Resposta

```json
{
  "data": [
    {
      "id": "uuid",
      "node_id": "uuid",
      "fact_label": "Ponte fixa mantém melhor afinação",
      "fact_description": null,
      "consensus_score": 0.85,
      "status": "VERIFIED",
      "last_updated": "2026-01-01T00:00:00.000Z",
      "evidence_thread_ids": ["uuid"]
    }
  ]
}
```
