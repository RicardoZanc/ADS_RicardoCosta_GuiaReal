# API — Usuários

Documentação de referência para clientes (humanos e LLM) da API REST do GuiaReal.

**Escopo deste arquivo:** rotas em `/api/users`.

**Fora do escopo:** autenticação ([auth.md](auth.md)), listagem de opções de interesse ([nodes.md](nodes.md)).

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Content-Type (PATCH/PUT) | `application/json` |
| Autenticação | JWT Bearer obrigatório em todas as rotas |

---

## Modelo de interesse

Interesses vinculam o usuário a nós da taxonomia com tipo `TIPO` ou `CATEGORIA`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | ID do nó |
| `name` | string | Nome do nó |
| `type` | `"TIPO"` \| `"CATEGORIA"` | Tipo do nó |
| `parent_id` | uuid \| null | Pai na árvore (TIPO para CATEGORIA) |

Para listar opções disponíveis no onboarding:

- `GET /api/nodes?type=TIPO`
- `GET /api/nodes?type=CATEGORIA&tipo_id=<uuid-do-tipo>`

---

## `PATCH /users/me`

Atualiza dados do usuário autenticado.

| Item | Valor |
|------|-------|
| Sucesso | `200 OK` |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `avatar_url` | string \| null | sim | URL válida do bucket de perfis do Supabase, ou `null` para remover |

### Resposta

Perfil do usuário com `interests` incluídos.

```json
{
  "id": "uuid",
  "username": "usuario",
  "reputation_score": 0,
  "avatar_url": "https://...",
  "created_at": "2026-01-01T00:00:00.000Z",
  "email": "user@example.com",
  "interests": []
}
```

O campo `email` aparece apenas quando o viewer é o próprio usuário.

---

## `GET /users/me/interests`

Lista os interesses do usuário autenticado.

| Item | Valor |
|------|-------|
| Sucesso | `200 OK` |

### Resposta

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Eletrônicos",
      "type": "TIPO",
      "parent_id": "uuid-root"
    }
  ]
}
```

---

## `PUT /users/me/interests`

Substitui todos os interesses do usuário autenticado (replace total).

| Item | Valor |
|------|-------|
| Sucesso | `200 OK` |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `node_ids` | uuid[] | sim | Máximo 30; apenas nós `TIPO` ou `CATEGORIA`; array vazio remove todos |

### Resposta

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Guitarras",
      "type": "CATEGORIA",
      "parent_id": "uuid-tipo"
    }
  ]
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | `O nó "..." não é um interesse válido (apenas TIPO e CATEGORIA)` |
| `400` | `Um ou mais interesses informados não existem` |
| `422` | `Dados inválidos` |

---

## `GET /users/:username`

Perfil público de um usuário ativo (não banido, não deletado).

| Item | Valor |
|------|-------|
| Sucesso | `200 OK` |

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `username` | string | Nome de usuário (1–50 caracteres) |

### Resposta

```json
{
  "id": "uuid",
  "username": "joao",
  "reputation_score": 10,
  "avatar_url": null,
  "created_at": "2026-01-01T00:00:00.000Z",
  "interests": [
    {
      "id": "uuid",
      "name": "Eletrônicos",
      "type": "TIPO",
      "parent_id": "uuid-root"
    }
  ]
}
```

O campo `email` é incluído somente quando o viewer autenticado é o próprio usuário do perfil.

### Erros

| Status | `message` típico |
|--------|------------------|
| `404` | `Usuário não encontrado` |

---

## `GET /users/:username/interactions`

Lista opiniões e threads do usuário com contexto de produto ou nó.

| Item | Valor |
|------|-------|
| Sucesso | `200 OK` |

### Query

| Campo | Tipo | Default | Regras |
|-------|------|---------|--------|
| `page` | number | 1 | ≥ 1 |
| `limit` | number | 20 | 1–100 |

### Resposta

```json
{
  "data": [
    {
      "id": "uuid",
      "kind": "opinion",
      "content": "...",
      "created_at": "2026-01-01T00:00:00.000Z",
      "context": {
        "kind": "product",
        "id": "uuid",
        "name": "Produto X"
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
