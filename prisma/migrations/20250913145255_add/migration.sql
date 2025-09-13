/*
  Warnings:

  - You are about to drop the `ReportMedia` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `media` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."RoleName" AS ENUM ('citizen', 'analyst', 'admin');

-- DropForeignKey
ALTER TABLE "public"."ReportMedia" DROP CONSTRAINT "ReportMedia_reportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReportMedia" DROP CONSTRAINT "ReportMedia_uploadedBy_fkey";

-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "media" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Role" DROP COLUMN "name",
ADD COLUMN     "name" "public"."RoleName" NOT NULL;

-- DropTable
DROP TABLE "public"."ReportMedia";

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "public"."RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
