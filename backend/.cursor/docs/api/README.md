# API — GuiaReal

Documentação de referência para clientes (humanos e LLM) da API REST do GuiaReal.

**Escopo deste arquivo:** convenções globais, índice de módulos e rota raiz.

**Fora do escopo:** contratos detalhados de cada módulo (ver links abaixo).

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Content-Type (POST/PATCH/PUT) | `application/json` |
| CORS | `credentials: true` (necessário para cookies de refresh) |
| Autenticação padrão | JWT Bearer — obtenha o token via [auth.md](auth.md) |

---

## Módulos

| Módulo | Prefixo | Documentação |
|--------|---------|--------------|
| Auth | `/api/auth` | [auth.md](auth.md) |
| Nodes | `/api/nodes` | [nodes.md](nodes.md) |
| Products | `/api/products` | [products.md](products.md) |
| Opinions | `/api/opinions` | [opinions.md](opinions.md) |
| Feed | `/api/feed` | [feed.md](feed.md) |
| Technical Facts (Tools) | `/tool/technical-facts` | [technical_facts.md](technical_facts.md) |

---

## Tools (n8n / automações)

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/tool` (dev) |
| Autenticação | Header `X-Tool-Api-Key` (`TOOL_API_KEY` no `.env`) |

---

## Rota raiz

### `GET /api/`

Rota de verificação autenticada (registrada em `server.ts`, fora dos módulos).

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer obrigatório |
| Sucesso | `200` |

**Resposta:**

```json
{ "message": "Hello <username>" }
```

---

## Formato de erro

Todas as rotas retornam erros no mesmo envelope:

```json
{
  "status": "error",
  "message": "Descrição legível do erro",
  "details": []
}
```

O campo `details` é opcional. Em validação Zod (`422`), contém array de `{ path, message }`.

| Status | Origem típica |
|--------|---------------|
| `400` | Regra de negócio violada (`BadRequestError`) |
| `401` | Token ausente, inválido ou credenciais incorretas |
| `404` | Recurso não encontrado |
| `409` | Conflito (duplicidade) |
| `422` | Payload inválido (Zod) |
| `500` | Erro interno não tratado |

---

## Paginação

Endpoints paginados retornam:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Defaults comuns: `page=1`, `limit=20`, `limit` máximo `100`.
