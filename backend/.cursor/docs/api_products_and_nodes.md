# API — Produtos e Nodes

Documentação de referência para clientes (humanos e LLM) da API REST do GuiaReal.

**Escopo deste arquivo:** rotas em `/api/nodes` e `/api/products`.  
**Fora do escopo:** autenticação detalhada (`/api/auth/*`), listagem/busca paginada de produtos (não implementada).

---

## Base

| Item | Valor |
|------|-------|
| Base URL | `http://localhost:3000/api` (dev) |
| Content-Type (POST) | `application/json` |
| Autenticação | JWT Bearer em todas as rotas deste módulo |

```
Authorization: Bearer <accessToken>
```

Obtenha `accessToken` via `POST /api/auth/login` com `{ "email", "password" }`. A resposta inclui `accessToken` e `user` no JSON; o refresh token é enviado em cookie HttpOnly (`guiareal_refresh`, path `/api/auth`). Renove o access com `POST /api/auth/refresh` (cookie automático, sem body).

---

## Formato de erro (todas as rotas)

```json
{
  "status": "error",
  "message": "Descrição legível em português",
  "details": []
}
```

| HTTP | Origem típica |
|------|----------------|
| 400 | Regra de negócio violada (`BadRequestError`) |
| 401 | Token ausente, inválido ou conta indisponível |
| 404 | Recurso referenciado não existe (`NotFoundError`) |
| 409 | Conflito de unicidade (`ConflictError`) |
| 422 | Validação Zod do payload/query (`details`: `{ path, message }[]`) |
| 500 | Erro interno não tratado |

---

## Modelo de domínio — tipos de nó

Enum `node_type` no banco:

| Tipo | Criável via API? | Parent esperado | Uso em produto? |
|------|------------------|-----------------|-----------------|
| `ROOT` | Não | `null` (único no sistema) | Proibido em `nodeIds` |
| `TIPO` | Sim (`POST /nodes`) | `ROOT` (automático) | Proibido em `nodeIds` |
| `CATEGORIA` | Sim | `TIPO` (`parent_id` obrigatório) | Obrigatório: exatamente 1 |
| `MARCA` | Sim | `ROOT` (automático) | Obrigatório: exatamente 1 |
| `TECNOLOGIA` | Sim | `ROOT` (automático) | Opcional: 0..N |
| `COMPOSICAO` | Sim | `ROOT` (automático) | Opcional: 0..N |
| `ATRIBUTO` | Sim | `ROOT` (automático) | Opcional: 0..N |

**Hierarquia relevante:**

```
ROOT
├── TIPO (ex: Instrumentos Musicais)
│   └── CATEGORIA (ex: Guitarras)   ← parent_id = id do TIPO
├── MARCA (ex: Ibanez)
├── TECNOLOGIA (ex: Floyd Rose)
├── COMPOSICAO (ex: Maple)
└── ATRIBUTO (ex: 6 Cordas)
```

**Pré-requisito de infraestrutura:** deve existir exatamente um nó `ROOT` no banco. Sem ele, `POST /nodes` falha com `404`.

**Padrão de orquestração (MVP):** o frontend cria nós individualmente (`POST /nodes`), acumula UUIDs e só então cria o produto (`POST /products`). Não envie criação de nós dentro do payload de produto.

---

## Rotas — Nodes

### `GET /api/nodes`

Busca paginada de nós. Nós `ROOT` **nunca** aparecem nos resultados.

**Auth:** obrigatória  
**Body:** nenhum

#### Query parameters

| Param | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `q` | string | não | — | Busca fuzzy no campo `name` (`pg_trgm`; threshold via env `NODES_SEARCH_FUZZINESS`, padrão `0.3`) |
| `type` | enum | não | — | `TIPO`, `CATEGORIA`, `MARCA`, `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO` |
| `tipo_id` | UUID | não | — | Restringe a categorias filhas do TIPO informado (ver regras abaixo) |
| `page` | int ≥ 1 | não | `1` | Página |
| `limit` | int 1–100 | não | `20` | Itens por página |

#### Regras quando `tipo_id` está presente

