# API — Products (Tools)

Endpoint interno para o agente n8n consultar a taxonomia vinculada a um produto.

**Base URL:** `http://localhost:3000/tool`

**Autenticação:** header `X-Tool-Api-Key` com valor de `TOOL_API_KEY` (`.env`).

---

## `GET /products/:product_id/nodes`

Lista os nós vinculados ao produto para mapeamento temático quando `node_id` da interação é nulo.

| Item | Valor |
|------|-------|
| Autenticação | `X-Tool-Api-Key` |
| Sucesso | `200 OK` |

### Path

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `product_id` | uuid | ID do produto |

### Resposta

```json
{
  "product_id": "uuid",
  "product_name": "Ibanez RG550",
  "nodes": [
    { "id": "uuid", "name": "Ibanez", "type": "MARCA" },
    { "id": "uuid", "name": "Floyd Rose", "type": "TECNOLOGIA" }
  ]
}
```

Inclui nós dos tipos `CATEGORIA`, `MARCA`, `TECNOLOGIA`, `COMPOSICAO` e `ATRIBUTO` vinculados via `product_nodes`.

### Erros

| Status | `message` típico |
|--------|------------------|
| `404` | Produto não encontrado |
| `422` | ID do produto inválido |
