# HTTP Request — Callback do agente

Nó após o AI Agent para persistir a resposta no backend e emitir eventos via Socket.IO.

## Configuração

| Campo | Valor |
|-------|-------|
| Method | `POST` |
| URL | `{{ $env.TOOL_BASE_URL }}/chat/agent-response` |
| Authentication | Header Auth |
| Header name | `X-Tool-Api-Key` |
| Header value | `{{ $env.TOOL_API_KEY }}` |
| Content-Type | `application/json` |

## Body (JSON)

Se o AI Agent retornar JSON parseado em `$json.output`:

```json
{
  "chat_id": "={{ $json.output.chat_id }}",
  "title": "={{ $json.output.title }}",
  "assistant_message": "={{ $json.output.assistant_message }}"
}
```

Se o agente retornar texto em `$json.output` (sem parser estruturado), adicione um nó **Code** antes:

```javascript
const raw = $input.first().json.output ?? $input.first().json.text ?? '';
const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

return [{ json: parsed }];
```

Depois mapeie `$json.chat_id`, `$json.title` e `$json.assistant_message` no HTTP Request.

## Tratamento de erro

- Se o parse JSON falhar, configure **Error Workflow** ou **Continue On Fail** com log
- Status `4xx` do backend indica payload inválido — revise o output do agente
- Status `401` indica `X-Tool-Api-Key` incorreto

## Fluxo completo no n8n

```
Webhook Trigger
  → AI Agent (system: system_prompt.md | user: user_prompt.n8n.md)
  → [opcional] Code (parse JSON)
  → HTTP Request (este callback)
```
