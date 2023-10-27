/*
  Warnings:

  - You are about to drop the column `skuCode` on the `PurchaseOrderProduct` table. All the data in the column will be lost.
  - Added the required column `sku` to the `PurchaseOrderProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PurchaseOrderProduct` DROP COLUMN `skuCode`,
    ADD COLUMN `sku` VARCHAR(191) NOT NULL;
