# API — Chats

Endpoints de chat para usuários autenticados e integração com o agente n8n via webhook assíncrono.

---

## REST — Usuários

**Base URL:** `http://localhost:3000/api`

**Autenticação:** header `Authorization: Bearer <access_token>`

### `POST /chats`

Cria um chat sem título e persiste a primeira mensagem do usuário. Dispara webhook assíncrono para o n8n processar a resposta do agente.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `201 Created` |

#### Body

```json
{
  "content": "Qual o melhor arroz integral?"
}
```

| Campo | Tipo | Regras |
|-------|------|--------|
| `content` | string | obrigatório, 1–4000 caracteres |

#### Resposta

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": null,
  "created_at": "2026-06-28T03:00:00.000Z",
  "messages": [
    {
      "id": "uuid",
      "chat_id": "uuid",
      "sender": "USER",
      "content": "Qual o melhor arroz integral?",
      "mentioned_evidences": null,
      "mentioned_technical_facts": null,
      "created_at": "2026-06-28T03:00:00.000Z"
    }
  ]
}
```

---

### `GET /chats`

Lista os chats do usuário autenticado, ordenados do mais recente ao mais antigo.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

#### Resposta

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Melhor arroz integral",
      "created_at": "2026-06-28T03:00:00.000Z"
    }
  ]
}
```

---

### `GET /chats/:id`

Retorna um chat e todas as mensagens ordenadas por `created_at` ascendente.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

#### Resposta

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Melhor arroz integral",
  "created_at": "2026-06-28T03:00:00.000Z",
  "messages": [
    {
      "id": "uuid",
      "chat_id": "uuid",
      "sender": "USER",
      "content": "Qual o melhor arroz integral?",
      "mentioned_evidences": null,
      "mentioned_technical_facts": null,
      "created_at": "2026-06-28T03:00:00.000Z"
    }
  ]
}
```

---

### `POST /chats/:id/messages`

Persiste uma nova mensagem do usuário em um chat existente e dispara webhook assíncrono para o n8n.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `201 Created` |

#### Body

```json
{
  "content": "E quanto ao preço?"
}
```

| Campo | Tipo | Regras |
|-------|------|--------|
| `content` | string | obrigatório, 1–4000 caracteres |

#### Resposta

```json
{
  "message": {
    "id": "uuid",
    "chat_id": "uuid",
    "sender": "USER",
    "content": "E quanto ao preço?",
    "mentioned_evidences": null,
    "mentioned_technical_facts": null,
    "created_at": "2026-06-28T03:01:00.000Z"
  }
}
```

O webhook n8n é enviado com `should_name_conversation: false`.

---

## Socket.IO

**URL:** mesma origem do backend (`http://localhost:3000`)

**Autenticação:** token JWT em `auth.token` no handshake

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: accessToken },
});
```

### Cliente → Servidor

| Evento | Payload |
|--------|---------|
| `chat:join` | `{ chatId: string }` |

Entra na sala `chat:{chatId}`. Requer que o chat pertença ao usuário autenticado.

### Servidor → Cliente

| Evento | Payload |
|--------|---------|
| `chat:assistant_message` | `{ chatId: string, message: ChatMessage }` |
| `chat:agent_progress` | `{ chatId: string, step: string, message: string }` |
| `chat:title_updated` | `{ chatId: string, title: string }` |
| `chat:error` | `{ message: string }` |

`chat:agent_progress` é efêmero (não persistido). Valores de `step`: `context`, `collect`, `query`, `hypothesis`, `validate`, `respond`. O frontend exibe apenas a última mensagem de progresso enquanto aguarda a resposta.

A mensagem do usuário é retornada no `POST /chats` — não é emitida via socket na criação.

---

## Webhook n8n (backend → n8n)

**Variável:** `N8N_CHAT_WEBHOOK_URL`

**Método:** `POST`

**Payload enviado após criar chat ou nova mensagem:**

```json
{
  "chat_id": "uuid",
  "user_id": "uuid",
  "user_message": "texto da mensagem",
  "should_name_conversation": true
}
```

- `should_name_conversation: true` — apenas na primeira mensagem (`POST /chats`)
- `should_name_conversation: false` — mensagens subsequentes (`POST /chats/:id/messages`)

Falha no webhook não impede a criação do chat (log WARN no backend).

---

## Tool — Callback do agente (n8n → backend)

**Base URL:** `http://localhost:3000/tool`

