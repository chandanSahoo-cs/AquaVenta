/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Report" DROP COLUMN "downvotes",
DROP COLUMN "upvotes";
