/*
  Warnings:

  - You are about to drop the column `product_id` on the `chats` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_product_id_fkey";

-- DropIndex
DROP INDEX "chats_product_id_idx";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "product_id";
