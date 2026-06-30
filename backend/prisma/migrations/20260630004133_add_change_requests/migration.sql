-- CreateEnum
CREATE TYPE "change_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "change_entity_type" AS ENUM ('NODE', 'PRODUCT');

-- CreateTable
CREATE TABLE "change_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "entity_type" "change_entity_type" NOT NULL,
    "entity_id" UUID NOT NULL,
    "changes" JSONB NOT NULL,
    "previous_state" JSONB NOT NULL,
    "status" "change_request_status" DEFAULT 'PENDING',
    "reviewer_id" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "change_requests_status_idx" ON "change_requests"("status");

-- CreateIndex
CREATE INDEX "change_requests_entity_type_entity_id_idx" ON "change_requests"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "change_requests_user_id_idx" ON "change_requests"("user_id");

-- AddForeignKey
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
