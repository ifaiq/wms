/*
  Warnings:

  - You are about to drop the column `userId` on the `Adjustment` table. All the data in the column will be lost.
  - The values [CONFIRMED] on the enum `Adjustment_status` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `createdById` to the `Adjustment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Adjustment` DROP FOREIGN KEY `Adjustment_userId_fkey`;

-- AlterTable
ALTER TABLE `Adjustment` DROP COLUMN `userId`,
    ADD COLUMN `createdById` INTEGER NOT NULL,
    MODIFY `status` ENUM('READY', 'CANCELLED', 'DONE') NOT NULL;

-- AddForeignKey
ALTER TABLE `Adjustment` ADD CONSTRAINT `Adjustment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
