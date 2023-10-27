-- CreateTable
CREATE TABLE `DraftInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('SERVICE_INVOICE', 'REBATE', 'RETURN') NOT NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `vendorId` INTEGER NULL,
    `detail` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DraftInvoice` ADD CONSTRAINT `DraftInvoice_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftInvoice` ADD CONSTRAINT `DraftInvoice_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
