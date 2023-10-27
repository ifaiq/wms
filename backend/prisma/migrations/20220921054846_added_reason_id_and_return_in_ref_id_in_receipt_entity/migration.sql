-- AlterTable
ALTER TABLE `Receipt` ADD COLUMN `reasonId` INTEGER NULL,
    ADD COLUMN `returnInRefId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Receipt` ADD CONSTRAINT `Receipt_returnInRefId_fkey` FOREIGN KEY (`returnInRefId`) REFERENCES `ReturnReceipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Receipt` ADD CONSTRAINT `Receipt_reasonId_fkey` FOREIGN KEY (`reasonId`) REFERENCES `Reason`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
