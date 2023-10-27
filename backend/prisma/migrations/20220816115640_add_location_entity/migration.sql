-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `ancestry` VARCHAR(191) NULL,
    `country` ENUM('PAK', 'SAUDI', 'ARE') NOT NULL,
    `businessUnitId` INTEGER NOT NULL,
    `warehouseId` INTEGER NOT NULL,
    `warehouseName` VARCHAR(191) NOT NULL,
    `parentId` INTEGER NULL,
    `availableForSale` BOOLEAN NOT NULL,
    `grnApplicable` BOOLEAN NOT NULL,
    `returnApplicable` BOOLEAN NOT NULL,
    `priority` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Location_name_key`(`name`),
    UNIQUE INDEX `Location_parentId_priority_key`(`parentId`, `priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
