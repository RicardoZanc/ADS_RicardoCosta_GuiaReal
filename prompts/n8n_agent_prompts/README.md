# Prompts — Agentes n8n (GuiaReal)

Prompts prontos para colar nos workflows n8n que orquestram agentes de IA.

## Chat Agent

Fluxo: `Webhook Trigger` → `AI Agent` (+ tools, **sem** Structured Output Parser) → **Code** (parse + normaliza resposta) → `HTTP Request` (`POST /tool/chat/agent-response`)

| Arquivo | Uso no n8n |
|---------|------------|
| [chat/system_prompt.md](chat/system_prompt.md) | **System Message** do nó AI Agent |
| [chat/user_prompt.n8n.md](chat/user_prompt.n8n.md) | **Text / User Message** do nó AI Agent (expressões n8n) |
| [chat/structured_output_schema.json](chat/structured_output_schema.json) | Referência do formato esperado do JSON (documentação; **não** está mais ligado a um Structured Output Parser no workflow) |
| [chat/http_request_callback.md](chat/http_request_callback.md) | Nó **Code** de parsing/normalização + configuração do HTTP Request de callback |

**Por que sem Structured Output Parser?** O AI Agent + Structured Output Parser (`hasOutputParser: true`) mostrou-se instável com `gpt-4.1-mini`: no turno final (após usar as tools), o modelo às vezes retornava *completion* vazia, e as tentativas de `autoFix` produziam JSON malformado (cercas de markdown, chave `output` duplicada). Isso é uma limitação conhecida — a documentação do n8n recomenda evitar parser estruturado acoplado direto ao agente. A solução foi desacoplar: o agente responde em **texto livre** (`hasOutputParser: false`, instruído via prompt a devolver um JSON como string) e um nó **Code** faz o parsing manual, com múltiplas camadas de defesa (ver `http_request_callback.md`).

O nó **Code** ("Normalize Agent Response") fica entre o AI Agent e o HTTP Request: faz `JSON.parse` da string retornada, remove cercas de código markdown se presentes, desembrulha aninhamento acidental de `output`, **sempre sobrescreve `chat_id`** a partir do payload do webhook (nunca do modelo) e normaliza `mentioned_technical_facts`/`mentioned_evidences` para `[]` quando ausentes.

### Payload recebido no webhook

```json
{
  "chat_id": "uuid",
  "user_id": "uuid",
  "user_message": "texto da mensagem do usuário",
  "should_name_conversation": true,
  "message_history": [
    { "sender": "USER", "content": "mensagem anterior do usuário" },
    { "sender": "ASSISTANT", "content": "resposta anterior do assistente" }
  ]
}
```

`message_history` contém as últimas N mensagens anteriores à atual (sem a mensagem em `user_message`). Na primeira mensagem de um chat, o array vem vazio.

### Tools disponíveis para o agente

| Tool | Método | Uso |
|------|--------|-----|
| Search Nodes | `GET /tool/nodes/search?q=...` | Descobrir nós da taxonomia por nome |
| List Technical Facts | `GET /tool/technical-facts?node_id=...` | Consultar fatos consolidados e evidências |
| Get Product Nodes (Chat) | `GET /tool/products/{product_id}/nodes` | Mapear nós quando souber o produto |
| Report Progress | `POST /tool/chat/agent-progress` | Feedback efêmero de progresso por etapa do raciocínio |

No n8n, configure cada rota como um nó **HTTP Request Tool** conectado ao AI Agent, com `toolDescription` espelhando a documentação da API.

### Callback esperado pelo backend

`POST {TOOL_BASE_URL}/chat/agent-response`

Header: `X-Tool-Api-Key: {TOOL_API_KEY}`

`structured_output_schema.json` define os campos esperados (`chat_id`, `title`, `assistant_message`, ...) **diretamente na raiz** — apenas como referência de documentação/contrato, já que não há mais um Structured Output Parser no workflow validando isso automaticamente. Campos `mentioned_technical_facts` e `mentioned_evidences` aceitam array ou `null`; o prompt orienta o modelo a usar `[]` quando não houver fatos.

O nó **Code** ("Normalize Agent Response") após o AI Agent lê `$json.output` (string retornada pelo agente), faz `JSON.parse` após remover cercas de código markdown se presentes, desembrulha aninhamento acidental de `output`, e **sempre sobrescreve `chat_id` com o valor do webhook** (`$('Webhook').first().json.body.chat_id`) — o modelo nunca é a fonte de verdade para esse campo. O backend também aceita body flat ou wrapped (`{ "output": { ... } }`) como defesa adicional.

```json
{
  "chat_id": "uuid",
  "title": "Título curto da conversa",
  "assistant_message": "Resposta do assistente ao usuário",
  "mentioned_technical_facts": [
    {
      "id": "uuid",
      "fact_label": "Ponte fixa mantém melhor afinação",
      "evidence": [
        { "source_type": "opinion", "source_id": "uuid" }
      ]
    }
  ],
  "mentioned_evidences": [
    { "source_type": "opinion", "source_id": "uuid" }
  ]
}
```

`title` vazio (`""`) indica que o título não deve ser alterado (usado quando `should_name_conversation: false`).

Os campos `mentioned_technical_facts` e `mentioned_evidences` devem ser arrays — use `[]` quando a resposta não se apoiar em fatos técnicos. Cada fato em `mentioned_technical_facts` pode ter `evidence: []` quando a tool retornou o fato sem evidências linkadas.

O JSON acima é exatamente o que o nó Code entrega ao HTTP Request de callback (`jsonBody: ={{ $json }}`).

Documentação completa: [backend/.cursor/docs/api/chats.md](../../backend/.cursor/docs/api/chats.md), [nodes_tool.md](../../backend/.cursor/docs/api/nodes_tool.md), [technical_facts.md](../../backend/.cursor/docs/api/technical_facts.md)

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

## Report Fact Review Agent

Fluxo: `Webhook` (`report-fact-review`) → `AI Agent` → tools HTTP

| Arquivo | Uso no n8n |
|---------|------------|
| [review_technical_facts_on_report.md](review_technical_facts_on_report.md) | **System Message** do nó AI Agent |

Workflow versionado: [backend/n8n_workflows/ReportFactReview.json](../../backend/n8n_workflows/ReportFactReview.json)

### Payload recebido no webhook

Disparado pelo backend (`N8N_REPORT_WEBHOOK_URL`) quando um administrador aplica uma denúncia (`RESOLVED`) e o conteúdo envolve fatos técnicos:

```json
{
  "report_id": "uuid",
  "source_type": "thread",
  "source_id": "uuid",
  "reason": "MISLEADING",
  "fact_ids": ["uuid"],
  "resolution": "RESOLVED",
  "admin_notes": "Conteúdo ofensivo confirmado."
}
```

### Tools disponíveis para o agente

| Tool | Método | Uso |
|------|--------|-----|
| Get Facts By Evidence | `GET /tool/technical-facts/by-evidence/{source_type}/{source_id}` | Contexto do conteúdo denunciado e fatos vinculados |
| Update Technical Fact | `PATCH /tool/technical-facts/{id}` | Ajustar status/consenso após revisão |
| Delete Fact Evidence | `DELETE /tool/technical-facts/{fact_id}/evidence/{source_type}/{source_id}` | Remover evidência inválida |

Documentação: [reports.md](../../backend/.cursor/docs/api/reports.md), [technical_facts.md](../../backend/.cursor/docs/api/technical_facts.md)
