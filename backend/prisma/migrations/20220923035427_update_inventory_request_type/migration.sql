-- AlterTable
ALTER TABLE `InventoryRequest` MODIFY `type` ENUM('PURCHASE', 'RETURN', 'ADJUSTMENT', 'RECEIPT', 'TRANSFER') NOT NULL;
