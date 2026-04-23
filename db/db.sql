-- Extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipos enumerados para consistência
CREATE TYPE node_type AS ENUM ('ROOT', 'TIPO', 'CATEGORIA', 'TECNOLOGIA', 'MARCA');
CREATE TYPE opinion_sentiment AS ENUM ('POSITIVO', 'NEGATIVO', 'MISTO');
CREATE TYPE queue_status AS ENUM ('PENDING', 'READY', 'PROCESSED', 'IGNORED');

-- Tabela de Nós (Hierarquia Recursiva)
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type node_type NOT NULL,
    wikidata_id VARCHAR(50), -- Referência externa para Deep Research
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_node_name_per_parent UNIQUE (parent_id, name)
);

-- Tabela de Produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES nodes(id),
    name VARCHAR(255) NOT NULL,
    ean VARCHAR(13) UNIQUE, -- Código de barras
    mpn VARCHAR(50),        -- Manufacturer Part Number
    brand_name VARCHAR(100),
    image_url TEXT,
    specs JSONB DEFAULT '{}', -- Atributos técnicos flexíveis (ex: "brilho", "hz")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usuários e Reputação
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    reputation_score INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opiniões (Multinível: pode ser sobre um Produto, Marca ou Tecnologia)
CREATE TABLE opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    -- target_id é genérico; na lógica de aplicação, aponta para node_id ou product_id
    target_id UUID NOT NULL, 
    content TEXT NOT NULL,
    sentiment opinion_sentiment DEFAULT 'MISTO',
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    is_eligible_for_ai BOOLEAN DEFAULT FALSE, -- Marcado após relevância social
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dicas de Uso (Foco em durabilidade)
CREATE TABLE tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    node_id UUID REFERENCES nodes(id), -- Dica pode ser para toda uma tecnologia (ex: IPS)
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela unificada de Discussões
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES interactions(id) ON DELETE CASCADE, -- Permite threads (respostas)
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Polimorfismo: a discussão pertence a qual "âncora"?
    opinion_id UUID REFERENCES opinions(id) ON DELETE CASCADE,
    tip_id UUID REFERENCES tips(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para carregar as threads rapidamente
CREATE INDEX idx_interactions_parent ON interactions(parent_id);
CREATE INDEX idx_interactions_anchor ON interactions(opinion_id, tip_id);

-- Fila de Processamento da LLM (Batch Processing)
CREATE TABLE ai_processing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opinion_id UUID NOT NULL REFERENCES opinions(id),
    status queue_status DEFAULT 'PENDING',
    processed_at TIMESTAMP,
    insight_summary TEXT, -- Resumo extraído pela IA
    detected_tags JSONB,  -- Tags como ["LG", "defeito_cronico", "suporte_lento"]
    retry_count INT DEFAULT 0
);

-- Insights Consolidados (O que a IA "aprendeu" sobre o Grafo)
CREATE TABLE technical_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES nodes(id),
    product_id UUID REFERENCES products(id),
    insight_text TEXT NOT NULL, -- Ex: "Padrão de vazamento de luz detectado nesta tecnologia"
    occurrence_count INT DEFAULT 1,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca recursiva na árvore
CREATE INDEX idx_nodes_hierarchy ON nodes(parent_id);

-- Índice para busca de produtos por EAN (Cadastro de baixo atrito)
CREATE INDEX idx_products_ean ON products(ean);

-- Índice para o Worker de IA processar apenas o que tem relevância social
CREATE INDEX idx_opinion_ai_eligibility ON opinions(is_eligible_for_ai) WHERE is_eligible_for_ai = TRUE;

-- Índice GIN para busca rápida dentro de JSONB de especificações
CREATE INDEX idx_products_specs ON products USING GIN (specs);

-- [ ... Tabelas de Nodes e Products mantidas ... ]

-- Opiniões e Dicas agora são "Postagens Âncora"
CREATE TABLE opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    target_id UUID NOT NULL, -- Node ou Product
    title VARCHAR(255),
    initial_content TEXT NOT NULL, -- O desabafo inicial
    sentiment opinion_sentiment DEFAULT 'MISTO',
    is_eligible_for_ai BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Respostas/Discussões (A Thread)
CREATE TABLE discussion_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opinion_id UUID REFERENCES opinions(id) ON DELETE CASCADE,
    tip_id UUID REFERENCES tips(id) ON DELETE CASCADE,
    parent_interaction_id UUID REFERENCES discussion_threads(id), -- Para aninhamento
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Status para o fluxo de moderação
CREATE TYPE report_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');
CREATE TYPE report_reason AS ENUM ('SPAM', 'TOXICITY', 'MISINFORMATION', 'ADVERTISING', 'OTHER');

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    
    -- O que está sendo denunciado? (Polimorfismo para abranger a thread toda)
    target_opinion_id UUID REFERENCES opinions(id),
    target_tip_id UUID REFERENCES tips(id),
    target_interaction_id UUID REFERENCES discussion_threads(id),
    
    reason report_reason NOT NULL,
    description TEXT,
    status report_status DEFAULT 'PENDING',
    
    moderator_notes TEXT, -- Notas internas da moderação
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extensão da tabela de Usuários para banimento
ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN ban_reason TEXT;