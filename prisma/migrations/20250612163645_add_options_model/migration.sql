/*
  Warnings:

  - A unique constraint covering the columns `[studentId,questionId]` on the table `StudentAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `StudentAnswer_studentId_questionId_key` ON `StudentAnswer`(`studentId`, `questionId`);
