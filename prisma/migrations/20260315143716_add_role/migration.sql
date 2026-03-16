/*
  Warnings:

  - You are about to drop the column `role` on the `Department` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGEMENT', 'STAFF');

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STAFF';
