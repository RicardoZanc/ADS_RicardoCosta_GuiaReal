# API — Products

Documentação de referência para clientes (humanos e LLM) da API REST do GuiaReal.

**Escopo deste arquivo:** rotas em `/api/products`.

**Fora do escopo:** autenticação ([auth.md](auth.md)), criação de nós ([nodes.md](nodes.md)), criação de opiniões ([opinions.md](opinions.md)), listagem global de produtos (não implementada).

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Content-Type (POST/PATCH) | `application/json` |
| Autenticação | JWT Bearer em todas as rotas deste módulo |

---

## Fluxo de cadastro

O módulo de produtos é agnóstico à criação de nós. O frontend deve:

1. Criar ou buscar nós via `POST /api/nodes` / `GET /api/nodes`.
2. Coletar os UUIDs retornados.
3. Enviar `POST /api/products` com o array `nodeIds`.

Detalhes de taxonomia e regras de negócio: [produtos_e_nodes.mdc](../../rules/specs/produtos_e_nodes.mdc).

---

## `POST /products`

Cadastro de produto com vínculo total aos nós informados.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `201 Created` |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `name` | string | sim | Não vazio (trim); único case insensitive |
| `ean` | string | não | Apenas dígitos, máx. 13; único se informado |
| `brand_name` | string | não | Máx. 100 caracteres |
| `image_url` | string | não | URL válida |
| `nodeIds` | uuid[] | sim | Mín. 2 itens; sem duplicatas |

### Regras de negócio (`nodeIds`)

- Deve conter **exatamente uma** `CATEGORIA` e **exatamente uma** `MARCA`.
- Pode conter zero ou mais: `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO`.
- Não pode conter nós `ROOT` ou `TIPO`.
- Todos os IDs devem existir no banco.

### Resposta

```json
{
  "id": "uuid",
  "name": "Ibanez RG550",
  "ean": "1234567890123",
  "brand_name": "Ibanez",
  "image_url": "https://example.com/img.jpg",
  "created_at": "2026-01-01T00:00:00.000Z",
  "nodeIds": ["uuid-categoria", "uuid-marca", "uuid-tecnologia"]
}
```

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | `O produto deve possuir exatamente uma CATEGORIA e exatamente uma MARCA` |
| `400` | `nodeIds não pode conter valores duplicados` |
| `400` | `nodeIds não pode conter nós do tipo ROOT ou TIPO` |
| `404` | `Um ou mais nodeIds informados não existem` |
| `409` | `Já existe produto com este nome` |
| `409` | `Já existe produto com este EAN` |
| `409` | `Produto já existe com os mesmos dados únicos` |
| `422` | `Dados inválidos` |

---

## `PATCH /products/:id`

Atualiza nome, imagem e/ou taxonomia (`nodeIds`) de um produto existente.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso (admin) | `200 OK` — alteração aplicada imediatamente |
| Sucesso (usuário) | `202 Accepted` — solicitação de mudança criada para revisão |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | uuid | ID do produto |

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `name` | string | não* | Não vazio (trim); único case insensitive se informado |
| `image_url` | string \| null | não* | URL do bucket de produtos do Supabase, ou `null` para remover |
| `nodeIds` | uuid[] | não* | Mesmas regras de `POST /products` quando informado |

\* Pelo menos um campo deve ser informado.

### Moderação

- **Admin**: persiste direto e retorna o detalhe do produto (`GET /products/:id`).
- **Usuário comum**: cria `change_requests` (`PENDING`) e retorna `202` com `change_request_id`.

Revisão admin: `PATCH /api/change-requests/:id`.

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | `Informe ao menos um campo para alterar` |
| `400` | `Nenhuma alteração foi informada` |
| `400` | `O produto deve possuir exatamente uma CATEGORIA e exatamente uma MARCA` |
| `404` | `Produto não encontrado` |
| `409` | `Já existe produto com este nome` |
| `409` | `Já existe uma solicitação pendente para esta entidade` |
| `422` | `Dados inválidos` |

---

## `GET /products/:id`

Detalhe de produto com taxonomia resolvida e abas de discussão.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | uuid | ID do produto |

### Resposta

```json
{
  "id": "uuid",
  "name": "Ibanez RG550",
  "ean": "1234567890123",
  "brand_name": "Ibanez",
  "image_url": "https://example.com/img.jpg",
  "created_at": "2026-01-01T00:00:00.000Z",
  "taxonomy": {
    "tipo": { "id": "uuid", "name": "Instrumentos Musicais" },
    "categoria": { "id": "uuid", "name": "Guitarras" },
    "marca": { "id": "uuid", "name": "Ibanez" },
    "tecnologias": [{ "id": "uuid", "name": "Floyd Rose" }],
    "composicoes": [{ "id": "uuid", "name": "Maple" }],
    "atributos": [{ "id": "uuid", "name": "6 Cordas" }]
  },
  "discussionTabs": [
    {
      "scope": "product",
      "label": "Produto",
      "opinionCount": 5
    },
    {
      "scope": "node",
      "nodeId": "uuid",
      "type": "MARCA",
      "label": "Ibanez",
      "opinionCount": 12
    }
  ]
}
```

`discussionTabs` inclui uma aba `product` e uma aba por nó vinculado dos tipos `MARCA`, `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO`.

### Erros

| Status | `message` típico |
|--------|------------------|
| `404` | `Produto não encontrado` |
| `422` | `Dados inválidos` |

---

## `GET /products/:id/opinions`

Lista paginada de opiniões do produto ou de um nó vinculado.

| Item | Valor |
|------|-------|
| Autenticação | JWT Bearer |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | uuid | ID do produto |

### Query

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `scope` | enum | `product` | `product` — opiniões do produto; `node` — opiniões de um nó vinculado |
| `node_id` | uuid | — | Obrigatório quando `scope=node` |
| `page` | int | `1` | Página (mín. 1) |
| `limit` | int | `20` | Itens por página (1–100) |

### Resposta

Formato `OpinionListPageResult` — ver seção **Formato de listagem** em [opinions.md](opinions.md).

### Erros

| Status | `message` típico |
|--------|------------------|
| `400` | `Nó não vinculado a este produto` |
| `404` | `Produto não encontrado` |
| `422` | `node_id é obrigatório quando scope é node` |
| `422` | `Dados inválidos` |