1. O UUID deve existir e ser de um nó `TIPO` (senão `404` ou `400`).
2. A busca força `type = CATEGORIA` e `parent_id = tipo_id`.
3. Se `type` também for enviado, deve ser `CATEGORIA` ou omitido (senão `422`).

#### Resposta `200`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "type": "CATEGORIA",
      "parent_id": "uuid | null",
      "wikidata_id": "string | null",
      "created_at": "ISO-8601 | null"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

**Ordenação:** com `q` → similaridade DESC, depois `name ASC`; sem `q` → `name ASC`.

#### Exemplos

```
GET /api/nodes?q=Ibanez&type=MARCA
GET /api/nodes?tipo_id=<uuid-tipo>&q=Guitar
GET /api/nodes?type=TIPO&page=1&limit=10
```

---

### `POST /api/nodes`

Cria um nó taxonômico.

**Auth:** obrigatória

#### Request body

```json
{
  "name": "string (obrigatório, trim, min 1)",
  "type": "TIPO | CATEGORIA | MARCA | TECNOLOGIA | COMPOSICAO | ATRIBUTO",
  "parent_id": "uuid (opcional; regras por type)",
  "wikidata_id": "string (opcional, max 50)"
}
```

#### Regras de `parent_id` por `type`

| `type` | `parent_id` no request | Persistido como |
|--------|------------------------|-----------------|
| `CATEGORIA` | **Obrigatório** — UUID de um `TIPO` | valor enviado |
| `TIPO`, `MARCA`, `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO` | Ignorado se enviado | UUID do nó `ROOT` |

#### Resposta `201`

```json
{
  "id": "uuid",
  "name": "string",
  "type": "MARCA",
  "parent_id": "uuid",
  "wikidata_id": "string | null",
  "created_at": "ISO-8601"
}
```

#### Erros de negócio comuns

| Situação | HTTP | message (exemplo) |
|----------|------|-------------------|
| ROOT ausente no banco | 404 | `Nó ROOT não encontrado` |
| CATEGORIA sem `parent_id` | 400 | `Para criar CATEGORIA, o campo parent_id é obrigatório...` |
| `parent_id` não é TIPO | 400 | `Para criar CATEGORIA, o parent_id deve apontar para um nó do tipo TIPO` |
| `parent_id` inexistente | 404 | `Parent ID não encontrado` |
| Nome já usado no mesmo escopo | 409 | `Já existe um nó com este nome para o tipo informado` |
| Nó duplicado (unicidade) | 409 | `Já existe um nó com os mesmos dados únicos` |

> Unicidade de nome é validada por escopo: `CATEGORIA` é única por `parent_id` (TIPO); os demais tipos são únicos sob o `ROOT`. A comparação é case-insensitive.

#### Exemplo — criar categoria

```json
{
  "name": "Guitarras",
  "type": "CATEGORIA",
  "parent_id": "<uuid-do-tipo-instrumentos-musicais>"
}
```

#### Exemplo — criar marca (sem parent_id)

```json
{
  "name": "Ibanez",
  "type": "MARCA"
}
```

---

### `PATCH /api/nodes/:id`

Renomeia um nó existente. Apenas o campo `name` pode ser alterado.

**Auth:** obrigatória

#### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID do nó a renomear |

#### Request body

```json
{
  "name": "string (obrigatório, trim, min 1)"
}
```

#### Resposta `200`

```json
{
  "id": "uuid",
  "name": "string",
  "type": "MARCA",
  "parent_id": "uuid",
  "wikidata_id": "string | null",
  "created_at": "ISO-8601"
}
```

#### Erros de negócio comuns

| Situação | HTTP | message (exemplo) |
|----------|------|-------------------|
| `id` inválido (não-UUID) | 422 | `ID do nó inválido` |
| Nó inexistente | 404 | `Nó não encontrado` |
| Nó do tipo `ROOT` ou `TIPO` | 400 | `Nós do tipo ROOT ou TIPO não podem ser renomeados` |
| Nome já usado no mesmo escopo | 409 | `Já existe um nó com este nome para o tipo informado` |

