-- AlterEnum
ALTER TYPE "node_type" ADD VALUE 'COMPOSICAO';

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex (customizado; não refletido no schema.prisma)
CREATE INDEX IF NOT EXISTS nodes_name_trgm_idx
  ON nodes USING gin (name gin_trgm_ops);
