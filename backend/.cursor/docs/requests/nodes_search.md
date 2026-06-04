# Pesquisa de nós via Insomnia

Rota: **`GET /api/nodes`** — busca paginada com filtro opcional por nome (`q`) e tipo (`type`).

Nós do tipo **ROOT** nunca aparecem nos resultados.  
Com `q`, a busca usa similaridade fuzzy (`pg_trgm`); threshold padrão: `0.3` (`NODES_SEARCH_FUZZINESS` no `.env`).

**Base URL:** `http://localhost:3000/api`  
**Headers em todas as rotas autenticadas:**

```
Authorization: Bearer SEU_ACCESS_TOKEN
```

---

## 0 — Login (obter token)

**POST** `http://localhost:3000/api/auth/login`

```json
{
  "email": "ricardozancan@gmail.com",
  "password": "senha@123"
}
```

Copie `accessToken` da resposta JSON e use no header `Authorization`. O refresh token é definido como cookie HttpOnly (`guiareal_refresh`) no login; use `POST /auth/refresh` (sem body, cookie automático) para renovar o access.

---

## Parâmetros disponíveis

| Query     | Obrigatório | Default | Descrição |
|-----------|-------------|---------|-----------|
| `q`       | não         | —       | Texto para busca fuzzy no `name` |
| `type`    | não         | —       | `TIPO`, `CATEGORIA`, `MARCA`, `TECNOLOGIA`, `COMPOSICAO`, `ATRIBUTO` |
| `tipo_id` | não         | —       | UUID de um nó `TIPO`; restringe a categorias filhas desse tipo |
| `page`    | não         | `1`     | Página (≥ 1) |
| `limit`   | não         | `20`    | Itens por página (1–100) |

Com `tipo_id`, a API força `type=CATEGORIA` e filtra `parent_id = tipo_id`.  
Se enviar `type` junto, deve ser `CATEGORIA` (ou omita `type`).

---

## 1 — Listar todos os nós (paginação padrão)

**GET** `http://localhost:3000/api/nodes`

Sem filtros. Retorna até 20 nós por página, ordenados por `name ASC`.

---

## 2 — Listar com paginação customizada

**GET** `http://localhost:3000/api/nodes?page=1&limit=10`

---

## 3 — Buscar por texto (qualquer tipo)

**GET** `http://localhost:3000/api/nodes?q=Ibanez`

Retorna nós cujo nome tem similaridade ≥ threshold com `"Ibanez"`, ordenados por relevância.

---

## 4 — Filtrar por TIPO

**GET** `http://localhost:3000/api/nodes?type=TIPO`

---

## 5 — Filtrar por CATEGORIA

**GET** `http://localhost:3000/api/nodes?type=CATEGORIA`

---

## 6 — Filtrar por MARCA

**GET** `http://localhost:3000/api/nodes?type=MARCA`

---

## 7 — Filtrar por TECNOLOGIA

**GET** `http://localhost:3000/api/nodes?type=TECNOLOGIA`

---

## 8 — Filtrar por COMPOSICAO

**GET** `http://localhost:3000/api/nodes?type=COMPOSICAO`

---

## 9 — Filtrar por ATRIBUTO

**GET** `http://localhost:3000/api/nodes?type=ATRIBUTO`

---

## 10 — Busca por texto + tipo (MARCA)

**GET** `http://localhost:3000/api/nodes?q=Iban&type=MARCA`

Combina fuzzy no nome com filtro de tipo.

---

## 11 — Busca por texto + tipo (CATEGORIA)

**GET** `http://localhost:3000/api/nodes?q=Guitar&type=CATEGORIA`

---

## 12 — Busca por texto + tipo + paginação

**GET** `http://localhost:3000/api/nodes?q=Maple&type=COMPOSICAO&page=1&limit=5`

---

## 13 — Categorias filhas de um TIPO (listar todas)

Substitua `TIPO_ID` pelo UUID retornado ao criar/listar um TIPO.

**GET** `http://localhost:3000/api/nodes?tipo_id=TIPO_ID`

---

## 14 — Fuzzy search de categorias de um TIPO

**GET** `http://localhost:3000/api/nodes?tipo_id=TIPO_ID&q=Guitar`

Busca fuzzy apenas entre categorias cujo `parent_id` é o TIPO informado.

---

## 15 — Fuzzy search de categorias de um TIPO + paginação

**GET** `http://localhost:3000/api/nodes?tipo_id=TIPO_ID&q=Guitar&page=1&limit=10`

---

## Formato da resposta (`200`)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ibanez",
      "type": "MARCA",
      "parent_id": "uuid-do-root",
      "wikidata_id": null,
      "created_at": "2026-05-31T12:00:00.000Z"
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

## Ordem resumida

| # | Método | URL | Uso |
|---|--------|-----|-----|
| 0 | POST | `/auth/login` | obter token |
| 1 | GET | `/nodes` | listar tudo |
| 2 | GET | `/nodes?page=1&limit=10` | paginação |
| 3 | GET | `/nodes?q=Ibanez` | busca fuzzy |
| 4 | GET | `/nodes?type=TIPO` | só tipos |
| 5 | GET | `/nodes?type=CATEGORIA` | só categorias |
| 6 | GET | `/nodes?type=MARCA` | só marcas |
| 7 | GET | `/nodes?type=TECNOLOGIA` | só tecnologias |
| 8 | GET | `/nodes?type=COMPOSICAO` | só composições |
| 9 | GET | `/nodes?type=ATRIBUTO` | só atributos |
| 10 | GET | `/nodes?q=Iban&type=MARCA` | texto + tipo |
| 11 | GET | `/nodes?q=Guitar&type=CATEGORIA` | texto + tipo |
| 12 | GET | `/nodes?q=Maple&type=COMPOSICAO&page=1&limit=5` | completo |
| 13 | GET | `/nodes?tipo_id=TIPO_ID` | categorias de um TIPO |
| 14 | GET | `/nodes?tipo_id=TIPO_ID&q=Guitar` | fuzzy em categorias do TIPO |
| 15 | GET | `/nodes?tipo_id=TIPO_ID&q=Guitar&page=1&limit=10` | fuzzy + paginação |

**Nota:** não há rota de pesquisa de produtos (`GET /api/products`) implementada no backend atualmente.
