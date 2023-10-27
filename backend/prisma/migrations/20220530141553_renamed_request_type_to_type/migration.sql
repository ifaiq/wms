/*
  Warnings:

  - You are about to drop the column `requestType` on the `InventoryRequest` table. All the data in the column will be lost.
  - Added the required column `type` to the `InventoryRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `InventoryRequest` DROP COLUMN `requestType`,
    ADD COLUMN `responseStatus` INTEGER NULL,
    ADD COLUMN `type` ENUM('PURCHASE', 'RETURN', 'ADJUSTMENT', 'RECEIPT') NOT NULL;
