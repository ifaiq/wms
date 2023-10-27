/*
  Warnings:

  - You are about to drop the column `returnedReceiptId` on the `Receipt` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Receipt` DROP FOREIGN KEY `Receipt_returnedReceiptId_fkey`;

-- AlterTable
ALTER TABLE `Receipt` DROP COLUMN `returnedReceiptId`;

-- CreateTable
CREATE TABLE `ReturnReceipt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receiptId` INTEGER NOT NULL,
    `poId` INTEGER NOT NULL,
    `reasonId` INTEGER NOT NULL,
    `status` ENUM('READY', 'DONE', 'CANCELLED') NOT NULL,
    `confirmedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReturnReceiptProduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receiptId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantityReceived` INTEGER NOT NULL,
    `quantityReturned` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ReturnReceiptProduct_receiptId_productId_key`(`receiptId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReturnReceipt` ADD CONSTRAINT `ReturnReceipt_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnReceipt` ADD CONSTRAINT `ReturnReceipt_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnReceipt` ADD CONSTRAINT `ReturnReceipt_receiptId_fkey` FOREIGN KEY (`receiptId`) REFERENCES `Receipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnReceipt` ADD CONSTRAINT `ReturnReceipt_reasonId_fkey` FOREIGN KEY (`reasonId`) REFERENCES `Reason`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnReceiptProduct` ADD CONSTRAINT `ReturnReceiptProduct_receiptId_fkey` FOREIGN KEY (`receiptId`) REFERENCES `ReturnReceipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
