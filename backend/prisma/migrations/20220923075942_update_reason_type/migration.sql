-- AlterTable
ALTER TABLE `Reason` MODIFY `type` ENUM('RETURN', 'ADJUSTMENT', 'TRANSFER') NOT NULL;
