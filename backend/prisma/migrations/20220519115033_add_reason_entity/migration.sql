-- CreateTable
CREATE TABLE `Reason` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('RETURN', 'ADJUSTMENT') NOT NULL,
    `reason` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Reason_type_reason_key`(`type`, `reason`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
