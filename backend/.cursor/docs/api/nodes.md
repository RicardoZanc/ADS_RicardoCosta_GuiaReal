# API — Nodes

Documentação de referência para clientes (humanos e LLM) da API REST do GuiaReal.

**Escopo deste arquivo:** rotas em `/api/nodes`.

**Fora do escopo:** autenticação ([auth.md](auth.md)), criação de produtos ([products.md](products.md)), criação de opiniões ([opinions.md](opinions.md)).

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Content-Type (POST/PATCH) | `application/json` |
| Autenticação | JWT Bearer em todas as rotas deste módulo |

---

## Tipos de nó

Tipos pesquisáveis e criáveis via API (exceto `ROOT`, que é infraestrutura interna):

`TIPO` · `CATEGORIA` · `MARCA` · `TECNOLOGIA` · `COMPOSICAO` · `ATRIBUTO`

A busca (`GET /`) exclui nós `ROOT`. O detalhe (`GET /:id`) só expõe tipos visualizáveis: `CATEGORIA`, `MARCA`, `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO`.

---

## `GET /nodes`

Busca paginada de nós com filtro opcional por nome (fuzzy) e tipo.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Query

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `q` | string | — | Termo de busca (similaridade `pg_trgm`, threshold padrão `0.3`, env `NODES_SEARCH_FUZZINESS`) |
| `type` | enum | — | Filtra por tipo de nó |
| `tipo_id` | uuid | — | Restringe a categorias filhas do TIPO informado (força `type=CATEGORIA` internamente) |
| `page` | int | `1` | Página (mín. 1) |
| `limit` | int | `20` | Itens por página (1–100) |

**Regra:** se `tipo_id` for informado, `type` deve ser omitido ou `CATEGORIA`.

### Resposta

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Guitarras",
      "type": "CATEGORIA",
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
| `401` | Token ausente ou inválido |
| `404` | `Parent ID não encontrado` (quando `tipo_id` inválido) |
| `422` | `Dados inválidos` |

---

## `POST /nodes`

Criação de nó na árvore taxonômica.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `201 Created` |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `name` | string | sim | Não vazio (trim) |
| `type` | enum | sim | Um dos tipos pesquisáveis |
| `parent_id` | uuid | condicional | Obrigatório para `CATEGORIA` (deve apontar para nó `TIPO`) |
| `wikidata_id` | string | não | Máx. 50 caracteres |

### Regras de negócio

- **`CATEGORIA`:** `parent_id` obrigatório e deve referenciar um nó do tipo `TIPO`.
- **`TIPO`, `MARCA`, `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO`:** associados automaticamente ao nó `ROOT` (ignora `parent_id` do cliente).
- Nome único por `(type, parent_id)` — case insensitive.

### Resposta

```json
{
  "id": "uuid",
  "name": "Floyd Rose",
  "type": "TECNOLOGIA",
  "parent_id": "uuid-root",
  "wikidata_id": null,
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | `Para criar CATEGORIA, o campo parent_id é obrigatório...` |
| `400` | `Para criar CATEGORIA, o parent_id deve apontar para um nó do tipo TIPO` |
| `409` | `Já existe um nó com este nome para o tipo informado` |
| `409` | `Já existe um nó com os mesmos dados únicos` |
| `404` | `Nó ROOT não encontrado` |
| `422` | `Dados inválidos` |

---

## `GET /nodes/:id`

Detalhe de um nó visualizável.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | uuid | ID do nó |

### Resposta

```json
{
  "id": "uuid",
  "name": "Guitarras",
  "type": "CATEGORIA",
  "wikidata_id": null,
  "created_at": "2026-01-01T00:00:00.000Z",
  "context": {
    "parentTipo": {
      "id": "uuid",
      "name": "Instrumentos Musicais"
    }
  },
  "opinionCount": 12
}
```

`context.parentTipo` é `null` para tipos que não são `CATEGORIA`.

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | `Nó não disponível para visualização` (ROOT, TIPO ou tipo não suportado) |
| `404` | `Nó não encontrado` |
| `422` | `Dados inválidos` |

---

## `PATCH /nodes/:id`

Renomeia um nó existente.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | uuid | ID do nó |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `name` | string | sim | Não vazio (trim) |

### Regras de negócio

- Nós `ROOT` e `TIPO` não podem ser renomeados.
- Nome único por `(type, parent_id)` — case insensitive.

### Resposta

Mesmo formato de `POST /nodes` (objeto do nó atualizado).

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | `Nós do tipo ROOT ou TIPO não podem ser renomeados` |
| `404` | `Nó não encontrado` |
| `409` | `Já existe um nó com este nome para o tipo informado` |
| `422` | `Dados inválidos` |

---

## `GET /nodes/:id/opinions`

Lista paginada de opiniões vinculadas ao nó.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | uuid | ID do nó |

### Query

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | int | `1` | Página (mín. 1) |
| `limit` | int | `20` | Itens por página (1–100) |

### Resposta

Formato `OpinionListPageResult` — ver seção **Formato de listagem** em [opinions.md](opinions.md).

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | `Nó não disponível para visualização` |
| `404` | `Nó não encontrado` |
| `422` | `Dados inválidos` |
