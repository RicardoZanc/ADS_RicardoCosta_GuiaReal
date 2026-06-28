-- AlterTable: add surrogate PK and opinion_id, make interaction_id optional
ALTER TABLE "fact_evidence" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "fact_evidence" ADD COLUMN "opinion_id" UUID;

-- Drop old composite PK
ALTER TABLE "fact_evidence" DROP CONSTRAINT "fact_evidence_pkey";

-- Make interaction_id nullable
ALTER TABLE "fact_evidence" ALTER COLUMN "interaction_id" DROP NOT NULL;

-- New PK on id
ALTER TABLE "fact_evidence" ADD CONSTRAINT "fact_evidence_pkey" PRIMARY KEY ("id");

-- Unique constraints per source type
CREATE UNIQUE INDEX "fact_evidence_fact_id_interaction_id_key" ON "fact_evidence"("fact_id", "interaction_id") WHERE "interaction_id" IS NOT NULL;
CREATE UNIQUE INDEX "fact_evidence_fact_id_opinion_id_key" ON "fact_evidence"("fact_id", "opinion_id") WHERE "opinion_id" IS NOT NULL;

-- Exactly one source must be set
ALTER TABLE "fact_evidence" ADD CONSTRAINT "fact_evidence_single_source_check" CHECK (
  ("interaction_id" IS NOT NULL AND "opinion_id" IS NULL)
  OR ("interaction_id" IS NULL AND "opinion_id" IS NOT NULL)
);

-- FK to opinions
ALTER TABLE "fact_evidence" ADD CONSTRAINT "fact_evidence_opinion_id_fkey" FOREIGN KEY ("opinion_id") REFERENCES "opinions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
