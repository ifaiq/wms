/*
  Warnings:

  - You are about to drop the column `physicalQuantity` on the `InventoryMovement` table. All the data in the column will be lost.
  - Added the required column `newQuantity` to the `InventoryMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldQuantity` to the `InventoryMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `InventoryMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `InventoryMovement` DROP COLUMN `physicalQuantity`,
    ADD COLUMN `newQuantity` INTEGER NOT NULL,
    ADD COLUMN `oldQuantity` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL;
