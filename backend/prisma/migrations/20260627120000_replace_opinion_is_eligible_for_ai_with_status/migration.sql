-- AlterTable
ALTER TABLE "opinions" ADD COLUMN "status" "queue_status" DEFAULT 'PENDING';

UPDATE "opinions"
SET "status" = 'PENDING'
WHERE "is_eligible_for_ai" = true;

ALTER TABLE "opinions" DROP COLUMN "is_eligible_for_ai";
