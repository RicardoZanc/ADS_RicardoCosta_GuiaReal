# Cadastro do primeiro produto via Insomnia

Fluxo de referência: guitarra **Ibanez RG450DX**.  
Cada passo abaixo é uma requisição separada. Copie URL + body, execute em ordem e guarde o `id` de cada resposta.

**Base URL:** `http://localhost:3000/api`  
**Headers em todas as rotas autenticadas:**

```
Content-Type: application/json
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

Copie `accessToken` da resposta JSON e use no header `Authorization`. O refresh token fica no cookie `guiareal_refresh` (definido no login; enviado automaticamente em `POST /auth/refresh`).

---

## Pré-requisito: nó ROOT no banco

A API não cria ROOT via `POST /api/nodes`. Se ainda não existir, insira uma vez no Postgres:

```sql
INSERT INTO nodes (name, type, parent_id)
VALUES ('ROOT', 'ROOT', NULL);
```

Sem ROOT, todas as criações de nó falham com `404 Nó ROOT não encontrado`.

---

## 1 — Criar TIPO

**POST** `http://localhost:3000/api/nodes`

```json
{
  "name": "Instrumentos Musicais",
  "type": "TIPO"
}
```

Guarde o `id` retornado → **`TIPO_ID`**

---

## 2 — Criar CATEGORIA

Filha direta do TIPO criado acima (`parent_id` obrigatório).

**POST** `http://localhost:3000/api/nodes`

```json
{
  "name": "Guitarras",
  "type": "CATEGORIA",
  "parent_id": "TIPO_ID"
}
```

Substitua `TIPO_ID` pelo UUID real. Guarde o `id` → **`CATEGORIA_ID`**

---

## 3 — Criar MARCA

**POST** `http://localhost:3000/api/nodes`

```json
{
  "name": "Ibanez",
  "type": "MARCA"
}
```

Guarde o `id` → **`MARCA_ID`**

---

## 4 — Criar TECNOLOGIA

**POST** `http://localhost:3000/api/nodes`

```json
{
  "name": "Floyd Rose",
  "type": "TECNOLOGIA"
}
```

Guarde o `id` → **`TECNOLOGIA_ID`**

---

## 5 — Criar COMPOSICAO

**POST** `http://localhost:3000/api/nodes`

```json
{
  "name": "Maple",
  "type": "COMPOSICAO"
}
```

Guarde o `id` → **`COMPOSICAO_ID`**

---

## 6 — Criar ATRIBUTO

**POST** `http://localhost:3000/api/nodes`

```json
{
  "name": "6 Cordas",
  "type": "ATRIBUTO"
}
```

Guarde o `id` → **`ATRIBUTO_ID`**

---

## 7 — Criar produto

Obrigatório: **exatamente 1** CATEGORIA e **exatamente 1** MARCA em `nodeIds`.  
Opcional: zero ou mais TECNOLOGIA, COMPOSICAO e ATRIBUTO.

**POST** `http://localhost:3000/api/products`

```json
{
  "name": "Ibanez RG450DX",
  "ean": "7891234567890",
  "brand_name": "Ibanez",
  "image_url": "https://example.com/ibanez-rg450dx.jpg",
  "nodeIds": [
    "CATEGORIA_ID",
    "MARCA_ID",
    "TECNOLOGIA_ID",
    "COMPOSICAO_ID",
    "ATRIBUTO_ID"
  ]
}
```

Substitua todos os placeholders pelos UUIDs reais.  
Campos opcionais: remova `ean`, `brand_name` ou `image_url` se não quiser enviá-los.

**Mínimo válido** (só categoria + marca):

```json
{
  "name": "Ibanez RG450DX",
  "nodeIds": [
    "CATEGORIA_ID",
    "MARCA_ID"
  ]
}
```

---

## Consultas úteis (opcional)

Listar TIPOs existentes (para reutilizar `parent_id` sem criar outro):

**GET** `http://localhost:3000/api/nodes?type=TIPO&limit=20`

Buscar nó por nome:

**GET** `http://localhost:3000/api/nodes?q=Ibanez&type=MARCA&limit=20`

---

## Ordem resumida

| # | Método | Rota | O que guardar |
|---|--------|------|---------------|
| 0 | POST | `/auth/login` | `accessToken` |
| 1 | POST | `/nodes` (TIPO) | `TIPO_ID` |
| 2 | POST | `/nodes` (CATEGORIA) | `CATEGORIA_ID` |
| 3 | POST | `/nodes` (MARCA) | `MARCA_ID` |
| 4 | POST | `/nodes` (TECNOLOGIA) | `TECNOLOGIA_ID` |
| 5 | POST | `/nodes` (COMPOSICAO) | `COMPOSICAO_ID` |
| 6 | POST | `/nodes` (ATRIBUTO) | `ATRIBUTO_ID` |
| 7 | POST | `/products` | produto criado |

Resposta esperada do produto: `201` com `id`, `name`, `nodeIds`, etc.
