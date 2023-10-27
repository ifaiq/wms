-- AlterTable
ALTER TABLE `Adjustment` ADD COLUMN `locationId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Receipt` ADD COLUMN `locationId` INTEGER NULL;

-- AlterTable
ALTER TABLE `ReturnReceipt` ADD COLUMN `locationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Receipt` ADD CONSTRAINT `Receipt_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnReceipt` ADD CONSTRAINT `ReturnReceipt_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Adjustment` ADD CONSTRAINT `Adjustment_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