**Autenticação:** header `X-Tool-Api-Key` com valor de `TOOL_API_KEY`

### `POST /chat/agent-response`

Persiste título e mensagem do assistente, emite eventos socket para a sala do chat.

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

#### Body

```json
{
  "chat_id": "uuid",
  "title": "Melhor arroz integral",
  "assistant_message": "Com base nas opiniões da comunidade...",
  "mentioned_technical_facts": [
    {
      "id": "uuid",
      "fact_label": "Ponte fixa mantém melhor afinação",
      "evidence": [
        { "source_type": "opinion", "source_id": "uuid" },
        { "source_type": "thread", "source_id": "uuid" }
      ]
    }
  ],
  "mentioned_evidences": [
    { "source_type": "opinion", "source_id": "uuid" },
    { "source_type": "thread", "source_id": "uuid" }
  ]
}
```

| Campo | Tipo | Regras |
|-------|------|--------|
| `chat_id` | uuid | obrigatório |
| `title` | string | máx. 255 caracteres; string vazia (`""`) quando o agente não deve alterar o título |
| `assistant_message` | string | obrigatório, mínimo 1 caractere |
| `mentioned_technical_facts` | array ou `null` | opcional; fatos técnicos usados na resposta, com `evidence[]` copiados da API |
| `mentioned_evidences` | array ou `null` | opcional; união deduplicada de opiniões/threads citadas. Se `mentioned_technical_facts` for enviado, o backend deriva este campo automaticamente |

Quando `title` é string vazia, o backend **não atualiza** o título do chat e **não emite** `chat:title_updated`. Apenas a mensagem do assistente é persistida e propagada via socket.

---

### `POST /chat/agent-progress`

Emite feedback efêmero de progresso do raciocínio via socket (`chat:agent_progress`). Não persiste dados.

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `204 No Content` |

#### Body

```json
{
  "chat_id": "uuid",
  "step": "query",
  "message": "Consultando fatos técnicos da comunidade…"
}
```

| Campo | Tipo | Regras |
|-------|------|--------|
| `chat_id` | uuid | obrigatório |
| `step` | enum | `context` · `collect` · `query` · `hypothesis` · `validate` · `respond` |
| `message` | string | obrigatório, 1–500 caracteres, texto descritivo em pt-BR para o usuário |

#### Resposta

Sem body (`204 No Content`).

---

#### Resposta (`POST /chat/agent-response`)

```json
{
  "chat_id": "uuid",
  "title": "Melhor arroz integral",
  "message": {
    "id": "uuid",
    "chat_id": "uuid",
    "sender": "ASSISTANT",
    "content": "Com base nas opiniões da comunidade...",
    "mentioned_evidences": [
      { "source_type": "opinion", "source_id": "uuid" },
      { "source_type": "thread", "source_id": "uuid" }
    ],
    "mentioned_technical_facts": [
      {
        "id": "uuid",
        "fact_label": "Ponte fixa mantém melhor afinação",
        "evidence": [
          { "source_type": "opinion", "source_id": "uuid" }
        ]
      }
    ],
    "created_at": "2026-06-28T03:00:05.000Z"
  }
}
```

---

## Fluxo completo

1. Frontend: `GET /api/chats` para histórico na sidebar
2. Frontend: `POST /api/chats` (nova conversa) ou `POST /api/chats/:id/messages` (follow-up)
3. Frontend: conecta socket e emite `chat:join { chatId }`
4. Backend: dispara webhook n8n (`should_name_conversation` conforme o endpoint)
5. n8n: agente consulta nós/fatos via tools, valida hipótese e gera resposta (+ título na primeira mensagem)
6. n8n: `POST /tool/chat/agent-response`
7. Backend: persiste e emite `chat:title_updated` (se aplicável) + `chat:assistant_message`
