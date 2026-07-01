# Code (parsing + normalização) + HTTP Request — Callback do agente

Dois nós após o AI Agent para persistir a resposta no backend e emitir eventos via Socket.IO.

> O AI Agent **não** usa Structured Output Parser (`hasOutputParser: false`). O agente responde com uma string de texto contendo JSON (orientado pelo `system_prompt.md`), e este nó Code faz o parsing manual. Essa decisão veio de instabilidade observada com `gpt-4.1-mini` + Structured Output Parser acoplado ao agente: no turno final o modelo às vezes retornava *completion* vazia, e o `autoFix` do parser gerava JSON malformado (cercas de markdown, chave `output` duplicada).

## Nó Code — "Normalize Agent Response"

Fica entre o AI Agent e o HTTP Request. Responsabilidades:

- Lê `$json.output` (string retornada pelo agente; `$json.text` como fallback)
- Remove cercas de código markdown (```` ```json ... ``` ````) se o modelo as incluir por engano
- Faz `JSON.parse` da string resultante
- Desembrulha aninhamento acidental de `output` (`{"output": {...}}`) — defesa contra o modelo repetir uma chave que não deveria escrever
- **Sempre sobrescreve `chat_id`** com o valor do payload do webhook (`$('Webhook').first().json.body.chat_id`) — o modelo **nunca** é a fonte de verdade para esse campo, eliminando de raiz o risco de UUID inventado/truncado
- Normaliza `mentioned_technical_facts` e `mentioned_evidences`: `null` → `[]`
- Lança erro claro (`Error`) se a resposta não puder ser interpretada como JSON válido ou não tiver `assistant_message`

```javascript
const webhookItem = $('Webhook').first().json;
const webhookBody = webhookItem.body ?? webhookItem;
const chatId = webhookBody.chat_id;

function stripFences(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

function unwrapOutput(obj) {
  let current = obj;
  let guard = 0;
  while (current && typeof current === 'object' && 'output' in current && !('chat_id' in current) && guard < 5) {
    current = current.output;
    guard++;
  }
  return current;
}

return $input.all().map((item) => {
  const raw = item.json.output ?? item.json.text ?? item.json;

  let parsed = raw;
  if (typeof raw === 'string') {
    const cleaned = stripFences(raw);
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      throw new Error(`Resposta do agente não é JSON válido: ${error.message}`);
    }
  }

  parsed = unwrapOutput(parsed);

  if (!parsed || typeof parsed !== 'object' || !parsed.assistant_message) {
    throw new Error('Resposta do agente não contém assistant_message.');
  }

  return {
    json: {
      chat_id: chatId,
      title: parsed.title ?? '',
      assistant_message: parsed.assistant_message,
      mentioned_technical_facts: parsed.mentioned_technical_facts ?? [],
      mentioned_evidences: parsed.mentioned_evidences ?? [],
    },
  };
});
```

## Nó HTTP Request — callback

| Campo | Valor |
|-------|-------|
| Method | `POST` |
| URL | `{{ $env.TOOL_BASE_URL }}/chat/agent-response` |
| Authentication | Header Auth |
| Header name | `X-Tool-Api-Key` |
| Header value | `{{ $env.TOOL_API_KEY }}` |
| Content-Type | `application/json` |

### Body (JSON)

O nó Code já entrega o body exato esperado pelo backend — sem necessidade de desembrulhar nada:

```
={{ $json }}
```

Campos enviados ao backend:

| Campo | Obrigatório |
|-------|-------------|
| `chat_id` | sim |
| `title` | sim (string vazia quando não alterar título) |
| `assistant_message` | sim |
| `mentioned_technical_facts` | sim, pode ser `[]` |
| `mentioned_evidences` | sim, pode ser `[]` |

## Tratamento de erro

- Se o Code node lançar erro (JSON inválido / `assistant_message` ausente), a execução falha visivelmente no n8n — revise o schema do parser ou o prompt do agente
- Status `4xx` do backend indica payload inválido — revise a saída do Code node
- Status `401` indica `X-Tool-Api-Key` incorreto

## Fluxo completo no n8n

```
Webhook Trigger
  → AI Agent (system: system_prompt.md | user: user_prompt.n8n.md | tools: Search Nodes, List Technical Facts, Get Product Nodes, Report Progress | hasOutputParser: false)
  → Code (Normalize Agent Response)
  → HTTP Request (este callback)
```
