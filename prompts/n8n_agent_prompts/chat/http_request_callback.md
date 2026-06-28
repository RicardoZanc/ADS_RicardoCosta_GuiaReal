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

Se o AI Agent retornar JSON parseado em `$json.output`, repasse o objeto completo:

```json
={{ $json.output }}
```

Campos esperados:

| Campo | Obrigatório |
|-------|-------------|
| `chat_id` | sim |
| `title` | sim (string vazia quando não alterar título) |
| `assistant_message` | sim |
| `mentioned_technical_facts` | não — fatos técnicos usados com evidências |
| `mentioned_evidences` | não — lista deduplicada de opiniões/threads citadas |

Alternativa com mapeamento explícito:

```json
{
  "chat_id": "={{ $json.output.chat_id }}",
  "title": "={{ $json.output.title }}",
  "assistant_message": "={{ $json.output.assistant_message }}",
  "mentioned_technical_facts": "={{ $json.output.mentioned_technical_facts }}",
  "mentioned_evidences": "={{ $json.output.mentioned_evidences }}"
}
```

Se o agente retornar texto em `$json.output` (sem parser estruturado), adicione um nó **Code** antes:

```javascript
const raw = $input.first().json.output ?? $input.first().json.text ?? '';
const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

return [{ json: parsed }];
```

## Tratamento de erro

- Se o parse JSON falhar, configure **Error Workflow** ou **Continue On Fail** com log
- Status `4xx` do backend indica payload inválido — revise o output do agente
- Status `401` indica `X-Tool-Api-Key` incorreto

## Fluxo completo no n8n

```
Webhook Trigger
  → AI Agent (system: system_prompt.md | user: user_prompt.n8n.md | tools: Search Nodes, List Technical Facts, Get Product Nodes)
  → [opcional] Code (parse JSON)
  → HTTP Request (este callback)
```
