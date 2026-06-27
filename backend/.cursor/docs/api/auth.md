# API — Autenticação

Documentação de referência para clientes (humanos e LLM) da API REST do GuiaReal.

**Escopo deste arquivo:** rotas em `/api/auth`.

**Fora do escopo:** rotas protegidas dos demais módulos ([nodes.md](nodes.md), [products.md](products.md), [opinions.md](opinions.md), [feed.md](feed.md)).

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Content-Type (POST) | `application/json` |
| Autenticação | Não exigida neste módulo (exceto uso indireto do cookie de refresh) |

---

## Modelo de autenticação

1. **`POST /login`** retorna `accessToken` (JWT) no body e define cookie HttpOnly com refresh token.
2. Clientes autenticados enviam `Authorization: Bearer <accessToken>` nas demais rotas.
3. **`POST /refresh`** reemite `accessToken` usando o cookie de refresh (sem body).
4. **`POST /logout`** revoga o refresh token e limpa o cookie.

### Cookie de refresh

| Item | Valor |
|------|-------|
| Nome padrão | `guiareal_refresh` (override: `REFRESH_COOKIE_NAME`) |
| Path | `/api/auth` |
| HttpOnly | `true` |
| SameSite | `lax` (override: `COOKIE_SAME_SITE`) |
| Secure | `false` em dev; `true` em produção (override: `COOKIE_SECURE`) |

Requisições que dependem do cookie devem usar `credentials: "include"` no fetch.

---

## `POST /auth/signup`

Cadastro de novo usuário.

| Item | Valor |
|------|-------|
| Autenticação | Não |
| Sucesso | `201 Created` |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `email` | string | sim | E-mail válido |
| `password` | string | sim | Mínimo 6 caracteres |
| `username` | string | sim | 2–50 caracteres (trim) |

### Resposta

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "usuario",
  "hashpassword": "...",
  "reputation_score": 0,
  "is_banned": false,
  "created_at": "2026-01-01T00:00:00.000Z",
  "deleted_at": null
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `409` | `User already exists` |
| `409` | `Nome de usuário já cadastrado` |
| `422` | `Dados inválidos` |

---

## `POST /auth/login`

Autenticação com e-mail e senha.

| Item | Valor |
|------|-------|
| Autenticação | Não |
| Sucesso | `200 OK` + cookie de refresh |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `email` | string | sim | E-mail válido |
| `password` | string | sim | Mínimo 6 caracteres |

### Resposta

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "usuario"
  }
}
```

O refresh token **não** é retornado no body; é gravado no cookie HttpOnly.

### Erros

| Status | `message` típico |
|--------|------------------|
| `401` | `Credenciais inválidas` |
| `422` | `Dados inválidos` |

---

## `POST /auth/refresh`

Reemissão do access token a partir do cookie de refresh.

| Item | Valor |
|------|-------|
| Autenticação | Cookie `guiareal_refresh` em `/api/auth` |
| Body | Vazio (`{}`) |
| Sucesso | `200 OK` |

### Resposta

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "usuario"
  }
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `401` | `Token de atualização inválido` |

---

## `POST /auth/logout`

Revoga o refresh token e remove o cookie.

| Item | Valor |
|------|-------|
| Autenticação | Cookie opcional |
| Body | Nenhum |
| Sucesso | `204 No Content` (sem body) |

Se houver cookie válido, o token é revogado no Redis antes de limpar o cookie.
