-- Normalize legacy values before shrinking the enum
UPDATE "discussion_threads"
SET "status" = 'PENDING'
WHERE "status" = 'READY';

UPDATE "discussion_threads"
SET "status" = 'PROCESSED'
WHERE "status" = 'IGNORED';

UPDATE "opinions"
SET "status" = 'PENDING'
WHERE "status" = 'READY';

UPDATE "opinions"
SET "status" = 'PROCESSED'
WHERE "status" = 'IGNORED';

CREATE TYPE "queue_status_new" AS ENUM ('PENDING', 'PROCESSED');

ALTER TABLE "discussion_threads"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "queue_status_new"
USING ("status"::text::"queue_status_new");

ALTER TABLE "opinions"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "queue_status_new"
USING ("status"::text::"queue_status_new");

DROP TYPE "queue_status";

ALTER TYPE "queue_status_new" RENAME TO "queue_status";

ALTER TABLE "discussion_threads"
ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "opinions"
ALTER COLUMN "status" SET DEFAULT 'PENDING';
