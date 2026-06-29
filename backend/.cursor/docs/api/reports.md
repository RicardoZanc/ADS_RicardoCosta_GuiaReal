# API — Reports (Denúncias)

Endpoints para denúncia de opiniões e comentários, com moderação administrativa.

**Base URL:** `http://localhost:3000/api`

**Autenticação:** JWT Bearer em todas as rotas.

---

## `POST /reports`

Cria uma denúncia sobre uma opinião raiz ou comentário (thread).

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `201 Created` |

### Body

```json
{
  "target_type": "opinion",
  "target_id": "uuid",
  "reason": "SPAM"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `target_type` | `"opinion"` \| `"thread"` | Tipo do conteúdo denunciado |
| `target_id` | uuid | ID da opinião ou thread |
| `reason` | string | `SPAM`, `OFFENSIVE`, `MISLEADING`, `OFF_TOPIC`, `OTHER` |

### Regras

- Denunciante não pode ser o autor do conteúdo
- Um usuário só pode denunciar o mesmo alvo uma vez
- Conteúdo com `reports_locked = true` não pode ser denunciado
- Conteúdo oculto (`is_hidden`) retorna `404`
- Se o conteúdo estiver vinculado a fatos técnicos via `fact_evidence`, dispara webhook n8n (`N8N_REPORT_WEBHOOK_URL`) para revisão automática

### Resposta

```json
{
  "id": "uuid",
  "target_type": "thread",
  "target_id": "uuid",
  "reason": "SPAM",
  "status": "PENDING",
  "created_at": "2026-06-29T00:00:00.000Z",
  "linked_fact_count": 2
}
```

### Erros

| Status | Situação |
|--------|----------|
| `403` | Denunciar próprio conteúdo |
| `404` | Alvo não encontrado ou oculto |
| `409` | Já denunciado ou `reports_locked` |

---

## `GET /reports`

Lista denúncias (somente administradores).

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer + `is_admin` |
| Sucesso | `200 OK` |

### Query

| Parâmetro | Tipo | Default |
|-----------|------|---------|
| `status` | `PENDING` \| `UNDER_REVIEW` \| `RESOLVED` \| `REJECTED` | todos |
| `page` | int ≥ 1 | `1` |
| `limit` | int 1–100 | `20` |

### Resposta

```json
{
  "data": [
    {
      "id": "uuid",
      "reason": "SPAM",
      "status": "PENDING",
      "admin_notes": null,
      "created_at": "2026-06-29T00:00:00.000Z",
      "reviewed_at": null,
      "reporter": { "id": "uuid", "username": "mod_sensei" },
      "reviewer": null,
      "target": {
        "type": "thread",
        "id": "uuid",
        "title": null,
        "content": "Texto do comentário...",
        "is_hidden": false,
        "reports_locked": false,
        "author": { "id": "uuid", "username": "shredder_99" }
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

## `PATCH /reports/:id`

Atualiza o status de uma denúncia (somente administradores).

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer + `is_admin` |
| Sucesso | `200 OK` |

### Body

```json
{
  "status": "RESOLVED",
  "admin_notes": "Conteúdo ofensivo confirmado."
}
```

| Status | Efeito no conteúdo |
|--------|-------------------|
| `UNDER_REVIEW` | Apenas atualiza a denúncia |
| `RESOLVED` | Oculta o conteúdo (`is_hidden = true`) |
| `REJECTED` | Bloqueia novas denúncias (`reports_locked = true`) |

### Resposta

```json
{
  "id": "uuid",
  "status": "RESOLVED",
  "admin_notes": "Conteúdo ofensivo confirmado.",
  "reviewed_at": "2026-06-29T01:00:00.000Z",
  "target_type": "thread",
  "target_id": "uuid"
}
```

---

## Webhook n8n (outbound)

Quando uma denúncia é criada e há fatos técnicos vinculados:

| Variável | Exemplo |
|----------|---------|
| `N8N_REPORT_WEBHOOK_URL` | `http://localhost:5678/webhook/report-fact-review` |

**Payload:**

```json
{
  "report_id": "uuid",
  "source_type": "thread",
  "source_id": "uuid",
  "reason": "MISLEADING",
  "fact_ids": ["uuid", "uuid"]
}
```

Ver [technical_facts.md](technical_facts.md) para endpoints de revisão usados pelo agente n8n.
