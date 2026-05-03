CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE node_type AS ENUM ('ROOT', 'TIPO', 'CATEGORIA', 'TECNOLOGIA', 'MARCA', 'ATRIBUTO');
CREATE TYPE opinion_sentiment AS ENUM ('POSITIVO', 'NEGATIVO', 'MISTO');
CREATE TYPE queue_status AS ENUM ('PENDING', 'READY', 'PROCESSED', 'IGNORED');
CREATE TYPE report_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');
CREATE TYPE fact_status AS ENUM ('HYPOTHESIS', 'VERIFIED', 'DISPUTED');

---

-- Hierarquia técnica e de mercado
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type node_type NOT NULL,
    wikidata_id VARCHAR(50), -- Para futura expansão
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE nodes
ADD CONSTRAINT check_root_parent
CHECK (
    (type = 'ROOT' AND parent_id IS NULL) OR 
    (type <> 'ROOT' AND parent_id IS NOT NULL)
);

-- Entidade Produto (Instância comercial)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    ean VARCHAR(13) UNIQUE,
    brand_name VARCHAR(100),
    image_url TEXT, -- URL de terceiros para custo zero
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relacionamento Muitos-para-Muitos (Atributos como Nós)
CREATE TABLE product_nodes (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, node_id)
);


-----

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashPassword TEXT NOT NULL,
    reputation_score INT DEFAULT 0,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Ponto de entrada: Opiniões e Dicas (Âncoras)
CREATE TABLE opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    target_id UUID NOT NULL, -- Vinculado a um Produto ou Nó
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_eligible_for_ai BOOLEAN DEFAULT FALSE, -- Gatilho de relevância
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Threads de Discussão (Onde o debate acontece)
CREATE TABLE discussion_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opinion_id UUID REFERENCES opinions(id) ON DELETE CASCADE,
    parent_interaction_id UUID REFERENCES discussion_threads(id), -- Aninhamento
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    cached_upvotes INT DEFAULT 0, -- Para performance de UI
    status queue_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registro Nominal de Votos (Segurança e Reputação)
CREATE TABLE reaction_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    interaction_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    vote_type INT DEFAULT 1, -- 1 (Up), -1 (Down)
    UNIQUE(user_id, interaction_id) -- Proteção Sybil
);

---

-- Fatos Consolidados pela IA (O "Cérebro" do RAG)
CREATE TABLE technical_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES nodes(id),
    fact_label TEXT NOT NULL, -- Ex: "Ponte fixa mantém melhor afinação"
    fact_description TEXT,
    consensus_score FLOAT DEFAULT 0,
    status fact_status DEFAULT 'HYPOTHESIS',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Atribuição de Prova (O "Recibo")
CREATE TABLE fact_evidence (
    fact_id UUID REFERENCES technical_facts(id) ON DELETE CASCADE,
    interaction_id UUID REFERENCES discussion_threads(id),
    PRIMARY KEY (fact_id, interaction_id)
);


---
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    target_interaction_id UUID REFERENCES discussion_threads(id),
    reason VARCHAR(50) NOT NULL, -- SPAM, Toxicidade, etc.
    status report_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);