/*
  Warnings:

  - You are about to drop the column `target_id` on the `opinions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "opinions" DROP COLUMN "target_id",
ADD COLUMN     "node_id" UUID,
ADD COLUMN     "product_id" UUID;

-- AddForeignKey
ALTER TABLE "opinions" ADD CONSTRAINT "opinions_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opinions" ADD CONSTRAINT "opinions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
