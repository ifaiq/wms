-- AlterTable
ALTER TABLE `PurchaseOrder` ADD COLUMN `currency` ENUM('AED', 'SAR', 'PKR', 'USD') NULL;
