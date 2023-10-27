/*
  Warnings:

  - You are about to drop the column `disabled` on the `Vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Vendor` DROP COLUMN `disabled`,
    ADD COLUMN `status` ENUM('IN_REVIEW', 'LOCKED', 'DISABLED') NOT NULL DEFAULT 'IN_REVIEW';
