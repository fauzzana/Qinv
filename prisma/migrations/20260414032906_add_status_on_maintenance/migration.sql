/*
  Warnings:

  - Added the required column `status_maintain` to the `AssetMaintenance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetMaintenance" ADD COLUMN     "status_maintain" INTEGER NOT NULL DEFAULT 0;
