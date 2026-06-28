# API — Opinions

Documentação de referência para clientes (humanos e LLM) da API REST do GuiaReal.

**Escopo deste arquivo:** rotas em `/api/opinions` (criação, threads e reações).

**Fora do escopo:** autenticação ([auth.md](auth.md)), listagem de opiniões em produto/nó (`GET /api/products/:id/opinions` em [products.md](products.md), `GET /api/nodes/:id/opinions` em [nodes.md](nodes.md)).

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Content-Type (POST/PUT) | `application/json` |
| Autenticação | JWT Bearer em todas as rotas deste módulo |

---

## `POST /opinions/products/:product_id`

Cria opinião vinculada a um produto.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `201 Created` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `product_id` | uuid | ID do produto |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `title` | string | não | Máx. 255 caracteres |
| `content` | string | sim | Não vazio (trim) |

### Resposta

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "product_id": "uuid",
  "node_id": null,
  "title": "Ótima guitarra",
  "content": "Excelente para shred.",
  "status": "PENDING",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `404` | `Produto não encontrado` |
| `422` | `Dados inválidos` |

---

## `POST /opinions/nodes/:node_id`

Cria opinião vinculada a um nó.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `201 Created` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `node_id` | uuid | ID do nó |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `title` | string | não | Máx. 255 caracteres |
| `content` | string | sim | Não vazio (trim) |

### Resposta

Mesmo formato de `POST /opinions/products/:product_id`, com `node_id` preenchido e `product_id` nulo.

### Erros

| Status | `message` típico |
|--------|------------------|
| `404` | `Nó não encontrado` |
| `422` | `Dados inválidos` |

---

## `POST /opinions/:opinion_id/threads`

Cria resposta (thread) em uma opinião.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `201 Created` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `opinion_id` | uuid | ID da opinião |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `content` | string | sim | Não vazio (trim) |
| `parent_interaction_id` | uuid \| null | não | ID da thread pai (para respostas aninhadas) |

### Regras de negócio

- Se `parent_interaction_id` for informado, a thread pai deve existir e pertencer à mesma opinião.

### Resposta

```json
{
  "id": "uuid",
  "opinion_id": "uuid",
  "parent_interaction_id": null,
  "user_id": "uuid",
  "content": "Concordo totalmente.",
  "cached_upvotes": 0,
  "status": "ACTIVE",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | `Interação pai não encontrada` |
| `400` | `A interação pai não pertence a esta opinião` |
| `404` | `Opinião não encontrada` |
| `422` | `Dados inválidos` |

---

## `PUT /opinions/:opinion_id/reaction`

Registra ou remove reação (like/dislike) em uma opinião.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `opinion_id` | uuid | ID da opinião |

### Body

| Campo | Tipo | Obrigatório | Valores |
|-------|------|-------------|---------|
| `action` | enum | sim | `like` · `dislike` · `remove_like` · `remove_dislike` |

### Semântica de `action`

| `action` | Comportamento |
|----------|---------------|
| `like` | Sem voto → cria like (`1`); dislike → troca para like; like existente → remove voto (toggle) |
| `dislike` | Sem voto → cria dislike (`-1`); like → troca para dislike; dislike existente → remove voto (toggle) |
| `remove_like` | Remove voto apenas se for like |
| `remove_dislike` | Remove voto apenas se for dislike |

### Resposta

```json
{
  "cached_upvotes": 5,
  "user_vote": 1
}
```

`user_vote`: `1` (like), `-1` (dislike) ou `null` (sem voto).

### Erros

| Status | `message` típico |
|--------|------------------|
| `404` | `Opinião não encontrada` |
| `422` | `Dados inválidos` |

---

## `PUT /opinions/threads/:thread_id/reaction`

Registra ou remove reação em uma thread de discussão.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `thread_id` | uuid | ID da thread |

### Body

Mesmo formato e semântica de `PUT /opinions/:opinion_id/reaction`.

### Resposta

```json
{
  "cached_upvotes": 3,
  "user_vote": -1
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `404` | `Interação não encontrada` |
| `422` | `Dados inválidos` |

---

## Formato de listagem

Usado pelas rotas `GET /api/products/:id/opinions` e `GET /api/nodes/:id/opinions` (documentadas nos respectivos módulos).

### `OpinionListPageResult`

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Ótima guitarra",
      "content": "Excelente para shred.",
      "created_at": "2026-01-01T00:00:00.000Z",
      "author": { "id": "uuid", "username": "usuario" },
      "cached_upvotes": 5,
      "user_vote": 1,
      "score": 8,
      "replies": []
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

### `OpinionReply` (aninhado em `replies`)

```json
{
  "id": "uuid",
  "content": "Concordo.",
  "created_at": "2026-01-01T00:00:00.000Z",
  "author": { "id": "uuid", "username": "usuario" },
  "cached_upvotes": 2,
  "user_vote": null,
  "replies": []
}
```

| Campo | Descrição |
|-------|-----------|
| `cached_upvotes` | Soma líquida de votos na opinião/thread |
| `user_vote` | Voto do usuário autenticado: `1`, `-1` ou `null` |
| `score` | Opinião: `cached_upvotes` + soma de upvotes das threads filhas |
| `replies` | Árvore de threads; raízes ordenadas por upvotes, aninhadas cronologicamente |
