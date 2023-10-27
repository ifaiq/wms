/*
  Warnings:

  - The values [GRN] on the enum `InventoryMovement_movementType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `InventoryMovement` MODIFY `movementType` ENUM('RECEIPT', 'RETURN_IN', 'RETURN_OUT', 'ADJUSTMENT', 'TRANSFER', 'BATCH_ACCEPTANCE', 'BATCH_CLOSING') NOT NULL;
