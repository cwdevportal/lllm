/*
  Warnings:

  - You are about to drop the `TeacherRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `Course` MODIFY `userId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `TeacherRequest`;

-- DropTable
DROP TABLE `User`;
