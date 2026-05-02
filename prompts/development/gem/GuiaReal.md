# GuiaReal

O GuiaReal é uma rede social onde produtos e suas características são discutidos por pessoas diretamente impactadas por esses temas. Em uma interface de chat, o usuário interage com um agente de IA que gera recomendações com base nas informações extraídas das interações da comunidade.


### 📄 GuiaReal: Especificação Técnica e Diretrizes de Arquitetura

---

#### 1. Conceito Central: Sabedoria em Camadas

O GuiaReal organiza conhecimento de forma relacional e reutilizável. Problemas, características e percepções associados a um componente (ex: painel IPS) devem se propagar automaticamente para todos os produtos que o utilizam.

O sistema estrutura o conhecimento em três tipos principais:

* **Opiniões:** Avaliações subjetivas focadas em experiência e decisão de compra.
* **Dicas:** Conteúdo prático voltado a uso, durabilidade e manutenção no pós-compra.
* **Trade-offs:** Relações explícitas de custo vs. perda de valor (ex: pagar menos implica abrir mão de X e Y).

Regra fundamental: o sistema deve evidenciar consequências de escolha, não apenas recomendar opções.

---

#### 2. Stack Tecnológica

* **Frontend:** Next.js (PWA)
  Aplicação web com comportamento de app, priorizando performance, responsividade e distribuição sem dependência de app stores.

* **Backend:** Node.js com Express
  API orientada a serviços, com foco em simplicidade inicial e evolução incremental.

* **Banco de Dados:** PostgreSQL
  Modelagem relacional com suporte a:

  * estruturas hierárquicas (ex: componentes → produtos)
  * atributos dinâmicos (especificações técnicas variáveis)

* **Orquestração de IA:** n8n
  Responsável por:

  * ingestão e processamento das interações da comunidade
  * enriquecimento de dados
  * geração de contexto para o agente de recomendação

---



