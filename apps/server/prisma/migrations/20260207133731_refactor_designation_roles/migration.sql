/*
  Warnings:

  - You are about to drop the column `roleAbstraction` on the `Designation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Designation" DROP COLUMN "roleAbstraction",
ADD COLUMN     "titleHindi" TEXT,
ADD COLUMN     "titleTamil" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'STAFF';