---

## Rotas — Products

### `GET /api/products/:id`

Retorna metadados do produto, taxonomia agrupada e abas de discussão com contagem de opiniões. **Não inclui comentários** — use `GET /api/products/:id/opinions` (lazy load).

**Auth:** obrigatória

#### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID do produto |

#### Resposta `200`

```json
{
  "id": "uuid",
  "name": "string",
  "ean": "string | null",
  "brand_name": "string | null",
  "image_url": "string | null",
  "created_at": "ISO-8601",
  "taxonomy": {
    "tipo": { "id": "uuid", "name": "string" },
    "categoria": { "id": "uuid", "name": "string" },
    "marca": { "id": "uuid", "name": "string" },
    "tecnologias": [{ "id": "uuid", "name": "string" }],
    "composicoes": [{ "id": "uuid", "name": "string" }],
    "atributos": [{ "id": "uuid", "name": "string" }]
  },
  "discussionTabs": [
    { "scope": "product", "label": "Produto", "opinionCount": 5 },
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

- `tipo` é inferido pelo `parent_id` da `CATEGORIA` vinculada (via grafo ascendente).
- `discussionTabs` inclui aba `product` + uma aba por nó vinculado dos tipos `MARCA`, `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO`.

#### Erros comuns

| Situação | HTTP | message (exemplo) |
|----------|------|-------------------|
| `id` inválido | 422 | `ID do produto inválido` |
| Produto inexistente | 404 | `Produto não encontrado` |

---

### `GET /api/products/:id/opinions`

Lista paginada de opiniões da aba ativa (produto ou nó vinculado).

**Auth:** obrigatória

#### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID do produto |

#### Query parameters

| Param | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `scope` | enum | não | `product` | `product` ou `node` |
| `node_id` | UUID | sim se `scope=node` | — | Nó vinculado ao produto |
| `page` | int ≥ 1 | não | `1` | Página |
| `limit` | int 1–100 | não | `20` | Itens por página |

#### Ordenação (opção A)

1. Opiniões **com respostas** primeiro, ordenadas por `score DESC` (`cached_upvotes` da opinião + soma de `cached_upvotes` de todas as threads).
2. Opiniões **sem respostas** no final, ordenadas por `created_at DESC`.
3. Respostas raiz (sem `parent_interaction_id`): `cached_upvotes DESC`, depois `created_at DESC`.
4. Respostas aninhadas (filhas de outra thread): `created_at ASC` (ordem cronológica de conversa).

#### Resposta `200`

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string | null",
      "content": "string",
      "created_at": "ISO-8601",
      "author": { "id": "uuid", "username": "string" },
      "cached_upvotes": 3,
      "user_vote": 1,
      "score": 11,
      "replies": [
        {
          "id": "uuid",
          "content": "string",
          "created_at": "ISO-8601",
          "author": { "id": "uuid", "username": "string" },
          "cached_upvotes": 8,
          "user_vote": null,
          "replies": [
            {
              "id": "uuid",
              "content": "string",
              "created_at": "ISO-8601",
              "author": { "id": "uuid", "username": "string" },
              "cached_upvotes": 2,
              "user_vote": -1,
              "replies": []
            }
          ]
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

- `cached_upvotes`: score líquido direto no item (opinião raiz ou thread).
- `user_vote`: voto do usuário autenticado (`1`, `-1` ou `null`).
- `score` (somente na opinião raiz): `cached_upvotes` da opinião + soma de `cached_upvotes` de todas as threads — usado na ordenação.

#### Erros comuns

| Situação | HTTP | message (exemplo) |
|----------|------|-------------------|
| `scope=node` sem `node_id` | 422 | `node_id é obrigatório quando scope é node` |
| Produto inexistente | 404 | `Produto não encontrado` |
| Nó não vinculado ao produto | 400 | `Nó não vinculado a este produto` |

#### Exemplos

```
GET /api/products/<uuid>/opinions?scope=product&page=1&limit=20
GET /api/products/<uuid>/opinions?scope=node&node_id=<uuid-marca>&page=1
```

#### Escrita na view de detalhe

Rotas já existentes em `/api/opinions`:

| Método | Path | Uso |
|--------|------|-----|
| `POST` | `/api/opinions/products/:product_id` | Nova opinião na aba Produto |
| `POST` | `/api/opinions/nodes/:node_id` | Nova opinião na aba de um nó |
| `POST` | `/api/opinions/:opinion_id/threads` | Resposta a uma opinião ou a qualquer thread da discussão |
| `PUT` | `/api/opinions/:opinion_id/reaction` | Like/dislike na opinião raiz |
| `PUT` | `/api/opinions/threads/:thread_id/reaction` | Like/dislike em uma resposta (thread) |

#### `PUT /api/opinions/:opinion_id/reaction`

**Auth:** obrigatória

##### Request body

```json
{
  "action": "like | dislike | remove_like | remove_dislike"
}
```

| Ação | Comportamento |
|------|---------------|
| `like` | Define voto `+1`; se já for `+1`, remove o voto (toggle) |
| `dislike` | Define voto `-1`; se já for `-1`, remove o voto (toggle) |
| `remove_like` | Remove voto somente se atual for `+1` (idempotente) |
| `remove_dislike` | Remove voto somente se atual for `-1` (idempotente) |

##### Resposta `200`

```json
{
  "cached_upvotes": 3,
  "user_vote": 1
}
```

##### Erros comuns

| Situação | HTTP | message (exemplo) |
|----------|------|-------------------|
| Opinião inexistente | 404 | `Opinião não encontrada` |
| `action` inválida | 422 | validação Zod |

#### `PUT /api/opinions/threads/:thread_id/reaction`

Mesmo contrato de body, resposta e ações de `PUT /api/opinions/:opinion_id/reaction`, aplicado à thread indicada.

##### Erros comuns

| Situação | HTTP | message (exemplo) |
|----------|------|-------------------|
| Thread inexistente | 404 | `Interação não encontrada` |
| `action` inválida | 422 | validação Zod |

#### `POST /api/opinions/:opinion_id/threads`

**Auth:** obrigatória

##### Request body

```json
{
  "content": "string (obrigatório)",
  "parent_interaction_id": "uuid | null (opcional)"
}
```

- Omitido ou `null`: resposta direta à opinião raiz.
- Informado: resposta aninhada à thread indicada (deve pertencer à mesma opinião).

##### Erros comuns

| Situação | HTTP | message (exemplo) |
|----------|------|-------------------|
| Opinião inexistente | 404 | `Opinião não encontrada` |
| `parent_interaction_id` inexistente | 400 | `Interação pai não encontrada` |
| Pai de outra opinião | 400 | `A interação pai não pertence a esta opinião` |

---

### `POST /api/products`

Cria um produto e vincula nós já existentes (tabela pivô `product_nodes`).

**Auth:** obrigatória

#### Request body

```json
{
  "name": "string (obrigatório, trim, min 1; único case-insensitive)",
  "ean": "string (opcional; só dígitos, 1–13 chars)",
  "brand_name": "string (opcional, max 100; nome comercial descritivo)",
  "image_url": "string (opcional; URL válida)",
  "nodeIds": ["uuid", "..."] 
}
```

#### Regras de `nodeIds`

| Regra | Detalhe |
|-------|---------|
| Tamanho mínimo (schema) | ≥ 2 UUIDs |
| Sem duplicatas | `400` se repetido |
| Todos devem existir | `404` se algum UUID não existir |
| Tipos proibidos | `ROOT`, `TIPO` → `400` |
| Tipos permitidos | `CATEGORIA`, `MARCA`, `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO` |
| Composição obrigatória | **exatamente 1** `CATEGORIA` e **exatamente 1** `MARCA` |
| Opcionais | 0..N de `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO` |

O TIPO macro do produto **não** vai em `nodeIds`; é inferido pelo `parent_id` da `CATEGORIA` vinculada.

#### Resposta `201`

```json
{
  "id": "uuid",
  "name": "string",
  "ean": "string | null",
  "brand_name": "string | null",
  "image_url": "string | null",
  "created_at": "ISO-8601",
  "nodeIds": ["uuid", "uuid"]
}
```

> Nota: a resposta expõe `nodeIds` achatado; o campo interno `product_nodes` não é retornado.

#### Erros de negócio comuns

| Situação | HTTP | message (exemplo) |
|----------|------|-------------------|
| Nome já cadastrado (case-insensitive) | 409 | `Já existe produto com este nome` |
| EAN já cadastrado | 409 | `Já existe produto com este EAN` |
| 0 ou >1 CATEGORIA/MARCA | 400 | `O produto deve possuir exatamente uma CATEGORIA e exatamente uma MARCA` |
| nodeIds com ROOT/TIPO | 400 | `nodeIds não pode conter nós do tipo ROOT ou TIPO` |
| nodeIds duplicados | 400 | `nodeIds não pode conter valores duplicados` |
| UUID inexistente | 404 | `Um ou mais nodeIds informados não existem` |
| Conflito Prisma (unicidade) | 409 | `Produto já existe com os mesmos dados únicos` |

#### Exemplo — produto mínimo válido

```json
{
  "name": "Ibanez RG450DX",
  "nodeIds": [
    "<uuid-categoria-guitarras>",
    "<uuid-marca-ibanez>"
  ]
}
```

#### Exemplo — produto completo

```json
{
  "name": "Ibanez RG450DX",
  "ean": "7891234567890",
  "brand_name": "Ibanez",
  "image_url": "https://example.com/ibanez-rg450dx.jpg",
  "nodeIds": [
    "<uuid-categoria>",
    "<uuid-marca>",
    "<uuid-tecnologia>",
    "<uuid-composicao>",
    "<uuid-atributo>"
  ]
}
```

---

## Fluxo recomendado para cadastrar um produto

Execute nesta ordem. Guarde cada `id` retornado.

```
1. POST /api/auth/login                          → accessToken
2. POST /api/nodes  { type: TIPO, ... }          → tipo_id
3. POST /api/nodes  { type: CATEGORIA, parent_id: tipo_id }
4. POST /api/nodes  { type: MARCA, ... }
5. POST /api/nodes  { type: TECNOLOGIA, ... }    (opcional, repetível)
6. POST /api/nodes  { type: COMPOSICAO, ... }    (opcional, repetível)
7. POST /api/nodes  { type: ATRIBUTO, ... }      (opcional, repetível)
8. POST /api/products { name, nodeIds: [...] }
```

Para **autocomplete de categorias** dentro de um TIPO durante o cadastro:

```
GET /api/nodes?tipo_id=<uuid-tipo>&q=<texto-digitado>
```

Para **reutilizar nós existentes** em vez de criar:

```
GET /api/nodes?q=<nome>&type=MARCA
GET /api/nodes?tipo_id=<uuid-tipo>&q=<nome>
```

---

## Referência rápida de endpoints

| Método | Path | Função |
|--------|------|--------|
| `GET` | `/api/nodes` | Buscar/listar nós |
| `POST` | `/api/nodes` | Criar nó |
| `PATCH` | `/api/nodes/:id` | Renomear nó |
| `GET` | `/api/products/:id` | Detalhe do produto (metadados + abas) |
| `GET` | `/api/products/:id/opinions` | Opiniões paginadas por aba |
| `POST` | `/api/products` | Criar produto |

---

## Checklist para LLM ao montar requisições

- [ ] Incluir header `Authorization: Bearer ...` em todas as chamadas
- [ ] Criar nós **antes** do produto; produto só recebe UUIDs existentes
- [ ] Nunca colocar `ROOT` ou `TIPO` em `nodeIds` de produto
- [ ] Garantir exatamente 1 `CATEGORIA` + 1 `MARCA` em `nodeIds`
- [ ] Ao criar `CATEGORIA`, sempre enviar `parent_id` de um `TIPO` válido
- [ ] Usar `tipo_id` na busca quando filtrar categorias de um macro-tipo
- [ ] Tratar erros pelo campo `message` (português) e `details` em validações 422
