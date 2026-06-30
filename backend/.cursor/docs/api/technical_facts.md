# API — Technical Facts (Tools)

Endpoints internos para o pipeline de consolidação de fatos técnicos via n8n/IA.

**Base URL:** `http://localhost:3000/tool`

**Autenticação:** header `X-Tool-Api-Key` com valor de `TOOL_API_KEY` (`.env`).

---

## `GET /technical-facts/pending-queue`

Lista itens pendentes da fila unificada: **opiniões** e **threads** com `status: PENDING`, ordenados por `created_at`.

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
      "source_type": "opinion",
      "source_id": "uuid",
      "title": "Excelente para Shred",
      "content": "O braço é extremamente confortável...",
      "opinion_id": "uuid",
      "node_id": null,
      "product_id": "uuid",
      "evidence_weight": 12.5,
      "cached_upvotes": 5,
      "author": {
        "reputation_score": 10,
        "is_banned": false
      }
    },
    {
      "source_type": "thread",
      "source_id": "uuid",
      "title": null,
      "content": "Vale a pena lubrificar os carrinhos...",
      "opinion_id": "uuid",
      "node_id": null,
      "product_id": "uuid",
      "evidence_weight": 8.0,
      "cached_upvotes": 3,
      "author": {
        "reputation_score": 5,
        "is_banned": false
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

Itens com `is_hidden = true` são excluídos da fila.

---

## `POST /technical-facts`

Cria um fato técnico consolidado, vincula evidências (opiniões e/ou threads) e marca as fontes como `PROCESSED`.

Evidências podem estar `PENDING` ou `PROCESSED` e a mesma fonte pode vincular-se a vários fatos.

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
| `evidence` | `{ source_type, source_id }[]` (min 1) | sim |

`source_type`: `opinion` ou `thread`.

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
  "evidence": [
    { "source_type": "opinion", "source_id": "uuid" },
    { "source_type": "thread", "source_id": "uuid" }
  ]
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | evidence não pode conter fontes duplicadas |
| `404` | Nó, opinião ou thread não encontrada |
| `422` | Payload inválido |

---

## `PATCH /technical-facts/queue/:source_type/:source_id/processed`

Marca um item da fila como `PROCESSED` sem criar fato (descarte pelo pipeline).

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Valores |
|-----------|------|---------|
| `source_type` | enum | `opinion` · `thread` |
| `source_id` | uuid | ID da opinião ou thread |

### Resposta

```json
{
  "source_type": "thread",
  "source_id": "uuid",
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
| `node_id` | uuid | não* |
| `status` | `HYPOTHESIS` · `VERIFIED` · `DISPUTED` | não* |
| `limit` | int 1–50 | não (default `20`) |

\* Informe ao menos `node_id` ou `status`.

Exemplos:
- `?node_id=<uuid>` — fatos do nó
- `?status=HYPOTHESIS&limit=1` — uma hipótese pendente (modo revisão)
- `?node_id=<uuid>&status=HYPOTHESIS` — hipóteses de um nó

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
      "evidence": [
        { "source_type": "thread", "source_id": "uuid" },
        { "source_type": "opinion", "source_id": "uuid" }
      ]
    }
  ]
}
```

---

## `GET /technical-facts/by-evidence/:source_type/:source_id`

Lista fatos técnicos vinculados a uma opinião ou thread (usado na revisão após denúncia).

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Valores |
|-----------|------|---------|
| `source_type` | enum | `opinion` · `thread` |
| `source_id` | uuid | ID da fonte denunciada |

### Resposta

```json
{
  "reported_source": {
    "source_type": "thread",
    "source_id": "uuid",
    "title": null,
    "content": "Texto denunciado...",
    "is_hidden": false,
    "reports_locked": false,
    "author": { "id": "uuid", "username": "user" }
  },
  "data": [
    {
      "id": "uuid",
      "node_id": "uuid",
      "fact_label": "Afirmação técnica",
      "fact_description": null,
      "consensus_score": 0.7,
      "status": "VERIFIED",
      "last_updated": "2026-01-01T00:00:00.000Z",
      "evidence": [
        { "source_type": "thread", "source_id": "uuid" }
      ]
    }
  ]
}
```

---

## `POST /technical-facts/:id/evidence`

Anexa evidências a um fato técnico existente (ex.: confirmar hipótese) e marca as fontes como `PROCESSED`.

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Body

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `evidence` | `{ source_type, source_id }[]` (min 1) | sim |
| `consensus_score` | number 0–1 | não |
| `status` | `HYPOTHESIS` · `VERIFIED` · `DISPUTED` | não |

### Resposta

```json
{
  "id": "uuid",
  "node_id": "uuid",
  "fact_label": "Freio ABS traz maior segurança",
  "fact_description": null,
  "consensus_score": 0.75,
  "status": "VERIFIED",
  "last_updated": "2026-01-01T00:00:00.000Z",
  "evidence": [
    { "source_type": "thread", "source_id": "uuid" }
  ]
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | evidence não pode conter fontes duplicadas |
| `404` | Fato, opinião ou thread não encontrada |
| `422` | Payload inválido |

---

## `PATCH /technical-facts/:id`

Atualiza um fato técnico existente (revisão pós-denúncia).

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Body (ao menos um campo)

| Campo | Tipo |
|-------|------|
| `fact_label` | string |
| `fact_description` | string |
| `consensus_score` | number 0–1 |
| `status` | `HYPOTHESIS` · `VERIFIED` · `DISPUTED` |

---

## `DELETE /technical-facts/:fact_id/evidence/:source_type/:source_id`

Remove o vínculo de evidência entre um fato e uma opinião/thread.

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Resposta

```json
{
  "fact_id": "uuid",
  "source_type": "thread",
  "source_id": "uuid",
  "removed": true
}
```
