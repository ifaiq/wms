-- CreateTable
CREATE TABLE `Adjustment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('READY', 'CANCELLED', 'CONFIRMED') NOT NULL,
    `country` ENUM('PK', 'SA', 'UAE') NOT NULL,
    `businessUnitId` INTEGER NOT NULL,
    `warehouseId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdjustmentProduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adjustmentId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `actualQuantity` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdjustmentProduct_adjustmentId_productId_key`(`adjustmentId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Adjustment` ADD CONSTRAINT `Adjustment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdjustmentProduct` ADD CONSTRAINT `AdjustmentProduct_adjustmentId_fkey` FOREIGN KEY (`adjustmentId`) REFERENCES `Adjustment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
