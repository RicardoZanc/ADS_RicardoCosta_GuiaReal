# User Prompt — n8n AI Agent

Cole o conteúdo abaixo no campo **Text** (ou **User Message**) do nó AI Agent.
As expressões `{{ ... }}` são sintaxe n8n e serão resolvidas em runtime.

---

## Versão recomendada (webhook body direto)

Use quando o Webhook Trigger entrega o payload no `$json.body` ou `$json`:

```
Processe a mensagem do usuário no chat do GuiaReal e retorne o JSON conforme instruído.

Payload recebido:
{{ JSON.stringify($json.body ?? $json, null, 2) }}
```

---

## Versão com campos explícitos

Use se preferir mapear campos individualmente no nó anterior:

```
Processe a mensagem do usuário no chat do GuiaReal e retorne o JSON conforme instruído.

- chat_id: {{ $json.chat_id }}
- user_id: {{ $json.user_id }}
- user_message: {{ $json.user_message }}
- should_name_conversation: {{ $json.should_name_conversation }}
```

---

## Versão com histórico (recomendada)

O backend envia `message_history` no payload. Use quando o Webhook Trigger entrega o payload no `$json.body` ou `$json`:

```
Processe a mensagem do usuário no chat do GuiaReal e retorne o JSON conforme instruído.

Payload recebido:
{{ JSON.stringify($json.body ?? $json, null, 2) }}

O campo message_history contém mensagens anteriores (sender + content), em ordem cronológica. A mensagem atual está em user_message (fora do histórico).
```
