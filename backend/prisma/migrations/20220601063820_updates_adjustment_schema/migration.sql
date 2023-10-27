/*
  Warnings:

  - You are about to drop the column `reason` on the `Adjustment` table. All the data in the column will be lost.
  - Added the required column `reasonId` to the `Adjustment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Adjustment` DROP COLUMN `reason`,
    ADD COLUMN `reasonId` INTEGER NOT NULL,
    ADD COLUMN `reasonValue` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Adjustment` ADD CONSTRAINT `Adjustment_reasonId_fkey` FOREIGN KEY (`reasonId`) REFERENCES `Reason`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
