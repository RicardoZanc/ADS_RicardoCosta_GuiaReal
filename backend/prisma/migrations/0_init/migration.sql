-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "fact_status" AS ENUM ('HYPOTHESIS', 'VERIFIED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "node_type" AS ENUM ('ROOT', 'TIPO', 'CATEGORIA', 'TECNOLOGIA', 'MARCA', 'ATRIBUTO');

-- CreateEnum
CREATE TYPE "opinion_sentiment" AS ENUM ('POSITIVO', 'NEGATIVO', 'MISTO');

-- CreateEnum
CREATE TYPE "queue_status" AS ENUM ('PENDING', 'READY', 'PROCESSED', 'IGNORED');

-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "discussion_threads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "opinion_id" UUID,
    "parent_interaction_id" UUID,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "cached_upvotes" INTEGER DEFAULT 0,
    "status" "queue_status" DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_evidence" (
    "fact_id" UUID NOT NULL,
    "interaction_id" UUID NOT NULL,

    CONSTRAINT "fact_evidence_pkey" PRIMARY KEY ("fact_id","interaction_id")
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "type" "node_type" NOT NULL,
    "wikidata_id" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opinions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT NOT NULL,
    "is_eligible_for_ai" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opinions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_nodes" (
    "product_id" UUID NOT NULL,
    "node_id" UUID NOT NULL,

    CONSTRAINT "product_nodes_pkey" PRIMARY KEY ("product_id","node_id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "ean" VARCHAR(13),
    "brand_name" VARCHAR(100),
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reaction_votes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "interaction_id" UUID NOT NULL,
    "vote_type" INTEGER DEFAULT 1,

    CONSTRAINT "reaction_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reporter_id" UUID NOT NULL,
    "target_interaction_id" UUID,
    "reason" VARCHAR(50) NOT NULL,
    "status" "report_status" DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_facts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "node_id" UUID,
    "fact_label" TEXT NOT NULL,
    "fact_description" TEXT,
    "consensus_score" DOUBLE PRECISION DEFAULT 0,
    "status" "fact_status" DEFAULT 'HYPOTHESIS',
    "last_updated" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technical_facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "username" VARCHAR(50) NOT NULL,
    "hashpassword" TEXT NOT NULL,
    "reputation_score" INTEGER DEFAULT 0,
    "is_banned" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_ean_key" ON "products"("ean");

-- CreateIndex
CREATE UNIQUE INDEX "reaction_votes_user_id_interaction_id_key" ON "reaction_votes"("user_id", "interaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "discussion_threads" ADD CONSTRAINT "discussion_threads_opinion_id_fkey" FOREIGN KEY ("opinion_id") REFERENCES "opinions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "discussion_threads" ADD CONSTRAINT "discussion_threads_parent_interaction_id_fkey" FOREIGN KEY ("parent_interaction_id") REFERENCES "discussion_threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "discussion_threads" ADD CONSTRAINT "discussion_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fact_evidence" ADD CONSTRAINT "fact_evidence_fact_id_fkey" FOREIGN KEY ("fact_id") REFERENCES "technical_facts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fact_evidence" ADD CONSTRAINT "fact_evidence_interaction_id_fkey" FOREIGN KEY ("interaction_id") REFERENCES "discussion_threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opinions" ADD CONSTRAINT "opinions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_nodes" ADD CONSTRAINT "product_nodes_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_nodes" ADD CONSTRAINT "product_nodes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_votes" ADD CONSTRAINT "reaction_votes_interaction_id_fkey" FOREIGN KEY ("interaction_id") REFERENCES "discussion_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reaction_votes" ADD CONSTRAINT "reaction_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_interaction_id_fkey" FOREIGN KEY ("target_interaction_id") REFERENCES "discussion_threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "technical_facts" ADD CONSTRAINT "technical_facts_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

