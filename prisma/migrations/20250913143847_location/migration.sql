/*
  Warnings:

  - Added the required column `location` to the `Hotspot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Hotspot" ADD COLUMN     "location" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "public"."SocialPost" ADD COLUMN     "location" TEXT;
