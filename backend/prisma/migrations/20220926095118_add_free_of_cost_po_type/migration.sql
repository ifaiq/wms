-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `type` ENUM('STANDARD', 'SHUTTLING', 'PROJECTION', 'JIT', 'DIRECT_DELIVERY', 'EXCLUSIVE_DISTRIBUTION', 'FREE_OF_COST') NOT NULL DEFAULT 'STANDARD';
