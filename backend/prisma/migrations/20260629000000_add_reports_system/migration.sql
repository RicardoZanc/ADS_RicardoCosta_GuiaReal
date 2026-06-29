-- AlterTable
ALTER TABLE "discussion_threads" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "discussion_threads" ADD COLUMN "reports_locked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "opinions" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "opinions" ADD COLUMN "reports_locked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN "target_opinion_id" UUID;
ALTER TABLE "reports" ADD COLUMN "reviewer_id" UUID;
ALTER TABLE "reports" ADD COLUMN "reviewed_at" TIMESTAMPTZ(6);
ALTER TABLE "reports" ADD COLUMN "admin_notes" TEXT;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_opinion_id_fkey" FOREIGN KEY ("target_opinion_id") REFERENCES "opinions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- CreateIndex
CREATE UNIQUE INDEX "reports_reporter_id_target_interaction_id_key" ON "reports"("reporter_id", "target_interaction_id") WHERE "target_interaction_id" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reports_reporter_id_target_opinion_id_key" ON "reports"("reporter_id", "target_opinion_id") WHERE "target_opinion_id" IS NOT NULL;

-- CheckConstraint: exactly one target
ALTER TABLE "reports" ADD CONSTRAINT "reports_single_target_check" CHECK (
  (
    ("target_interaction_id" IS NOT NULL AND "target_opinion_id" IS NULL)
    OR
    ("target_interaction_id" IS NULL AND "target_opinion_id" IS NOT NULL)
  )
);
