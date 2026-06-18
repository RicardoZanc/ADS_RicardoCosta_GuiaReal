-- DropIndex
DROP INDEX "reaction_votes_user_id_interaction_id_key";

-- AlterTable
ALTER TABLE "opinions" ADD COLUMN     "cached_upvotes" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "reaction_votes" ADD COLUMN     "opinion_id" UUID,
ALTER COLUMN "interaction_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reaction_votes" ADD CONSTRAINT "reaction_votes_opinion_id_fkey" FOREIGN KEY ("opinion_id") REFERENCES "opinions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
