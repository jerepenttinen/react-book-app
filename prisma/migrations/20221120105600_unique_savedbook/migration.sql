/*
  Warnings:

  - A unique constraint covering the columns `[bookId,userId]` on the table `SavedBook` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SavedBook_bookId_userId_key" ON "SavedBook"("bookId", "userId");
