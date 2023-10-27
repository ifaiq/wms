-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `status` ENUM('IN_REVIEW', 'PO', 'LOCKED', 'CANCELLED') NOT NULL;
