-- CreateTable
CREATE TABLE `InventoryRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `referenceId` INTEGER NULL,
    `requestBody` JSON NOT NULL,
    `responseBody` JSON NULL,
    `requestType` VARCHAR(191) NOT NULL,
    `idempotencyKey` VARCHAR(191) NULL,
    `isSuccessful` BOOLEAN NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
