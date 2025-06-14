/*
  Warnings:

  - The primary key for the `Option` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `Option` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `questionId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Question` DROP PRIMARY KEY,
    ADD COLUMN `updatedAt` DATETIME(3) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `StudentAnswer` ADD COLUMN `isCorrect` BOOLEAN NULL,
    MODIFY `questionId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `StudentAnswer_questionId_idx` ON `StudentAnswer`(`questionId`);
