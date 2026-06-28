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
