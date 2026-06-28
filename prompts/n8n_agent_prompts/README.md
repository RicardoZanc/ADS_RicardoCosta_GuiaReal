# Prompts — Agentes n8n (GuiaReal)

Prompts prontos para colar nos workflows n8n que orquestram agentes de IA.

## Chat Agent

Fluxo: `Webhook Trigger` → `AI Agent` → `HTTP Request` (`POST /tool/chat/agent-response`)

| Arquivo | Uso no n8n |
|---------|------------|
| [chat/system_prompt.md](chat/system_prompt.md) | **System Message** do nó AI Agent |
| [chat/user_prompt.n8n.md](chat/user_prompt.n8n.md) | **Text / User Message** do nó AI Agent (expressões n8n) |
| [chat/structured_output_schema.json](chat/structured_output_schema.json) | **Structured Output Parser** (opcional, recomendado) |
| [chat/http_request_callback.md](chat/http_request_callback.md) | Configuração do nó HTTP Request de callback |

### Payload recebido no webhook

```json
{
  "chat_id": "uuid",
  "user_id": "uuid",
  "user_message": "texto da mensagem do usuário",
  "should_name_conversation": true
}
```

### Callback esperado pelo backend

`POST {TOOL_BASE_URL}/chat/agent-response`

Header: `X-Tool-Api-Key: {TOOL_API_KEY}`

```json
{
  "chat_id": "uuid",
  "title": "Título curto da conversa",
  "assistant_message": "Resposta do assistente ao usuário"
}
```

`title` vazio (`""`) indica que o título não deve ser alterado (usado quando `should_name_conversation: false`).

Documentação completa: [backend/.cursor/docs/api/chats.md](../../backend/.cursor/docs/api/chats.md)

## Technical Facts Agent

Fluxo: `HTTP Request` (pending-queue) → `AI Agent` → tools HTTP

| Arquivo | Uso no n8n |
|---------|------------|
| [create_technical_facts.md](create_technical_facts.md) | **System Message** do nó AI Agent |

### Entrada do agente

`GET {TOOL_BASE_URL}/technical-facts/pending-queue`

Header: `X-Tool-Api-Key: {TOOL_API_KEY}`

O payload `data[]` contém itens unificados com `source_type` (`opinion` | `thread`), `source_id`, `title`, `content`, `node_id`, `product_id`, `evidence_weight`, `cached_upvotes` e `author`.

### Tools disponíveis para o agente

| Tool | Método | Uso |
|------|--------|-----|
| Listar nós do produto | `GET /tool/products/{product_id}/nodes` | Quando `node_id` for nulo e houver `product_id` |
| Descartar item da fila | `PATCH /tool/technical-facts/queue/{source_type}/{source_id}/processed` | Conteúdo social ou sem substância técnica |
| Criar fato técnico | `POST /tool/technical-facts` | Conclusão técnica consolidada (`evidence[]`) |

No n8n, configure cada rota como um nó **HTTP Request Tool** conectado ao AI Agent, com `toolDescription` espelhando a documentação da API.

Documentação completa: [backend/.cursor/docs/api/technical_facts.md](../../backend/.cursor/docs/api/technical_facts.md), [products_tool.md](../../backend/.cursor/docs/api/products_tool.md)
